import {
  getImplementedProcedureGuideUrl,
  getSupportedProcedureOptions,
  normalizeProcedureLabel,
} from '../data/procedureTaxonomyCore.js';

export const P1_PRIORITY_PROCEDURE_SEEDS = [
  'rhinoplasty',
  'facelift',
  'eyelid surgery',
  'neck lift',
  'brow lift',
  'revision rhinoplasty',
  'nose tip refinement',
  'mini facelift',
  'cheek augmentation',
  'chin augmentation',
  'liposuction',
  'tummy tuck',
  'breast augmentation',
  'breast lift',
  'BBL',
  'mommy makeover',
  'arm lift',
  'thigh lift',
  'botox',
  'dermal fillers',
];

const P1_STATIC_PUBLIC_ROUTES = [
  '/',
  '/surgeons',
  '/gallery',
  '/travel',
  '/reviews',
  '/video-cases',
  '/procedure/videos',
  '/procedures/face',
  '/procedures/body',
  '/procedures/nonsurgical',
  '/procedures/hair',
  '/procedures/dental',
];

const PROCEDURE_ALIASES = {
  bbl: ['Brazilian Butt Lift (BBL)'],
  botox: ['BOTOX® & Neurotoxins', 'BOTOX® Cosmetic'],
};

const normalizeRoutePath = (route) => {
  if (!route) return null;
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
  if (normalizedRoute.length > 1 && normalizedRoute.endsWith('/')) {
    return normalizedRoute.slice(0, -1);
  }
  return normalizedRoute;
};

const resolvePriorityProcedure = (seed, supportedProcedures) => {
  const normalizedSeed = normalizeProcedureLabel(seed);
  const candidates = PROCEDURE_ALIASES[normalizedSeed] || [seed];

  const match = supportedProcedures.find((procedure) =>
    candidates.some((candidate) => normalizeProcedureLabel(procedure.label) === normalizeProcedureLabel(candidate))
  );

  if (!match) {
    throw new Error(`Unable to resolve P1 priority procedure seed: ${seed}`);
  }

  return match;
};

export function getP1StaticPublicRoutes() {
  return [...P1_STATIC_PUBLIC_ROUTES];
}

export function getP1PriorityProcedures() {
  const supportedProcedures = getSupportedProcedureOptions();
  return P1_PRIORITY_PROCEDURE_SEEDS.map((seed) => resolvePriorityProcedure(seed, supportedProcedures));
}

export function getP1ProcedureGuideRoutes() {
  return getP1PriorityProcedures().map((procedure) => getImplementedProcedureGuideUrl(procedure.label));
}

export function getP1ProcedureVideoRoutes() {
  return getP1PriorityProcedures().map((procedure) => `${getImplementedProcedureGuideUrl(procedure.label)}/videos`);
}

export function getPublicSeoRoutes(extraRoutes = []) {
  const routes = [
    ...getP1StaticPublicRoutes(),
    ...getP1ProcedureGuideRoutes(),
    ...getP1ProcedureVideoRoutes(),
    ...extraRoutes,
  ]
    .map(normalizeRoutePath)
    .filter(Boolean);

  return Array.from(new Set(routes));
}
