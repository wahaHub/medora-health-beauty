import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { PatientAuthProvider, usePatientAuth } from '../contexts/PatientAuthContext';
import {
  ApiError,
  request,
  RESTORE_TOKEN_STORAGE_KEY,
} from '../services/crmApiClient';

const crmApiMock = vi.hoisted(() => ({
  getMe: vi.fn(),
  restoreSession: vi.fn(),
  verifyMagicLink: vi.fn(),
  sendMagicLink: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../services/crmApiClient', async () => {
  const actual = await vi.importActual<typeof import('../services/crmApiClient')>('../services/crmApiClient');
  return {
    ...actual,
    crmApi: crmApiMock,
  };
});

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function AuthProbe() {
  const { isAuthenticated, isLoading, patient } = usePatientAuth();

  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="patient-id">{patient?.id ?? 'none'}</div>
    </div>
  );
}

describe('PatientAuthProvider site-scoped restore', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    crmApiMock.getMe.mockRejectedValue(new Error('no active cookie session'));
    crmApiMock.restoreSession.mockResolvedValue({
      patientId: 'beauty-patient-1',
      caseId: 'case-1',
      restoreToken: 'beauty-token-1',
      nextStep: 'messages-ready',
    });
  });

  it('does not restore from the legacy shared restore-token key', async () => {
    localStorage.setItem('medora.patient.restoreToken', 'legacy-shared-token');

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <MemoryRouter initialEntries={['/login']}>
          <PatientAuthProvider>
            <AuthProbe />
          </PatientAuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(crmApiMock.getMe).toHaveBeenCalledTimes(1);
    expect(crmApiMock.restoreSession).not.toHaveBeenCalled();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('patient-id')).toHaveTextContent('none');
    expect(localStorage.getItem('medora.patient.restoreToken')).toBe('legacy-shared-token');
    expect(localStorage.getItem('beauty.patient.restoreToken')).toBeNull();
  });

  it('restores successfully from the Beauty-scoped restore-token key', async () => {
    localStorage.setItem(RESTORE_TOKEN_STORAGE_KEY, 'beauty-scoped-token');

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <MemoryRouter initialEntries={['/login']}>
          <PatientAuthProvider>
            <AuthProbe />
          </PatientAuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(crmApiMock.getMe).toHaveBeenCalled();
    expect(crmApiMock.restoreSession).toHaveBeenCalledWith('beauty-scoped-token');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('patient-id')).toHaveTextContent('beauty-patient-1');
    expect(localStorage.getItem(RESTORE_TOKEN_STORAGE_KEY)).toBe('beauty-token-1');
  });

  it('preserves a valid Beauty restore token when dashboard token verification fails transiently', async () => {
    crmApiMock.getMe.mockResolvedValueOnce(null);
    crmApiMock.verifyMagicLink.mockRejectedValueOnce(new ApiError('CRM temporarily unavailable', 503));
    localStorage.setItem(RESTORE_TOKEN_STORAGE_KEY, 'beauty-scoped-token');

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <MemoryRouter initialEntries={['/dashboard?token=magic-token']}>
          <PatientAuthProvider>
            <AuthProbe />
          </PatientAuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(crmApiMock.verifyMagicLink).toHaveBeenCalledWith('magic-token');
    expect(localStorage.getItem(RESTORE_TOKEN_STORAGE_KEY)).toBe('beauty-scoped-token');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('clears the Beauty restore token when dashboard token verification fails with a 4xx auth error', async () => {
    crmApiMock.getMe.mockResolvedValueOnce(null);
    crmApiMock.verifyMagicLink.mockRejectedValueOnce(new ApiError('invalid token', 401));
    localStorage.setItem(RESTORE_TOKEN_STORAGE_KEY, 'beauty-scoped-token');

    render(
      <QueryClientProvider client={makeQueryClient()}>
        <MemoryRouter initialEntries={['/dashboard?token=bad-token']}>
          <PatientAuthProvider>
            <AuthProbe />
          </PatientAuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(crmApiMock.verifyMagicLink).toHaveBeenCalledWith('bad-token');
    expect(localStorage.getItem(RESTORE_TOKEN_STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });
});

describe('Beauty CRM client request paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps browser requests on the relative Beauty proxy path', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue('{"ok":true}'),
    });
    vi.stubGlobal('fetch', fetchMock);

    await request('/me');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/patient/me',
      expect.objectContaining({
        credentials: 'include',
      }),
    );
  });
});
