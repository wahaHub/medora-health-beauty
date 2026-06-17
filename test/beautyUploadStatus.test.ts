import { describe, expect, it } from 'vitest';
import { hasBeautyUploadSubmission } from '@/services/beautyUploadStatus';
import type { Message } from '@/services/crmApiClient';

function createMessage(overrides: Partial<Message>): Message {
  return {
    id: 'message-1',
    role: 'patient',
    content: '',
    createdAt: '2026-06-17T00:00:00.000Z',
    ...overrides,
  };
}

describe('beautyUploadStatus', () => {
  it('treats the consultation upload marker as the completed 5-view submission signal', () => {
    expect(hasBeautyUploadSubmission([
      createMessage({
        content: '[Beauty Consultation Upload]',
      }),
    ])).toBe(true);

    expect(hasBeautyUploadSubmission([
      createMessage({
        content: 'General patient chat',
        attachments: new Array(5).fill(null).map((_, index) => ({
          fileName: `view-${index + 1}.jpg`,
          mimeType: 'image/jpeg',
          fileSize: 1000,
          storageKey: `view-${index + 1}`,
        })),
      }),
    ])).toBe(false);

    expect(hasBeautyUploadSubmission([
      createMessage({
        content: '[Beauty Consultation Upload]',
        attachments: new Array(5).fill(null).map((_, index) => ({
          fileName: `view-${index + 1}.jpg`,
          mimeType: 'image/jpeg',
          fileSize: 1000,
          storageKey: `view-${index + 1}`,
        })),
      }),
    ])).toBe(true);
  });
});
