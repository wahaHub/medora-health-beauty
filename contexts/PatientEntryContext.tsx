/**
 * PatientEntryContext
 *
 * Owns the patient entry state machine, pre-bootstrap chat history,
 * hospital selection, and handoff into PatientMessagePanel.
 *
 * Intentionally separate from PatientAuthContext which owns only:
 * session, bootstrap, magic-link, and logout.
 */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePatientAuth } from '../contexts/PatientAuthContext';
import { crmApi } from '../services/crmApiClient';
import {
  clearBootstrapErrorMarker,
  clearHistoryAfterSuccessfulImport,
  ensureOpeningMessageSeeded,
  getOrCreateActiveImportKey,
  isImportComplete,
  migrateAnonymousHistoryToScoped,
  readAnonymousHistory,
  readBootstrapErrorMarker,
  readScopedHistory,
  writeAnonymousHistory,
  writeBootstrapErrorMarker,
  writeScopedHistory,
  type PreBootstrapMessage,
} from '../services/patientEntryStorage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PatientEntryPhase =
  | 'collect-profile'
  | 'select-hospitals'
  | 'messages-ready'
  | 'bootstrap-error';

export type MatchedHospital = {
  id: string;
  name: string;
  city?: string;
  summary?: string;
};

export type PatientProfileDraft = {
  name: string;
  email: string;
  phone: string;
  disease: string;
  destination: string;
};

export type PatientConversationSummary = {
  id: string;
  type: 'patient-admin' | 'patient-hospital';
  category?: string;
  title?: string;
  lastMessagePreview?: string;
  unreadCount?: number;
};

export type PatientEntryImportStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

type ScopedPatientSession = {
  patientId: string;
  caseId: string;
};

type FormalConversationRef = {
  id: string;
  type: 'patient-admin' | 'patient-hospital';
  category?: string;
};

// ---------------------------------------------------------------------------
// Context value interface
// ---------------------------------------------------------------------------

export interface PatientEntryContextValue {
  /** Whether the floating chat widget is open */
  isWidgetOpen: boolean;
  /** Current entry phase / stage */
  phase: PatientEntryPhase;
  /** Pre-bootstrap local messages (before formal conversations exist) */
  preBootstrapMessages: PreBootstrapMessage[];
  /** Partially-filled profile form data */
  profileDraft: PatientProfileDraft;
  /** Case id, set once onboarding completes */
  caseId: string | null;
  /** Hospital matches returned from the API */
  matchedHospitals: MatchedHospital[];
  /** Ids of hospitals the patient selected */
  selectedHospitalIds: string[];
  /** Whether the full-screen message panel is open */
  isPanelOpen: boolean;
  /** Non-null when phase === 'bootstrap-error' */
  bootstrapError: string | null;
  /** Active formal conversation (admin channel) */
  activeConversationId: string | null;
  /** Import status for pre-bootstrap history */
  importStatus: PatientEntryImportStatus;

  // --- Actions ---
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;

  setProfileDraft: (draft: PatientProfileDraft) => void;
  patchProfileDraft: (draft: Partial<PatientProfileDraft>) => void;

  appendPreBootstrapMessage: (message: PreBootstrapMessage) => void;
  replacePreBootstrapMessages: (messages: PreBootstrapMessage[]) => void;

  /**
   * Called after successful onboarding: migrates anonymous history to the
   * scoped patient/case bucket and returns the merged history.
   */
  bindScopedSession: (patientId: string, caseId: string) => PreBootstrapMessage[];

  setMatchedHospitals: (hospitals: MatchedHospital[]) => void;
  setSelectedHospitalIds: (ids: string[]) => void;
  toggleHospitalSelection: (hospitalId: string) => void;

  openPanel: () => void;
  closePanel: () => void;

  setActiveConversationId: (id: string | null) => void;
  setImportStatus: (status: PatientEntryImportStatus) => void;
  setBootstrapError: (message: string | null) => void;
  clearBootstrapError: () => void;

