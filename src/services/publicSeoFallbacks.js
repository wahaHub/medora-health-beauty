import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getImplementedProcedureGuideUrl,
  getProcedureSlug,
  normalizeProcedureLabel,
} from '../data/procedureTaxonomyCore.js';
import { getP1PriorityProcedures } from '../seo/routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const VIDEO_CASE_THUMBNAIL_FALLBACK = '/homepage/aesthetic-cases-collage.png';
const VIDEO_CASE_LIMIT_PER_PROCEDURE = 6;
const VIDEO_CASE_MANIFEST_VERSION = '20260610-v6';
const DEFAULT_R2_PUBLIC_URL = 'https://videos.medorabeauty.com';
const VIDEO_CASE_MANIFEST_TIMEOUT_MS = 10000;

const VIDEO_PROJECT_ALIASES = {
  blepharoplasty: 'eye-surgery',
  'body contouring': 'body-contouring',
  'breast augmentation': 'breast',
  'breast lift': 'breast',
  'brow lift': 'eye-surgery',
  'cheek augmentation': 'facial-contouring',
  'chin augmentation': 'facial-contouring',
  dental: 'porcelain-veneers',
  'dental aesthetics': 'porcelain-veneers',
  'dermal fillers': 'injectables',
  'double eyelid surgery': 'eye-surgery',
  'eye surgery': 'eye-surgery',
  'eyelid surgery': 'eye-surgery',
  facelift: 'facial-contouring',
  'facial contouring': 'facial-contouring',
  'facial injectables': 'injectables',
  'hair restoration': 'hair-transplant',
  'hair transplant': 'hair-transplant',
  injectables: 'injectables',
  liposuction: 'body-contouring',
  'mini facelift': 'facial-contouring',
  'mommy makeover': 'body-contouring',
  'neck lift': 'facial-contouring',
  'nose surgery': 'nose-surgery',
  'nose tip refinement': 'nose-surgery',
  'non surgical skin tightening': 'skin-tightening-ns',
  'porcelain veneers': 'porcelain-veneers',
  rhinoplasty: 'nose-surgery',
  'revision rhinoplasty': 'nose-surgery',
  'skin tightening': 'skin-tightening-ns',
  'teeth whitening': 'teeth-whitening',
  'tooth whitening': 'teeth-whitening',
  'tummy tuck': 'body-contouring',
  veneers: 'porcelain-veneers',
};

const safeReadJson = async (relativePath) => {
  try {
    const source = await readFile(join(rootDir, relativePath), 'utf8');
    return JSON.parse(source);
  } catch {
    return null;
  }
};

const getEnv = (configEnv) => configEnv || process.env;

const resolveRemoteVideoManifestUrl = (configEnv) => {
  const env = getEnv(configEnv);
  const explicitUrl = env.SEO_VIDEO_CASE_MANIFEST_URL || env.VIDEO_CASE_MANIFEST_URL;
  if (explicitUrl) return explicitUrl;

  if (configEnv && !env.VITE_R2_CUSTOM_DOMAIN && !env.VITE_R2_PUBLIC_URL && !env.R2_PUBLIC_URL) {
    return null;
  }

  const baseUrl =
    env.VITE_R2_CUSTOM_DOMAIN ||
    env.VITE_R2_PUBLIC_URL ||
    env.R2_PUBLIC_URL ||
    DEFAULT_R2_PUBLIC_URL;
  return `${baseUrl.replace(/\/+$/, '')}/video_cases_v4/manifest.json?v=${VIDEO_CASE_MANIFEST_VERSION}`;
};

const fetchJsonWithTimeout = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VIDEO_CASE_MANIFEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

const hasVideoCaseRows = (manifest) => Array.isArray(manifest?.cases) && manifest.cases.length > 0;

const firstSentence = (value) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const [sentence] = text.split(/(?<=[.!?])\s+/);
  return sentence || text;
};

