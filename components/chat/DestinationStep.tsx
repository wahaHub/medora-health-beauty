import { useEffect, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { crmApi } from '../../services/crmApiClient';

interface DestinationStepProps {
  onSelect: (destination: string) => void;
}

export function DestinationStep({ onSelect }: DestinationStepProps) {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    crmApi.getDestinations()
      .then((data: any) => {
        setDestinations(Array.isArray(data) ? data : data.destinations ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
      <h4 className="text-stone-800 font-serif text-lg mb-1">Preferred Destination</h4>
      <p className="text-stone-500 text-sm mb-3">Where would you like to have your procedure?</p>
      <div className="flex-1 overflow-y-auto space-y-2 -mr-2 pr-2">
        {destinations.map((dest: any) => {
          const label = typeof dest === 'string' ? dest : `${dest.city}, ${dest.country}`;
          const value = typeof dest === 'string' ? dest : dest.id ?? label;
          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className="w-full text-left px-4 py-3 bg-stone-50 hover:bg-gold-50 border border-stone-200 hover:border-gold-300 rounded-xl transition-all duration-300 text-sm text-stone-800 flex items-center gap-3"
            >
              <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
              {label}
            </button>
          );
        })}
        {destinations.length === 0 && (
          <p className="text-stone-400 text-sm text-center py-4">No destinations available.</p>
        )}
      </div>
    </div>
  );
}
