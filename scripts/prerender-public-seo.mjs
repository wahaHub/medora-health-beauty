import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadPublicSeoData } from '../src/services/publicSeoData.js';
import { getPublicSeoRoutes } from '../src/seo/routes.js';
import { writeRouteHtml } from '../src/seo/renderStaticHtml.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

const logger = {
  warn: (message) => console.warn(message),
};

const assertRequiredOutput = (entry) => {
  if (!entry.title || !entry.canonicalUrl || !entry.outputPath) {
    throw new Error(`Missing required prerender metadata for ${entry.route}`);
  }
};

const shellHtml = await readFile(join(distDir, 'index.html'), 'utf8');
const seoData = await loadPublicSeoData({ logger });
const routes = getPublicSeoRoutes(seoData.routeExtras);
const manifest = [];

for (const route of routes) {
  const entry = await writeRouteHtml({
    route,
    distDir,
    shellHtml,
    data: seoData,
  });
  assertRequiredOutput(entry);
  manifest.push(entry);
}

await writeFile(
  join(distDir, 'seo-prerender-manifest.json'),
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      routes: manifest,
      warnings: seoData.warnings,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log(`[seo] Prerendered ${manifest.length} public routes`);
