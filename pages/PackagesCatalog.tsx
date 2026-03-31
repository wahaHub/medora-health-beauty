import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Check,
  X,
  CreditCard,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  usePatientPackages,
  useCreatePatientOrder,
  useCreatePaymentIntent,
} from '../hooks/usePatientPhase2';
import { usePatientAuth } from '../contexts/PatientAuthContext';
import type { PatientPackage } from '../services/patientPhase2Api';
import { pendingOrderKey } from '../services/storageKeys';

function PackageCard({
  pkg,
  onSelect,
}: {
  pkg: PatientPackage;
  onSelect: (pkg: PatientPackage) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {pkg.coverImageUrl && (
        <img src={pkg.coverImageUrl} alt={pkg.nameEn} className="h-44 w-full object-cover" />
      )}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-serif font-semibold text-navy-900 mb-1">
          {pkg.nameZh ?? pkg.nameEn}
        </h3>
        <p className="text-stone-500 text-sm flex-1 line-clamp-3">
          {pkg.descriptionZh ?? pkg.descriptionEn ?? ''}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gold-700">
            {pkg.currency} {Number(pkg.price).toLocaleString()}
          </span>
          <button
            onClick={() => onSelect(pkg)}
            className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Order
          </button>
        </div>
      </div>
    </div>
  );
}

type ModalState =
  | { stage: 'confirm'; pkg: PatientPackage }
  | { stage: 'await-payment'; orderId: string; pkg: PatientPackage }
  | { stage: 'payment'; orderId: string; pkg: PatientPackage }
  | { stage: 'done'; pkg: PatientPackage };

export default function PackagesCatalog() {
  const navigate = useNavigate();
  const { patient } = usePatientAuth();
  const patientId = patient?.id ?? '';
  const { data, isLoading, error: packagesError } = usePatientPackages();
  const createOrder = useCreatePatientOrder();
  const createPayment = useCreatePaymentIntent();

  const [modal, setModal] = useState<ModalState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const packages = data?.data ?? [];

  const openModal = (pkg: PatientPackage) => {
    const existingOrderId = patientId
      ? sessionStorage.getItem(pendingOrderKey(patientId, pkg.id))
      : null;

    setModal(
      existingOrderId
        ? { stage: 'await-payment', orderId: existingOrderId, pkg }
        : { stage: 'confirm', pkg },
    );
    setError(null);
  };

  const handleCreateOrder = async () => {
    if (!modal || modal.stage !== 'confirm' || !patientId) return;
    setError(null);
    try {
      const order = await createOrder.mutateAsync({
        packageId: modal.pkg.id,
        ...(patient?.caseId ? { caseId: patient.caseId } : {}),
      });
      sessionStorage.setItem(pendingOrderKey(patientId, modal.pkg.id), order.id);
      setModal({ stage: 'await-payment', orderId: order.id, pkg: modal.pkg });
    } catch (e: any) {
      setError(e.message ?? 'Failed to create order');
    }
  };

  const handleInitPayment = async () => {
    if (!modal || modal.stage !== 'await-payment') return;
    setError(null);
    try {
      await createPayment.mutateAsync(modal.orderId);
      setModal({ stage: 'payment', orderId: modal.orderId, pkg: modal.pkg });
    } catch (e: any) {
      setError(e.message ?? 'Failed to initialize payment');
    }
  };

  const abandonAndRestart = (pkg: PatientPackage) => {
    if (patientId) {
      sessionStorage.removeItem(pendingOrderKey(patientId, pkg.id));
    }
    setModal({ stage: 'confirm', pkg });
    setError(null);
  };

  const closeModal = () => {
    setModal(null);
    setError(null);
  };

  const finishAndClose = (pkg: PatientPackage) => {
    if (patientId) {
      sessionStorage.removeItem(pendingOrderKey(patientId, pkg.id));
    }
    setModal(null);
    setError(null);
  };

  if (isLoading) {
    return <div className="text-center py-20 text-stone-400">Loading packages…</div>;
  }

  if (packagesError) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-10 text-center max-w-sm">
          <AlertCircle className="mx-auto text-red-400 mb-3" size={36} />
          <p className="font-medium text-stone-700 mb-1">Could not load packages</p>
          <p className="text-stone-400 text-sm">{(packagesError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy-900">Packages</h1>
          <p className="text-stone-500 mt-1">Choose a package that fits your journey.</p>
        </div>

        {packages.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center">
            <ShoppingBag className="mx-auto text-stone-300 mb-3" size={40} />
            <p className="text-stone-400">No packages available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onSelect={openModal} />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy-900">
                {modal.stage === 'confirm' && 'Confirm Order'}
                {modal.stage === 'await-payment' && 'Proceed to Payment'}
                {modal.stage === 'payment' && 'Payment'}
                {modal.stage === 'done' && 'Order Placed!'}
              </h2>
              <button onClick={closeModal}><X size={18} /></button>
            </div>

            {modal.stage === 'confirm' && (
              <>
                <div className="bg-stone-50 rounded-xl p-4 space-y-2 text-sm">
                  <p className="font-medium text-stone-800">{modal.pkg.nameZh ?? modal.pkg.nameEn}</p>
                  <p className="text-stone-500">{modal.pkg.descriptionZh ?? modal.pkg.descriptionEn ?? ''}</p>
                  <p className="text-gold-700 font-bold text-base">
                    {modal.pkg.currency} {Number(modal.pkg.price).toLocaleString()}
                  </p>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  onClick={handleCreateOrder}
                  disabled={createOrder.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {createOrder.isPending ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  {createOrder.isPending ? 'Creating order…' : 'Proceed to Payment'}
                </button>
              </>
            )}

            {modal.stage === 'await-payment' && (
              <>
                <p className="text-stone-500 text-sm">
                  Order <span className="font-mono">#{modal.orderId.slice(0, 8)}</span> created.
                  Click below to initialise your payment.
                </p>
                {error && (
                  <div className="space-y-2">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button
                      onClick={() => abandonAndRestart(modal.pkg)}
                      className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <RotateCcw size={12} /> Start over with a new order
                    </button>
                  </div>
                )}
                <button
                  onClick={handleInitPayment}
                  disabled={createPayment.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {createPayment.isPending ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  {createPayment.isPending ? 'Initializing payment…' : 'Pay Now'}
                </button>
              </>
            )}

            {modal.stage === 'payment' && (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm space-y-2">
                  <p className="font-medium text-amber-800">Payment Ready</p>
                  <p className="text-amber-600">
                    Order #{modal.orderId.slice(0, 8)} created. The real checkout surface will use the payment intent privately.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/dashboard/orders?orderId=${modal.orderId}`)}
                    className="flex-1 bg-gold-600 hover:bg-gold-700 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    View Order
                  </button>
                  <button
                    onClick={() => setModal({ stage: 'done', pkg: modal.pkg })}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl font-medium transition-colors"
                  >
                    Mark Complete
                  </button>
                </div>
              </>
            )}

            {modal.stage === 'done' && (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check size={24} className="text-green-600" />
                </div>
                <p className="font-semibold text-stone-800">Order placed successfully!</p>
                <p className="text-stone-500 text-sm">Your coordinator will be in touch shortly.</p>
                <button
                  onClick={() => finishAndClose(modal.pkg)}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
