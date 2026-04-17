import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ContactInfoStep } from '../components/chat/ContactInfoStep';

const patientAuthState = vi.hoisted(() => ({
  bootstrapSession: vi.fn(async (session: unknown) => session),
}));

const patientEntryState = vi.hoisted(() => ({
  profileDraft: {
    name: 'Alice Beauty',
    email: 'alice@example.com',
    phone: '+1 555 0100',
    disease: '',
    destination: '',
    category: '',
    procedureId: '',
  },
  patchProfileDraft: vi.fn((patch: Record<string, unknown>) => {
    patientEntryState.profileDraft = {
      ...patientEntryState.profileDraft,
      ...patch,
    };
  }),
  applyOnboardingResult: vi.fn(),
}));

const crmApiState = vi.hoisted(() => ({
  getProcedures: vi.fn(),
  getDestinations: vi.fn(),
  initOnboarding: vi.fn(),
}));

vi.mock('../contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('../hooks/usePatientEntry', () => ({
  usePatientEntry: () => patientEntryState,
}));

vi.mock('../services/crmApiClient', async () => {
  const actual = await vi.importActual<typeof import('../services/crmApiClient')>('../services/crmApiClient');
  return {
    ...actual,
    crmApi: crmApiState,
  };
});

describe('Beauty widget onboarding form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patientEntryState.profileDraft = {
      name: 'Alice Beauty',
      email: 'alice@example.com',
      phone: '+1 555 0100',
      disease: '',
      destination: '',
      category: '',
      procedureId: '',
    };
    crmApiState.getProcedures.mockImplementation(async (category?: string) => ({
      procedures: category === 'face'
        ? [{ id: 'rhinoplasty', name: 'Rhinoplasty' }]
        : category === 'body'
          ? [{ id: 'liposuction', name: 'Liposuction' }]
          : [{ id: 'botox', name: 'Botox' }],
    }));
    crmApiState.getDestinations.mockResolvedValue({
      destinations: ['South Korea', 'Thailand'],
    });
    crmApiState.initOnboarding.mockResolvedValue({
      patientId: 'patient-1',
      caseId: 'case-1',
      restoreToken: 'restore-token-1',
      nextStep: 'messages-ready',
      conversations: [],
    });
  });

  it('renders a grouped procedure select, a destination select, and the Submit details CTA', async () => {
    render(<ContactInfoStep />);

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Condition / Procedure' })).toBeInTheDocument();
    });

    expect(screen.getByRole('combobox', { name: 'Destination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit details' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Find My Hospitals' })).toBeNull();
  });

  it('submits the selected procedure metadata and destination through initOnboarding', async () => {
    const view = render(<ContactInfoStep />);

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Condition / Procedure' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox', { name: 'Condition / Procedure' }), {
      target: { value: 'rhinoplasty' },
    });
    view.rerender(<ContactInfoStep />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Destination' }), {
      target: { value: 'South Korea' },
    });
    view.rerender(<ContactInfoStep />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit details' }));

    await waitFor(() => {
      expect(crmApiState.initOnboarding).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Alice Beauty',
        email: 'alice@example.com',
        phone: '+1 555 0100',
        disease: 'Rhinoplasty',
        category: 'face',
        destination: 'South Korea',
      }));
    });

    expect(crmApiState.initOnboarding).not.toHaveBeenCalledWith(expect.objectContaining({
      procedureId: 'rhinoplasty',
    }));
  });
});
