import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { crmApi } from '../../services/crmApiClient';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { usePatientEntry } from '../../hooks/usePatientEntry';

type ProcedureOption = {
  id: string;
  name: string;
};

type ProcedureGroup = {
  category: string;
  label: string;
  procedures: ProcedureOption[];
};

const PROCEDURE_GROUPS: Array<{ category: string; label: string }> = [
  { category: 'face', label: 'Face' },
  { category: 'body', label: 'Body' },
  { category: 'non-surgical', label: 'Non-Surgical' },
];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getOnboardingProcedureId(procedureId: string): string | undefined {
  return UUID_PATTERN.test(procedureId) ? procedureId : undefined;
}

export function ContactInfoStep() {
  const { bootstrapSession } = usePatientAuth();
  const { profileDraft, patchProfileDraft, applyOnboardingResult } = usePatientEntry();
  const [procedureGroups, setProcedureGroups] = useState<ProcedureGroup[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [loadingProcedures, setLoadingProcedures] = useState(true);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void Promise.all(
      PROCEDURE_GROUPS.map(async (group) => {
        const response = await crmApi.getProcedures(group.category);
        return {
          category: group.category,
          label: group.label,
          procedures: Array.isArray(response?.procedures) ? response.procedures : [],
        };
      }),
    )
      .then((groups) => {
        if (!active) return;
        setProcedureGroups(groups);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message ?? 'Failed to load procedures');
      })
      .finally(() => {
        if (!active) return;
        setLoadingProcedures(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    void crmApi.getDestinations()
      .then((response) => {
        if (!active) return;
        setDestinations(Array.isArray(response?.destinations) ? response.destinations : []);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message ?? 'Failed to load destinations');
      })
      .finally(() => {
        if (!active) return;
        setLoadingDestinations(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const procedureMetadata = useMemo(() => {
    const byId = new Map<string, { name: string; category: string }>();
    for (const group of procedureGroups) {
      for (const procedure of group.procedures) {
        byId.set(procedure.id, { name: procedure.name, category: group.category });
      }
    }
    return byId;
  }, [procedureGroups]);

  const canSubmit = profileDraft.name.trim() !== ''
    && profileDraft.email.trim() !== ''
    && profileDraft.disease.trim() !== ''
    && profileDraft.destination.trim() !== '';

  const handleProcedureChange = (procedureId: string) => {
    const next = procedureMetadata.get(procedureId);
    patchProfileDraft({
      procedureId,
      category: next?.category ?? '',
      disease: next?.name ?? '',
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await crmApi.initOnboarding({
        name: profileDraft.name,
        email: profileDraft.email,
        phone: profileDraft.phone,
        disease: profileDraft.disease,
        procedureId: getOnboardingProcedureId(profileDraft.procedureId),
        category: profileDraft.category || undefined,
        destination: profileDraft.destination,
        preferredLanguage: 'en',
      });

      const nextStep: 'select-hospitals' | 'messages-ready' =
        (result.nextStep as 'select-hospitals' | 'messages-ready') ?? 'select-hospitals';

      bootstrapSession({
        patientId: result.patientId,
        caseId: result.caseId,
        name: profileDraft.name,
        email: profileDraft.email,
        restoreToken: result.restoreToken ?? '',
        nextStep,
      });

      applyOnboardingResult({
        patientId: result.patientId,
        caseId: result.caseId,
        nextStep,
        conversations: result.conversations,
      });
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-3 my-2 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
      <h4 className="text-stone-800 font-serif text-base mb-0.5">Your Info</h4>
      <p className="text-stone-500 text-xs mb-3">We&apos;ll match you with the best hospitals.</p>

      <div className="space-y-2.5">
        <div>
          <label htmlFor="patient-name" className="text-stone-600 text-xs font-medium mb-1 block">Name *</label>
          <input
            id="patient-name"
            type="text"
            value={profileDraft.name}
            onChange={(e) => patchProfileDraft({ name: e.target.value })}
            placeholder="Your full name"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label htmlFor="patient-email" className="text-stone-600 text-xs font-medium mb-1 block">Email *</label>
          <input
            id="patient-email"
            type="email"
            value={profileDraft.email}
            onChange={(e) => patchProfileDraft({ email: e.target.value })}
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label htmlFor="patient-phone" className="text-stone-600 text-xs font-medium mb-1 block">Phone</label>
          <input
            id="patient-phone"
            type="tel"
            value={profileDraft.phone}
            onChange={(e) => patchProfileDraft({ phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label htmlFor="patient-procedure" className="text-stone-600 text-xs font-medium mb-1 block">Condition / Procedure</label>
          <div className="relative">
            <select
              id="patient-procedure"
              aria-label="Condition / Procedure"
              value={profileDraft.procedureId}
              disabled={loadingProcedures}
              onChange={(e) => handleProcedureChange(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white disabled:opacity-60"
            >
              <option value="">Select a procedure</option>
              {procedureGroups.map((group) => (
                <optgroup key={group.category} label={group.label}>
                  {group.procedures.map((procedure) => (
                    <option key={procedure.id} value={procedure.id}>
                      {procedure.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {loadingProcedures ? (
              <Loader2 className="w-4 h-4 animate-spin text-gold-600 absolute right-3 top-2.5" />
            ) : null}
          </div>
        </div>
        <div>
          <label htmlFor="patient-destination" className="text-stone-600 text-xs font-medium mb-1 block">Destination</label>
          <div className="relative">
            <select
              id="patient-destination"
              aria-label="Destination"
              value={profileDraft.destination}
              disabled={loadingDestinations}
              onChange={(e) => patchProfileDraft({ destination: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white disabled:opacity-60"
            >
              <option value="">Select destination</option>
              {destinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </select>
            {loadingDestinations ? (
              <Loader2 className="w-4 h-4 animate-spin text-gold-600 absolute right-3 top-2.5" />
            ) : null}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="mt-3 w-full bg-gold-600 hover:bg-gold-700 disabled:bg-stone-300 text-white py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Submit details
      </button>
    </div>
  );
}
