import { X } from 'lucide-react';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { OnboardingFlow } from './OnboardingFlow';

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const { isLoading } = usePatientAuth();

  return (
    <div className="fixed bottom-24 right-6 z-[9999] w-[90vw] md:w-[380px] h-[520px] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden animate-fade-in-up border border-stone-100">
      {/* Header */}
      <div className="bg-navy-900 px-4 py-3 flex items-center justify-between shrink-0">
        <h3 className="text-white font-serif tracking-wide text-lg">Medora Beauty</h3>
        <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-gold-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <OnboardingFlow onClose={onClose} />
        )}
      </div>
    </div>
  );
}
