import { useRef, useEffect, useState, type KeyboardEvent, type ChangeEvent } from 'react';
import { Send, RefreshCw, MessageSquare } from 'lucide-react';
import { usePatientEntry } from '../../hooks/usePatientEntry';
import { useMessagePanel } from '../../contexts/MessagePanelContext';
import { ContactInfoStep } from './ContactInfoStep';
import { HospitalCards } from './HospitalCards';
import type { PreBootstrapMessage } from '../../services/patientEntryStorage';

// ---------------------------------------------------------------------------
// Pre-bootstrap message bubble
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: PreBootstrapMessage }) {
  const isUser = message.role === 'patient';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-gold-600 text-white rounded-br-sm'
            : 'bg-stone-100 text-stone-800 rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pre-bootstrap message input (no conversationId yet)
// ---------------------------------------------------------------------------

function PreBootstrapInput() {
  const { appendPreBootstrapMessage } = usePatientEntry();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = content.trim();
    if (!text) return;
    appendPreBootstrapMessage({
      clientId: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: 'patient',
      content: text,
      createdAt: new Date().toISOString(),
    });
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
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
          disabled={!content.trim()}
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

// ---------------------------------------------------------------------------
// Main OnboardingFlow
// ---------------------------------------------------------------------------

interface OnboardingFlowProps {
  onClose?: () => void;
}

export function OnboardingFlow({ onClose }: OnboardingFlowProps = {}) {
  const {
    phase,
    preBootstrapMessages,
    bootstrapError,
    clearBootstrapError,
  } = usePatientEntry();
  const { open: openMessages } = useMessagePanel();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages or phase changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [preBootstrapMessages.length, phase]);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable chat stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-3 space-y-2 min-h-0"
      >
        {/* Pre-bootstrap message history */}
        {preBootstrapMessages.map((msg) => (
          <MessageBubble key={msg.clientId} message={msg} />
        ))}

        {/* Phase-specific embedded control */}
        {phase === 'collect-profile' && (
          <div className="px-2">
            <ContactInfoStep />
          </div>
        )}

        {phase === 'select-hospitals' && (
          <div className="px-2">
            <HospitalCards />
          </div>
        )}

        {phase === 'messages-ready' && (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center gap-4">
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
                onClose?.();
              }}
              className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300"
            >
              Open Messages
            </button>
          </div>
        )}

        {phase === 'bootstrap-error' && (
          <div className="mx-3 my-2 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-700 text-sm font-medium mb-1">Something went wrong</p>
            <p className="text-red-600 text-xs mb-3">
              {bootstrapError ?? 'Unable to set up your session. Please try again.'}
            </p>
            <button
              onClick={clearBootstrapError}
              className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Message input — hidden for returning patients who already have conversations */}
      {phase !== 'messages-ready' && <PreBootstrapInput />}
    </div>
  );
}
