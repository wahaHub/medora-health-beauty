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

const PROCEDURE_CONTENT_ALIASES = {
  [normalizeProcedureLabel('Brazilian Butt Lift (BBL)')]: [
    'Brazilian Butt Lift',
    'Brazilian Butt Lift (Buttock Fat Transfer / Buttock Enhancement)',
  ],
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

const toTechniqueList = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (!item || typeof item !== 'object') return '';
      const name = String(item.name || item.title || '').trim();
      const description = String(item.description || item.guidance || '').replace(/\s+/g, ' ').trim();
      return [name, description].filter(Boolean).join(': ');
    })
    .filter(Boolean);
};

const toTimelineList = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (!item || typeof item !== 'object') return '';
      const timepoint = String(item.timepoint || item.time || item.stage || '').trim();
      const guidance = String(item.guidance || item.description || '').replace(/\s+/g, ' ').trim();
      return [timepoint, guidance].filter(Boolean).join(': ');
    })
    .filter(Boolean);
};

const createFallbackDescription = (procedure) =>
  `${procedure.label} guide from Medora Beauty with procedure overview, candidacy, benefits, recovery considerations, and planning context for patients comparing aesthetic care options.`;

const MEDICAL_DISCLAIMER =
  'This guide is educational and does not replace consultation with a qualified clinician who can review your health history, anatomy, goals, and destination-specific care plan.';

const createShortAnswer = (procedure, overview) => {
  const sourceSummary = firstSentence(overview);
  if (sourceSummary) {
    return `${sourceSummary} Medora Beauty uses this guide to help patients compare procedure goals, risks, recovery, case media, and provider options before consultation.`;
  }

  return `${procedure.label} is an aesthetic treatment option that should be evaluated through a qualified consultation. Medora Beauty helps patients compare goals, risks, recovery, case media, and provider options before planning care.`;
};

const createWhoShouldAvoid = (procedure) => [
  `People considering ${procedure.label} should delay or avoid treatment until cleared by a qualified clinician if they have uncontrolled medical conditions, active infection, or healing risks that could make treatment unsafe.`,
  'Patients who cannot pause nicotine use, follow recovery restrictions, attend follow-up care, or accept realistic limitations may not be ready for treatment.',
  'Anyone seeking guaranteed, perfectly symmetrical, or risk-free results should revisit expectations with a clinician before booking.',
];

const createCostFactors = (procedure) => [
  `${procedure.label} cost can vary by destination, provider experience, facility setting, anesthesia needs, and whether the plan is surgical, nonsurgical, primary, revision, or combined with other procedures.`,
  'Travel planning, recovery lodging, medications, garments, imaging, lab work, follow-up visits, and revision policies can affect the total patient budget.',
  'A final quote should come after consultation because anatomy, goals, safety requirements, and recovery logistics change the treatment plan.',
];

const createFaqItems = (procedure, fields) => {
  const items = [
    {
      question: `What is ${procedure.label}?`,
      answer: fields.shortAnswerSummary,
    },
    {
      question: `Who may be a candidate for ${procedure.label}?`,
      answer:
        fields.candidacy[0] ||
        `Candidates for ${procedure.label} should be assessed through consultation, health screening, and realistic goal review.`,
    },
    {
      question: `Who should avoid or delay ${procedure.label}?`,
      answer: fields.whoShouldAvoid[0],
    },
    {
      question: `What affects ${procedure.label} cost?`,
      answer: fields.costFactors.join(' '),
    },
    {
      question: `What are the main ${procedure.label} risks?`,
      answer: [
        fields.risks.slice(0, 2).join(' '),
        'Risk level depends on health history, technique, provider judgment, and recovery compliance.',
      ]
        .filter(Boolean)
        .join(' '),
    },
  ];

  if (fields.recovery) {
    items.splice(3, 0, {
      question: `How long is ${procedure.label} recovery?`,
      answer: fields.recovery,
    });
  }

  return items.filter((item) => item.question && item.answer);
};

const getContentForProcedure = (contentByProcedure, procedure) => {
  const normalizedLabel = normalizeProcedureLabel(procedure.label);
  const directMatch = contentByProcedure.get(normalizedLabel);
  if (directMatch) return directMatch;

  const aliases = PROCEDURE_CONTENT_ALIASES[normalizedLabel] || [];
  for (const alias of aliases) {
    const match = contentByProcedure.get(normalizeProcedureLabel(alias));
    if (match) return match;
  }

  return null;
};