const normalizeVideoProcedureName = (procedureName) =>
  decodeURIComponent(procedureName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const resolveVideoProjectForProcedure = (procedureName) =>
  VIDEO_PROJECT_ALIASES[normalizeVideoProcedureName(procedureName)] || null;

const labelFromVideoSlug = (slug = '') =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => (part === 'and' ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`))
    .join(' ');

const durationFromId = (id = '') => {
  const seed = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const seconds = 45 + (seed % 58);
  return `PT${Math.floor(seconds / 60)}M${seconds % 60}S`;
};

const toStringList = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') return item.description || item.name || item.title || '';
      return '';
    })
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
};

const createFallbackDescription = (procedure) =>
  `${procedure.label} guide from Medora Beauty with procedure overview, candidacy, benefits, recovery considerations, and planning context for patients comparing aesthetic care options.`;

const getContentForProcedure = (contentByProcedure, procedure) => {
  const normalizedLabel = normalizeProcedureLabel(procedure.label);
  return contentByProcedure.get(normalizedLabel) || null;
};

const buildContentIndex = (contentJson) => {
  const procedures = Array.isArray(contentJson?.procedures) ? contentJson.procedures : [];
  return new Map(
    procedures.flatMap((item) => {
      const names = [item.procedureName, item.procedure].filter(Boolean);
      return names.map((name) => [normalizeProcedureLabel(name), item]);
    })
  );
};

const normalizeSurgeon = (surgeon, index) => {
  const name = String(surgeon.name || '').trim();
  if (!name) return null;
  const slug = getProcedureSlug(name.replace(/^Dr\.?\s+/i, 'dr ')) || `surgeon-${index + 1}`;

  return {
    id: surgeon.surgeon_id || slug,
    name,
    slug,
    route: `/surgeon/${encodeURIComponent(slug)}`,
    title: surgeon.title || 'Aesthetic surgeon',
    specialties: Array.isArray(surgeon.specialties) ? surgeon.specialties : [],
    languages: Array.isArray(surgeon.languages) ? surgeon.languages : [],
    bio: typeof surgeon.bio === 'string' ? surgeon.bio : surgeon.bio?.intro || '',
    imageUrl: surgeon.image_url || surgeon.imageUrl || '',
  };
};

const normalizeVideoCase = (item, index, generatedAt) => {
  const id = String(item.id || `video-case-${index + 1}`).trim();
  const projectName = String(item.projectName || labelFromVideoSlug(item.project || 'cosmetic-procedure')).trim();
  const doctorName = String(item.doctorName || '').replace(/^医院_/, '').trim();
  const providerContext = doctorName ? ` with ${doctorName}` : '';
  const title = `${projectName} Video Case ${index + 1}`;
  const summary = `Consent-backed ${projectName.toLowerCase()} video case summary${providerContext}, presented for procedure comparison and planning context without private patient identifiers or guaranteed outcome claims.`;

  return {
    id,
    title,
    name: title,
    summary,
    description: summary,
    procedure: projectName,
    project: item.project || '',
    projectName,
    doctorName,
    videoUrl: item.videoUrl || '',
    contentUrl: item.videoUrl || '',
    thumbnailUrl: item.thumbnailUrl || item.thumbnail_url || VIDEO_CASE_THUMBNAIL_FALLBACK,
    uploadDate: generatedAt || undefined,
    duration: durationFromId(id),
  };
};

export async function loadFallbackVideoCases(config = {}) {
  const warnings = [];
  const remoteUrl = resolveRemoteVideoManifestUrl(config.env);
  let manifest = null;
  let source = 'public/video-cases.json';

  if (remoteUrl) {
    try {
      manifest = await fetchJsonWithTimeout(remoteUrl);
      if (!hasVideoCaseRows(manifest)) {
        throw new Error('missing cases array');
      }
      source = remoteUrl;
    } catch (error) {
      warnings.push(`R2 video case manifest unavailable (${error.message}); using checked-in public/video-cases.json fallback.`);
      manifest = null;
    }
  }

  if (!manifest) {
    manifest = await safeReadJson('public/video-cases.json');
    if (!hasVideoCaseRows(manifest)) {
      warnings.push('Checked-in public/video-cases.json fallback is unavailable or empty; video case SEO data will be omitted.');
    }
  }

  const cases = Array.isArray(manifest?.cases) ? manifest.cases : [];

  return {
    source,
    warnings,
    cases: cases
      .map((item, index) => normalizeVideoCase(item, index, manifest?.generatedAt))
      .filter((item) => item.videoUrl && item.project),
  };
}

const getVideoCasesForProcedure = (videoCases, procedureName) => {
  const project = resolveVideoProjectForProcedure(procedureName);
  if (!project) return [];

  return videoCases
    .filter((item) => item.project === project)
    .slice(0, VIDEO_CASE_LIMIT_PER_PROCEDURE);
};

export async function loadFallbackProcedures() {
  const contentJson = await safeReadJson('scripts/data/procedures_content_en.json');
  const contentByProcedure = buildContentIndex(contentJson);

  return getP1PriorityProcedures().map((procedure) => {
    const content = getContentForProcedure(contentByProcedure, procedure);
    const guideUrl = getImplementedProcedureGuideUrl(procedure.label);
    const overview = content?.overview || '';
    const benefits = toStringList(content?.benefits);
    const candidacy = toStringList(content?.candidacy);
    const risks = toStringList(content?.risksAndConsiderations);
    const recovery =
      typeof content?.recovery === 'string'
        ? content.recovery
        : content?.recovery?.recovery_time || content?.recoveryTimeline?.[0]?.description || '';

    return {
      label: procedure.label,
      slug: getProcedureSlug(procedure.label),
      area: procedure.area,
      category: procedure.category,
      guideUrl,
      videoUrl: `${guideUrl}/videos`,
      title: `${procedure.label} Guide | Medora Beauty`,
      description: firstSentence(overview) || createFallbackDescription(procedure),
      overview,
      benefits: benefits.length > 0 ? benefits : [`Learn whether ${procedure.label} may fit your aesthetic goals.`],
      candidacy: candidacy.length > 0 ? candidacy : ['Best evaluated through a consultation with a qualified clinician.'],
      risks: risks.length > 0 ? risks : ['All procedures involve individual risks, recovery variables, and suitability limits.'],
      recovery,
      imageUrl: '',
    };
  });
}

export async function loadFallbackSurgeons() {
  const surgeonsJson = await safeReadJson('scripts/data/surgeons_generated.json');
  const surgeons = Array.isArray(surgeonsJson) ? surgeonsJson : [];
  return surgeons.map(normalizeSurgeon).filter(Boolean);
}

export async function loadPublicSeoFallbackData(config = {}) {
  const [procedures, surgeons, videoCaseData] = await Promise.all([
    loadFallbackProcedures(),
    loadFallbackSurgeons(),
    loadFallbackVideoCases({ env: config.env }),
  ]);
  const videoCases = videoCaseData.cases;
  const proceduresWithVideoCases = procedures.map((procedure) => ({
    ...procedure,
    videoCases: getVideoCasesForProcedure(videoCases, procedure.label),
  }));

  return {
    procedures: proceduresWithVideoCases,
    surgeons,
    hospitals: [],
    videoCases,
    videoCaseSource: videoCaseData.source,
    warnings: videoCaseData.warnings,
  };
}
