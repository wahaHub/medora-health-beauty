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

const DIRECT_VIDEO_PROJECT_ALIASES: Record<string, string> = {
  blepharoplasty: 'eye-surgery',
  'body contouring': 'body-contouring',
  breast: 'breast',
  'breast augmentation': 'breast',
  dental: 'porcelain-veneers',
  'dental aesthetics': 'porcelain-veneers',
  'double eyelid surgery': 'eye-surgery',
  'eye surgery': 'eye-surgery',
  'eyelid surgery': 'eye-surgery',
  'facial contouring': 'facial-contouring',
  'facial injectables': 'injectables',
  'hair restoration': 'hair-transplant',
  'hair transplant': 'hair-transplant',
  injectables: 'injectables',
  invisalign: 'invisalign-clear-aligners',
  'invisalign clear aligners': 'invisalign-clear-aligners',
  'laser treatments': 'laser-treatments',
  labiaplasty: 'intimate',
  'non surgical skin tightening': 'skin-tightening-ns',
  rhinoplasty: 'nose-surgery',
  'nose surgery': 'nose-surgery',
  'porcelain veneers': 'porcelain-veneers',
  'skin tightening': 'skin-tightening-ns',
  'smile design': 'smile-design',
  'teeth whitening': 'teeth-whitening',
  'tooth whitening': 'teeth-whitening',
  veneers: 'porcelain-veneers',
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

export const VIDEO_CASE_MANIFEST_VERSION = '20260610-v6';

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

const normalizeVideoProcedureName = (procedureName: string) =>
  decodeURIComponent(procedureName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const resolveVideoProjectForProcedure = (procedureName: string) =>
  DIRECT_VIDEO_PROJECT_ALIASES[normalizeVideoProcedureName(procedureName)] || null;

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