const buildContentIndex = (contentJson) => {
  const procedures = Array.isArray(contentJson?.procedures) ? contentJson.procedures : [];
  return new Map(
    procedures.flatMap((item) => {
      const names = [item.procedureName, item.procedure]
        .flatMap((name) => {
          if (!name) return [];
          const primaryName = String(name).replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
          return [name, primaryName];
        })
        .filter(Boolean);
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

const normalizeVideoCase = (item, index) => {
  const id = String(item.id || `video-case-${index + 1}`).trim();
  const shortId = id.slice(0, 8) || String(index + 1);
  const projectName = String(item.projectName || labelFromVideoSlug(item.project || 'cosmetic-procedure')).trim();
  const doctorName = String(item.doctorName || '').replace(/^医院_/, '').trim();
  const providerContext = doctorName ? ` with ${doctorName}` : '';
  const title = `${projectName} Video Case ${shortId}`;
  const confidence = String(item.classificationConfidence || '').trim();
  const sourceKind = String(item.sourceKind || '').replace(/[_-]+/g, ' ').trim();
  const privacyNote = 'Consent-backed case media is summarized without private patient identifiers or guaranteed outcome claims.';
  const timelineNote = 'Exact treatment and recovery dates are not published in the public manifest.';
  const sourceNote = [sourceKind && `source: ${sourceKind}`, confidence && `classification confidence: ${confidence}`]
    .filter(Boolean)
    .join('; ');
  const caseContext = `Manifest lists this media as ${projectName} case video ${shortId}${providerContext}.`;
  const sourceContext = sourceNote ? `Manifest source context: ${sourceNote}.` : '';
  const resultViewingContext = 'Use this media for consultation research and provider-style comparison, not as a guaranteed individual result.';
  const summary = [caseContext, resultViewingContext, privacyNote, sourceContext].filter(Boolean).join(' ');
  const mediaAltText = `${projectName} video case ${shortId}${providerContext} from Medora Beauty case media.`;

  return {
    id,
    caseNumber: shortId,
    title,
    name: title,
    summary,
    description: summary,
    procedure: projectName,
    project: item.project || '',
    projectName,
    doctorName,
    provider: doctorName,
    patientConcern: item.patientConcern || item.patient_concern || undefined,
    treatmentApproach: item.treatmentApproach || item.treatment_approach || item.treatmentPlan || item.treatment_plan || undefined,
    outcomeSummary: item.outcomeSummary || item.outcome_summary || undefined,
    timeline: item.timeline || item.recoveryTimeline || item.recovery_timeline || undefined,
    caseContext,
    sourceContext,
    resultViewingContext,
    timelineNote,
    mediaAltText,
    privacyNote,
    sourceSet: item.sourceSet || '',
    sourceKind: item.sourceKind || '',
    classificationConfidence: item.classificationConfidence || '',
    videoUrl: item.videoUrl || '',
    contentUrl: item.videoUrl || '',
    thumbnailUrl: item.thumbnailUrl || item.thumbnail_url || VIDEO_CASE_THUMBNAIL_FALLBACK,
    uploadDate: item.uploadDate || item.upload_date || undefined,
    duration: item.duration || item.videoDuration || item.video_duration || undefined,
    transcript: item.transcript || item.videoTranscript || item.video_transcript || undefined,
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
      .map((item, index) => normalizeVideoCase(item, index))
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
    const techniques = toTechniqueList(content?.techniques);
    const recoveryTimeline = toTimelineList(content?.recoveryTimeline);
    const recoveryTips = toStringList(content?.recoveryTips);
    const complementaryProcedures = toStringList(content?.complementaryProcedures);
    const recovery =
      typeof content?.recovery === 'string'
        ? content.recovery
        : content?.recovery?.recovery_time || content?.recoveryTimeline?.[0]?.description || '';
    const procedureDescription = content?.procedure || '';
    const expectedResults =
      typeof content?.recovery === 'object' && content?.recovery?.final_results
        ? `Final results: ${content.recovery.final_results}`
        : '';
    const sourceFields = {
      benefits: benefits.length > 0 ? benefits : [`Learn whether ${procedure.label} may fit your aesthetic goals.`],
      candidacy: candidacy.length > 0 ? candidacy : ['Best evaluated through a consultation with a qualified clinician.'],
      risks: risks.length > 0 ? risks : ['All procedures involve individual risks, recovery variables, and suitability limits.'],
    };
    const answerFields = {
      ...sourceFields,
      shortAnswerSummary: createShortAnswer(procedure, overview),
      whoShouldAvoid: createWhoShouldAvoid(procedure),
      costFactors: createCostFactors(procedure),
      recovery,
    };

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
      shortAnswerSummary: answerFields.shortAnswerSummary,
      benefits: sourceFields.benefits,
      candidacy: sourceFields.candidacy,
      whoShouldAvoid: answerFields.whoShouldAvoid,
      techniques,
      procedureDescription,
      expectedResults,
      risks: sourceFields.risks,
      recovery,
      recoveryTimeline,
      recoveryTips,
      costFactors: answerFields.costFactors,
      complementaryProcedures,
      faqItems: createFaqItems(procedure, answerFields),
      medicalDisclaimer: MEDICAL_DISCLAIMER,
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
