import { Sparkles, RefreshCw } from 'lucide-react';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { usePatientAiSummary } from '../../hooks/usePatientPhase2';

export default function AiSummaryPage() {
  const { patient } = usePatientAuth();
  const caseId = patient?.caseId ?? null;

  const { data, isLoading, refetch } = usePatientAiSummary(caseId);

  if (!caseId) {
    return (
      <div className="text-center py-20">
        <Sparkles className="mx-auto text-stone-300 mb-3" size={40} />
        <p className="text-stone-400">No active case found.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-20 text-stone-400">Loading summary…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-navy-900">AI Case Summary</h1>
        {data?.status === 'READY' && (
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        )}
      </div>

      {(!data || data.status === 'EMPTY') && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Sparkles className="mx-auto text-stone-300 mb-3" size={40} />
          <p className="text-stone-500 font-medium mb-1">No summary available yet</p>
          <p className="text-stone-400 text-sm">
            Once your case has enough information, an AI summary of your medical journey will appear here.
          </p>
        </div>
      )}

      {data?.status === 'PENDING' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <RefreshCw size={18} className="text-amber-500 animate-spin" />
            <p className="text-amber-700 font-medium">Generating your summary…</p>
          </div>
          <p className="text-amber-600 text-sm">This usually takes a minute. The page will update automatically.</p>
        </div>
      )}

      {data?.status === 'FAILED' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-medium mb-1">Summary generation failed</p>
          <p className="text-red-500 text-sm">Please contact your coordinator if this persists.</p>
        </div>
      )}

      {data?.status === 'READY' && data.summary && (
        <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-gold-500" />
            <span className="text-sm font-medium text-stone-500">AI-generated summary</span>
            {data.updatedAt && (
              <span className="ml-auto text-xs text-stone-400">
                Last updated {new Date(data.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <div className="prose prose-stone max-w-none">
            {data.summary.split('\n').filter(Boolean).map((paragraph, i) => (
              <p key={i} className="text-stone-700 text-sm leading-relaxed mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
          <p className="mt-6 text-xs text-stone-400 italic">
            This summary is AI-generated and for informational purposes only. Always consult your medical team for health decisions.
          </p>
        </div>
      )}
    </div>
  );
}
