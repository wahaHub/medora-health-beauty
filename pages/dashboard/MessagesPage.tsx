import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare, MessageCircle } from 'lucide-react';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { usePatientEntry } from '../../hooks/usePatientEntry';
import { usePatientConversations } from '../../hooks/usePatientConversations';
import { ConversationList } from '../../components/messaging/ConversationList';
import { ChatView } from '../../components/messaging/ChatView';
import type { Conversation } from '../../services/crmApiClient';

export default function MessagesPage() {
  const { patient } = usePatientAuth();
  const { phase, openPanel } = usePatientEntry();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlConvId = searchParams.get('conv');

  const { data: conversations = [], isLoading: listLoading } = usePatientConversations();

  // Sort: admin conversation first, then by updatedAt desc
  const sortedConversations = useMemo<Conversation[]>(() => {
    const admin = conversations.filter((c) => c.type === 'patient-admin');
    const others = conversations
      .filter((c) => c.type !== 'patient-admin')
      .sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      });
    return [...admin, ...others];
  }, [conversations]);

  // Determine active conversation
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!sortedConversations.length) {
      setActiveConv(null);
      return;
    }
    if (urlConvId) {
      const match = sortedConversations.find((c) => c.id === urlConvId);
      if (match) {
        setActiveConv(match);
        return;
      }
    }
    // Default to admin or first
    const admin = sortedConversations.find((c) => c.type === 'patient-admin');
    setActiveConv(admin ?? sortedConversations[0]);
  }, [sortedConversations, urlConvId]);

  const handleSelect = (conv: Conversation) => {
    setActiveConv(conv);
    setSearchParams({ conv: conv.id });
  };

  if (!patient) {
    return (
      <div className="flex items-center justify-center py-24 text-stone-400">
        Please sign in to view your messages.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden h-[calc(100vh-180px)] min-h-[480px] flex">
      {/* Left: Conversation List */}
      <div className="w-full md:w-72 lg:w-80 border-r border-stone-100 flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-800">Conversations</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          {listLoading ? (
            <div className="flex items-center justify-center h-full text-stone-400 text-sm">
              Loading conversations...
            </div>
          ) : (
            <ConversationList
              conversations={sortedConversations}
              activeId={activeConv?.id ?? null}
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>

      {/* Right: Chat Thread */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeConv ? (
          <ChatView conversation={activeConv} />
        ) : (
          <EmptyState
            hasConversations={sortedConversations.length > 0}
            phase={phase}
            onStartChat={openPanel}
            onGoHome={() => navigate('/')}
          />
        )}
      </div>
    </div>
  );
}

function EmptyState({
  hasConversations,
  phase,
  onStartChat,
  onGoHome,
}: {
  hasConversations: boolean;
  phase: string;
  onStartChat: () => void;
  onGoHome: () => void;
}) {
  const isReady = phase === 'messages-ready';

  if (hasConversations) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center mb-4">
          <MessageSquare size={28} className="text-gold-600" />
        </div>
        <h3 className="text-lg font-serif font-semibold text-navy-900 mb-1">
          No conversation selected
        </h3>
        <p className="text-stone-500 text-sm max-w-xs">
          Select a conversation from the list to start messaging your care team.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mb-4">
        <MessageCircle size={32} className="text-gold-600" />
      </div>
      <h3 className="text-lg font-serif font-semibold text-navy-900 mb-2">
        No conversations yet
      </h3>
      <p className="text-stone-500 text-sm max-w-xs mb-6">
        {isReady
          ? 'Start chatting with your care coordinator or hospitals.'
          : 'Complete your onboarding to start messaging your care team.'}
      </p>
      {isReady ? (
        <button
          onClick={onStartChat}
          className="px-5 py-2.5 bg-gold-600 text-white rounded-xl text-sm font-medium hover:bg-gold-700 transition-colors flex items-center gap-2"
        >
          <MessageCircle size={16} />
          Start Chatting
        </button>
      ) : (
        <button
          onClick={onGoHome}
          className="px-5 py-2.5 bg-gold-600 text-white rounded-xl text-sm font-medium hover:bg-gold-700 transition-colors"
        >
          Get Started
        </button>
      )}
    </div>
  );
}
