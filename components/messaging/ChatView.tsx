import { useMessages } from '../../hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatViewProps {
  conversation: {
    id: string;
    caseId: string;
    hospitalName?: string;
  };
}

export function ChatView({ conversation }: ChatViewProps) {
  const { data, isLoading, refetch } = useMessages(conversation.id);
  const messages = data?.messages ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="px-4 py-3 border-b border-stone-200 shrink-0">
        <h3 className="text-stone-800 font-medium text-sm truncate">
          {conversation.hospitalName ?? 'Hospital'}
        </h3>
      </div>

      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput conversationId={conversation.id} onMessageSent={() => refetch()} />
    </div>
  );
}
