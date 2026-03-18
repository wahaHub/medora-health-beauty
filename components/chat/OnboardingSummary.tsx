import { CheckCircle, MessageSquare } from 'lucide-react';
import { useMessagePanel } from '../../contexts/MessagePanelContext';

export function OnboardingSummary() {
  const { open: openMessages } = useMessagePanel();

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h4 className="text-stone-800 font-serif text-xl mb-1">You're All Set!</h4>
        <p className="text-stone-500 text-sm">
          Your selected hospitals have been notified. You can now chat with them directly.
        </p>
      </div>
      <button
        onClick={openMessages}
        className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        Open Messages
      </button>
    </div>
  );
}
