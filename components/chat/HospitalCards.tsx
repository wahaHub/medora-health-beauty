import { useEffect, useState } from 'react';
import { Loader2, Check, ArrowRight } from 'lucide-react';
import { crmApi } from '../../services/crmApiClient';

interface HospitalCardsProps {
  category: string;
  procedureId?: string;
  destination?: string;
  caseId: string;
  onSubmit: () => void;
}

export function HospitalCards({ category, procedureId, destination, caseId, onSubmit }: HospitalCardsProps) {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    crmApi.matchHospitals({ category, procedureId, destination })
      .then((data) => {
        setHospitals(data.hospitals ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, procedureId, destination]);

  const toggleHospital = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await crmApi.selectHospitals({ caseId, hospitalIds: Array.from(selected) });
      onSubmit();
    } catch (err: any) {
      setError(err.message ?? 'Failed to select hospitals');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-gold-600 animate-spin" />
      </div>
    );
  }

  if (error && hospitals.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <h4 className="text-stone-800 font-serif text-lg mb-1">Recommended Hospitals</h4>
      <p className="text-stone-500 text-sm mb-3">Select hospitals to start chatting with.</p>

      <div className="flex-1 overflow-y-auto space-y-2 -mr-2 pr-2">
        {hospitals.map((h: any) => {
          const isSelected = selected.has(h.id);
          return (
            <button
              key={h.id}
              onClick={() => toggleHospital(h.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-start gap-3 ${
                isSelected
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-stone-200 bg-stone-50 hover:border-gold-300 hover:bg-gold-50/50'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                isSelected ? 'border-gold-600 bg-gold-600' : 'border-stone-300'
              }`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-stone-800 text-sm font-medium truncate">{h.name}</p>
                {h.rating && (
                  <p className="text-stone-500 text-xs mt-0.5">Rating: {h.rating}</p>
                )}
                {h.tags && h.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {h.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-xs bg-white px-2 py-0.5 rounded-full text-stone-500 border border-stone-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
        {hospitals.length === 0 && (
          <p className="text-stone-400 text-sm text-center py-4">No hospitals found.</p>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={selected.size === 0 || submitting}
        className="mt-3 w-full bg-gold-600 hover:bg-gold-700 disabled:bg-stone-300 text-white py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Start Chatting
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
