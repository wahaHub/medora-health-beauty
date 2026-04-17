import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import handler from '../api/patient/[...path].js';

type MockRequest = {
  method: string;
  query: { path: string[] };
  headers: Record<string, string>;
  body?: unknown;
  url: string;
};

function createResponseRecorder() {
  let statusCode = 200;
  const headers = new Map<string, string | string[]>();
  let body: unknown;

  return {
    get statusCode() {
      return statusCode;
    },
    get headers() {
      return headers;
    },
    get body() {
      return body;
    },
    setHeader(name: string, value: string | string[]) {
      headers.set(name.toLowerCase(), value);
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    send(payload: unknown) {
      body = payload;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
  };
}

describe('Beauty patient proxy', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('forwards path, query, cookies, status, body, and set-cookie headers to CRM', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: vi.fn().mockResolvedValue('{"error":"crm-auth-required"}'),
      headers: {
        getSetCookie: () => ['patient_session=abc; Path=/; HttpOnly', 'refresh_token=def; Path=/; HttpOnly'],
        get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
    });

    global.fetch = fetchMock as typeof fetch;

    const req: MockRequest = {
      method: 'POST',
      query: { path: ['conversations', 'conv-123', 'messages'] },
      headers: {
        cookie: 'patient_session=browser-cookie; theme=light',
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: { content: 'hello from beauty' },
      url: '/api/patient/conversations/conv-123/messages?cursor=next&limit=10',
    };
    const res = createResponseRecorder();

    await handler(req as never, res as never);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/patient/conversations/conv-123/messages?cursor=next&limit=10',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'hello from beauty' }),
        headers: expect.objectContaining({
          cookie: 'patient_session=browser-cookie; theme=light',
          'content-type': 'application/json',
          'x-medora-site': 'beauty',
        }),
      }),
    );

    expect(res.statusCode).toBe(401);
    expect(res.headers.get('set-cookie')).toEqual([
      'patient_session=abc; Path=/; HttpOnly',
      'refresh_token=def; Path=/; HttpOnly',
    ]);
    expect(res.body).toBe('{"error":"crm-auth-required"}');
  });

  it('forwards a single set-cookie header when getSetCookie is unavailable', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue('{"ok":true}'),
      headers: {
        get: (name: string) => {
          const normalized = name.toLowerCase();
          if (normalized === 'content-type') return 'application/json';
          if (normalized === 'set-cookie') return 'patient_session=solo; Path=/; HttpOnly';
          return null;
        },
      },
    });

    global.fetch = fetchMock as typeof fetch;

    const req: MockRequest = {
      method: 'GET',
      query: { path: ['me'] },
      headers: {
        cookie: 'patient_session=browser-cookie',
      },
      url: '/api/patient/me',
    };
    const res = createResponseRecorder();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.headers.get('set-cookie')).toBe('patient_session=solo; Path=/; HttpOnly');
    expect(res.body).toBe('{"ok":true}');
  });

  it('falls back to the production CRM origin when CRM_API_BASE_URL is unset on Vercel', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue('{"ok":true}'),
      headers: {
        get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
    });

    global.fetch = fetchMock as typeof fetch;
    const originalVercel = process.env.VERCEL;
    const originalCrmApiBaseUrl = process.env.CRM_API_BASE_URL;
    process.env.VERCEL = '1';
    delete process.env.CRM_API_BASE_URL;

    const req: MockRequest = {
      method: 'GET',
      query: { path: ['me'] },
      headers: {},
      url: '/api/patient/me',
    };
    const res = createResponseRecorder();

    try {
      await handler(req as never, res as never);
    } finally {
      process.env.VERCEL = originalVercel;
      if (typeof originalCrmApiBaseUrl === 'string') {
        process.env.CRM_API_BASE_URL = originalCrmApiBaseUrl;
      } else {
        delete process.env.CRM_API_BASE_URL;
      }
    }

    expect(fetchMock).toHaveBeenCalledWith(
      'https://crmapi.medicaltourismchina.health/api/patient/me',
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });
});
