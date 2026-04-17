import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { MessageInput } from '../components/messaging/MessageInput';

const crmApiState = vi.hoisted(() => ({
  initConversationAttachmentUpload: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock('../services/crmApiClient', async () => {
  const actual = await vi.importActual<typeof import('../services/crmApiClient')>('../services/crmApiClient');
  return {
    ...actual,
    crmApi: crmApiState,
  };
});

describe('Beauty message composer attachments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    crmApiState.initConversationAttachmentUpload.mockResolvedValue({
      upload: {
        uploadUrl: 'https://upload.example.com/file-1',
        storageKey: 'crm/dev/messages/file-1.png',
        expiresIn: 300,
      },
      asset: {
        fileName: 'before.png',
        mimeType: 'image/png',
        fileSize: 12,
        storageKey: 'crm/dev/messages/file-1.png',
      },
    });
    crmApiState.sendMessage.mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
    }));
  });

  it('uploads selected attachments before sending the message', async () => {
    render(<MessageInput conversationId="conv-1" />);

    const file = new File(['hello world'], 'before.png', { type: 'image/png' });
    const input = screen.getAllByLabelText('Attach files').find((element) => element.tagName === 'INPUT');
    expect(input).toBeDefined();
    fireEvent.change(input!, { target: { files: [file] } });
    fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
      target: { value: 'Please review this photo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(crmApiState.initConversationAttachmentUpload).toHaveBeenCalledWith({
        conversationId: 'conv-1',
        fileName: 'before.png',
        fileSize: 11,
        mimeType: 'image/png',
      });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://upload.example.com/file-1',
      expect.objectContaining({
        method: 'PUT',
        body: file,
      }),
    );
    expect(crmApiState.sendMessage).toHaveBeenCalledWith('conv-1', 'Please review this photo', {
      attachments: [{
        fileName: 'before.png',
        mimeType: 'image/png',
        fileSize: 12,
        storageKey: 'crm/dev/messages/file-1.png',
      }],
      messageType: 'IMAGE',
    });
  });
});
