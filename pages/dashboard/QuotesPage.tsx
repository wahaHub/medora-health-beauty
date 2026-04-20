/**
 * QuotesPage
 *
 * Phase 1: Lists all cases and their associated quotes.
 * Reads from usePatientCases() which calls crmApi.getCases().
 * Falls back to an empty-state CTA if no data is available.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientCases } from '../../hooks/usePatientCases';
import { crmApi } from '../../services/crmApiClient';
import { FileText, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function QuotesPage() {
  const { data, isLoading, refetch } = usePatientCases();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-400">
        Loading your quotes…
      </div>
    );
  }

  const cases = Array.isArray(data) ? data : (data?.cases ?? []);

  // Collect all cases that have at least one quote, or fallback to all cases
  const casesWithQuotes = cases.filter((c: any) => (c.quotes ?? []).length > 0);
  const allQuotes = cases.flatMap((c: any) =>
    (c.quotes ?? []).map((q: any) => ({ ...q, caseId: c.id, caseNumber: c.caseNumber })),
  );

  if (allQuotes.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-6">Quotes</h1>
        <div className="bg-white rounded-2xl p-12 text-center">
          <FileText className="mx-auto text-stone-300 mb-4" size={48} />
          <p className="text-stone-500 text-lg">No quotes yet</p>
          <p className="text-stone-400 text-sm mt-2 max-w-xs mx-auto">
            Once hospitals review your case, they'll send treatment quotes here for you
            to review.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-5 py-2.5 bg-gold-600 text-white rounded-xl text-sm font-medium hover:bg-gold-700 transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-navy-900 mb-6">Quotes</h1>
      <div className="space-y-6">
        {casesWithQuotes.map((c: any) => (
          <CaseQuoteSection key={c.id} caseData={c} onRefetch={refetch} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CaseQuoteSection({
  caseData: c,
  onRefetch,
}: {
  caseData: any;
  onRefetch: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const quotes: any[] = c.quotes ?? [];
  const pendingCount = quotes.filter((q) => q.status === 'PENDING').length;

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Case header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-sage-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-stone-400">{c.caseNumber}</span>
          <span className="text-stone-700 font-medium text-sm">
            {c.primaryDiagnosis || 'General Consultation'}
          </span>
          {pendingCount > 0 && (
            <span className="bg-gold-100 text-gold-700 text-xs px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-stone-400" />
        ) : (
          <ChevronDown size={16} className="text-stone-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-stone-100 divide-y divide-stone-50">
          {quotes.map((q) => (
            <QuoteRow key={q.id} caseId={c.id} quote={q} onRefetch={onRefetch} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuoteRow({
  caseId,
  quote: q,
  onRefetch,
}: {
  caseId: string;
  quote: any;
  onRefetch: () => void;
}) {
  const [confirming, setConfirming] = useState<'accept' | 'reject' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!confirming) return;
    setLoading(true);
    try {
      if (confirming === 'accept') {
        await crmApi.acceptQuote(caseId, q.id);
      } else {
        await crmApi.rejectQuote(caseId, q.id);
      }
      onRefetch();
    } finally {
      setLoading(false);
      setConfirming(null);
    }
  };

  const statusClass =
    q.status === 'ACCEPTED'
      ? 'bg-green-100 text-green-700'
      : q.status === 'REJECTED'
      ? 'bg-red-100 text-red-700'
      : q.status === 'EXPIRED'
      ? 'bg-stone-100 text-stone-500'
      : 'bg-gold-100 text-gold-700';

  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-700 text-sm">{q.hospitalName || 'Hospital Quote'}</p>
        <p className="text-xl font-bold text-navy-900 mt-0.5">
          ${q.totalAmount?.toLocaleString() ?? '—'}
        </p>
        {q.notes && (
          <p className="text-xs text-stone-400 mt-1 truncate">{q.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-xs px-2.5 py-1 rounded-full ${statusClass}`}>{q.status}</span>
        {q.status === 'PENDING' && (
          <>
            <button
              onClick={() => setConfirming('accept')}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
            >
              <Check size={12} /> Accept
            </button>
            <button
              onClick={() => setConfirming('reject')}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-200 text-stone-700 rounded-lg text-xs hover:bg-stone-300"
            >
              <X size={12} /> Reject
            </button>
          </>
        )}
      </div>

      {/* Confirmation overlay */}
      {confirming && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 w-full">
            <p className="text-lg font-medium text-stone-800 mb-2">
              {confirming === 'accept' ? 'Accept this quote?' : 'Reject this quote?'}
            </p>
            <p className="text-stone-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirming(null)}
                disabled={loading}
                className="px-4 py-2 text-stone-500 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={loading}
                className={`px-4 py-2 rounded-xl text-white text-sm ${
                  confirming === 'accept'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-60`}
              >
                {loading ? 'Processing…' : `Confirm ${confirming}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
