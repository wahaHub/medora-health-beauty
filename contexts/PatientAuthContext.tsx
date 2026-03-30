import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  clearStoredRestoreToken,
  crmApi,
  getStoredRestoreToken,
  setStoredRestoreToken,
  shouldClearStoredRestoreToken,
  type PatientSessionBootstrap,
  type PatientSessionProfile,
} from '../services/crmApiClient';
import { useQueryClient } from '@tanstack/react-query';

export interface PatientProfile {
  id: string;
  caseId?: string;
  name?: string;
  email?: string;
  patientCode?: string | null;
  preferredLanguage?: string;
  nextStep?: 'select-hospitals' | 'messages-ready';
}

interface PatientAuthContextValue {
  patient: PatientProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  bootstrapSession: (session: PatientSessionBootstrap) => void;
  requestMagicLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const PatientAuthContext = createContext<PatientAuthContextValue | undefined>(undefined);

function toPatientProfile(profile: PatientSessionProfile): PatientProfile {
  const id = profile.id ?? profile.patientId;

  if (!id) {
    throw new Error('Patient profile is missing an id');
  }

  return {
    id,
    caseId: profile.caseId,
    name: profile.name,
    email: profile.email,
    patientCode: profile.patientCode,
    preferredLanguage: profile.preferredLanguage,
    nextStep: profile.nextStep,
  };
}

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const initialLocationRef = useRef({
    pathname: location.pathname,
    search: location.search,
  });
  const sessionStateRef = useRef({
    initialBootstrapActive: false,
    lastVerifiedToken: null as string | null,
    tokenVerificationInFlight: false,
    sessionEpoch: 0,
  });
  const patientRef = useRef<PatientProfile | null>(null);

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    patientRef.current = patient;
  }, [patient]);

  const applyPatientSession = useCallback((session: PatientSessionProfile) => {
    const nextPatient = toPatientProfile(session);
    patientRef.current = nextPatient;
    setPatient(nextPatient);

    if (session.restoreToken) {
      setStoredRestoreToken(session.restoreToken);
    }

    return nextPatient;
  }, []);

  const recoverPatientSession = useCallback(async (): Promise<PatientSessionProfile | null> => {
    try {
      return await crmApi.getMe();
    } catch (meError) {
      console.warn('Patient /me check failed, trying restore token:', meError);
    }

    const restoreToken = getStoredRestoreToken();

    if (!restoreToken) {
      return null;
    }

    try {
      return await crmApi.restoreSession(restoreToken);
    } catch (restoreError) {
      if (shouldClearStoredRestoreToken(restoreError)) {
        clearStoredRestoreToken();
      }
      console.warn('Patient restore session failed:', restoreError);
      return null;
    }
  }, []);

  const handleDashboardToken = useCallback(async (token: string): Promise<boolean> => {
    if (sessionStateRef.current.tokenVerificationInFlight) {
      return false;
    }

    sessionStateRef.current.tokenVerificationInFlight = true;
    setError(null);

    try {
      const verified = await crmApi.verifyMagicLink(token);
      applyPatientSession(verified);
      sessionStateRef.current.lastVerifiedToken = token;
      return true;
    } catch (tokenError) {
      clearStoredRestoreToken();
      patientRef.current = null;
      sessionStateRef.current.lastVerifiedToken = null;
      setPatient(null);
      setError(tokenError instanceof Error ? tokenError.message : 'Failed to verify patient login link');
      return false;
    } finally {
      sessionStateRef.current.tokenVerificationInFlight = false;
    }
  }, [applyPatientSession]);

  const requestMagicLink = useCallback(async (email: string) => {
    await crmApi.sendMagicLink(email);
  }, []);

  const bootstrapSession = useCallback((session: PatientSessionBootstrap) => {
    sessionStateRef.current.sessionEpoch += 1;
    setError(null);
    applyPatientSession(session);
    setIsLoading(false);
  }, [applyPatientSession]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    clearStoredRestoreToken();
    patientRef.current = null;
    sessionStateRef.current.lastVerifiedToken = null;
    setPatient(null);

    try {
      await crmApi.logout();
    } catch (logoutError) {
      console.warn('Patient logout request failed, clearing local session anyway:', logoutError);
    } finally {
      // Clear all patient-scoped query groups on logout
      await Promise.all([
        queryClient.removeQueries({ queryKey: ['patient-phase2'] }),
        queryClient.removeQueries({ queryKey: ['patient', 'conversations'] }),
        queryClient.removeQueries({ queryKey: ['patient', 'cases'] }),
        queryClient.removeQueries({ queryKey: ['patient', 'intake'] }),
      ]);
      setIsLoading(false);
      navigate('/login', { replace: true });
    }
  }, [navigate, queryClient]);

  // Initial bootstrap: token-in-URL → cookie/getMe → restore-token → logged-out
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (sessionStateRef.current.initialBootstrapActive) {
        return;
      }

      const bootstrapEpoch = sessionStateRef.current.sessionEpoch;
      sessionStateRef.current.initialBootstrapActive = true;
      setIsLoading(true);
      setError(null);

      try {
        const { pathname, search } = initialLocationRef.current;
        const token = pathname === '/dashboard'
          ? new URLSearchParams(search).get('token')
          : null;

        if (token) {
          const tokenResolved = await handleDashboardToken(token);
          if (cancelled) return;

          navigate(tokenResolved ? '/dashboard' : '/login', tokenResolved
            ? { replace: true }
            : { replace: true, state: { error: 'invalid-token' } });
          return;
        }

        const recovered = await recoverPatientSession();
        if (cancelled) return;
        if (sessionStateRef.current.sessionEpoch !== bootstrapEpoch) {
          return;
        }

        if (recovered) {
          applyPatientSession(recovered);
          return;
        }

        patientRef.current = null;
        setPatient(null);
      } finally {
        sessionStateRef.current.initialBootstrapActive = false;
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [handleDashboardToken, navigate, recoverPatientSession, applyPatientSession]);

  // Re-verify a new token that appears in the URL after initial bootstrap
  useEffect(() => {
    if (location.pathname !== '/dashboard') {
      return;
    }

    const token = new URLSearchParams(location.search).get('token');

    if (!token) {
      return;
    }

    if (sessionStateRef.current.initialBootstrapActive) {
      return;
    }

    if (sessionStateRef.current.lastVerifiedToken === token || sessionStateRef.current.tokenVerificationInFlight) {
      return;
    }

    let cancelled = false;

    const verifyDashboardToken = async () => {
      setIsLoading(true);
      const tokenResolved = await handleDashboardToken(token);

      if (cancelled) return;

      navigate(tokenResolved ? '/dashboard' : '/login', tokenResolved
        ? { replace: true }
        : { replace: true, state: { error: 'invalid-token' } });

      if (!tokenResolved && !patientRef.current) {
        setPatient(null);
      }

      setIsLoading(false);
    };

    void verifyDashboardToken();

    return () => {
      cancelled = true;
    };
  }, [handleDashboardToken, location.pathname, location.search, navigate]);

  const value = useMemo<PatientAuthContextValue>(() => ({
    patient,
    isAuthenticated: Boolean(patient),
    isLoading,
    error,
    bootstrapSession,
    requestMagicLink,
    logout,
  }), [patient, isLoading, error, bootstrapSession, requestMagicLink, logout]);

  return (
    <PatientAuthContext.Provider value={value}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const context = useContext(PatientAuthContext);

  if (!context) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider');
  }

  return context;
}
