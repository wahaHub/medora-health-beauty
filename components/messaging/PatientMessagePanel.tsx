import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ShoppingBag, Package } from 'lucide-react';
import { usePatientEntry } from '../../hooks/usePatientEntry';
import { usePatientConversations } from '../../hooks/usePatientConversations';
import { PanelHeader } from './PanelHeader';
import { ConversationList } from './ConversationList';
import { ChatView } from './ChatView';
import type { Conversation } from '../../services/crmApiClient';

/**
 * PatientMessagePanel
 *
 * Full-screen messaging workspace opened once `phase === 'messages-ready'`.
 * Open/close state is owned by PatientEntryContext (isPanelOpen / closePanel),
 * NOT by the legacy MessagePanelContext. This ensures a single source of truth
 * for the phase machine.
 *
 * The admin conversation (`type === 'patient-admin'`) is always pinned first
 * and selected by default (driven by `activeConversationId` from context).
 */
export function PatientMessagePanel() {
  const navigate = useNavigate();
  const {
    isPanelOpen,
    closePanel,
    activeConversationId,
    setActiveConversationId,
    phase,
    caseId,
  } = usePatientEntry();

  const { data: conversations = [], isLoading } = usePatientConversations();

  // Sort: admin conversation first, then hospital conversations by updatedAt desc.
  const sortedConversations = useMemo<Conversation[]>(() => {
    const adminConvs = conversations.filter((c) => c.type === 'patient-admin');
    const hospitalConvs = conversations
      .filter((c) => c.type !== 'patient-admin')
      .sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      });
    return [...adminConvs, ...hospitalConvs];
  }, [conversations]);

  // Auto-select the first conversation (admin) when panel becomes ready.
  const defaultConversationId = useMemo(() => {
    if (activeConversationId && conversations.some((c) => c.id === activeConversationId)) {
      return activeConversationId;
    }
    // Prefer admin conversation, fall back to first available.
    const adminConv = sortedConversations.find((c) => c.type === 'patient-admin');
    return adminConv?.id ?? sortedConversations[0]?.id ?? null;
  }, [activeConversationId, conversations, sortedConversations]);

  useEffect(() => {
    if (defaultConversationId && defaultConversationId !== activeConversationId) {
      setActiveConversationId(defaultConversationId);
    }
  }, [defaultConversationId, activeConversationId, setActiveConversationId]);

  const activeConversation = useMemo(
    () => sortedConversations.find((c) => c.id === (activeConversationId ?? defaultConversationId)) ?? null,
    [sortedConversations, activeConversationId, defaultConversationId],
  );

  // Only render the panel when phase is messages-ready and the panel is open.
  if (phase !== 'messages-ready' || !isPanelOpen) return null;

  // Filter conversations to the current case when caseId is known.
  const visibleConversations = caseId
    ? sortedConversations.filter((c) => !c.caseId || c.caseId === caseId)
    : sortedConversations;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={closePanel} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden mx-4">
        <PanelHeader onClose={closePanel} />

        {/* Phase-2 quick actions */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-stone-100 bg-stone-50">
          <button
            onClick={() => { closePanel(); navigate('/packages'); }}
            className="flex items-center gap-1.5 text-xs text-gold-700 font-medium bg-gold-50 hover:bg-gold-100 border border-gold-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Package size={13} /> Browse Packages
          </button>
          <button
            onClick={() => { closePanel(); navigate('/dashboard/orders'); }}
            className="flex items-center gap-1.5 text-xs text-stone-600 font-medium bg-white hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ShoppingBag size={13} /> View Orders
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visibleConversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-6">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-stone-400" />
            </div>
            <p className="text-stone-500 text-sm">
              No conversations yet. Complete the onboarding to start chatting with hospitals.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Conversation list (admin pinned first) */}
            <div className="w-80 border-r border-stone-200 shrink-0 overflow-hidden flex flex-col">
              <ConversationList
                conversations={visibleConversations}
                activeId={activeConversationId ?? defaultConversationId ?? null}
                onSelect={(conv) => setActiveConversationId(conv.id)}
              />
            </div>

            {/* Right: Chat view */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeConversation ? (
                <ChatView conversation={activeConversation} />
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
