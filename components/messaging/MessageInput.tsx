import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { crmApi } from '../../services/crmApiClient';

interface MessageInputProps {
  conversationId: string;
  onMessageSent?: () => void;
}

export function MessageInput({ conversationId, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const text = content.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      await crmApi.sendMessage(conversationId, text);
      setContent('');
      onMessageSent?.();
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch {
      // Keep content on error so user can retry
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div className="px-4 py-3 border-t border-stone-200 shrink-0 bg-white">
      <div className="flex items-end gap-2 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-200 focus-within:border-gold-500 transition-colors">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-transparent outline-none text-sm text-stone-700 placeholder-stone-400 resize-none max-h-[120px]"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className={`p-2 rounded-full transition-colors shrink-0 ${
            content.trim()
              ? 'bg-gold-600 text-white hover:bg-gold-700'
              : 'bg-stone-200 text-stone-400'
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
