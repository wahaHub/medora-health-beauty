import type { Conversation } from '../../services/crmApiClient';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
}

/**
 * ConversationList
 *
 * Renders a scrollable list of conversations. The admin conversation
 * (`type === 'patient-admin'`) is expected to already be sorted first by the
 * caller (PatientMessagePanel). It receives a display label of 'Medora Support'.
 */
export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-stone-400 text-sm px-4 text-center">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {conversations.map((conv) => {
        const isActive = conv.id === activeId;
        const isAdmin = conv.type === 'patient-admin';
        const displayName = isAdmin ? 'Medora Support' : (conv.hospitalName ?? 'Hospital');
        const lastMessageText =
          conv.lastMessage?.content ?? undefined;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`text-left px-4 py-3 border-b border-stone-100 transition-colors ${
              isActive ? 'bg-gold-50' : 'hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-sm font-medium text-stone-800 truncate flex-1">
                {displayName}
              </span>
              {(conv.unreadCount ?? 0) > 0 && (
                <span className="bg-gold-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2">
                  {conv.unreadCount}
                </span>
              )}
            </div>
            {isAdmin && (
              <p className="text-[10px] text-gold-600/70 mb-0.5">Admin thread</p>
            )}
            {lastMessageText && (
              <p className="text-xs text-stone-500 truncate">{lastMessageText}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
