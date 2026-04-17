import { useEffect, useRef } from 'react';
import { FileText, Image as ImageIcon } from 'lucide-react';
import type { Message, MessageAttachment } from '../../services/crmApiClient';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function AttachmentCard({ attachment, isPatient }: { attachment: MessageAttachment; isPatient: boolean }) {
  const isImage = attachment.mimeType.startsWith('image/');
  const hasUrl = Boolean(attachment.url && attachment.url.trim().length > 0);

  if (isImage && hasUrl) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className={`block overflow-hidden rounded-2xl border ${
          isPatient
            ? 'border-gold-200 bg-gold-50'
            : 'border-stone-200 bg-stone-50'
        }`}
      >
        <img
          src={attachment.url}
          alt={attachment.fileName}
          className="h-40 w-full object-cover"
          loading="lazy"
        />
        <div className={`flex items-center gap-2 px-3 py-2 text-[12px] ${
          isPatient ? 'text-gold-700' : 'text-stone-600'
        }`}>
          <ImageIcon className="h-4 w-4 shrink-0" />
          <span className="min-w-0 truncate">{attachment.fileName}</span>
        </div>
      </a>
    );
  }

  const content = (
    <>
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${
        isPatient ? 'bg-gold-100 text-gold-700' : 'bg-white text-stone-600'
      }`}>
        {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{attachment.fileName}</span>
    </>
  );

  if (!hasUrl) {
    return (
      <div
        className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-[12px] ${
          isPatient
            ? 'border-gold-200 bg-gold-50 text-gold-800'
            : 'border-stone-200 bg-stone-50 text-stone-700'
        }`}
      >
        {content}
      </div>
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-[12px] ${
        isPatient
          ? 'border-gold-200 bg-gold-50 text-gold-800 hover:bg-gold-100'
          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
      }`}
    >
      {content}
    </a>
  );
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  let lastDate = '';

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
      {messages.map((msg) => {
        const msgDate = formatDate(msg.createdAt);
        const showDateSep = msgDate !== lastDate;
        lastDate = msgDate;
        const isPatient = msg.senderType === 'patient';

        return (
          <div key={msg.id}>
            {showDateSep && (
              <div className="flex items-center justify-center my-3">
                <span className="text-xs text-stone-400 bg-stone-100 px-3 py-0.5 rounded-full">
                  {msgDate}
                </span>
              </div>
            )}
            <div className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                  isPatient
                    ? 'bg-gold-100 text-stone-800 rounded-tr-sm'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-tl-sm'
                }`}
              >
                {msg.content ? (
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                ) : null}
                {msg.attachments && msg.attachments.length > 0 ? (
                  <div className={`${msg.content ? 'mt-3' : ''} space-y-2`}>
                    {msg.attachments.map((attachment) => (
                      <AttachmentCard
                        key={`${msg.id}:${attachment.storageKey}`}
                        attachment={attachment}
                        isPatient={isPatient}
                      />
                    ))}
                  </div>
                ) : null}
                <p className={`text-[10px] mt-1 ${isPatient ? 'text-gold-600/60' : 'text-stone-400'} text-right`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
