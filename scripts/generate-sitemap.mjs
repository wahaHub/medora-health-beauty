import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import {
  getImplementedProcedureGalleryUrl,
  getImplementedProcedureGuideUrl,
  getImplementedProcedureVideoUrl,
  getSupportedProcedureOptions,
  normalizeProcedureLabel,
} from '../src/data/procedureTaxonomyCore.js';

const SITE_ORIGIN = 'https://medorabeauty.com';
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const staticPublicRoutes = [
  '/',
  '/team',
  '/surgeons',
  '/gallery',
  '/travel',
  '/reviews',
  '/patient-form',
  '/search',
  '/get-quote',
  '/video-cases',
  '/procedure/videos',
];

const procedureAreaRoutes = [
  '/procedures/face',
  '/procedures/body',
  '/procedures/nonsurgical',
  '/procedures/hair',
  '/procedures/dental',
];

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const encodePathSegment = (value) => encodeURIComponent(decodeURIComponent(String(value || '')));

const blockedEntityTokens = new Set([
  'test',
  'testing',
  'demo',
  'sample',
  'placeholder',
  'dummy',
  'mock',
  'staging',
  'dev',
]);

const tokenizeIndexableText = (value) =>
  String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

const isBlockedEntityToken = (token) => {
  if (blockedEntityTokens.has(token)) return true;
  if (/^(test|testing|demo|sample|placeholder|dummy|mock|staging|dev)\d+$/.test(token)) return true;
  return false;
};

export const isIndexablePublicEntity = ({ pathSegment, displayName, allowNumericPathSegment = false }) => {
  const pathValue = String(pathSegment || '').trim();
  const nameValue = String(displayName || '').trim();
  if (!pathValue || !nameValue) return false;

  const pathTokens = tokenizeIndexableText(pathValue);
  const nameTokens = tokenizeIndexableText(nameValue);
  const allTokens = [...pathTokens, ...nameTokens];

  if (allTokens.some(isBlockedEntityToken)) return false;
  if (!allowNumericPathSegment && /^\d+$/.test(pathTokens[0] || '')) return false;

  return true;
};

const supportedProcedureLabels = new Set(
  getSupportedProcedureOptions().map((procedure) => normalizeProcedureLabel(procedure.label))
);

const isSupportedProcedureName = (procedureName) =>
  supportedProcedureLabels.has(normalizeProcedureLabel(procedureName));

export const isIndexableCaseRoute = (caseItem) => {
  const caseNumber = String(caseItem?.case_number || '').trim();
  const procedureName = caseItem?.procedures?.procedure_name;

  return /^\d+$/.test(caseNumber) && isSupportedProcedureName(procedureName);
};

const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const absolutize = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalizedPath}`;
};

const addUrl = (urls, path) => {
  if (!path) return;
  urls.add(absolutize(path));
};

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const addSupabaseUrls = async (urls) => {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const runPublicQuery = async (label, queryUrls) => {
    try {
      await queryUrls(supabase);
    } catch (error) {
      console.warn(`[sitemap] Skipping ${label}: ${error.message}`);
    }
  };

  await runPublicQuery('surgeon routes', async (client) => {
    const { data, error } = await client
      .from('surgeons')
      .select('surgeon_id, name')
      .not('surgeon_id', 'is', null)
      .order('surgeon_id', { ascending: true });

    if (error) throw error;
    (data || []).filter((surgeon) =>
      isIndexablePublicEntity({
        pathSegment: surgeon.surgeon_id,
        displayName: surgeon.name,
      })
    ).forEach((surgeon) => {
      addUrl(urls, `/surgeon/${encodePathSegment(surgeon.surgeon_id)}`);
    });
  });

  await runPublicQuery('hospital routes', async (client) => {
    const { data, error } = await client
      .from('hospitals')
      .select('slug, name')
      .not('slug', 'is', null)
      .order('slug', { ascending: true });

    if (error) throw error;
    (data || []).filter((hospital) =>
      isIndexablePublicEntity({
        pathSegment: hospital.slug,
        displayName: hospital.name,
      })
    ).forEach((hospital) => {
      addUrl(urls, `/hospital/${encodePathSegment(hospital.slug)}`);
      addUrl(urls, `/hospital/${encodePathSegment(hospital.slug)}/gallery`);
    });
  });

  await runPublicQuery('case routes', async (client) => {
    const { data, error } = await client
      .from('procedure_cases')
      .select('case_number, procedures (procedure_name)')
      .not('case_number', 'is', null)
      .order('case_number', { ascending: true });

    if (error) throw error;
    (data || []).filter(isIndexableCaseRoute).forEach((caseItem) => {
      const procedureName = caseItem.procedures?.procedure_name;
      addUrl(urls, `${getImplementedProcedureGuideUrl(procedureName)}/case/${encodePathSegment(caseItem.case_number)}`);
    });
  });
};

const buildSitemap = async () => {
  const urls = new Set();

  staticPublicRoutes.forEach((route) => addUrl(urls, route));
  procedureAreaRoutes.forEach((route) => addUrl(urls, route));

  getSupportedProcedureOptions().forEach((procedure) => {
    addUrl(urls, getImplementedProcedureGuideUrl(procedure.label));
    addUrl(urls, getImplementedProcedureGalleryUrl(procedure.label));
    addUrl(urls, getImplementedProcedureVideoUrl(procedure.label));
  });

  await addSupabaseUrls(urls);

  const entries = Array.from(urls)
    .sort()
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
};

export const generateSitemapFile = async () => {
  const sitemap = await buildSitemap();
  await writeFile(join(rootDir, 'public', 'sitemap.xml'), sitemap, 'utf8');
  console.log(`[sitemap] Wrote public/sitemap.xml`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateSitemapFile();
}
