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
  const title = getPatientConversationTitle(conversation);
  const threadLabel = getPatientConversationThreadLabel(conversation);

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="px-4 py-3 border-b border-stone-200 shrink-0">
        <h3 className="text-stone-800 font-medium text-sm truncate">{title}</h3>
        <p className="mt-0.5 text-[11px] text-stone-500">{threadLabel}</p>
      </div>

      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput conversationId={conversation.id} onMessageSent={() => refetch()} />
    </div>
  );
}
