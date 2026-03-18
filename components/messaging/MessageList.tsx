import { useEffect, useRef } from 'react';

interface Message {
  id: string;
  content: string;
  senderType: 'patient' | 'hospital' | 'system';
  createdAt: string;
}

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

  // Group messages by date
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
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
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
