import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ConsultationModal from '@/components/ConsultationModal';

const crmApiState = vi.hoisted(() => ({
  initOnboarding: vi.fn(),
}));

const consultationState = vi.hoisted(() => ({
  isOpen: true,
  closeConsultation: vi.fn(),
  preselectedProcedure: '',
  preselectedSurgeon: '',
}));

const patientAuthState = vi.hoisted(() => ({
  bootstrapSession: vi.fn(),
}));

const patientEntryState = vi.hoisted(() => ({
  applyOnboardingResult: vi.fn(() => true),
}));

vi.mock('@/services/crmApiClient', async () => {
  const actual = await vi.importActual<typeof import('@/services/crmApiClient')>('@/services/crmApiClient');
  return {
    ...actual,
    crmApi: crmApiState,
  };
});

vi.mock('@/contexts/ConsultationContext', () => ({
  useConsultation: () => consultationState,
}));

vi.mock('@/contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: () => patientEntryState,
}));

vi.mock('@/hooks/useData', () => ({
  useSurgeonsList: () => ({ data: { surgeons: [] }, isLoading: false }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      scheduleConsultation: 'Schedule Your Consultation',
      contactRequired: '* Required',
      contactFirstName: 'First Name*',
      contactLastName: 'Last Name*',
      contactEmail: 'Email*',
      contactPhoneField: 'Phone*',
      contactZipCode: 'Zip Code*',
      contactCountryOfOrigin: 'Country of Origin*',
      contactProcedureInterest: 'Procedure Interest*',
      contactPreferredProvider: 'Preferred Provider*',
      contactFirstAvailable: 'First Available',
      contactHowCanWeHelp: 'How can we help?',
      contactSubmit: 'Submit Inquiry',
      submitting: 'Submitting...',
      consultationThankYou: 'Thank you!',
      consultationSuccess: 'We have received your consultation request and will contact you shortly.',
    }[key] ?? key),
  }),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ currentLanguage: 'en' }),
}));

describe('Consultation modal CRM onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultationState.isOpen = true;
    consultationState.preselectedProcedure = '';
    consultationState.preselectedSurgeon = '';
    crmApiState.initOnboarding.mockResolvedValue({
      patientId: 'patient-2',
      caseId: 'case-2',
      restoreToken: 'restore-token-2',
      nextStep: 'messages-ready',
      conversations: [{ id: 'conversation-1', type: 'patient-admin' }],
    });
  });

  it('uses shared procedure taxonomy and submits through the CRM onboarding flow', async () => {
    render(<ConsultationModal />);

    expect(screen.queryByPlaceholderText('Zip Code*')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Preferred Provider*' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Smile Design' })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('First Name*'), {
      target: { value: 'Mina' },
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name*'), {
      target: { value: 'Patient' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email*'), {
      target: { value: 'mina@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone*'), {
      target: { value: '+86 138 0000 0000' },
    });
    fireEvent.change(screen.getByPlaceholderText('Country of Origin*'), {
      target: { value: 'China' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Procedure Interest*' }), {
      target: { value: 'smile-design' },
    });
    fireEvent.change(screen.getByPlaceholderText('How can we help?'), {
      target: { value: 'I want to compare options.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit Inquiry' }));

    await waitFor(() => {
      expect(crmApiState.initOnboarding).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Mina Patient',
        email: 'mina@example.com',
        phone: '+86 138 0000 0000',
        disease: 'Smile Design',
        procedureId: 'smile-design',
        category: 'dental',
        preferredLanguage: 'en',
        source: 'consultation_modal',
        countryOfOrigin: 'China',
        message: 'I want to compare options.',
      }));
    });

    expect(patientAuthState.bootstrapSession).toHaveBeenCalledWith(expect.objectContaining({
      patientId: 'patient-2',
      caseId: 'case-2',
      name: 'Mina Patient',
      email: 'mina@example.com',
      restoreToken: 'restore-token-2',
      nextStep: 'messages-ready',
    }));
    expect(patientEntryState.applyOnboardingResult).toHaveBeenCalledWith(expect.objectContaining({
      patientId: 'patient-2',
      caseId: 'case-2',
      nextStep: 'messages-ready',
      conversations: [{ id: 'conversation-1', type: 'patient-admin' }],
    }));
  });

  it('maps legacy procedure preselection to the shared public taxonomy', () => {
    consultationState.preselectedProcedure = 'Rhinoplasty';

    render(<ConsultationModal />);

    expect(screen.getByRole('combobox', { name: 'Procedure Interest*' })).toHaveValue('nose');
  });
});
