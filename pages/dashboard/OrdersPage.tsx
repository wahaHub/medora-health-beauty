import { useState } from 'react';
import { ShoppingBag, CreditCard, ChevronRight, X } from 'lucide-react';
import { usePatientOrders, usePatientOrder, useCreatePaymentIntent } from '../../hooks/usePatientPhase2';

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  AWAITING_PAYMENT: 'bg-orange-100 text-orange-700',
  PAID: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-stone-100 text-stone-500',
};

export default function OrdersPage() {
  const { data, isLoading } = usePatientOrders();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: order } = usePatientOrder(selectedId);
  const paymentMutation = useCreatePaymentIntent();
  const [paymentResult, setPaymentResult] = useState<string | null>(null);

  const orders = data?.data ?? [];

  const handleInitPayment = async () => {
    if (!selectedId) return;
    const result = await paymentMutation.mutateAsync(selectedId);
    // In a real app you'd launch Stripe with result.clientSecret
    setPaymentResult(`Payment initiated. Client secret: ${result.clientSecret.slice(0, 20)}…`);
  };

  if (isLoading) return <div className="text-center py-20 text-stone-400">Loading orders…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-bold text-navy-900">Orders</h1>

      {/* Detail modal */}
      {selectedId && order && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-navy-900">Order #{order.orderNumber}</h2>
              <button onClick={() => { setSelectedId(null); setPaymentResult(null); }}><X size={18} /></button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone-400">Type</span><span className="text-stone-700">{order.type}</span></div>
              <div className="flex justify-between"><span className="text-stone-400">Amount</span><span className="font-medium text-stone-800">{order.currency} {order.amount}</span></div>
              <div className="flex justify-between"><span className="text-stone-400">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status] ?? 'bg-stone-100 text-stone-500'}`}>{order.status}</span>
              </div>
              {order.paidAt && <div className="flex justify-between"><span className="text-stone-400">Paid</span><span>{new Date(order.paidAt).toLocaleDateString()}</span></div>}
            </div>
            {order.status === 'AWAITING_PAYMENT' && (
              <>
                {paymentResult ? (
                  <p className="text-xs text-green-600 bg-green-50 rounded-xl p-3">{paymentResult}</p>
                ) : (
                  <button onClick={handleInitPayment} disabled={paymentMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 bg-gold-600 hover:bg-gold-700 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                    <CreditCard size={16} />
                    {paymentMutation.isPending ? 'Loading…' : 'Pay Now'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <ShoppingBag className="mx-auto text-stone-300 mb-3" size={40} />
          <p className="text-stone-400">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map(o => (
            <button key={o.id} onClick={() => setSelectedId(o.id)}
              className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 text-left hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800">Order #{o.orderNumber}</p>
                <p className="text-xs text-stone-400 mt-0.5">{o.type} · {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="text-sm font-medium text-stone-700">{o.currency} {o.amount}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[o.status] ?? 'bg-stone-100 text-stone-500'}`}>{o.status}</span>
              <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
