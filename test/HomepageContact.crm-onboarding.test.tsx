import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Contact from '@/components/Contact';

const crmApiState = vi.hoisted(() => ({
  initOnboarding: vi.fn(),
}));

const patientAuthState = vi.hoisted(() => ({
  bootstrapSession: vi.fn(),
}));

const patientEntryState = vi.hoisted(() => ({
  applyOnboardingResult: vi.fn(),
}));

vi.mock('@/services/crmApiClient', async () => {
  const actual = await vi.importActual<typeof import('@/services/crmApiClient')>('@/services/crmApiClient');
  return {
    ...actual,
    crmApi: crmApiState,
  };
});

vi.mock('@/contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: () => patientEntryState,
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      categoryFace: 'Face',
      categoryBody: 'Body',
      categoryBreast: 'Breast',
      categoryNonSurgical: 'Non Surgical',
      contactTitle: 'Contact',
      contactPhone: 'Phone: (201) 406-6514',
      contactEmailDisplay: 'Email: contact@medorabeauty.com',
      contactRequired: '* Required',
      contactFirstName: 'First Name*',
      contactLastName: 'Last Name*',
      contactEmail: 'Email*',
      contactPhoneField: 'Phone*',
      contactZipCode: 'Zip Code*',
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

vi.mock('@/hooks/useScrollReveal', () => ({
  useScrollReveal: vi.fn(),
}));

vi.mock('@/services/surgeons', () => ({
  fetchSurgeonsData: vi.fn(async () => ({
    surgeonsBySpecialty: {
      face: [{ surgeon_id: 'dr-chen', name: 'Dr. Chen' }],
    },
  })),
}));

describe('Homepage contact CRM onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    crmApiState.initOnboarding.mockResolvedValue({
      patientId: 'patient-1',
      caseId: 'case-1',
      restoreToken: 'restore-token-1',
      nextStep: 'messages-ready',
      conversations: [],
    });
  });

  it('submits homepage consultation details through the CRM onboarding flow', async () => {
    render(<Contact />);

    fireEvent.change(screen.getByPlaceholderText('First Name*'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name*'), {
      target: { value: 'Beauty' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email*'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone*'), {
      target: { value: '+1 555 0100' },
    });
    fireEvent.change(screen.getByPlaceholderText('Zip Code*'), {
      target: { value: '90210' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Procedure Interest*' }), {
      target: { value: 'Rhinoplasty' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Preferred Provider*' }), {
      target: { value: 'any' },
    });
    fireEvent.change(screen.getByPlaceholderText('How can we help?'), {
      target: { value: 'I want a natural result.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit Inquiry' }));

    await waitFor(() => {
      expect(crmApiState.initOnboarding).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Alice Beauty',
        email: 'alice@example.com',
        phone: '+1 555 0100',
        disease: 'Rhinoplasty',
        category: 'face',
        preferredLanguage: 'en',
        source: 'homepage_contact',
        zipCode: '90210',
        preferredProvider: 'any',
        message: 'I want a natural result.',
      }));
    });
  });
});