  getStableImportKey: (patientId: string, caseId: string) => string;
  markImportSucceeded: (patientId: string, caseId: string, importKey: string) => void;
  hasImportedHistory: (patientId: string, caseId: string, importKey: string) => boolean;

  /**
   * Transitions state after fresh onboarding form submit.
   * Returns true on success, false if bootstrap-error was triggered.
   */
  applyOnboardingResult: (input: {
    patientId: string;
    caseId: string;
    nextStep: 'select-hospitals' | 'messages-ready';
    conversations?: FormalConversationRef[];
    importStatus?: PatientEntryImportStatus;
    importError?: string | null;
  }) => boolean;

  /**
   * Transitions state when restoring a returning patient (session recovery).
   * Returns true on success, false if bootstrap-error was triggered.
   */
  applyRestoreResult: (input: {
    patientId: string;
    caseId: string;
    nextStep: 'select-hospitals' | 'messages-ready';
    conversations?: FormalConversationRef[];
    importStatus?: PatientEntryImportStatus;
    importError?: string | null;
  }) => boolean;

  /**
   * Shared helper used by both onboarding and restore paths to land in
   * messages-ready. Returns true on success.
   */
  resolveMessagesReadyState: (input: {
    patientId: string;
    caseId: string;
    conversations: FormalConversationRef[];
    importStatus?: PatientEntryImportStatus;
    importError?: string | null;
  }) => boolean;

