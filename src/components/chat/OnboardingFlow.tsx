import { useRef, useEffect, useState, type KeyboardEvent, type ChangeEvent } from 'react';
import { ArrowRight, Camera, CheckCircle2, MessageSquare, Paperclip, RefreshCw, Send } from 'lucide-react';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation';
import { crmApi } from '@/services/crmApiClient';
import { hasBeautyUploadSubmission } from '@/services/beautyUploadStatus';
import { MessageInput } from '@/components/messaging/MessageInput';
import { ContactInfoStep } from './ContactInfoStep';
import { HospitalCards } from './HospitalCards';
import type { PreBootstrapMessage } from '@/services/patientEntryStorage';

// ---------------------------------------------------------------------------
// Pre-bootstrap message bubble
// ---------------------------------------------------------------------------

function MessageBubble({ message }: { message: PreBootstrapMessage }) {
  const isUser = message.role === 'patient';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-gold-600 text-white rounded-br-sm'
            : 'bg-stone-100 text-stone-800 rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pre-bootstrap message input (no conversationId yet)
// ---------------------------------------------------------------------------

function PreBootstrapInput() {
  const { dt } = useDashboardTranslation();
  const { appendPreBootstrapMessage } = usePatientEntry();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = content.trim();
    if (!text) return;
    appendPreBootstrapMessage({
      clientId: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: 'patient',
      content: text,
      createdAt: new Date().toISOString(),
    });
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div className="px-4 py-3 border-t border-stone-200 shrink-0 bg-white">
      <div className="flex items-end gap-2 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-200 focus-within:border-gold-500 transition-colors">
        <button
          type="button"
          disabled
          aria-label={dt('messageAttachFiles')}
          title={dt('chatAttachUnavailable')}
          className="rounded-full p-2 text-stone-300"
        >
          <Paperclip size={16} />
        </button>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={dt('messagePlaceholder')}
          rows={1}
          className="flex-1 bg-transparent outline-none text-sm text-stone-700 placeholder-stone-400 resize-none max-h-[120px]"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          aria-label={dt('messageSend')}
          className={`p-2 rounded-full transition-colors shrink-0 ${
            content.trim()
              ? 'bg-gold-600 text-white hover:bg-gold-700'
              : 'bg-stone-200 text-stone-400'
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main OnboardingFlow
// ---------------------------------------------------------------------------

interface OnboardingFlowProps {
  onClose?: () => void;
  onComplete?: (result: { patientId: string; caseId: string }) => void;
  showPreBootstrapInput?: boolean;
}

function SubmittedDetailsCard() {
  const { dt } = useDashboardTranslation();
  const { patient } = usePatientAuth();
  const { profileDraft } = usePatientEntry();

  const mergedProfile = {
    name: profileDraft.name.trim() || patient?.name || '',
    email: profileDraft.email.trim() || patient?.email || '',
    disease: profileDraft.disease.trim() || '',
    destination: profileDraft.destination.trim() || '',
  };

  const rows = [
    [dt('chatName').replace(' *', ''), mergedProfile.name],
    [dt('emailAddress'), mergedProfile.email],
    [dt('chatConditionProcedure'), mergedProfile.disease],
    [dt('chatDestination'), mergedProfile.destination],
  ].filter(([, value]) => value.trim() !== '');

  return (
    <div className="mx-3 my-2 rounded-[26px] border border-stone-200 bg-white px-5 py-5 shadow-[0_22px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold text-stone-900">{dt('chatSubmittedDetails')}</div>
          <p className="mt-1 text-sm text-stone-500">
            {dt('chatSubmittedDetailsDescription')}
          </p>
          <div className="mt-4 space-y-2">
            {rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[130px_1fr] gap-3 text-sm leading-6">
                <span className="text-stone-500">{label}:</span>
                <span className="font-medium text-stone-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BeautyUploadPromptCard() {
  const { dt } = useDashboardTranslation();

  const handleUploadViews = () => {
    if (typeof window !== 'undefined') {
      window.location.assign('/consultation-upload');
    }
  };

  return (
    <div className="mx-3 my-2 rounded-[26px] border border-gold-200 bg-gold-50/70 px-5 py-5 shadow-[0_22px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gold-700 shadow-sm">
          <Camera className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-serif text-lg text-stone-900">{dt('chatBeautyUploadPromptTitle')}</h4>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {dt('chatBeautyUploadPromptDescription')}
          </p>
          <button
            type="button"
            onClick={handleUploadViews}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-700 sm:w-auto"
          >
            {dt('chatBeautyUploadPromptButton')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BeautyUploadSubmittedCard() {
  const { dt } = useDashboardTranslation();

  return (
    <div className="mx-3 my-2 rounded-[26px] border border-emerald-100 bg-emerald-50/60 px-5 py-5 shadow-[0_22px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-serif text-lg text-stone-900">{dt('chatBeautyUploadSubmittedTitle')}</h4>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {dt('chatBeautyUploadSubmittedDescription')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function OnboardingFlow({ onClose, onComplete, showPreBootstrapInput = true }: OnboardingFlowProps = {}) {
  const { dt } = useDashboardTranslation();
  const {
    phase,
    preBootstrapMessages,
    bootstrapError,
    clearBootstrapError,
    openPanel,
  } = usePatientEntry();
  const { patient } = usePatientAuth();
  const widgetChatSessionId = patient?.widgetChatTarget?.kind === 'CHATBOT_SESSION'
    ? patient.widgetChatTarget.sessionId
    : '';
  const [beautyUploadSubmitted, setBeautyUploadSubmitted] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isBackendOwnedHospitalSelection = phase === 'select-hospitals'
    && patient?.widgetChatTarget?.kind === 'CHATBOT_SESSION';

  // Auto-scroll to bottom whenever messages or phase changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = phase === 'collect-profile' ? 0 : scrollRef.current.scrollHeight;
    }
  }, [preBootstrapMessages.length, phase]);

  useEffect(() => {
    if (!isBackendOwnedHospitalSelection || !widgetChatSessionId) {
      setBeautyUploadSubmitted(false);
      return;
    }

    let cancelled = false;

    crmApi.getMessages(widgetChatSessionId, { limit: 100 })
      .then(({ messages }) => {
        if (!cancelled) {
          setBeautyUploadSubmitted(hasBeautyUploadSubmission(messages));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBeautyUploadSubmitted(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isBackendOwnedHospitalSelection, widgetChatSessionId]);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable chat stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-3 space-y-2 min-h-0"
      >
        {/* Pre-bootstrap message history */}
        {preBootstrapMessages.map((msg) => (
          <MessageBubble key={msg.clientId} message={msg} />
        ))}

        {/* Phase-specific embedded control */}
        {phase === 'collect-profile' && (
          <div className="px-2">
            <ContactInfoStep onComplete={onComplete} />
          </div>
        )}

        {phase === 'select-hospitals' && isBackendOwnedHospitalSelection && (
          <div className="px-2 space-y-2">
            <SubmittedDetailsCard />
            {beautyUploadSubmitted ? <BeautyUploadSubmittedCard /> : <BeautyUploadPromptCard />}
          </div>
        )}

        {phase === 'select-hospitals' && !isBackendOwnedHospitalSelection && (
          <div className="px-2">
            <HospitalCards />
          </div>
        )}

        {phase === 'messages-ready' && (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gold-600" />
            </div>
            <div>
              <h4 className="text-stone-800 font-serif text-lg mb-1">{dt('chatWelcomeBack')}</h4>
              <p className="text-stone-500 text-sm">{dt('chatViewHospitalConversations')}</p>
            </div>
            <button
              onClick={() => {
                openPanel();
                onClose?.();
              }}
              className="bg-gold-600 hover:bg-gold-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300"
            >
              {dt('dashboardOpenMessages')}
            </button>
          </div>
        )}

        {phase === 'bootstrap-error' && (
          <div className="mx-3 my-2 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-700 text-sm font-medium mb-1">{dt('chatSomethingWentWrong')}</p>
            <p className="text-red-600 text-xs mb-3">
              {bootstrapError ?? dt('chatUnableSetup')}
            </p>
            <button
              onClick={clearBootstrapError}
              className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {dt('chatTryAgain')}
            </button>
          </div>
        )}
      </div>

      {/* Message input — hidden for returning patients who already have conversations */}
      {showPreBootstrapInput && phase !== 'messages-ready' && !isBackendOwnedHospitalSelection && <PreBootstrapInput />}
      {showPreBootstrapInput && isBackendOwnedHospitalSelection && beautyUploadSubmitted && widgetChatSessionId && (
        <MessageInput conversationId={widgetChatSessionId} />
      )}
    </div>
  );
}
