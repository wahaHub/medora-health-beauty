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
  blepharoplasty: 'eye-surgery',
  'double eyelid surgery': 'eye-surgery',
  'eye surgery': 'eye-surgery',
  'eyebrow restoration': 'hair-transplant',
  'eyelid surgery': 'eye-surgery',
  facelift: 'facial-contouring',
  'facial contouring': 'facial-contouring',
  fillers: 'injectables',
  botox: 'injectables',
  injectables: 'injectables',
  'hair transplant': 'hair-transplant',
  hairline: 'hair-transplant',
  liposuction: 'body-contouring',
  rhinoplasty: 'nose-surgery',
  'nose surgery': 'nose-surgery',
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
