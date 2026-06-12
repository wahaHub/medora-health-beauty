import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { crmApi } from '@/services/crmApiClient';
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation';

interface ProcedureOption {
  id: string;
  name: string;
}

interface OnboardingDetailsStepProps {
  category: string;
  procedureId: string;
  destination: string;
  onCategoryChange: (category: string) => void;
  onProcedureChange: (procedureId: string, procedureName: string) => void;
  onDestinationChange: (destination: string) => void;
  onNext: () => void;
}

const CATEGORY_OPTIONS = [
  { id: 'face', label: 'Face' },
  { id: 'body', label: 'Body' },
  { id: 'non-surgical', label: 'Non-Surgical' },
] as const;

export function OnboardingDetailsStep({
  category,
  procedureId,
  destination,
  onCategoryChange,
  onProcedureChange,
  onDestinationChange,
  onNext,
}: OnboardingDetailsStepProps) {
  const { dt } = useDashboardTranslation();
  const [procedures, setProcedures] = useState<ProcedureOption[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [loadingProcedures, setLoadingProcedures] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoadingDestinations(true);
    crmApi.getDestinations()
      .then((data) => {
        if (!active) return;
        const values = Array.isArray(data?.destinations) ? data.destinations : [];
        setDestinations(values);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message ?? dt('chatLoadDestinationsFailed'));
      })
      .finally(() => {
        if (!active) return;
        setLoadingDestinations(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!category) {
      setProcedures([]);
      return;
    }
    let active = true;
    setLoadingProcedures(true);
    setError(null);
    crmApi.getProcedures(category)
      .then((data) => {
        if (!active) return;
        const values = Array.isArray(data?.procedures) ? data.procedures : [];
        setProcedures(values);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message ?? dt('chatLoadProceduresFailed'));
      })
      .finally(() => {
        if (!active) return;
        setLoadingProcedures(false);
      });

    return () => {
      active = false;
    };
  }, [category]);

  const canNext = Boolean(category && procedureId && destination);

  const procedureById = useMemo(() => {
    const map = new Map<string, string>();
    for (const procedure of procedures) {
      map.set(procedure.id, procedure.name);
    }
    return map;
  }, [procedures]);

  return (
    <div className="p-4 h-full flex flex-col overflow-y-auto">
      <h4 className="text-stone-800 font-serif text-lg mb-1">{dt('chatTellUsNeed')}</h4>
      <p className="text-stone-500 text-sm mb-4">
        {dt('chatSelectDetailsDescription')}
      </p>

      <div className="space-y-3 flex-1">
        <div>
          <label className="text-stone-600 text-xs font-medium mb-1 block">{dt('chatCategory')}</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:outline-none focus:border-gold-500"
          >
            <option value="">{dt('chatSelectCategory')}</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {dt(option.id === 'face' ? 'chatFace' : option.id === 'body' ? 'chatBody' : 'chatNonSurgical')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-stone-600 text-xs font-medium mb-1 block">{dt('chatConditionProcedure')}</label>
          <div className="relative">
            <select
              value={procedureId}
              disabled={!category || loadingProcedures}
              onChange={(e) => {
                const nextId = e.target.value;
                onProcedureChange(nextId, procedureById.get(nextId) ?? '');
              }}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:outline-none focus:border-gold-500 disabled:opacity-60"
            >
              <option value="">
                {!category ? dt('chatSelectCategoryFirst') : dt('chatSelectProcedure')}
              </option>
              {procedures.map((procedure) => (
                <option key={procedure.id} value={procedure.id}>
                  {procedure.name}
                </option>
              ))}
            </select>
            {loadingProcedures ? (
              <Loader2 className="w-4 h-4 animate-spin text-gold-600 absolute right-3 top-2.5" />
            ) : null}
          </div>
        </div>

        <div>
          <label className="text-stone-600 text-xs font-medium mb-1 block">{dt('chatDestination')}</label>
          <div className="relative">
            <select
              value={destination}
              disabled={loadingDestinations}
              onChange={(e) => onDestinationChange(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:outline-none focus:border-gold-500 disabled:opacity-60"
            >
              <option value="">{dt('chatSelectDestination')}</option>
              {destinations.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {loadingDestinations ? (
              <Loader2 className="w-4 h-4 animate-spin text-gold-600 absolute right-3 top-2.5" />
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="mt-4 w-full bg-gold-600 hover:bg-gold-700 disabled:bg-stone-300 text-white py-2.5 rounded-xl font-medium transition-all duration-300"
      >
        {dt('next')}
      </button>
    </div>
  );
}
