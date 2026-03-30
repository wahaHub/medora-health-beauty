/**
 * Tests for the two risky paths in the PackagesCatalog + /packages route:
 *   1. Unauthenticated access → redirect to /login (ProtectedRoute guard)
 *   2. Payment intent fails → retry reuses existing orderId, no second order created
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ProtectedRoute } from '../components/ProtectedRoute';
import PackagesCatalog from '../pages/PackagesCatalog';

// ─── Context mocks ────────────────────────────────────────────────────────────

vi.mock('../contexts/PatientAuthContext', () => ({
  usePatientAuth: vi.fn(),
  PatientAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../hooks/usePatientPhase2', () => ({
  usePatientPackages: vi.fn(),
  useCreatePatientOrder: vi.fn(),
  useCreatePaymentIntent: vi.fn(),
}));

import { usePatientAuth } from '../contexts/PatientAuthContext';
import {
  usePatientPackages,
  useCreatePatientOrder,
  useCreatePaymentIntent,
} from '../hooks/usePatientPhase2';

const mockUsePatientAuth = usePatientAuth as ReturnType<typeof vi.fn>;
const mockUsePatientPackages = usePatientPackages as ReturnType<typeof vi.fn>;
const mockUseCreatePatientOrder = useCreatePatientOrder as ReturnType<typeof vi.fn>;
const mockUseCreatePaymentIntent = useCreatePaymentIntent as ReturnType<typeof vi.fn>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FAKE_PACKAGE = {
  id: 'pkg-1',
  nameEn: 'Premium Package',
  nameZh: null,
  descriptionEn: 'All-inclusive medical travel package',
  descriptionZh: null,
  price: '5000',
  currency: 'USD',
  coverImageUrl: null,
};

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderWithRouter(ui: React.ReactElement, { initialPath = '/packages' } = {}) {
  const client = makeQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialPath]}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('/packages route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  // ── Test 1: unauthenticated access ─────────────────────────────────────────

  it('redirects unauthenticated users to /login', () => {
    mockUsePatientAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      patient: null,
    });

    renderWithRouter(
      <Routes>
        <Route
          path="/packages"
          element={
            <ProtectedRoute>
              <PackagesCatalog />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>,
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByText('Packages')).not.toBeInTheDocument();
  });

  // ── Test 2: payment-intent retry reuses existing orderId ───────────────────

  it('does not create a second order when payment-intent fails and user retries', async () => {
    const user = userEvent.setup();

    mockUsePatientAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      patient: { id: 'patient-1', caseId: 'case-1' },
    });

    mockUsePatientPackages.mockReturnValue({
      data: { data: [FAKE_PACKAGE] },
      isLoading: false,
      error: null,
    });

    const createOrderMutateAsync = vi.fn().mockResolvedValue({ id: 'order-42' });
    mockUseCreatePatientOrder.mockReturnValue({
      mutateAsync: createOrderMutateAsync,
      isPending: false,
    });

    // First call to createPaymentIntent fails; second call succeeds.
    const createPaymentMutateAsync = vi
      .fn()
      .mockRejectedValueOnce(new Error('Stripe gateway timeout'))
      .mockResolvedValueOnce({ clientSecret: 'pi_test_secret_abc' });

    mockUseCreatePaymentIntent.mockReturnValue({
      mutateAsync: createPaymentMutateAsync,
      isPending: false,
    });

    renderWithRouter(
      <Routes>
        <Route path="/packages" element={<PackagesCatalog />} />
      </Routes>,
    );

    // Click "Order" on the package card
    await user.click(screen.getByRole('button', { name: /order/i }));

    // Confirm stage: click "Proceed to Payment" → creates the order
    await user.click(screen.getByRole('button', { name: /proceed to payment/i }));
    await waitFor(() => expect(createOrderMutateAsync).toHaveBeenCalledTimes(1));

    // Now on await-payment. Click "Pay Now" → payment intent fails
    await user.click(screen.getByRole('button', { name: /pay now/i }));
    await waitFor(() =>
      expect(screen.getByText(/stripe gateway timeout/i)).toBeInTheDocument(),
    );

    // createOrder must still have been called exactly once
    expect(createOrderMutateAsync).toHaveBeenCalledTimes(1);

    // Retry "Pay Now" — must not call createOrder again
    await user.click(screen.getByRole('button', { name: /pay now/i }));
    await waitFor(() =>
      expect(screen.getByText(/pi_test_secret_abc/i)).toBeInTheDocument(),
    );

    // createOrder called exactly once in total; createPaymentIntent called twice
    expect(createOrderMutateAsync).toHaveBeenCalledTimes(1);
    expect(createPaymentMutateAsync).toHaveBeenCalledTimes(2);
    // Both calls used the same orderId
    expect(createPaymentMutateAsync).toHaveBeenNthCalledWith(1, 'order-42');
    expect(createPaymentMutateAsync).toHaveBeenNthCalledWith(2, 'order-42');
  });

  // ── Bonus: modal-close between order and payment still reuses orderId ──────

  it('resumes to await-payment on re-open when modal was closed after order created', async () => {
    const user = userEvent.setup();

    mockUsePatientAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      patient: { id: 'patient-1', caseId: 'case-1' },
    });

    mockUsePatientPackages.mockReturnValue({
      data: { data: [FAKE_PACKAGE] },
      isLoading: false,
      error: null,
    });

    const createOrderMutateAsync = vi.fn().mockResolvedValue({ id: 'order-99' });
    mockUseCreatePatientOrder.mockReturnValue({
      mutateAsync: createOrderMutateAsync,
      isPending: false,
    });

    mockUseCreatePaymentIntent.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ clientSecret: 'pi_test_secret_xyz' }),
      isPending: false,
    });

    renderWithRouter(
      <Routes>
        <Route path="/packages" element={<PackagesCatalog />} />
      </Routes>,
    );

    // Open modal and create order
    await user.click(screen.getByRole('button', { name: /order/i }));
    await user.click(screen.getByRole('button', { name: /proceed to payment/i }));
    await waitFor(() => expect(createOrderMutateAsync).toHaveBeenCalledTimes(1));

    // Close the modal while on await-payment
    await user.click(screen.getByRole('button', { name: '' })); // X button
    expect(screen.queryByText(/order-99/i)).not.toBeInTheDocument();

    // Re-open — should jump straight to await-payment (no confirm stage)
    await user.click(screen.getByRole('button', { name: /order/i }));
    expect(screen.getByText(/order-99/i)).toBeInTheDocument();

    // createOrder was NOT called a second time
    expect(createOrderMutateAsync).toHaveBeenCalledTimes(1);
  });
});
