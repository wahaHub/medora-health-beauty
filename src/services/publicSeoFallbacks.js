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

const safeReadJson = async (relativePath) => {
  try {
    const source = await readFile(join(rootDir, relativePath), 'utf8');
    return JSON.parse(source);
  } catch {
    return null;
  }
};

const firstSentence = (value) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const [sentence] = text.split(/(?<=[.!?])\s+/);
  return sentence || text;
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

export async function loadPublicSeoFallbackData() {
  const [procedures, surgeons] = await Promise.all([loadFallbackProcedures(), loadFallbackSurgeons()]);

  return {
    procedures,
    surgeons,
    hospitals: [],
    warnings: [],
  };
}
