import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ConsultationSurvey from '@/pages/ConsultationSurvey';

const crmApiState = vi.hoisted(() => ({
  initOnboarding: vi.fn(),
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

vi.mock('@/contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: () => patientEntryState,
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      surveyAreaQuestion: 'Which area would you like to enhance?',
      surveyAreaSubtitle: 'Select the area you want to discuss.',
      surveyProcedureQuestion: 'Which procedure are you considering?',
      surveyProcedureSubtitle: 'Select the procedure.',
      surveyExperienceQuestion: 'Where are you in your journey?',
      surveyExperienceSubtitle: 'Tell us about your experience.',
      surveyTimelineQuestion: 'When are you hoping to begin?',
      surveyTimelineSubtitle: 'Choose your timeline.',
      surveyBudgetQuestion: 'What budget range are you considering?',
      surveyBudgetSubtitle: 'Select a budget range.',
      surveyConditionsQuestion: 'Any medical conditions we should know about?',
      surveyConditionsSubtitle: 'Select any that apply.',
      surveyContactQuestion: 'Almost done! How can we reach you?',
      surveyContactSubtitle: 'We will send your consultation plan.',
      surveyExpFirstTime: 'First time',
      surveyExpFirstTimeDesc: 'I have not had this before.',
      surveyExpRevision: 'Revision',
      surveyExpRevisionDesc: 'I want to revise prior work.',
      surveyExpExploring: 'Exploring',
      surveyExpExploringDesc: 'I am comparing options.',
      surveyTimeAsap: 'As soon as possible',
      surveyTimeAsapDesc: 'Ready soon.',
      surveyTime1to3: '1-3 months',
      surveyTime1to3Desc: 'Planning ahead.',
      surveyTime3to6: '3-6 months',
      surveyTime3to6Desc: 'Later this year.',
      surveyTimeExploring: 'Still exploring',
      surveyTimeExploringDesc: 'No firm date.',
      surveyBudgetUnder3k: 'Under $3k',
      surveyBudget3to6k: '$3k-$6k',
      surveyBudget6to10k: '$6k-$10k',
      surveyBudgetOver10k: 'Over $10k',
      surveyCondNone: 'None',
      surveyCondHeart: 'Heart condition',
      surveyCondDiabetes: 'Diabetes',
      surveyCondBlood: 'Blood disorder',
      surveyCondAllergies: 'Allergies',
      surveyCondOther: 'Other',
      surveyHealthSurvey: 'Health Survey',
      surveyFormName: 'Full Name',
      surveyFormEmail: 'Email Address',
      surveyFormPhone: 'Phone Number',
      surveyFormCountry: 'Country / Region',
      surveyFormNotes: 'Additional Notes',
      surveyFormNamePlaceholder: 'Your full name',
      surveyFormEmailPlaceholder: 'your@email.com',
      surveyFormPhonePlaceholder: '+1 (555) 000-0000',
      surveyFormCountryPlaceholder: 'e.g. United States',
      surveyFormNotesPlaceholder: 'Any specific questions or concerns...',
      surveyGetQuote: 'Get My Free Quote',
      surveySubmitting: 'Submitting...',
      surveyThankYou: 'Thank you',
      surveyThankYouDesc: 'We received your consultation request.',
      surveyThankYouNote: 'Our team will review it.',
      surveyGoHome: 'Go home',
      surveyBack: 'Back',
      surveyExit: 'Exit',
      surveyNext: 'Next',
      of: 'of',
    }[key] ?? key),
  }),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ currentLanguage: 'en' }),
}));

const renderSurvey = () => render(
  <MemoryRouter initialEntries={['/get-quote']}>
    <ConsultationSurvey />
  </MemoryRouter>,
);

const choose = async (name: string) => {
  fireEvent.click(await screen.findByRole('button', { name: new RegExp(name, 'i') }));
};

describe('Consultation survey CRM onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    crmApiState.initOnboarding.mockResolvedValue({
      patientId: 'patient-survey',
      caseId: 'case-survey',
      restoreToken: 'restore-survey',
      nextStep: 'messages-ready',
      conversations: [{ id: 'conversation-survey', type: 'patient-admin' }],
    });
  });

  it('uses the public procedure taxonomy and submits survey contact through CRM onboarding', async () => {
    renderSurvey();

    await choose('Dental / Smile');
    await waitFor(() => expect(screen.getByRole('button', { name: /Smile Design/i })).toBeInTheDocument());
    await choose('Smile Design');
    await choose('Exploring');
    await choose('Still exploring');
    await choose('Over \\$10k');
    await choose('None');
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));

    fireEvent.change(await screen.findByPlaceholderText('Your full name'), {
      target: { value: 'Sofia Patient' },
    });
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'sofia@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('+1 (555) 000-0000'), {
      target: { value: '+1 555 0144' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. United States'), {
      target: { value: 'United States' },
    });
    fireEvent.change(screen.getByPlaceholderText('Any specific questions or concerns...'), {
      target: { value: 'I want a natural smile.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Get My Free Quote/i }));

    await waitFor(() => {
      expect(crmApiState.initOnboarding).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Sofia Patient',
        email: 'sofia@example.com',
        phone: '+1 555 0144',
        disease: 'Smile Design',
        procedureId: 'smile-design',
        category: 'dental',
        preferredLanguage: 'en',
        source: 'get_quote',
        countryOfOrigin: 'United States',
      }));
    });

    const payload = crmApiState.initOnboarding.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('zipCode');
    expect(payload).not.toHaveProperty('preferredProvider');
    expect(String(payload.message)).toContain('I want a natural smile.');
    expect(String(payload.message)).toContain('timeline: Still exploring');

    expect(patientAuthState.bootstrapSession).toHaveBeenCalledWith(expect.objectContaining({
      patientId: 'patient-survey',
      caseId: 'case-survey',
      name: 'Sofia Patient',
      email: 'sofia@example.com',
      restoreToken: 'restore-survey',
      nextStep: 'messages-ready',
    }));
    expect(patientEntryState.applyOnboardingResult).toHaveBeenCalledWith(expect.objectContaining({
      patientId: 'patient-survey',
      caseId: 'case-survey',
      nextStep: 'messages-ready',
      conversations: [{ id: 'conversation-survey', type: 'patient-admin' }],
    }));
  });
});
