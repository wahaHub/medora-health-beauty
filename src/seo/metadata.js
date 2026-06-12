export { DEFAULT_OG_IMAGE, SITE_NAME, SITE_ORIGIN } from './site.js';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_ORIGIN } from './site.js';

const STATIC_PAGE_COPY = {
  '/surgeons': {
    title: 'Global Cosmetic Surgeons | Medora Beauty',
    description: 'Meet Medora Beauty partner surgeons and compare specialties, destinations, and consultation options for international aesthetic treatment planning.',
  },
  '/gallery': {
    title: 'Before and After Cosmetic Surgery Gallery | Medora Beauty',
    description: 'Explore consent-aware Medora Beauty case media for cosmetic procedures, with privacy-first summaries for international aesthetic patients.',
  },
  '/travel': {
    title: 'Medical Travel for Cosmetic Surgery | Medora Beauty',
    description: 'Plan international medical travel for cosmetic surgery with Medora Beauty guidance on destinations, consultation steps, and coordinated patient support.',
  },
  '/reviews': {
    title: 'Patient Reviews and Experiences | Medora Beauty',
    description: 'Read Medora Beauty patient experience information and learn how consultation, hospital matching, and care coordination support treatment decisions.',
  },
  '/video-cases': {
    title: 'Cosmetic Surgery Video Cases | Medora Beauty',
    description: 'Watch consent-backed cosmetic surgery video case summaries from Medora Beauty to understand procedure journeys and provider options.',
  },
  '/procedure/videos': {
    title: 'All Cosmetic Procedure Video Cases | Medora Beauty',
    description: 'Browse Medora Beauty cosmetic procedure video cases across face, body, nonsurgical, hair, and dental aesthetic categories.',
  },
  '/procedures/face': {
    title: 'Face Cosmetic Surgery Procedures | Medora Beauty',
    description: 'Compare facial cosmetic procedure guides including rhinoplasty, facelift, eyelid surgery, and other Medora Beauty treatment options.',
  },
  '/procedures/body': {
    title: 'Body Cosmetic Surgery Procedures | Medora Beauty',
    description: 'Compare body contouring procedure guides including liposuction, tummy tuck, breast surgery, and related Medora Beauty options.',
  },
  '/procedures/nonsurgical': {
    title: 'Nonsurgical Aesthetic Procedures | Medora Beauty',
    description: 'Explore nonsurgical aesthetic treatment guides including injectables, skin treatments, and Medora Beauty consultation planning.',
  },
  '/procedures/hair': {
    title: 'Hair Restoration Procedures | Medora Beauty',
    description: 'Explore hair restoration procedure information and Medora Beauty planning support for international aesthetic patients.',
  },
  '/procedures/dental': {
    title: 'Cosmetic Dental Procedures | Medora Beauty',
    description: 'Compare cosmetic dental procedure guides and Medora Beauty planning support for smile-focused aesthetic treatment journeys.',
  },
};

const compact = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const stripTrailingSlash = (value) => value.replace(/\/+$/, '');

