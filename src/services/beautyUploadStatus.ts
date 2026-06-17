import type { Message } from '@/services/crmApiClient';

export const BEAUTY_UPLOAD_MARKER = '[Beauty Consultation Upload]';
export const BEAUTY_UPLOAD_REQUIRED_VIEW_COUNT = 5;

export function isCompletedBeautyUploadMessage(
  message: Pick<Message, 'content' | 'attachments'>,
): boolean {
  return message.content.includes(BEAUTY_UPLOAD_MARKER);
}

export function hasBeautyUploadSubmission(messages: Message[] | undefined | null): boolean {
  return Boolean(messages?.some(isCompletedBeautyUploadMessage));
}