  /** Full state reset (e.g. on logout) */
  resetEntryState: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const PatientEntryContext = createContext<PatientEntryContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEmptyProfileDraft(): PatientProfileDraft {
  return { name: '', email: '', phone: '', disease: '', destination: '' };
}

function identifyAdminConversation(
  conversations: FormalConversationRef[],
): FormalConversationRef | null {
  return (
    conversations.find(
      (c) => c.type === 'patient-admin' || c.category === 'ADMIN_PATIENT',
    ) ?? null
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PatientEntryProvider({ children }: { children: ReactNode }) {
  const { patient, isLoading: isPatientAuthLoading } = usePatientAuth();

  const [scopedSession, setScopedSession] = useState<ScopedPatientSession | null>(null);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [phase, setPhase] = useState<PatientEntryPhase>('collect-profile');
  const [preBootstrapMessages, setPreBootstrapMessages] = useState<PreBootstrapMessage[]>(() =>
    readAnonymousHistory(),
  );
  const [profileDraft, setProfileDraftState] = useState<PatientProfileDraft>(() =>
    createEmptyProfileDraft(),
  );
  const [caseId, setCaseId] = useState<string | null>(null);
  const [matchedHospitals, setMatchedHospitalsState] = useState<MatchedHospital[]>([]);
  const [selectedHospitalIds, setSelectedHospitalIdsState] = useState<string[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [bootstrapError, setBootstrapErrorState] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
  const [importStatus, setImportStatusState] = useState<PatientEntryImportStatus>('idle');

  const lastAppliedRestoreKeyRef = useRef<string | null>(null);
  const prevPatientIdRef = useRef<string | null | undefined>(undefined);

  // Reset entry state when patient logs out
  useEffect(() => {
    if (
      prevPatientIdRef.current !== undefined &&
      prevPatientIdRef.current !== null &&
      patient === null
    ) {
      setIsWidgetOpen(false);
      setPhase('collect-profile');
      setMatchedHospitalsState([]);
      setSelectedHospitalIdsState([]);
      setIsPanelOpen(false);
      setBootstrapErrorState(null);
      setActiveConversationIdState(null);
      setImportStatusState('idle');
      setCaseId(null);
      setScopedSession(null);
      setProfileDraftState(createEmptyProfileDraft());
      setPreBootstrapMessages(readAnonymousHistory());
    }
    prevPatientIdRef.current = patient?.id ?? null;
  }, [patient]);

  // Persist pre-bootstrap history on every change
  useEffect(() => {
    if (scopedSession) {
      writeScopedHistory(scopedSession.patientId, scopedSession.caseId, preBootstrapMessages);
    } else {
      writeAnonymousHistory(preBootstrapMessages);
    }
  }, [preBootstrapMessages, scopedSession]);

  // --- Internal helpers ---

  const moveToBootstrapError = useCallback(
    (patientId: string, nextCaseId: string, reason: string) => {
      writeBootstrapErrorMarker(patientId, nextCaseId, reason);
      setPhase('bootstrap-error');
      setBootstrapErrorState(reason);
      setImportStatusState('failed');
    },
    [],
  );

  const bindScopedSession = useCallback(
    (patientId: string, nextCaseId: string): PreBootstrapMessage[] => {
      const nextMessages = migrateAnonymousHistoryToScoped(patientId, nextCaseId);
      setScopedSession({ patientId, caseId: nextCaseId });
      setCaseId(nextCaseId);
      setPreBootstrapMessages(nextMessages);
      return nextMessages;
    },
    [],
  );

  const ensureWidgetHistoryInitialized = useCallback(() => {
    if (phase === 'messages-ready' || preBootstrapMessages.length > 0) return;
    const nextMessages = ensureOpeningMessageSeeded([]);
    if (scopedSession) {
      writeScopedHistory(scopedSession.patientId, scopedSession.caseId, nextMessages);
    } else {
      writeAnonymousHistory(nextMessages);
    }
    setPreBootstrapMessages(nextMessages);
  }, [phase, preBootstrapMessages.length, scopedSession]);

  const clearBootstrapError = useCallback(() => {
    const markerPatientId = scopedSession?.patientId ?? patient?.id ?? null;
    const markerCaseId = scopedSession?.caseId ?? patient?.caseId ?? null;

    if (markerPatientId && markerCaseId) {
      clearBootstrapErrorMarker(markerPatientId, markerCaseId);
    }
    lastAppliedRestoreKeyRef.current = null;
    setPhase('collect-profile');
    setImportStatusState('idle');
    setBootstrapErrorState(null);
  }, [patient?.caseId, patient?.id, scopedSession]);

  const resolveMessagesReadyState = useCallback(
    (input: {
      patientId: string;
      caseId: string;
      conversations: FormalConversationRef[];
      importStatus?: PatientEntryImportStatus;
      importError?: string | null;
    }): boolean => {
      const adminConv = identifyAdminConversation(input.conversations);
      if (!adminConv) {
        moveToBootstrapError(
          input.patientId,
          input.caseId,
          'Patient admin conversation not found',
        );
        return false;
      }

      clearBootstrapErrorMarker(input.patientId, input.caseId);
      setPhase('messages-ready');
      setActiveConversationIdState(adminConv.id);
      setCaseId(input.caseId);
      setMatchedHospitalsState([]);
      setSelectedHospitalIdsState([]);
      setImportStatusState(input.importStatus ?? 'idle');
      setBootstrapErrorState(
        input.importStatus === 'failed'
          ? (input.importError ?? 'Failed to import history')
          : null,
      );
      return true;
    },
    [moveToBootstrapError],
  );

  const applyOnboardingResult = useCallback(
    (input: {
      patientId: string;
      caseId: string;
      nextStep: 'select-hospitals' | 'messages-ready';
      conversations?: FormalConversationRef[];
      importStatus?: PatientEntryImportStatus;
      importError?: string | null;
    }): boolean => {
      bindScopedSession(input.patientId, input.caseId);
      clearBootstrapErrorMarker(input.patientId, input.caseId);
      setActiveConversationIdState(null);
      setImportStatusState('idle');

      if (input.nextStep === 'select-hospitals') {
        setPhase('select-hospitals');
        setBootstrapErrorState(null);
        return true;
      }

      return resolveMessagesReadyState({
        patientId: input.patientId,
        caseId: input.caseId,
        conversations: input.conversations ?? [],
        importStatus: input.importStatus,
        importError: input.importError,
      });
    },
    [bindScopedSession, resolveMessagesReadyState],
  );

  const applyRestoreResult = useCallback(
    (input: {
      patientId: string;
      caseId: string;
      nextStep: 'select-hospitals' | 'messages-ready';
      conversations?: FormalConversationRef[];
      importStatus?: PatientEntryImportStatus;
      importError?: string | null;
    }): boolean => {
      const nextMessages = readScopedHistory(input.patientId, input.caseId);
      setScopedSession({ patientId: input.patientId, caseId: input.caseId });
      setCaseId(input.caseId);
      setPreBootstrapMessages(nextMessages);

      const bootstrapFailure = readBootstrapErrorMarker(input.patientId, input.caseId);
      if (bootstrapFailure) {
        setPhase('bootstrap-error');
        setBootstrapErrorState(bootstrapFailure);
        setImportStatusState('failed');
        return false;
      }

      if (input.nextStep === 'select-hospitals') {
        setPhase('select-hospitals');
        setBootstrapErrorState(null);
        setImportStatusState('idle');
        return true;
      }

      return resolveMessagesReadyState({
        patientId: input.patientId,
        caseId: input.caseId,
        conversations: input.conversations ?? [],
        importStatus: input.importStatus,
        importError: input.importError,
      });
    },
    [resolveMessagesReadyState],
  );

  // --- Restore from PatientAuthContext on session recovery ---

  useEffect(() => {
    if (!patient?.id || !patient.caseId || !patient.nextStep || isPatientAuthLoading) {
      if (!patient) {
        lastAppliedRestoreKeyRef.current = null;
      }
      return;
    }

    // Already in the right phase — skip
    if (
      scopedSession?.patientId === patient.id &&
      scopedSession.caseId === patient.caseId &&
      (phase === 'messages-ready' ||
        (phase === 'select-hospitals' && patient.nextStep === 'select-hospitals'))
    ) {
      return;
    }

    const restoreKey = `${patient.id}:${patient.caseId}:${patient.nextStep}`;
    if (lastAppliedRestoreKeyRef.current === restoreKey) return;

    let cancelled = false;

    const syncState = async () => {
      let conversations: FormalConversationRef[] | undefined;

      if (patient.nextStep === 'messages-ready') {
        try {
          const records = await crmApi.getConversations();
          if (cancelled) return;

          const list = records as Array<{ id: string; caseId?: string; category?: string }>;

          conversations = list
            .filter(
              (c) =>
                c.caseId === patient.caseId &&
                (c.category === 'ADMIN_PATIENT' || c.category === 'HOSPITAL_PATIENT'),
            )
            .map((c) => ({
              id: c.id,
              category: c.category,
              type:
                c.category === 'ADMIN_PATIENT'
                  ? ('patient-admin' as const)
                  : ('patient-hospital' as const),
            }));
        } catch (err) {
          if (cancelled) return;
          moveToBootstrapError(
            patient.id,
            patient.caseId,
            err instanceof Error ? err.message : 'Failed to restore patient conversations',
          );
          lastAppliedRestoreKeyRef.current = restoreKey;
          return;
        }
      }

      const restored = applyRestoreResult({
        patientId: patient.id,
        caseId: patient.caseId!,
        nextStep: patient.nextStep!,
        conversations,
      });

      if (!cancelled && restored) {
        lastAppliedRestoreKeyRef.current = restoreKey;
      }
    };

    void syncState();

    return () => {
      cancelled = true;
    };
  }, [
    applyRestoreResult,
    isPatientAuthLoading,
    moveToBootstrapError,
    patient,
    phase,
    scopedSession,
  ]);

  // --- Context value ---

  const value = useMemo<PatientEntryContextValue>(
    () => ({
      isWidgetOpen,
      phase,
      preBootstrapMessages,
      profileDraft,
      caseId,
      matchedHospitals,
      selectedHospitalIds,
      isPanelOpen,
      bootstrapError,
      activeConversationId,
      importStatus,

      openWidget: () => {
        ensureWidgetHistoryInitialized();
        setIsWidgetOpen(true);
      },
      closeWidget: () => setIsWidgetOpen(false),
      toggleWidget: () => {
        if (!isWidgetOpen) ensureWidgetHistoryInitialized();
        setIsWidgetOpen((current) => !current);
      },

      setProfileDraft: (draft) => setProfileDraftState(draft),
      patchProfileDraft: (draft) =>
        setProfileDraftState((current) => ({ ...current, ...draft })),

      appendPreBootstrapMessage: (message) =>
        setPreBootstrapMessages((current) => [...current, message]),
      replacePreBootstrapMessages: (messages) => setPreBootstrapMessages(messages),

      bindScopedSession,

      setMatchedHospitals: (hospitals) => {
        setMatchedHospitalsState(hospitals);
        setSelectedHospitalIdsState((current) =>
          current.filter((id) => hospitals.some((h) => h.id === id)),
        );
      },
      setSelectedHospitalIds: (ids) => setSelectedHospitalIdsState(Array.from(new Set(ids))),
      toggleHospitalSelection: (hospitalId) =>
        setSelectedHospitalIdsState((current) =>
          current.includes(hospitalId)
            ? current.filter((id) => id !== hospitalId)
            : [...current, hospitalId],
        ),

      openPanel: () => {
        setIsWidgetOpen(false);
        setIsPanelOpen(true);
      },
      closePanel: () => setIsPanelOpen(false),

      setActiveConversationId: (id) => setActiveConversationIdState(id),
      setImportStatus: (status) => setImportStatusState(status),
      setBootstrapError: (message) => {
        if (scopedSession && message) {
          writeBootstrapErrorMarker(scopedSession.patientId, scopedSession.caseId, message);
        }
        setBootstrapErrorState(message);
      },
      clearBootstrapError,

      getStableImportKey: (patientId, nextCaseId) =>
        getOrCreateActiveImportKey(patientId, nextCaseId),
      markImportSucceeded: (patientId, nextCaseId, importKey) => {
        clearHistoryAfterSuccessfulImport(patientId, nextCaseId, importKey);
        setImportStatusState('succeeded');
      },
      hasImportedHistory: (patientId, nextCaseId, importKey) =>
        isImportComplete(patientId, nextCaseId, importKey),

      applyOnboardingResult,
      applyRestoreResult,
      resolveMessagesReadyState,

      resetEntryState: () => {
        setIsWidgetOpen(false);
        setPhase('collect-profile');
        setMatchedHospitalsState([]);
        setSelectedHospitalIdsState([]);
        setIsPanelOpen(false);
        setBootstrapErrorState(null);
        setActiveConversationIdState(null);
        setImportStatusState('idle');
        setCaseId(null);
        setScopedSession(null);
        setProfileDraftState(createEmptyProfileDraft());
        setPreBootstrapMessages(readAnonymousHistory());
      },
    }),
    [
      activeConversationId,
      applyOnboardingResult,
      applyRestoreResult,
      bindScopedSession,
      bootstrapError,
      caseId,
      clearBootstrapError,
      ensureWidgetHistoryInitialized,
      importStatus,
      isPanelOpen,
      isWidgetOpen,
      matchedHospitals,
      phase,
      preBootstrapMessages,
      profileDraft,
      resolveMessagesReadyState,
      scopedSession,
      selectedHospitalIds,
    ],
  );

  return (
    <PatientEntryContext.Provider value={value}>{children}</PatientEntryContext.Provider>
  );
}
