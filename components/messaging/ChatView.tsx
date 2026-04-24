import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useMessages } from '../../hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import {
  getPatientConversationThreadLabel,
  getPatientConversationTitle,
  type Conversation,
} from '../../services/crmApiClient';

interface ChatViewProps {
  conversation: Pick<Conversation, 'id' | 'type' | 'category' | 'hospitalName' | 'title'>;
}

function extractMessages(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.messages && Array.isArray(data.messages)) return data.messages;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

/**
 * ChatView
 *
 * Renders the message thread for a single conversation.
 */
export function ChatView({ conversation }: ChatViewProps) {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useMessages(conversation.id);
  const [draft, setDraft] = useState('');
  const messages = extractMessages(data).sort(
    (a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const title = getPatientConversationTitle(conversation);
  const threadLabel = getPatientConversationThreadLabel(conversation);
  const starterPrompts =
    conversation.type === 'patient-admin'
      ? [
          'Hi, I would like help with my treatment plan.',
          'Can you help me review my next steps?',
          'I have a question about pricing and timeline.',
        ]
      : [
          'Hi, I would like to learn more about this hospital.',
          'Can you share available appointment times?',
          'What information do you need from me to get started?',
        ];

  const handleMessageSent = (newMessage: any) => {
    // Optimistically append to cache so it appears immediately
    const queryKey = ['patient', 'messages', conversation.id];
    queryClient.setQueryData(queryKey, (old: any) => {
      const list = extractMessages(old);
      const next = [...list, newMessage];
      if (Array.isArray(old)) return next;
      return { ...old, messages: next, data: next };
    });
    // Then refetch to sync with server
    void refetch();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="px-4 py-3 border-b border-stone-200 shrink-0">
        <h3 className="text-stone-800 font-medium text-sm truncate">{title}</h3>
        <p className="mt-0.5 text-[11px] text-stone-500">{threadLabel}</p>
      </div>

      {messages.length === 0 && !isLoading ? (
        <div className="flex-1 overflow-y-auto px-6 py-8 bg-gradient-to-b from-gold-50/60 to-white">
          <div className="max-w-xl mx-auto rounded-3xl border border-gold-100 bg-white shadow-sm p-6">
            <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-700 flex items-center justify-center mb-4">
              <Sparkles size={22} />
            </div>
            <h4 className="text-xl font-serif font-semibold text-navy-900 mb-2">
              Start a new conversation
            </h4>
            <p className="text-sm text-stone-500 leading-6 mb-5">
              {conversation.type === 'patient-admin'
                ? 'Send your first message to the Medora care team. You can ask about planning, quotes, next steps, or any support you need.'
                : `Start the conversation with ${title}. Ask about availability, treatment options, pricing, or preparation details.`}
            </p>
            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setDraft(prompt)}
                  className="rounded-full border border-gold-200 bg-gold-50 px-3 py-2 text-xs text-gold-800 hover:bg-gold-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
      )}
      <MessageInput
        conversationId={conversation.id}
        onMessageSent={handleMessageSent}
        placeholder={`Message ${title}...`}
        draftValue={draft}
        onDraftChange={setDraft}
      />
    </div>
  );
}
