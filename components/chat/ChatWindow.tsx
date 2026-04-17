import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, X } from 'lucide-react';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { usePatientEntry } from '../../hooks/usePatientEntry';
import { usePatientConversations } from '../../hooks/usePatientConversations';
import { ChatView } from '../messaging/ChatView';
import { ConversationList } from '../messaging/ConversationList';
import { OnboardingFlow } from './OnboardingFlow';
import type { Conversation } from '../../services/crmApiClient';

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const { isLoading } = usePatientAuth();
  const {
    phase,
    activeConversationId,
    setActiveConversationId,
    caseId,
  } = usePatientEntry();
  const { data: conversations = [], isLoading: isLoadingConversations } = usePatientConversations();

  const sortedConversations = useMemo<Conversation[]>(() => {
    const adminConversations = conversations.filter((conversation) => conversation.type === 'patient-admin');
    const hospitalConversations = conversations
      .filter((conversation) => conversation.type !== 'patient-admin')
      .sort((left, right) => {
        const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
        const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
        return rightTime - leftTime;
      });

    return [...adminConversations, ...hospitalConversations];
  }, [conversations]);

  const visibleConversations = useMemo(
    () => (
      caseId
        ? sortedConversations.filter((conversation) => !conversation.caseId || conversation.caseId === caseId)
        : sortedConversations
    ),
    [caseId, sortedConversations],
  );

  const defaultConversationId = useMemo(() => {
    if (activeConversationId && visibleConversations.some((conversation) => conversation.id === activeConversationId)) {
      return activeConversationId;
    }

    const adminConversation = visibleConversations.find((conversation) => conversation.type === 'patient-admin');
    return adminConversation?.id ?? visibleConversations[0]?.id ?? null;
  }, [activeConversationId, visibleConversations]);

  useEffect(() => {
    if (phase !== 'messages-ready') {
      return;
    }

    if (defaultConversationId && defaultConversationId !== activeConversationId) {
      setActiveConversationId(defaultConversationId);
    }
  }, [activeConversationId, defaultConversationId, phase, setActiveConversationId]);

  const activeConversation = useMemo(
    () => visibleConversations.find((conversation) => conversation.id === (activeConversationId ?? defaultConversationId)) ?? null,
    [activeConversationId, defaultConversationId, visibleConversations],
  );

  const showsOnboardingFlow = phase === 'collect-profile'
    || phase === 'select-hospitals'
    || phase === 'bootstrap-error';

  return (
    <div className="fixed bottom-24 right-6 z-[9999] w-[90vw] md:w-[380px] h-[520px] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden animate-fade-in-up border border-stone-100">
      {/* Header */}
      <div className="bg-navy-900 px-4 py-3 flex items-center justify-between shrink-0">
        <h3 className="text-white font-serif tracking-wide text-lg">Medora Beauty</h3>
        <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-gold-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : showsOnboardingFlow ? (
          <OnboardingFlow onClose={onClose} />
        ) : phase === 'messages-ready' ? (
          <div className="flex h-full min-h-0 flex-col bg-stone-50">
            <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3">
              <div>
                <h4 className="font-serif text-base text-navy-900">Messages</h4>
                <p className="text-xs text-stone-500">Continue the same CRM-backed conversation here.</p>
              </div>
              <Link
                to="/dashboard/messages"
                onClick={onClose}
                className="rounded-lg border border-gold-200 bg-gold-50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-gold-700 transition-colors hover:bg-gold-100"
              >
                Full Workspace
              </Link>
            </div>

            {isLoadingConversations ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="w-8 h-8 border-2 border-gold-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : visibleConversations.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-100">
                  <MessageSquare className="h-7 w-7 text-gold-600" />
                </div>
                <div>
                  <p className="font-serif text-lg text-stone-800">Messages will appear here</p>
                  <p className="mt-1 text-sm text-stone-500">
                    Once CRM conversations are ready, you can continue them directly in this widget.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="max-h-40 shrink-0 overflow-y-auto border-b border-stone-200 bg-white">
                  <ConversationList
                    conversations={visibleConversations}
                    activeId={activeConversationId ?? defaultConversationId ?? null}
                    onSelect={(conversation) => setActiveConversationId(conversation.id)}
                  />
                </div>
                <div className="flex-1 min-h-0 bg-white">
                  {activeConversation ? (
                    <ChatView conversation={activeConversation} />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-stone-400">
                      Select a conversation to continue messaging.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-stone-500">Preparing your patient entry…</div>
          </div>
        )}
      </div>
    </div>
  );
}
