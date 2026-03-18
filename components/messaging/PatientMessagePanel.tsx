import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useMessagePanel } from '../../contexts/MessagePanelContext';
import { usePatientConversations } from '../../hooks/usePatientConversations';
import { PanelHeader } from './PanelHeader';
import { ConversationList } from './ConversationList';
import { ChatView } from './ChatView';

interface ActiveConversation {
  id: string;
  caseId: string;
  hospitalName?: string;
}

export function PatientMessagePanel() {
  const { isOpen, close } = useMessagePanel();
  const { data, isLoading } = usePatientConversations();
  const [active, setActive] = useState<ActiveConversation | null>(null);

  if (!isOpen) return null;

  const conversations = Array.isArray(data) ? data : data?.conversations ?? [];

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={close} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden mx-4">
        <PanelHeader onClose={close} />

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-6">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-stone-400" />
            </div>
            <p className="text-stone-500 text-sm">No conversations yet. Complete the onboarding to start chatting with hospitals.</p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Conversation list */}
            <div className="w-80 border-r border-stone-200 shrink-0 overflow-hidden flex flex-col">
              <ConversationList
                conversations={conversations}
                activeId={active?.id ?? null}
                onSelect={(conv) => setActive(conv)}
              />
            </div>

            {/* Right: Chat view */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {active ? (
                <ChatView conversation={active} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
                  Select a conversation to start messaging.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
