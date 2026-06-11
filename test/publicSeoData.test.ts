import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { P1_PRIORITY_PROCEDURE_SEEDS } from '../src/seo/routes.js';
import { loadPublicSeoData } from '../src/services/publicSeoData.js';

const nodeFacingModules = [
  'src/services/publicSeoData.js',
  'src/services/publicSeoSupabase.js',
  'src/services/publicSeoFallbacks.js',
  'src/seo/site.js',
  'src/seo/routes.js',
];

describe('public SEO data loader', () => {
  it('returns fallback SEO data and warnings when Supabase env is missing', async () => {
    const warn = vi.fn();
    const data = await loadPublicSeoData({
      env: {},
      logger: { warn },
    });

    expect(data.procedures).toHaveLength(20);
    expect(data.surgeons.length).toBeGreaterThan(0);
    expect(data.hospitals).toEqual([]);
    expect(data.routeExtras).toEqual(expect.arrayContaining(data.surgeons.map((surgeon) => surgeon.route)));
    expect(data.warnings).toContain('Supabase env is missing; using public SEO fallback data.');
    expect(warn).toHaveBeenCalledWith('[public-seo] Supabase env is missing; using public SEO fallback data.');
  });

  it('builds metadata-ready procedure records for every P1 priority seed', async () => {
    const data = await loadPublicSeoData({ env: {}, logger: { warn: vi.fn() } });

    expect(data.procedures).toHaveLength(P1_PRIORITY_PROCEDURE_SEEDS.length);
    expect(data.procedures.map((procedure) => procedure.label)).toContain('Brazilian Butt Lift (BBL)');
    expect(data.procedures.map((procedure) => procedure.label)).toContain('BOTOX® & Neurotoxins');

    data.procedures.forEach((procedure) => {
      expect(procedure.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(procedure.area).toMatch(/^(face|body|nonsurgical|hair|dental)$/);
      expect(procedure.guideUrl).toBe(`/procedure/${encodeURIComponent(procedure.label)}`);
      expect(procedure.videoUrl).toBe(`${procedure.guideUrl}/videos`);
      expect(procedure.title).toContain(procedure.label);
      expect(procedure.description.length).toBeGreaterThan(80);
      expect(procedure.benefits.length).toBeGreaterThan(0);
      expect(procedure.candidacy.length).toBeGreaterThan(0);
      expect(procedure.risks.length).toBeGreaterThan(0);
    });
  });

  it('keeps build-time modules Node-resolvable and independent of browser Supabase singleton', async () => {
    for (const modulePath of nodeFacingModules) {
      const source = await readFile(resolve(modulePath), 'utf8');

      expect(source).not.toContain('supabaseClient');
      expect(source).not.toMatch(/from ['"]@\//);
      expect(source).not.toMatch(/import\(['"]@\//);
    }
  });
});
