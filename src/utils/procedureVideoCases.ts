export type VideoCase = {
  id: string;
  doctor: string;
  doctorName: string;
  project: string;
  projectName: string;
  objectKey: string;
  videoUrl: string;
  size: number;
};

export type VideoCasePayload = {
  count: number;
  doctors: string[];
  projects: string[];
  cases: VideoCase[];
};

const PROJECT_ALIASES: Record<string, string> = {
  'aveli cellulite treatment': 'body-contouring',
  blepharoplasty: 'eye-surgery',
  'body contouring after weight loss': 'body-contouring',
  'botox cosmetic': 'injectables',
  'botox and neurotoxins': 'injectables',
  'bra line back lift': 'body-contouring',
  'brazilian butt lift bbl': 'body-contouring',
  'brazilian butt lift': 'body-contouring',
  'breast implant removal exchange and revision': 'breast',
  'breast lift': 'breast',
  'breast reduction': 'breast',
  'brow lift': 'facial-contouring',
  'buccal fat removal': 'facial-contouring',
  'buttock lift': 'body-contouring',
  'chemical peels': 'laser-treatments',
  'cheek augmentation': 'facial-contouring',
  'chin augmentation': 'facial-contouring',
  'collagen stimulators non ha fillers': 'collagen',
  cervicoplasty: 'facial-contouring',
  'deep neck contouring': 'facial-contouring',
  'dermal fillers': 'injectables',
  'double eyelid surgery': 'eye-surgery',
  'eye surgery': 'eye-surgery',
  'eyebrow restoration': 'hair-transplant',
  'eyelid surgery': 'eye-surgery',
  facelift: 'facial-contouring',
  'facial contouring': 'facial-contouring',
  'facial implants': 'facial-contouring',
  'facial injectables': 'injectables',
  'facial rejuvenation with prp': 'injectables',
  'fat dissolving injections': 'injectables',
  'fat transfer facial fat grafting': 'injectables',
  'forehead reduction surgery': 'facial-contouring',
  fillers: 'injectables',
  botox: 'injectables',
  injectables: 'injectables',
  'gynecomastia surgery': 'breast',
  'hair restoration': 'hair-transplant',
  'hair transplant': 'hair-transplant',
  'hairline restoration': 'hair-transplant',
  'ipl photofacial': 'laser-treatments',
  'jawline contouring': 'facial-contouring',
  labiaplasty: 'intimate',
  'laser hair removal': 'laser-treatments',
  'laser liposuction': 'body-contouring',
  'laser skin resurfacing': 'laser-treatments',
  'lip augmentation': 'injectables',
  'lip filler': 'injectables',
  'lip injections': 'injectables',
  'lip lift': 'injectables',
  hairline: 'hair-transplant',
  liposuction: 'body-contouring',
  'lower body lift 360 body lift': 'body-contouring',
  'microdermabrasion': 'laser-treatments',
  'microneedling': 'laser-treatments',
  'midface lift': 'facial-contouring',
  'mini facelift': 'facial-contouring',
  'mohs skin cancer reconstruction': 'facial-contouring',
  'mommy makeover': 'body-contouring',
  'mons pubis reduction lift': 'body-contouring',
  'neck lift': 'facial-contouring',
  'neck liposuction': 'body-contouring',
  'neck tightening': 'skin-tightening-ns',
  'non surgical skin tightening': 'skin-tightening-ns',
  'nose tip refinement': 'nose-surgery',
  otoplasty: 'facial-contouring',
  'otoplasty ear pinning': 'facial-contouring',
  panniculectomy: 'body-contouring',
  platysmaplasty: 'facial-contouring',
  'prp hair treatment': 'hair-transplant',
  'prp prf': 'injectables',
  'renuvion skin tightening treatment': 'skin-tightening-ns',
  'revision rhinoplasty': 'nose-surgery',
  rhinoplasty: 'nose-surgery',
  'nose surgery': 'nose-surgery',
  'scar reduction and revision': 'body-contouring',
  'skin resurfacing': 'laser-treatments',
  'submalar implants': 'facial-contouring',
  'temples lift temporofrontal lift': 'facial-contouring',
  'thigh lift': 'body-contouring',
  'tummy tuck': 'body-contouring',
  'upper body lift': 'body-contouring',
  'weight loss injections': 'body-contouring',
  'zygomatic arch contouring': 'facial-contouring',
  breast: 'breast',
  'breast augmentation': 'breast',
  'body contouring': 'body-contouring',
};

export const formatVideoCaseBytes = (bytes: number) => {
  if (!bytes) return '0 MB';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const labelFromVideoSlug = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => (part === 'and' ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');

export const VIDEO_CASE_MANIFEST_VERSION = '20260610-v4';

export const getVideoCaseManifestUrl = (baseUrl: string) =>
  `${baseUrl.replace(/\/+$/, '')}/video_cases_v4/manifest.json?v=${VIDEO_CASE_MANIFEST_VERSION}`;

export const paginateVideoCases = (cases: VideoCase[], page: number, pageSize: number) => {
  const totalItems = cases.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const items = cases.slice(startIndex, startIndex + pageSize);

  return {
    currentPage,
    totalPages,
    totalItems,
    startItem: totalItems === 0 ? 0 : startIndex + 1,
    endItem: Math.min(startIndex + items.length, totalItems),
    items,
  };
};

export const resolveVideoProjectForProcedure = (procedureName: string) => {
  const normalized = decodeURIComponent(procedureName || '')
    .toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  if (PROJECT_ALIASES[normalized]) {
    return PROJECT_ALIASES[normalized];
  }

  const match = Object.entries(PROJECT_ALIASES).find(([alias]) => normalized.includes(alias));
  return match?.[1] || null;
};

export const filterVideoCasesForProcedure = (cases: VideoCase[], procedureName: string) => {
  const project = resolveVideoProjectForProcedure(procedureName);
  if (!project) return [];
  return cases.filter((item) => item.project === project);
};

export const filterVideoCasesForProject = (cases: VideoCase[], project: string | null) => {
  if (!project || project === 'all') return cases;
  return cases.filter((item) => item.project === project);
};

export const getDoctorsForVideoCases = (cases: VideoCase[]) =>
  Array.from(new Map(cases.map((item) => [item.doctor, item.doctorName])).entries())
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
