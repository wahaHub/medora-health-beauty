import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import DashboardLayout from '../pages/dashboard/DashboardLayout';

const patientAuthState = vi.hoisted(() => ({
  patient: { id: 'patient-1', name: 'Beauty Patient' },
  logout: vi.fn(),
}));

const patientCasesState = vi.hoisted(() => ({
  data: { cases: [] },
}));

vi.mock('../contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('../hooks/usePatientCases', () => ({
  usePatientCases: () => patientCasesState,
}));

describe('Beauty dashboard route inventory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patientCasesState.data = { cases: [] };
  });

  it('shows the expected top-nav tabs', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<div>Dashboard home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /quotes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /messages/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tickets/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /journey/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ai summary/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /support/i })).toBeNull();
  });
});
