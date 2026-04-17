import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';

import { HospitalCards } from '../components/chat/HospitalCards';

const patientEntryState = vi.hoisted(() => ({
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
  matchedHospitals: [],
  setMatchedHospitals: vi.fn(),
  selectedHospitalIds: [],
  toggleHospitalSelection: vi.fn(),
  applyOnboardingResult: vi.fn(),
  openPanel: vi.fn(),
}));

const patientAuthState = vi.hoisted(() => ({
  patient: { id: 'patient-1' },
}));

const crmApiState = vi.hoisted(() => ({
  matchHospitals: vi.fn(),
  selectHospitals: vi.fn(),
  getConversations: vi.fn(),
}));

vi.mock('../hooks/usePatientEntry', () => ({
  usePatientEntry: () => patientEntryState,
}));

vi.mock('../contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('../services/crmApiClient', async () => {
  const actual = await vi.importActual<typeof import('../services/crmApiClient')>('../services/crmApiClient');
  return {
    ...actual,
    crmApi: crmApiState,
  };
});

describe('HospitalCards matching inputs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patientEntryState.profileDraft = {
      name: 'Alice Beauty',
      email: 'alice@example.com',
      phone: '+1 555 0100',
      disease: 'Rhinoplasty',
      destination: 'South Korea',
      category: 'face',
      procedureId: 'rhinoplasty',
    };
    patientEntryState.matchedHospitals = [];
    crmApiState.matchHospitals.mockResolvedValue({ hospitals: [] });
  });

  it('includes procedureId, category, and destination when fetching hospital matches', async () => {
    render(<HospitalCards />);

    await waitFor(() => {
      expect(crmApiState.matchHospitals).toHaveBeenCalledWith({
        procedureId: 'rhinoplasty',
        category: 'face',
        destination: 'South Korea',
      });
    });
  });
});
