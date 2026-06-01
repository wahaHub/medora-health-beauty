import { MessageCircle, X } from 'lucide-react';

interface ChatBubbleProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export function ChatBubble({ isOpen, onClick, unreadCount = 0 }: ChatBubbleProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center ${
        isOpen ? 'bg-stone-800 rotate-90' : 'bg-gold-600 hover:bg-gold-700'
      }`}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <X className="text-white w-6 h-6" />
      ) : (
        <>
          <MessageCircle className="text-white w-7 h-7" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}
