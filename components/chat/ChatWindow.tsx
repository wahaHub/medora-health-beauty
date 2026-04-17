import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Maximize2, MessageSquare, Minimize2, X } from 'lucide-react';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { usePatientEntry } from '../../hooks/usePatientEntry';
import { usePatientConversations } from '../../hooks/usePatientConversations';
import { ChatView } from '../messaging/ChatView';
import { ConversationList } from '../messaging/ConversationList';
import { OnboardingFlow } from './OnboardingFlow';
import type { Conversation } from '../../services/crmApiClient';

interface ChatWindowProps {
  displayMode: ChatWindowDisplayMode;
  onClose: () => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
}

export type ChatWindowDisplayMode = 'panel' | 'modal' | 'mobile-panel';

function getShellClasses(displayMode: ChatWindowDisplayMode) {
  if (displayMode === 'modal') {
    return 'relative flex h-[min(88dvh,52rem)] w-[min(72rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_34px_120px_rgba(15,23,42,0.28)]';
  }

  if (displayMode === 'mobile-panel') {
    return 'fixed inset-x-3 bottom-3 top-3 z-[9999] flex flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)] animate-fade-in-up';
  }

  return 'fixed bottom-5 right-5 z-[9999] flex h-[min(80dvh,46rem)] w-[min(35rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)] animate-fade-in-up sm:bottom-6 sm:right-6 sm:w-[min(38rem,calc(100vw-2rem))]';
}

function ChatHeader(props: {
  displayMode: ChatWindowDisplayMode;
  onClose: () => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
}) {
  const { displayMode, onClose, onMaximize, onMinimize } = props;

  return (
    <div className="bg-navy-900 px-4 py-3 flex items-center justify-between shrink-0">
      <div className="min-w-0">
        <h3 className="truncate text-white font-serif tracking-wide text-lg">Medora Beauty</h3>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-sage-200/80">
          Patient concierge chat
        </p>
      </div>
      <div className="ml-4 flex items-center gap-1.5">
        {displayMode === 'panel' && onMaximize && (
          <button
            onClick={onMaximize}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Maximize chat"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}
        {displayMode === 'modal' && onMinimize && (
          <button
            onClick={onMinimize}
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Minimize chat"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onClose}
          className="rounded-full p-2 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function MessagesReadyContent(props: {
  displayMode: ChatWindowDisplayMode;
  isLoadingConversations: boolean;
  visibleConversations: Conversation[];
  activeConversationId: string | null;
  defaultConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  activeConversation: Conversation | null;
  onClose: () => void;
}) {
  const {
    displayMode,
    isLoadingConversations,
    visibleConversations,
    activeConversationId,
    defaultConversationId,
    setActiveConversationId,
    activeConversation,
    onClose,
  } = props;

  const usesSplitLayout = displayMode === 'modal';

  return (
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
              Once CRM conversations are ready, you can continue them directly in this chat.
            </p>
          </div>
        </div>
      ) : usesSplitLayout ? (
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="border-b border-stone-200 bg-white md:w-[22rem] md:shrink-0 md:border-b-0 md:border-r">
            <div className="max-h-52 overflow-y-auto md:max-h-none md:h-full">
              <ConversationList
                conversations={visibleConversations}
                activeId={activeConversationId ?? defaultConversationId ?? null}
                onSelect={(conversation) => setActiveConversationId(conversation.id)}
              />
            </div>
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
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="max-h-48 shrink-0 overflow-y-auto border-b border-stone-200 bg-white">
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
  );
}

export function ChatWindow({ displayMode, onClose, onMaximize, onMinimize }: ChatWindowProps) {
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

  useEffect(() => {
    if (displayMode !== 'modal' || typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [displayMode]);

  const shell = (
    <div
      className={getShellClasses(displayMode)}
      data-testid="chat-window"
      data-chat-display-mode={displayMode}
      role="dialog"
      aria-modal={displayMode === 'modal'}
      aria-label="Medora Beauty chat"
    >
      <ChatHeader
        displayMode={displayMode}
        onClose={onClose}
        onMaximize={onMaximize}
        onMinimize={onMinimize}
      />

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-gold-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : showsOnboardingFlow ? (
          <OnboardingFlow onClose={onClose} />
        ) : phase === 'messages-ready' ? (
          <MessagesReadyContent
            displayMode={displayMode}
            isLoadingConversations={isLoadingConversations}
            visibleConversations={visibleConversations}
            activeConversationId={activeConversationId}
            defaultConversationId={defaultConversationId}
            setActiveConversationId={setActiveConversationId}
            activeConversation={activeConversation}
            onClose={onClose}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-stone-500">Preparing your patient entry…</div>
          </div>
        )}
      </div>
    </div>
  );

  if (displayMode === 'modal') {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/35 p-3 sm:p-6">
        {shell}
      </div>
    );
  }

  return shell;
}
