import { useState } from 'react';
import { Ticket, Plus, ChevronRight, X } from 'lucide-react';
import {
  usePatientTickets,
  usePatientTicket,
  useCreatePatientTicket,
  useReplyToPatientTicket,
} from '../../hooks/usePatientPhase2';
import type { PatientTicketType } from '../../services/patientPhase2Api';

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Open', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress',
  PENDING_INFO: 'Pending Info', RESOLVED: 'Resolved', CLOSED: 'Closed',
};

const STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700', ASSIGNED: 'bg-purple-100 text-purple-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700', PENDING_INFO: 'bg-orange-100 text-orange-700',
  RESOLVED: 'bg-green-100 text-green-700', CLOSED: 'bg-stone-100 text-stone-500',
};

const TICKET_TYPES: PatientTicketType[] = [
  'GENERAL_SUPPORT', 'MEDICAL_QUESTION', 'QUOTE_PRICING',
  'PACKAGE_ORDER', 'PAYMENT_REFUND', 'TRAVEL_JOURNEY', 'ACCOUNT_TECHNICAL',
];

export default function TicketsPage() {
  const { data, isLoading } = usePatientTickets();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [newTicket, setNewTicket] = useState({ type: 'GENERAL_SUPPORT' as PatientTicketType, subject: '', description: '' });

  const { data: detail } = usePatientTicket(selectedId);
  const createMutation = useCreatePatientTicket();
  const replyMutation = useReplyToPatientTicket();

  const tickets = data?.data ?? [];

  const handleCreate = async () => {
    if (!newTicket.subject || !newTicket.description) return;
    await createMutation.mutateAsync(newTicket);
    setShowCreate(false);
    setNewTicket({ type: 'GENERAL_SUPPORT', subject: '', description: '' });
  };

  const handleReply = async () => {
    if (!selectedId || !replyContent.trim()) return;
    await replyMutation.mutateAsync({ ticketId: selectedId, content: replyContent });
    setReplyContent('');
  };

  if (isLoading) return <div className="text-center py-20 text-stone-400">Loading tickets…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-navy-900">Support Tickets</h1>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy-900">New Support Ticket</h2>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <select value={newTicket.type} onChange={e => setNewTicket(t => ({ ...t, type: e.target.value as PatientTicketType }))}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm">
              {TICKET_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
            <input placeholder="Subject" value={newTicket.subject}
              onChange={e => setNewTicket(t => ({ ...t, subject: e.target.value }))}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm" />
            <textarea placeholder="Describe your issue…" rows={4} value={newTicket.description}
              onChange={e => setNewTicket(t => ({ ...t, description: e.target.value }))}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm resize-none" />
            <button onClick={handleCreate} disabled={createMutation.isPending}
              className="w-full bg-gold-600 hover:bg-gold-700 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
              {createMutation.isPending ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selectedId && detail && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="font-semibold text-navy-900">{detail.ticket.subject ?? 'Ticket'}</h2>
              <button onClick={() => setSelectedId(null)}><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="bg-stone-50 rounded-xl p-4 text-sm text-stone-700">{detail.ticket.description}</div>
              {detail.replies.map(r => (
                <div key={r.id} className={`rounded-xl p-3 text-sm ${r.authorRole === 'patient' ? 'bg-gold-50 ml-8' : 'bg-white border border-stone-100 mr-8'}`}>
                  <p className="text-xs text-stone-400 mb-1">{r.authorRole} · {new Date(r.createdAt).toLocaleDateString()}</p>
                  {r.content}
                </div>
              ))}
            </div>
            {!['RESOLVED', 'CLOSED'].includes(detail.ticket.status) && (
              <div className="p-4 border-t border-stone-100 flex gap-2">
                <input value={replyContent} onChange={e => setReplyContent(e.target.value)}
                  placeholder="Reply…" className="flex-1 border border-stone-200 rounded-xl px-4 py-2 text-sm" />
                <button onClick={handleReply} disabled={replyMutation.isPending || !replyContent.trim()}
                  className="bg-gold-600 hover:bg-gold-700 text-white px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50">
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Ticket className="mx-auto text-stone-300 mb-3" size={40} />
          <p className="text-stone-400">No tickets yet. Open one if you need help.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map(t => (
            <button key={t.id} onClick={() => setSelectedId(t.id)}
              className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 text-left hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800 truncate">{t.subject ?? `Ticket #${t.ticketNumber}`}</p>
                <p className="text-xs text-stone-400 mt-0.5">{t.type.replace(/_/g, ' ')} · {new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[t.status] ?? 'bg-stone-100 text-stone-500'}`}>
                {STATUS_LABEL[t.status] ?? t.status}
              </span>
              <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
