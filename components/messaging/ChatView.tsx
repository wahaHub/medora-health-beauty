import { useMessages } from '../../hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { Conversation } from '../../services/crmApiClient';

interface ChatViewProps {
  conversation: Pick<Conversation, 'id' | 'type' | 'hospitalName'>;
}

/**
 * ChatView
 *
 * Renders the message thread for a single conversation.
 * Resolves the display title based on conversation type:
 *   - patient-admin  → 'Medora Support'
 *   - patient-hospital → hospitalName or 'Hospital'
 */
export function ChatView({ conversation }: ChatViewProps) {
  const { data, isLoading, refetch } = useMessages(conversation.id);
  const messages = data?.messages ?? [];

  const title =
    conversation.type === 'patient-admin'
      ? 'Medora Support'
      : (conversation.hospitalName ?? 'Hospital');

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="px-4 py-3 border-b border-stone-200 shrink-0">
        <h3 className="text-stone-800 font-medium text-sm truncate">{title}</h3>
      </div>

      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput conversationId={conversation.id} onMessageSent={() => refetch()} />
    </div>
  );
}
