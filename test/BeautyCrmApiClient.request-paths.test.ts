import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Beauty CRM client request paths', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('keeps browser requests on the Beauty proxy path by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue('{"ok":true}'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const mod = await import('../services/crmApiClient');
    await mod.request('/me');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/patient/me',
      expect.objectContaining({
        credentials: 'include',
      }),
    );
  });

  it('uses the direct CRM base url when VITE_CRM_API_BASE_URL is configured', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_CRM_API_BASE_URL', 'https://crmapi.medicaltourismchina.health');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue('{"ok":true}'),
    });
    vi.stubGlobal('fetch', fetchMock);

    const mod = await import('../services/crmApiClient');
    await mod.request('/me');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://crmapi.medicaltourismchina.health/api/patient/me',
      expect.objectContaining({
        credentials: 'include',
      }),
    );
  });
});
