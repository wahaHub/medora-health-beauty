import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import {
  getImplementedProcedureGalleryUrl,
  getImplementedProcedureGuideUrl,
  getImplementedProcedureVideoUrl,
  getSupportedProcedureOptions,
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
      .select('surgeon_id')
      .not('surgeon_id', 'is', null)
      .order('surgeon_id', { ascending: true });

    if (error) throw error;
    (data || []).forEach((surgeon) => {
      addUrl(urls, `/surgeon/${encodePathSegment(surgeon.surgeon_id)}`);
    });
  });

  await runPublicQuery('hospital routes', async (client) => {
    const { data, error } = await client
      .from('hospitals')
      .select('slug')
      .not('slug', 'is', null)
      .order('slug', { ascending: true });

    if (error) throw error;
    (data || []).forEach((hospital) => {
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
    (data || []).forEach((caseItem) => {
      const procedureName = caseItem.procedures?.procedure_name;
      if (!procedureName) return;
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

const sitemap = await buildSitemap();
await writeFile(join(rootDir, 'public', 'sitemap.xml'), sitemap, 'utf8');
console.log(`[sitemap] Wrote public/sitemap.xml`);
