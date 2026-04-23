import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PatientEntryProvider, type PatientEntryContextValue } from '../contexts/PatientEntryContext';
import { usePatientEntry } from '../hooks/usePatientEntry';

const patientAuthState = vi.hoisted(() => ({
  patient: null as { id: string; caseId?: string; nextStep?: 'select-hospitals' | 'messages-ready' } | null,
  isLoading: false,
}));

const crmApiState = vi.hoisted(() => ({
  getConversations: vi.fn(),
}));

vi.mock('../contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('../services/crmApiClient', async () => {
  const actual = await vi.importActual<typeof import('../services/crmApiClient')>('../services/crmApiClient');

  return {
    ...actual,
    crmApi: {
      ...actual.crmApi,
      getConversations: crmApiState.getConversations,
    },
  };
});

let latestEntryState: PatientEntryContextValue | null = null;

function PatientEntryProbe() {
  const entry = usePatientEntry();
  latestEntryState = entry;

  return (
    <div
      data-testid="patient-entry-state"
      data-phase={entry.phase}
      data-active-conversation-id={entry.activeConversationId ?? ''}
      data-bootstrap-error={entry.bootstrapError ?? ''}
    />
  );
}

describe('PatientEntryContext messages-ready handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    latestEntryState = null;
    patientAuthState.patient = null;
    patientAuthState.isLoading = false;
    crmApiState.getConversations.mockResolvedValue([]);
  });

  it('allows onboarding bootstrap to land in messages-ready with a hospital conversation only', async () => {
    render(
      <PatientEntryProvider>
        <PatientEntryProbe />
      </PatientEntryProvider>,
    );

    act(() => {
      latestEntryState?.applyOnboardingResult({
        patientId: 'patient-1',
        caseId: 'case-1',
        nextStep: 'messages-ready',
        conversations: [
          {
            id: 'hospital-conv',
            type: 'patient-hospital',
            category: 'HOSPITAL_PATIENT',
          },
        ],
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('patient-entry-state')).toHaveAttribute('data-phase', 'messages-ready');
    });

    expect(screen.getByTestId('patient-entry-state')).toHaveAttribute(
      'data-active-conversation-id',
      'hospital-conv',
    );
    expect(screen.getByTestId('patient-entry-state')).toHaveAttribute('data-bootstrap-error', '');
  });

  it('restores messages-ready from typed hospital conversations without requiring admin', async () => {
    patientAuthState.patient = {
      id: 'patient-1',
      caseId: 'case-1',
      nextStep: 'messages-ready',
    };
    crmApiState.getConversations.mockResolvedValue([
      {
        id: 'other-case-conv',
        caseId: 'case-2',
        type: 'patient-hospital',
        unreadCount: 0,
      },
      {
        id: 'hospital-conv',
        caseId: 'case-1',
        type: 'patient-hospital',
        hospitalName: 'Beijing United',
        unreadCount: 0,
      },
    ]);

    render(
      <PatientEntryProvider>
        <PatientEntryProbe />
      </PatientEntryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('patient-entry-state')).toHaveAttribute('data-phase', 'messages-ready');
    });

    expect(crmApiState.getConversations).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('patient-entry-state')).toHaveAttribute(
      'data-active-conversation-id',
      'hospital-conv',
    );
    expect(screen.getByTestId('patient-entry-state')).toHaveAttribute('data-bootstrap-error', '');
  });

  it('ignores legacy or untyped conversations during messages-ready restore', async () => {
    patientAuthState.patient = {
      id: 'patient-1',
      caseId: 'case-1',
      nextStep: 'messages-ready',
    };
    crmApiState.getConversations.mockResolvedValue([
      {
        id: 'legacy-conv',
        caseId: 'case-1',
        title: 'Legacy thread',
        unreadCount: 0,
      },
      {
        id: 'hospital-conv',
        caseId: 'case-1',
        type: 'patient-hospital',
        hospitalName: 'Shanghai Ninth',
        unreadCount: 0,
      },
    ]);

    render(
      <PatientEntryProvider>
        <PatientEntryProbe />
      </PatientEntryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('patient-entry-state')).toHaveAttribute('data-phase', 'messages-ready');
    });

    expect(screen.getByTestId('patient-entry-state')).toHaveAttribute(
      'data-active-conversation-id',
      'hospital-conv',
    );
    expect(screen.getByTestId('patient-entry-state')).toHaveAttribute('data-bootstrap-error', '');
  });
});
