import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import DashboardLayout from '@/pages/dashboard/DashboardLayout';

const patientAuthState = vi.hoisted(() => ({
  patient: { id: 'patient-1', name: 'Beauty Patient' },
  logout: vi.fn(),
}));

const patientCasesState = vi.hoisted(() => ({
  data: { cases: [] },
}));

vi.mock('@/contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('@/hooks/usePatientCases', () => ({
  usePatientCases: () => patientCasesState,
}));

describe('Beauty dashboard route inventory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patientCasesState.data = { cases: [] };
  });

  it('shows the reference-style sidebar tabs and renders query-tab content', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard?tab=quotes']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<div>Dashboard home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('patient-dashboard-shell')).toBeInTheDocument();
    expect(screen.getByText('Beauty Patient')).toBeInTheDocument();
    expect(screen.getByText(/case workspace/i)).toBeInTheDocument();
    const nav = within(screen.getByRole('navigation', { name: /patient dashboard/i }));
    expect(nav.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/dashboard?tab=home');
    expect(nav.getByRole('link', { name: /quotes/i })).toHaveAttribute('href', '/dashboard?tab=quotes');
    expect(nav.getByRole('link', { name: /messages/i })).toHaveAttribute('href', '/dashboard?tab=messages');
    expect(nav.getByRole('link', { name: /tickets/i })).toHaveAttribute('href', '/dashboard?tab=tickets');
    expect(nav.getByRole('link', { name: /orders/i })).toHaveAttribute('href', '/dashboard?tab=orders');
    expect(nav.getByRole('link', { name: /journey/i })).toHaveAttribute('href', '/dashboard?tab=journey');
    expect(nav.getByRole('link', { name: /ai summary/i })).toHaveAttribute('href', '/dashboard?tab=ai-summary');
    expect(screen.getByRole('heading', { name: /quotes/i })).toBeInTheDocument();
  });

  it('keeps legacy nested dashboard routes active inside the new shell', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/messages']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="messages" element={<div>Legacy messages route</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('patient-dashboard-shell')).toBeInTheDocument();
    expect(screen.getByText('Legacy messages route')).toBeInTheDocument();
    const nav = within(screen.getByRole('navigation', { name: /patient dashboard/i }));
    expect(nav.getByRole('link', { name: /messages/i })).toHaveClass('bg-teal-600');
  });
});
