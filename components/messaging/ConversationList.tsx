import {
  getPatientConversationThreadLabel,
  getPatientConversationTitle,
  isAdminPatientConversation,
  type Conversation,
} from '../../services/crmApiClient';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
  variant?: 'sidebar' | 'switcher';
}

/**
 * ConversationList
 *
 * Renders either a sidebar list or a compact horizontal session switcher for
 * the current case's admin + hospital threads.
 */
export function ConversationList({
  conversations,
  activeId,
  onSelect,
  variant = 'sidebar',
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-stone-400 text-sm px-4 text-center">
        No conversations yet.
      </div>
    );
  }

  if (variant === 'switcher') {
    return (
      <div
        className="border-b border-stone-200 bg-white px-3 py-3"
        data-testid="compact-session-switcher"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Sessions
            </p>
            <p className="text-xs text-stone-500">
              Switch between your support thread and hospital threads for this case.
            </p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {conversations.map((conv) => {
            const isActive = conv.id === activeId;
            const displayName = getPatientConversationTitle(conv);

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`min-w-[10rem] shrink-0 rounded-2xl border px-3 py-2 text-left transition-colors ${
                  isActive
                    ? 'border-gold-300 bg-gold-50 text-gold-900'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    <p className="mt-0.5 text-[11px] text-stone-500">
                      {getPatientConversationThreadLabel(conv)}
                    </p>
                  </div>
                  {(conv.unreadCount ?? 0) > 0 && (
                    <span className="mt-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-600 px-1.5 text-[10px] text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto" data-testid="sidebar-session-list">
      {conversations.map((conv) => {
        const isActive = conv.id === activeId;
        const isAdmin = isAdminPatientConversation(conv);
        const displayName = getPatientConversationTitle(conv);
        const lastMessageText = conv.lastMessage?.content ?? undefined;

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
            <p className={`text-[10px] mb-0.5 ${isAdmin ? 'text-gold-600/70' : 'text-stone-400'}`}>
              {getPatientConversationThreadLabel(conv)}
            </p>
            {lastMessageText && (
              <p className="text-xs text-stone-500 truncate">{lastMessageText}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
