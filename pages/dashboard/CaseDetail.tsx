import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCaseDetail } from '../../hooks/useCaseDetail';
import { useQuote } from '../../hooks/useQuote';
import { usePatientConversations } from '../../hooks/usePatientConversations';
import { ChatView } from '../../components/messaging/ChatView';
import { crmApi } from '../../services/crmApiClient';
import { MessageCircle, FileText, Info, Check, X } from 'lucide-react';

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const [activeTab, setActiveTab] = useState<'messages' | 'quote' | 'overview'>('messages');
  const { data: caseData, isLoading } = useCaseDetail(caseId!);
  const { data: quoteData } = useQuote(caseId!);
  const { data: convData } = usePatientConversations();

  // Find conversations for this case
  const conversations = (convData?.conversations ?? []).filter((c: any) => c.caseId === caseId);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  if (isLoading) return <div className="text-center py-20 text-stone-400">Loading...</div>;

  const tabs = [
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'quote', label: 'Quotes', icon: FileText },
    { id: 'overview', label: 'Overview', icon: Info },
  ] as const;

  return (
    <div>
      <h1 className="text-xl font-serif font-bold text-navy-900 mb-4">
        Case {caseData?.caseNumber}
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1">
        {tabs.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === tab.id ? 'bg-gold-600 text-white' : 'text-stone-500 hover:text-stone-700'
            }`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ height: '60vh' }}>
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-stone-400">No conversations yet</div>
          ) : (
            <div className="flex h-full">
              {conversations.length > 1 && (
                <div className="w-64 border-r border-stone-100 overflow-y-auto">
                  {conversations.map((conv: any) => (
                    <button key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`w-full text-left px-4 py-3 border-b border-stone-50 hover:bg-sage-50 ${
                        activeConvId === conv.id ? 'bg-sage-50' : ''
                      }`}>
                      <p className="text-sm font-medium text-stone-700">{conv.hospitalName || 'Hospital'}</p>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1">
                <ChatView conversation={conversations.find((c: any) => c.id === (activeConvId || conversations[0]?.id)) || conversations[0]} />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'quote' && (
        <QuoteTab caseId={caseId!} quoteData={quoteData} />
      )}

      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl p-6">
          <div className="grid gap-4">
            <div><span className="text-stone-400 text-sm">Status</span><p className="text-stone-700">{caseData?.assignmentStatus}</p></div>
            <div><span className="text-stone-400 text-sm">Stage</span><p className="text-stone-700">{caseData?.treatmentStage}</p></div>
            <div><span className="text-stone-400 text-sm">Diagnosis</span><p className="text-stone-700">{caseData?.primaryDiagnosis || 'N/A'}</p></div>
            <div><span className="text-stone-400 text-sm">Created</span><p className="text-stone-700">{new Date(caseData?.createdAt).toLocaleDateString()}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuoteTab({ caseId, quoteData }: { caseId: string; quoteData: any }) {
  const [confirming, setConfirming] = useState<{ action: 'accept' | 'reject'; quoteId: string } | null>(null);

  const handleAction = async () => {
    if (!confirming) return;
    if (confirming.action === 'accept') {
      await crmApi.acceptQuote(caseId, confirming.quoteId);
    } else {
      await crmApi.rejectQuote(caseId, confirming.quoteId);
    }
    setConfirming(null);
    // Refetch would happen via React Query invalidation
  };

  const quotes = quoteData?.quotes ?? [];

  if (quotes.length === 0) {
    return <div className="bg-white rounded-2xl p-12 text-center text-stone-400">No quotes received yet</div>;
  }

  return (
    <div className="space-y-4">
      {quotes.map((q: any) => (
        <div key={q.id} className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-medium text-stone-700">{q.hospitalName || 'Hospital Quote'}</p>
              <p className="text-2xl font-bold text-navy-900 mt-1">${q.totalAmount?.toLocaleString()}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs ${
              q.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
              q.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
              q.status === 'EXPIRED' ? 'bg-stone-100 text-stone-500' :
              'bg-gold-100 text-gold-700'
            }`}>{q.status}</span>
          </div>
          {q.status === 'PENDING' && (
            <div className="flex gap-3 mt-4">
              <button onClick={() => setConfirming({ action: 'accept', quoteId: q.id })}
                className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700">
                <Check size={14} /> Accept
              </button>
              <button onClick={() => setConfirming({ action: 'reject', quoteId: q.id })}
                className="flex items-center gap-1 px-4 py-2 bg-stone-200 text-stone-700 rounded-xl text-sm hover:bg-stone-300">
                <X size={14} /> Reject
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Confirmation modal */}
      {confirming && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
            <p className="text-lg font-medium text-stone-800 mb-2">
              {confirming.action === 'accept' ? 'Accept this quote?' : 'Reject this quote?'}
            </p>
            <p className="text-stone-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirming(null)} className="px-4 py-2 text-stone-500 text-sm">Cancel</button>
              <button onClick={handleAction}
                className={`px-4 py-2 rounded-xl text-white text-sm ${
                  confirming.action === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}>
                Confirm {confirming.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
