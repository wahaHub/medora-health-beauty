import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';

import { loadPublicSeoData } from '../src/services/publicSeoData.js';
import { injectSeoIntoHtml, routeToCleanOutputPath, routeToOutputPath, writeRouteHtml } from '../src/seo/renderStaticHtml.js';
import { createSeoPayload } from '../src/seo/renderStaticHtml.js';

const shellHtml = `<!doctype html>
<html>
  <head>
    <title>Medora Beauty</title>
    <meta name="description" content="old">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`;

const loadFallbackData = () => loadPublicSeoData({ env: {}, logger: { warn: () => undefined } });

describe('SEO prerender HTML', () => {
  it('injects route-specific head, JSON-LD, and body content', async () => {
    const data = await loadFallbackData();
    const payload = createSeoPayload('/procedure/Rhinoplasty', data);
    const html = injectSeoIntoHtml(shellHtml, payload);

    expect(html).toContain('<title>Rhinoplasty');
    expect(html).toContain('<link rel="canonical" href="https://medorabeauty.com/procedure/Rhinoplasty">');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('data-seo-prerender="true"');
    expect(html).toContain('<h1>Rhinoplasty</h1>');
    expect(html.indexOf('data-seo-prerender="true"')).toBeLessThan(html.indexOf('/assets/index.js'));
  });

  it('uses data-backed surgeon routes for prerender canonicals', async () => {
    const data = await loadFallbackData();
    const payload = createSeoPayload('/surgeon/dr-min-zhang', data);
    const html = injectSeoIntoHtml(shellHtml, payload);

    expect(html).toContain('<link rel="canonical" href="https://medorabeauty.com/surgeon/dr-min-zhang">');
    expect(html).toContain('"url":"https://medorabeauty.com/surgeon/dr-min-zhang"');
    expect(html).not.toContain('Dr.%20Min%20Zhang');
  });

  it('maps encoded procedure routes to tested filesystem outputs', () => {
    expect(routeToOutputPath('/procedure/Rhinoplasty', 'dist')).toBe(join('dist', 'procedure', 'Rhinoplasty', 'index.html'));
    expect(routeToCleanOutputPath('/procedure/Rhinoplasty', 'dist')).toBe(join('dist', 'procedure', 'Rhinoplasty.html'));
    expect(routeToOutputPath('/procedure/Brazilian%20Butt%20Lift%20(BBL)', 'dist')).toBe(
      join('dist', 'procedure', 'Brazilian Butt Lift (BBL)', 'index.html'),
    );
    expect(routeToCleanOutputPath('/procedure/Brazilian%20Butt%20Lift%20(BBL)', 'dist')).toBe(
      join('dist', 'procedure', 'Brazilian Butt Lift (BBL).html'),
    );
    expect(routeToOutputPath('/procedure/BOTOX%C2%AE%20%26%20Neurotoxins', 'dist')).toBe(
      join('dist', 'procedure', 'BOTOX® & Neurotoxins', 'index.html'),
    );
    expect(routeToCleanOutputPath('/procedure/BOTOX%C2%AE%20%26%20Neurotoxins', 'dist')).toBe(
      join('dist', 'procedure', 'BOTOX® & Neurotoxins.html'),
    );
  });

  it('rejects decoded route segments that could escape the dist directory', () => {
    expect(() => routeToOutputPath('/hospital/..%2F..%2Foutside', '/repo/dist')).toThrow(/Unsafe SEO prerender route segment/);
    expect(() => routeToCleanOutputPath('/hospital/..%2F..%2Foutside', '/repo/dist')).toThrow(
      /Unsafe SEO prerender route segment/,
    );
  });

  it('writes procedure, video path, and generic video HTML files', async () => {
    const distDir = await mkdtemp(join(tmpdir(), 'medora-seo-'));
    const data = await loadFallbackData();

    try {
      await writeRouteHtml({ route: '/procedure/Rhinoplasty', distDir, shellHtml, data });
      await writeRouteHtml({ route: '/procedure/Rhinoplasty/videos', distDir, shellHtml, data });
      await writeRouteHtml({ route: '/procedure/videos', distDir, shellHtml, data });
      await writeRouteHtml({ route: '/procedure/Brazilian%20Butt%20Lift%20(BBL)', distDir, shellHtml, data });
      await writeRouteHtml({ route: '/procedure/BOTOX%C2%AE%20%26%20Neurotoxins', distDir, shellHtml, data });

      const guideHtml = await readFile(join(distDir, 'procedure', 'Rhinoplasty', 'index.html'), 'utf8');
      const videoHtml = await readFile(join(distDir, 'procedure', 'Rhinoplasty', 'videos', 'index.html'), 'utf8');
      const genericVideoHtml = await readFile(join(distDir, 'procedure', 'videos', 'index.html'), 'utf8');
      const bblHtml = await readFile(join(distDir, 'procedure', 'Brazilian Butt Lift (BBL)', 'index.html'), 'utf8');
      const botoxHtml = await readFile(join(distDir, 'procedure', 'BOTOX® & Neurotoxins', 'index.html'), 'utf8');

      expect(guideHtml).toContain('Rhinoplasty');
      expect(existsSync(join(distDir, 'procedure', 'Rhinoplasty.html'))).toBe(true);
      expect(videoHtml).toContain('Rhinoplasty Video Cases');
      expect(existsSync(join(distDir, 'procedure', 'Rhinoplasty', 'videos.html'))).toBe(true);
      expect(genericVideoHtml).toContain('All Cosmetic Procedure Video Cases');
      expect(existsSync(join(distDir, 'procedure', 'videos.html'))).toBe(true);
      expect(bblHtml).toContain('Brazilian Butt Lift');
      expect(existsSync(join(distDir, 'procedure', 'Brazilian Butt Lift (BBL).html'))).toBe(true);
      expect(botoxHtml).toContain('BOTOX');
      expect(existsSync(join(distDir, 'procedure', 'BOTOX® & Neurotoxins.html'))).toBe(true);
      expect(existsSync(join(distDir, 'procedure', 'videos?procedure=Rhinoplasty&area=face'))).toBe(false);
    } finally {
      await rm(distDir, { recursive: true, force: true });
    }
  });
});
