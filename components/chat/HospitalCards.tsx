import { useEffect, useState } from 'react';
import { Loader2, Check, ArrowRight } from 'lucide-react';
import { crmApi } from '../../services/crmApiClient';
import { usePatientEntry } from '../../hooks/usePatientEntry';
import { usePatientAuth } from '../../contexts/PatientAuthContext';

export function HospitalCards() {
  const {
    caseId,
    profileDraft,
    matchedHospitals,
    setMatchedHospitals,
    selectedHospitalIds,
    toggleHospitalSelection,
    applyOnboardingResult,
    openPanel,
  } = usePatientEntry();

  const { patient } = usePatientAuth();

  const [loading, setLoading] = useState(matchedHospitals.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (matchedHospitals.length > 0) return;
    setLoading(true);
    setError(null);
    crmApi
      .matchHospitals({
        destination: profileDraft.destination || undefined,
      })
      .then((data) => {
        setMatchedHospitals(data.hospitals ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileDraft.destination, matchedHospitals.length]);

  const handleSubmit = async () => {
    if (selectedHospitalIds.length === 0 || submitting || !caseId) return;
    if (!patient?.id) {
      setError('Session expired. Please refresh and try again.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await crmApi.selectHospitals({
        caseId,
        hospitalIds: selectedHospitalIds,
      });

      // Fetch the full conversation list so we can identify the admin
      // conversation and pass it to applyOnboardingResult.
      const allConversations = await crmApi.getConversations();

      // Keep only conversations belonging to this case (server may return all).
      const caseConversations = allConversations.filter(
        (c) => !c.caseId || c.caseId === caseId,
      );

      // Map to FormalConversationRef shape expected by applyOnboardingResult.
      const conversationRefs = caseConversations.map((c) => ({
        id: c.id,
        type: c.type,
        category: c.category,
      }));

      applyOnboardingResult({
        patientId: patient?.id ?? '',
        caseId,
        nextStep: 'messages-ready',
        conversations: conversationRefs,
      });
      openPanel();
    } catch (err: any) {
      setError(err.message ?? 'Failed to select hospitals');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-3 my-2 flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-gold-600 animate-spin" />
      </div>
    );
  }

  if (error && matchedHospitals.length === 0) {
    return (
      <div className="mx-3 my-2 p-4 bg-stone-50 border border-stone-200 rounded-2xl text-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-3 my-2 p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col">
      <h4 className="text-stone-800 font-serif text-base mb-0.5">Recommended Hospitals</h4>
      <p className="text-stone-500 text-xs mb-3">Select hospitals to start chatting with.</p>

      <div className="space-y-2 max-h-56 overflow-y-auto -mr-1 pr-1">
        {matchedHospitals.map((h) => {
          const isSelected = selectedHospitalIds.includes(h.id);
          return (
            <button
              key={h.id}
              onClick={() => toggleHospitalSelection(h.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-start gap-3 ${
                isSelected
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-stone-200 bg-white hover:border-gold-300 hover:bg-gold-50/50'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isSelected ? 'border-gold-600 bg-gold-600' : 'border-stone-300'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-stone-800 text-sm font-medium truncate">{h.name}</p>
                {h.city && (
                  <p className="text-stone-500 text-xs mt-0.5">{h.city}</p>
                )}
                {h.summary && (
                  <p className="text-stone-400 text-xs mt-0.5 line-clamp-2">{h.summary}</p>
                )}
              </div>
            </button>
          );
        })}
        {matchedHospitals.length === 0 && (
          <p className="text-stone-400 text-sm text-center py-4">No hospitals found.</p>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={selectedHospitalIds.length === 0 || submitting || !caseId}
        className="mt-3 w-full bg-gold-600 hover:bg-gold-700 disabled:bg-stone-300 text-white py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
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
