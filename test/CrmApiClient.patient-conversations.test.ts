import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('crmApiClient patient conversation normalization', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('preserves senderRole without coercing admin or ai replies into hospital senderType', async () => {
    const mod = await import('@/services/crmApiClient');

    expect(
      mod.normalizePatientMessage({
        id: 'msg-admin',
        conversationId: 'conv-1',
        senderRole: 'ADMIN',
        content: 'Support reply',
        createdAt: '2026-04-18T00:00:00.000Z',
      }),
    ).toMatchObject({
      role: 'admin',
      senderRole: 'ADMIN',
      senderType: undefined,
    });

    expect(
      mod.normalizePatientMessage({
        id: 'msg-ai',
        conversationId: 'conv-1',
        senderRole: 'AI',
        content: 'AI reply',
        createdAt: '2026-04-18T00:00:00.000Z',
      }),
    ).toMatchObject({
      role: 'admin',
      senderRole: 'AI',
      senderType: undefined,
    });

    expect(
      mod.normalizePatientMessage({
        id: 'msg-hospital',
        conversationId: 'conv-1',
        senderRole: 'HOSPITAL',
        content: 'Hospital reply',
        createdAt: '2026-04-18T00:00:00.000Z',
      }),
    ).toMatchObject({
      role: 'admin',
      senderRole: 'HOSPITAL',
      senderType: 'hospital',
    });
  });

  it('drops unknown conversation rows instead of coercing them to patient-hospital', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(JSON.stringify([
        {
          id: 'legacy-conv',
          caseId: 'case-1',
          type: 'legacy',
          updatedAt: '2026-04-18T00:00:00.000Z',
        },
        {
          id: 'hospital-conv',
          caseId: 'case-1',
          category: 'HOSPITAL_PATIENT',
          hospitalName: 'Beijing United',
          updatedAt: '2026-04-19T00:00:00.000Z',
        },
      ])),
    });
    vi.stubGlobal('fetch', fetchMock);

    const mod = await import('@/services/crmApiClient');
    const conversations = await mod.crmApi.getConversations();

    expect(conversations).toEqual([
      expect.objectContaining({
        id: 'hospital-conv',
        type: 'patient-hospital',
        hospitalName: 'Beijing United',
      }),
    ]);
  });

  it('normalizes CRM v2 patient session summaries into conversations', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(JSON.stringify({
        sessions: [
          {
            sessionId: 'widget-chat:patient-1:case-1',
            caseId: 'case-1',
            type: 'CARE_TEAM',
            title: 'Medora Care Team',
            hospitalId: null,
            hospitalName: null,
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null,
            updatedAt: '2026-06-07T00:00:00.000Z',
          },
        ],
        meta: {
          caseId: 'case-1',
          chatAuthority: 'AI_ACTIVE',
        },
      })),
    });
    vi.stubGlobal('fetch', fetchMock);

    const mod = await import('@/services/crmApiClient');
    const conversations = await mod.crmApi.getConversations();

    expect(conversations).toEqual([
      expect.objectContaining({
        id: 'widget-chat:patient-1:case-1',
        sessionId: 'widget-chat:patient-1:case-1',
        caseId: 'case-1',
        type: 'patient-admin',
        category: 'ADMIN_PATIENT',
        title: 'Medora Care Team',
      }),
    ]);
  });

  it('uses session chat events when sending text to a widget chat session', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(JSON.stringify({ ok: true })),
    });
    vi.stubGlobal('fetch', fetchMock);

    const mod = await import('@/services/crmApiClient');
    await mod.crmApi.sendMessage('widget-chat:patient-1:case-1', 'I want to talk about hair restoration.');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/patient/sessions/widget-chat%3Apatient-1%3Acase-1/chat/events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          eventType: 'TEXT_MESSAGE_SUBMITTED',
          locale: 'en',
          payload: {
            content: 'I want to talk about hair restoration.',
          },
        }),
      }),
    );
  });
});
