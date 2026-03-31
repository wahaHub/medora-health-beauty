/**
 * Tests for PackagesCatalog risky paths:
 *   1. Unauthenticated access → redirect to /login
 *   2. Payment intent fails → retry reuses same orderId, no second order
 *   3. Modal close between order and payment → re-open resumes at await-payment
 *   4. Patient-scoped keys: patient B cannot see patient A's pending orderId
 *   5. Stale orderId escape hatch: "Start over" clears stale key and restarts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ProtectedRoute } from '../components/ProtectedRoute';
import PackagesCatalog from '../pages/PackagesCatalog';

// ─── Mocks ────────────────────────────────────────────────────────────────────

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
      <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

function authAs(patient: { id: string; caseId?: string } | null) {
  mockUsePatientAuth.mockReturnValue({
    isAuthenticated: patient !== null,
    isLoading: false,
    patient,
  });
}

function setupPackages() {
  mockUsePatientPackages.mockReturnValue({
    data: { data: [FAKE_PACKAGE] },
    isLoading: false,
    error: null,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('/packages route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  // ── 1. Unauthenticated access ───────────────────────────────────────────────

  it('redirects unauthenticated users to /login', () => {
    authAs(null);

    renderWithRouter(
      <Routes>
        <Route
          path="/packages"
          element={<ProtectedRoute><PackagesCatalog /></ProtectedRoute>}
        />
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>,
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByText('Packages')).not.toBeInTheDocument();
  });

  // ── 2. Payment-intent retry reuses existing orderId ────────────────────────

  it('does not create a second order when payment-intent fails and user retries', async () => {
    const user = userEvent.setup();
    authAs({ id: 'patient-1', caseId: 'case-1' });
    setupPackages();

    const createOrderMutateAsync = vi.fn().mockResolvedValue({ id: 'order-42' });
    mockUseCreatePatientOrder.mockReturnValue({ mutateAsync: createOrderMutateAsync, isPending: false });

    const createPaymentMutateAsync = vi
      .fn()
      .mockRejectedValueOnce(new Error('Stripe gateway timeout'))
      .mockResolvedValueOnce({ clientSecret: 'pi_test_secret_abc' });
    mockUseCreatePaymentIntent.mockReturnValue({ mutateAsync: createPaymentMutateAsync, isPending: false });

    renderWithRouter(<Routes><Route path="/packages" element={<PackagesCatalog />} /></Routes>);

    await user.click(screen.getByRole('button', { name: /order/i }));
    await user.click(screen.getByRole('button', { name: /proceed to payment/i }));
    await waitFor(() => expect(createOrderMutateAsync).toHaveBeenCalledTimes(1));

    // First pay attempt fails
    await user.click(screen.getByRole('button', { name: /pay now/i }));
    await waitFor(() => expect(screen.getByText(/stripe gateway timeout/i)).toBeInTheDocument());
    expect(createOrderMutateAsync).toHaveBeenCalledTimes(1);

    // Retry — must reuse same orderId
    await user.click(screen.getByRole('button', { name: /pay now/i }));
    await waitFor(() => expect(screen.getByText(/pi_test_secret_abc/i)).toBeInTheDocument());

    expect(createOrderMutateAsync).toHaveBeenCalledTimes(1);
    expect(createPaymentMutateAsync).toHaveBeenCalledTimes(2);
    expect(createPaymentMutateAsync).toHaveBeenNthCalledWith(1, 'order-42');
    expect(createPaymentMutateAsync).toHaveBeenNthCalledWith(2, 'order-42');
  });

  // ── 3. Modal close between order and payment resumes at await-payment ───────

  it('resumes to await-payment on re-open when modal was closed after order created', async () => {
    const user = userEvent.setup();
    authAs({ id: 'patient-1', caseId: 'case-1' });
    setupPackages();

    const createOrderMutateAsync = vi.fn().mockResolvedValue({ id: 'order-99' });
    mockUseCreatePatientOrder.mockReturnValue({ mutateAsync: createOrderMutateAsync, isPending: false });
    mockUseCreatePaymentIntent.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ clientSecret: 'pi_test_secret_xyz' }),
      isPending: false,
    });

    renderWithRouter(<Routes><Route path="/packages" element={<PackagesCatalog />} /></Routes>);

    await user.click(screen.getByRole('button', { name: /order/i }));
    await user.click(screen.getByRole('button', { name: /proceed to payment/i }));
    await waitFor(() => expect(createOrderMutateAsync).toHaveBeenCalledTimes(1));

    // Close modal (X button has no accessible name, find by role)
    const closeBtn = screen.getAllByRole('button').find(
      (b) => b.textContent === '' || b.querySelector('svg'),
    );
    await user.click(closeBtn!);

    // Re-open — must skip confirm and land on await-payment
    await user.click(screen.getByRole('button', { name: /order/i }));
    expect(screen.getByText(/order-99/i)).toBeInTheDocument();
    expect(createOrderMutateAsync).toHaveBeenCalledTimes(1);
  });

  // ── 4. Patient-scoped keys: patient B cannot see patient A's pending order ──

  it('does not reuse a pending orderId belonging to a different patient', async () => {
    const user = userEvent.setup();

    // Pre-seed sessionStorage as if patient-A had a pending order
    sessionStorage.setItem('medora:pending-order:patient-A:pkg-1', 'order-from-patient-A');

    // Now patient-B signs in
    authAs({ id: 'patient-B', caseId: 'case-B' });
    setupPackages();

    const createOrderMutateAsync = vi.fn().mockResolvedValue({ id: 'order-from-patient-B' });
    mockUseCreatePatientOrder.mockReturnValue({ mutateAsync: createOrderMutateAsync, isPending: false });
    mockUseCreatePaymentIntent.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ clientSecret: 'pi_B' }),
      isPending: false,
    });

    renderWithRouter(<Routes><Route path="/packages" element={<PackagesCatalog />} /></Routes>);

    await user.click(screen.getByRole('button', { name: /order/i }));

    // Patient B should land on confirm (no existing order), not await-payment
    expect(screen.getByRole('button', { name: /proceed to payment/i })).toBeInTheDocument();
    // createOrder not called yet (still on confirm)
    expect(createOrderMutateAsync).toHaveBeenCalledTimes(0);
  });

  // ── 5. Stale orderId escape hatch clears key and restarts flow ──────────────

  it('offers "Start over" when payment-intent fails, and restarting creates a new order', async () => {
    const user = userEvent.setup();
    authAs({ id: 'patient-1', caseId: 'case-1' });
    setupPackages();

    const createOrderMutateAsync = vi
      .fn()
      .mockResolvedValueOnce({ id: 'order-stale' })
      .mockResolvedValueOnce({ id: 'order-fresh' });
    mockUseCreatePatientOrder.mockReturnValue({ mutateAsync: createOrderMutateAsync, isPending: false });

    // Payment intent always fails for order-stale
    mockUseCreatePaymentIntent.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(new Error('Order cancelled')),
      isPending: false,
    });

    renderWithRouter(<Routes><Route path="/packages" element={<PackagesCatalog />} /></Routes>);

    // Create first order
    await user.click(screen.getByRole('button', { name: /order/i }));
    await user.click(screen.getByRole('button', { name: /proceed to payment/i }));
    await waitFor(() => expect(createOrderMutateAsync).toHaveBeenCalledTimes(1));

    // Trigger payment intent failure
    await user.click(screen.getByRole('button', { name: /pay now/i }));
    await waitFor(() => expect(screen.getByText(/order cancelled/i)).toBeInTheDocument());

    // "Start over" link should appear
    const startOver = await screen.findByRole('button', { name: /start over/i });
    await user.click(startOver);

    // Should be back on confirm stage with a fresh slate
    expect(screen.getByRole('button', { name: /proceed to payment/i })).toBeInTheDocument();

    // Creating order again produces a new orderId
    mockUseCreatePaymentIntent.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ clientSecret: 'pi_fresh' }),
      isPending: false,
    });
    await user.click(screen.getByRole('button', { name: /proceed to payment/i }));
    await waitFor(() => expect(createOrderMutateAsync).toHaveBeenCalledTimes(2));
    expect(createOrderMutateAsync).toHaveBeenNthCalledWith(2, expect.objectContaining({ packageId: 'pkg-1' }));
  });
});
