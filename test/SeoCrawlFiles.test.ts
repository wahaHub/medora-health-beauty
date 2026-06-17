import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const rootDir = process.cwd();

const readPublicFile = (fileName: string) =>
  readFileSync(join(rootDir, 'public', fileName), 'utf8');

const getEnvWithoutSupabase = () => {
  const env = { ...process.env };
  delete env.SUPABASE_URL;
  delete env.SUPABASE_ANON_KEY;
  delete env.SUPABASE_SERVICE_KEY;
  delete env.SUPABASE_SERVICE_ROLE_KEY;
  delete env.VITE_SUPABASE_URL;
  delete env.VITE_SUPABASE_ANON_KEY;
  return env;
};

describe('SEO crawl files', () => {
  it('exposes crawler directives and AI-readable site context', () => {
    const robots = readPublicFile('robots.txt');
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain('Disallow: /api');
    expect(robots).toContain('Disallow: /dashboard');
    expect(robots).toContain('Disallow: /login');
    expect(robots).toContain('Disallow: /packages');
    expect(robots).toContain('Sitemap: https://medorabeauty.com/sitemap.xml');

    const llms = readPublicFile('llms.txt');
    [
      '## Medora Beauty',
      '## Key Pages',
      '## Procedure Areas',
      '## Procedure Guides',
      '## Doctors and Hospitals',
      '## Cases and Gallery',
      '## Editorial Standards',
      '## Medical Disclaimer',
      '## Contact',
    ].forEach((section) => {
      expect(llms).toContain(section);
    });
  });

  it('generates a no-env sitemap for implemented P0 URLs only', () => {
    execFileSync('node', ['scripts/generate-sitemap.mjs'], {
      cwd: rootDir,
      env: getEnvWithoutSupabase(),
      stdio: 'pipe',
    });

    const sitemap = readPublicFile('sitemap.xml');
    expect(sitemap).toContain('<loc>https://medorabeauty.com/</loc>');
    expect(sitemap).toContain('<loc>https://medorabeauty.com/procedure/videos</loc>');
    expect(sitemap).toContain('<loc>https://medorabeauty.com/procedures/face</loc>');
    expect(sitemap).toContain('<loc>https://medorabeauty.com/procedure/Rhinoplasty</loc>');
    expect(sitemap).toContain('<loc>https://medorabeauty.com/procedure/Rhinoplasty/gallery</loc>');
    expect(sitemap).toContain('<loc>https://medorabeauty.com/procedure/Rhinoplasty/videos</loc>');

    expect(sitemap).not.toContain('/procedure/videos?procedure=');
    expect(sitemap).not.toContain('/procedures/face/rhinoplasty');
    expect(sitemap).not.toContain('/procedures/face/rhinoplasty/video-cases');
    expect(sitemap).not.toContain('/procedures/face/rhinoplasty/before-after');
  });

  it('keeps obvious test provider data out of dynamic sitemap routes', async () => {
    const { isIndexableCaseRoute, isIndexablePublicEntity } = await import('../scripts/generate-sitemap.mjs');

    expect(
      isIndexablePublicEntity({
        pathSegment: 'bangkok-aesthetic-center',
        displayName: 'Bangkok Aesthetic Center',
      })
    ).toBe(true);
    expect(
      isIndexablePublicEntity({
        pathSegment: 'doc-test-hospital',
        displayName: 'Doc Test Hospital',
      })
    ).toBe(false);
    expect(
      isIndexablePublicEntity({
        pathSegment: 'testing001-mm7ap1rq',
        displayName: 'Testing 001',
      })
    ).toBe(false);
    expect(
      isIndexablePublicEntity({
        pathSegment: '001-mm8kyv0m',
        displayName: '001',
      })
    ).toBe(false);
    expect(
      isIndexablePublicEntity({
        pathSegment: 'dr-min-zhang',
        displayName: 'Dr. Min Zhang',
      })
    ).toBe(true);

    expect(
      isIndexableCaseRoute({
        case_number: '384846',
        procedures: { procedure_name: 'Tummy Tuck' },
      })
    ).toBe(true);
    expect(
      isIndexableCaseRoute({
        case_number: 'case-test-1',
        procedures: { procedure_name: 'Tummy Tuck' },
      })
    ).toBe(false);
    expect(
      isIndexableCaseRoute({
        case_number: '384846',
        procedures: { procedure_name: 'Experimental Test Procedure' },
      })
    ).toBe(false);
  });
});
