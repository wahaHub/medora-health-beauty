import { useRef, useState } from 'react';
import { Paperclip, Send, X } from 'lucide-react';
import { crmApi } from '../../services/crmApiClient';

interface MessageInputProps {
  conversationId: string;
  onMessageSent?: (message: any) => void;
  placeholder?: string;
  draftValue?: string;
  onDraftChange?: (value: string) => void;
}

type UploadedAttachment = {
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
};

async function uploadAttachment(
  conversationId: string,
  file: File,
): Promise<UploadedAttachment> {
  const init = await crmApi.initConversationAttachmentUpload({
    conversationId,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
  });

  const uploadResponse = await fetch(init.upload.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Attachment upload failed for ${file.name}`);
  }

  return init.asset;
}

export function MessageInput({
  conversationId,
  onMessageSent,
  placeholder = 'Type a message...',
  draftValue,
  onDraftChange,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const value = draftValue ?? content;

  const syncValue = (nextValue: string) => {
    if (draftValue === undefined) {
      setContent(nextValue);
    }
    onDraftChange?.(nextValue);
  };

  const resetComposer = () => {
    syncValue('');
    setSelectedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    const text = value.trim();
    if ((!text && selectedFiles.length === 0) || sending) return;

    setSending(true);
    setErrorMessage(null);
    try {
      let newMessage;
      if (selectedFiles.length > 0) {
        const attachments = await Promise.all(
          selectedFiles.map((file) => uploadAttachment(conversationId, file)),
        );
        newMessage = await crmApi.sendMessage(conversationId, text, {
          attachments: attachments.length > 0 ? attachments : undefined,
          messageType:
            attachments.length > 0
              ? selectedFiles.every((file) => file.type.startsWith('image/'))
                ? 'IMAGE'
                : 'FILE'
              : 'TEXT',
        });
      } else {
        newMessage = await crmApi.sendMessage(conversationId, text);
      }
      resetComposer();
      onMessageSent?.(newMessage);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to send message',
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    syncValue(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setSelectedFiles((current) => [...current, ...files]);
  };

  const removeFile = (targetFile: File) => {
    setSelectedFiles((current) => current.filter((file) => file !== targetFile));
  };

  return (
    <div className="px-4 py-3 border-t border-stone-200 shrink-0 bg-white">
      {selectedFiles.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFiles.map((file) => (
            <span
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-600"
            >
              <span className="max-w-[12rem] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(file)}
                className="rounded-full text-stone-400 transition-colors hover:text-stone-700"
                aria-label={`Remove ${file.name}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex items-end gap-2 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-200 focus-within:border-gold-500 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          aria-label="Attach files"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700"
          aria-label="Attach files"
        >
          <Paperclip size={16} />
        </button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent outline-none text-sm text-stone-700 placeholder-stone-400 resize-none max-h-[120px]"
        />
        <button
          onClick={handleSend}
          disabled={(!value.trim() && selectedFiles.length === 0) || sending}
          className={`p-2 rounded-full transition-colors shrink-0 ${
            value.trim() || selectedFiles.length > 0
              ? 'bg-gold-600 text-white hover:bg-gold-700'
              : 'bg-stone-200 text-stone-400'
          }`}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
      {errorMessage ? (
        <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
      ) : null}
    </div>
  );
}
