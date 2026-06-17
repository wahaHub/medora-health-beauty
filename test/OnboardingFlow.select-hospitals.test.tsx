import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { OnboardingFlow } from '@/components/chat/OnboardingFlow';

const patientEntryState = vi.hoisted(() => ({
  phase: 'select-hospitals',
  preBootstrapMessages: [],
  bootstrapError: null,
  clearBootstrapError: vi.fn(),
  openPanel: vi.fn(),
  matchedHospitals: [],
  selectedHospitalIds: [],
  setMatchedHospitals: vi.fn(),
  toggleHospitalSelection: vi.fn(),
  applyOnboardingResult: vi.fn(),
  caseId: 'case-1',
  profileDraft: {
    name: 'Alice Beauty',
    email: 'alice@example.com',
    phone: '+1 555 0100',
    disease: 'Rhinoplasty',
    destination: 'South Korea',
    category: 'face',
    procedureId: 'rhinoplasty',
  },
}));

const patientAuthState = vi.hoisted(() => ({
  patient: null as null | {
    name?: string;
    email?: string;
    disease?: string | null;
    destination?: string | null;
    widgetChatTarget?: { kind: 'CHATBOT_SESSION'; sessionId: string } | null;
  },
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: () => patientEntryState,
}));

vi.mock('@/hooks/usePatientConversations', () => ({
  usePatientConversations: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock('@/contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ currentLanguage: 'en' }),
  useOptionalLanguage: () => ({ currentLanguage: 'en' }),
}));

describe('OnboardingFlow select-hospitals ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patientEntryState.phase = 'select-hospitals';
    patientEntryState.preBootstrapMessages = [];
    patientEntryState.bootstrapError = null;
    patientAuthState.patient = null;
  });

  it('shows a submitted-details waiting state when CRM owns the chatbot session', () => {
    patientAuthState.patient = {
      name: 'Alice Beauty',
      email: 'alice@example.com',
      disease: 'Rhinoplasty',
      destination: 'South Korea',
      widgetChatTarget: {
        kind: 'CHATBOT_SESSION',
        sessionId: 'widget-chat:patient-1:case-1',
      },
    };

    render(<OnboardingFlow />);

    expect(screen.getByText(/submitted details/i)).toBeInTheDocument();
    expect(screen.getByText(/reviewing your profile in chat/i)).toBeInTheDocument();
    expect(screen.queryByText(/recommended hospitals/i)).toBeNull();
    expect(screen.queryByRole('button', { name: /start chatting/i })).toBeNull();
  });

});
