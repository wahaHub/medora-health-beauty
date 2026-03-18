import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { crmApi } from '../../services/crmApiClient';

interface ProcedureStepProps {
  category: string;
  onSelect: (procedureId: string, procedureName: string) => void;
}

export function ProcedureStep({ category, onSelect }: ProcedureStepProps) {
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    crmApi.getProcedures(category)
      .then((data: any) => {
        setProcedures(Array.isArray(data) ? data : data.procedures ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-gold-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <h4 className="text-stone-800 font-serif text-lg mb-1">Choose a Procedure</h4>
      <p className="text-stone-500 text-sm mb-3">Select the procedure you are considering.</p>
      <div className="flex-1 overflow-y-auto space-y-2 -mr-2 pr-2">
        {procedures.map((proc: any) => (
          <button
            key={proc.id}
            onClick={() => onSelect(proc.id, proc.name)}
            className="w-full text-left px-4 py-3 bg-stone-50 hover:bg-gold-50 border border-stone-200 hover:border-gold-300 rounded-xl transition-all duration-300 text-sm text-stone-800"
          >
            {proc.name}
          </button>
        ))}
        {procedures.length === 0 && (
          <p className="text-stone-400 text-sm text-center py-4">No procedures found.</p>
        )}
      </div>
    </div>
  );
}
