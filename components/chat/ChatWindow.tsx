import { X, MessageSquare } from 'lucide-react';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { useMessagePanel } from '../../contexts/MessagePanelContext';
import { OnboardingFlow } from './OnboardingFlow';

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const { isAuthenticated, isLoading } = usePatientAuth();
  const { open: openMessages } = useMessagePanel();

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
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-gold-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isAuthenticated ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gold-600" />
            </div>
            <div>
              <h4 className="text-stone-800 font-serif text-lg mb-1">Welcome Back</h4>
              <p className="text-stone-500 text-sm">View your hospital conversations and messages.</p>
            </div>
            <button
              onClick={() => {
                openMessages();
                onClose();
              }}
              className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300"
            >
              Open Messages
            </button>
          </div>
        ) : (
          <OnboardingFlow />
        )}
      </div>
    </div>
  );
}