export function createCanonicalUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalizedPath === '/' ? '/' : stripTrailingSlash(normalizedPath)}`;
}

function createImageUrl(image = DEFAULT_OG_IMAGE) {
  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return createCanonicalUrl(image || DEFAULT_OG_IMAGE);
}

function encodePathSegment(value) {
  return encodeURIComponent(compact(value));
}

function createMetadata({ title, description, path = '/', image = DEFAULT_OG_IMAGE, type = 'website' }) {
  const safeTitle = compact(title) || `${SITE_NAME} | Global Cosmetic Surgery Planning`;
  const safeDescription = compact(description) || 'Medora Beauty helps international patients compare cosmetic procedures, hospitals, surgeons, and global medical travel options.';
  const canonicalUrl = createCanonicalUrl(path);
  const imageUrl = createImageUrl(image);

  return {
    title: safeTitle,
    description: safeDescription,
    canonicalUrl,
    openGraph: {
      title: safeTitle,
      description: safeDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type,
      image: imageUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: safeTitle,
      description: safeDescription,
      image: imageUrl,
    },
  };
}

export function createHomeMetadata() {
  return createMetadata({
    title: 'Medora Beauty | Global Cosmetic Surgery Planning',
    description: 'Medora Beauty helps international patients compare cosmetic surgery procedures, trusted providers, case media, and coordinated global medical travel.',
    path: '/',
  });
}

export function createStaticPageMetadata(route, overrides = {}) {
  const path = route || '/';
  const copy = STATIC_PAGE_COPY[path] || {
    title: `${titleFromRoute(path)} | ${SITE_NAME}`,
    description: `Explore Medora Beauty guidance for ${titleFromRoute(path).toLowerCase()}, including provider comparison and medical travel planning for international aesthetic care.`,
  };

  return createMetadata({
    ...copy,
    ...overrides,
    path,
  });
}

export function createProcedureMetadata(procedure = {}) {
  const label = compact(procedure.label || procedure.name || procedure.procedure_name || 'Cosmetic Procedure');
  const category = compact(procedure.category || procedure.area || 'aesthetic');
  const description = compact(procedure.description) || `Learn about ${label}, including consultation planning, provider comparison, recovery considerations, and medical travel support with Medora Beauty.`;

  return createMetadata({
    title: `${label} Procedure Guide | ${SITE_NAME}`,
    description: `${description} Compare ${category} procedure options with Medora Beauty before choosing a provider.`,
    path: `/procedure/${encodePathSegment(label)}`,
    image: procedure.imageUrl || procedure.image_url || procedure.image || DEFAULT_OG_IMAGE,
    type: 'article',
  });
}

export function createProcedureVideoMetadata(procedure = {}) {
  const label = compact(procedure.label || procedure.name || procedure.procedure_name || 'Cosmetic Procedure');

  return createMetadata({
    title: `${label} Video Cases | ${SITE_NAME}`,
    description: `Watch consent-backed ${label} video case summaries and compare real procedure journeys, provider context, and planning considerations with Medora Beauty.`,
    path: `/procedure/${encodePathSegment(label)}/videos`,
    image: procedure.videoImageUrl || procedure.imageUrl || procedure.image_url || DEFAULT_OG_IMAGE,
    type: 'video.other',
  });
}

export function createSurgeonMetadata(surgeon = {}) {
  const name = compact(surgeon.name || surgeon.full_name || 'Medora Beauty Surgeon');
  const title = compact(surgeon.title || surgeon.role || 'Cosmetic surgeon');
  const specialties = normalizeList(surgeon.specialties || surgeon.specialty).join(', ');
  const path = compact(surgeon.route) || `/surgeon/${encodePathSegment(name)}`;

  return createMetadata({
    title: `${name} | ${title} | ${SITE_NAME}`,
    description: specialties
      ? `${name} is a ${title} with Medora Beauty profile information for ${specialties}. Compare consultation options and treatment planning context.`
      : `${name} is a ${title} with Medora Beauty profile information for international aesthetic patients comparing consultation options.`,
    path,
    image: surgeon.imageUrl || surgeon.image_url || surgeon.photo || DEFAULT_OG_IMAGE,
    type: 'profile',
  });
}

export function createHospitalMetadata(hospital = {}) {
  const name = compact(hospital.name || hospital.hospital_name || 'Medora Beauty Hospital');
  const city = compact(hospital.city || hospital.location?.city || hospital.destination || 'Global Network');
  const specialties = normalizeList(hospital.specialties || hospital.specialty).join(', ');
  const path = compact(hospital.route) || `/hospital/${encodePathSegment(name)}`;

  return createMetadata({
    title: `${name} in ${city} | ${SITE_NAME}`,
    description: specialties
      ? `${name} in ${city} offers Medora Beauty hospital profile information for ${specialties}, consultation planning, and international patient coordination.`
      : `${name} in ${city} offers Medora Beauty hospital profile information, consultation planning, and international patient coordination.`,
    path,
    image: hospital.imageUrl || hospital.image_url || hospital.logo || DEFAULT_OG_IMAGE,
  });
}

export function renderHeadTags(metadata) {
  const tags = [
    `<title>${escapeHtmlText(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtmlAttribute(metadata.description)}">`,
    `<link rel="canonical" href="${escapeHtmlAttribute(metadata.canonicalUrl)}">`,
    `<meta property="og:title" content="${escapeHtmlAttribute(metadata.openGraph.title)}">`,
    `<meta property="og:description" content="${escapeHtmlAttribute(metadata.openGraph.description)}">`,
    `<meta property="og:url" content="${escapeHtmlAttribute(metadata.openGraph.url)}">`,
    `<meta property="og:site_name" content="${escapeHtmlAttribute(metadata.openGraph.siteName)}">`,
    `<meta property="og:type" content="${escapeHtmlAttribute(metadata.openGraph.type)}">`,
    `<meta property="og:image" content="${escapeHtmlAttribute(metadata.openGraph.image)}">`,
    `<meta name="twitter:card" content="${escapeHtmlAttribute(metadata.twitter.card)}">`,
    `<meta name="twitter:title" content="${escapeHtmlAttribute(metadata.twitter.title)}">`,
    `<meta name="twitter:description" content="${escapeHtmlAttribute(metadata.twitter.description)}">`,
    `<meta name="twitter:image" content="${escapeHtmlAttribute(metadata.twitter.image)}">`,
  ];

  return tags.join('\n');
}

function titleFromRoute(path) {
  const lastSegment = compact(path).split('/').filter(Boolean).pop() || 'Home';
  return lastSegment
    .split('-')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map(compact).filter(Boolean);
  }

  const item = compact(value);
  return item ? [item] : [];
}

function escapeHtmlText(value) {
  return compact(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlAttribute(value) {
  return escapeHtmlText(value)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
