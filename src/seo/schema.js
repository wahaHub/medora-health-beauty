import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_ORIGIN, createCanonicalUrl } from './metadata.js';

const SCHEMA_CONTEXT = 'https://schema.org';
const PRIVACY_NOTE = 'Consent-backed case media is summarized without private patient identifiers or guaranteed outcome claims.';

const compact = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

function withContext(item) {
  return {
    '@context': SCHEMA_CONTEXT,
    ...item,
  };
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map(compact).filter(Boolean);
  }

  const item = compact(value);
  return item ? [item] : [];
}

function imageUrl(value) {
  return createCanonicalUrl(value || DEFAULT_OG_IMAGE);
}

function encodePathSegment(value) {
  return encodeURIComponent(compact(value));
}

function pageNameFromRoute(route) {
  const segment = compact(route).split('/').filter(Boolean).pop() || 'home';
  return segment
    .split('-')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

function asArray(value) {
  return Array.isArray(value) ? value : [value];
}

function isFaqItem(item) {
  return Boolean(compact(item?.question) && compact(item?.answer));
}

export function createHomepageSchema() {
  const url = createCanonicalUrl('/');
  const logo = imageUrl(DEFAULT_OG_IMAGE);

  return [
    withContext({
      '@type': 'Organization',
      name: SITE_NAME,
      url,
      logo,
      description: 'Medora Beauty helps international patients compare cosmetic surgery procedures, hospitals, surgeons, and medical travel options in China.',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'patient concierge',
        availableLanguage: ['English', 'Chinese'],
      },
    }),
    withContext({
      '@type': 'WebSite',
      name: SITE_NAME,
      url,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_ORIGIN}/procedure/videos?procedure={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }),
    withContext({
      '@type': 'MedicalBusiness',
      name: SITE_NAME,
      url,
      image: logo,
      description: 'Aesthetic care coordination and cosmetic surgery planning support for international patients considering treatment in China.',
    }),
  ];
}

export function createBreadcrumbSchema(items = []) {
  const safeItems = items
    .map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: compact(item?.name) || `Step ${index + 1}`,
      item: createCanonicalUrl(item?.url || '/'),
    }));

  return withContext({
    '@type': 'BreadcrumbList',
    itemListElement: safeItems,
  });
}

export function createProcedureSchema(procedure = {}) {
  const label = compact(procedure.label || procedure.name || procedure.procedure_name || 'Cosmetic Procedure');
  const category = compact(procedure.category || procedure.area || 'aesthetic');
  const description = compact(procedure.description) || `Conservative ${label} guide for patients comparing aesthetic care options with Medora Beauty.`;
  const procedureSchema = withContext({
    '@type': 'MedicalProcedure',
    name: label,
    description,
    url: createCanonicalUrl(`/procedure/${encodePathSegment(label)}`),
    bodyLocation: compact(procedure.bodyLocation || procedure.body_location) || undefined,
    procedureType: category,
    howPerformed: compact(procedure.howPerformed || procedure.how_performed) || undefined,
    risks: normalizeList(procedure.risks),
    preparation: compact(procedure.preparation) || undefined,
    followup: compact(procedure.recovery || procedure.recoveryInformation || procedure.recovery_information) || undefined,
    image: procedure.imageUrl || procedure.image_url ? imageUrl(procedure.imageUrl || procedure.image_url) : undefined,
  });
  const items = [
    pruneUndefined(procedureSchema),
    createBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Procedures', url: '/procedure/videos' },
      { name: label, url: `/procedure/${encodePathSegment(label)}` },
    ]),
  ];
  const faq = createFaqSchema(procedure.faq || procedure.faqItems || procedure.faq_items);

  if (faq) {
    items.push(faq);
  }

  return items;
}

export function createProcedureVideoSchema(procedure = {}, videos = []) {
  const label = compact(procedure.label || procedure.name || procedure.procedure_name || 'Cosmetic Procedure');
  const items = [
    ...createProcedureSchema({ ...procedure, label }).filter((item) => item['@type'] === 'MedicalProcedure'),
    createBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Video Cases', url: '/video-cases' },
      { name: label, url: `/procedure/${encodePathSegment(label)}/videos` },
    ]),
  ];

  videos.filter(hasVideoMetadata).forEach((video) => {
    items.push(pruneUndefined(withContext({
      '@type': 'VideoObject',
      name: compact(video.title || video.name),
      description: compact(video.description || video.summary) || `${PRIVACY_NOTE} Procedure: ${label}.`,
      thumbnailUrl: imageUrl(video.thumbnailUrl || video.thumbnail_url || video.imageUrl || video.image_url),
      contentUrl: compact(video.videoUrl || video.video_url || video.contentUrl || video.content_url) || undefined,
      embedUrl: compact(video.embedUrl || video.embed_url) || undefined,
      uploadDate: compact(video.uploadDate || video.upload_date) || undefined,
      duration: compact(video.duration) || undefined,
      transcript: compact(video.transcript) || undefined,
      about: {
        '@type': 'MedicalProcedure',
        name: label,
      },
      text: PRIVACY_NOTE,
    })));
  });

  return items;
}

export function createSurgeonSchema(surgeon = {}) {
  const name = compact(surgeon.name || surgeon.full_name || 'Medora Beauty Surgeon');
  const route = compact(surgeon.route) || `/surgeon/${encodePathSegment(name)}`;
  const specialties = normalizeList(surgeon.specialties || surgeon.specialty);
  const physician = pruneUndefined(withContext({
    '@type': 'Physician',
    name,
    url: createCanonicalUrl(route),
    image: surgeon.imageUrl || surgeon.image_url ? imageUrl(surgeon.imageUrl || surgeon.image_url) : undefined,
    jobTitle: compact(surgeon.title || surgeon.role) || undefined,
    medicalSpecialty: specialties.length ? specialties : undefined,
    worksFor: compact(surgeon.hospital || surgeon.hospital_name)
      ? { '@type': 'Hospital', name: compact(surgeon.hospital || surgeon.hospital_name) }
      : undefined,
    knowsLanguage: normalizeList(surgeon.languages).length ? normalizeList(surgeon.languages) : undefined,
  }));

  return [
    physician,
    createBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Surgeons', url: '/surgeons' },
      { name, url: route },
    ]),
  ];
}

export function createHospitalSchema(hospital = {}) {
  const name = compact(hospital.name || hospital.hospital_name || 'Medora Beauty Hospital');
  const route = compact(hospital.route) || `/hospital/${encodePathSegment(name)}`;
  const city = compact(hospital.city || hospital.location?.city || hospital.destination);
  const specialties = normalizeList(hospital.specialties || hospital.specialty);
  const hospitalSchema = pruneUndefined(withContext({
    '@type': 'Hospital',
    name,
    url: createCanonicalUrl(route),
    description: compact(hospital.description) || undefined,
    image: hospital.imageUrl || hospital.image_url || hospital.logo ? imageUrl(hospital.imageUrl || hospital.image_url || hospital.logo) : undefined,
    medicalSpecialty: specialties.length ? specialties : undefined,
    address: city
      ? {
          '@type': 'PostalAddress',
          addressLocality: city,
          addressCountry: compact(hospital.country) || 'China',
        }
      : undefined,
  }));

  return [
    hospitalSchema,
    createBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Hospitals', url: '/surgeons' },
      { name, url: route },
    ]),
  ];
}

export function createGallerySchema(cases = []) {
  const galleryItems = cases.map((item, index) => pruneUndefined({
    '@type': 'ImageObject',
    position: index + 1,
    name: compact(item.title || item.name || item.procedure || `Case ${index + 1}`),
    contentUrl: item.imageUrl || item.image_url ? imageUrl(item.imageUrl || item.image_url) : undefined,
    caption: compact(item.caption || item.description || `${PRIVACY_NOTE} Procedure: ${compact(item.procedure) || 'aesthetic care'}.`),
  }));

  return [
    withContext({
      '@type': 'ImageGallery',
      name: 'Medora Beauty Case Gallery',
      url: createCanonicalUrl('/gallery'),
      description: `${PRIVACY_NOTE} Browse cosmetic procedure case media for planning context.`,
      image: galleryItems,
    }),
    createBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Gallery', url: '/gallery' },
    ]),
  ];
}

export function createArticleSchema(page = {}) {
  const route = page.route || page.url || '/travel';
  const title = compact(page.title || page.headline || pageNameFromRoute(route));
  const items = [
    pruneUndefined(withContext({
      '@type': 'Article',
      headline: title,
      name: title,
      description: compact(page.description) || `Medora Beauty guide to ${title.toLowerCase()} for international aesthetic patients.`,
      url: createCanonicalUrl(route),
      author: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: imageUrl(DEFAULT_OG_IMAGE),
        },
      },
      dateModified: compact(page.dateModified || page.date_modified) || undefined,
      about: normalizeList(page.relatedProcedures || page.related_procedures).length
        ? normalizeList(page.relatedProcedures || page.related_procedures)
        : undefined,
    })),
    createBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: title, url: route },
    ]),
  ];
  const faq = createFaqSchema(page.faq || page.faqItems || page.faq_items);

  if (faq) {
    items.push(faq);
  }

  return items;
}

export function createCategorySchema(categoryPage = {}) {
  const route = categoryPage.route || categoryPage.url || '/procedures';
  const name = compact(categoryPage.name || categoryPage.title || pageNameFromRoute(route));

  return [
    pruneUndefined(withContext({
      '@type': 'CollectionPage',
      name,
      url: createCanonicalUrl(route),
      description: compact(categoryPage.description) || `Medora Beauty procedure category guide for ${name.toLowerCase()}.`,
      about: normalizeList(categoryPage.procedures).map((procedure) => ({
        '@type': 'MedicalProcedure',
        name: procedure,
      })),
    })),
    createBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Procedures', url: '/procedure/videos' },
      { name, url: route },
    ]),
  ];
}

export function createVideoCasesCollectionSchema(videos = []) {
  const videoItems = videos.filter(hasVideoMetadata).map((video, index) => pruneUndefined({
    '@type': 'VideoObject',
    position: index + 1,
    name: compact(video.title || video.name),
    description: compact(video.description || video.summary) || PRIVACY_NOTE,
    thumbnailUrl: imageUrl(video.thumbnailUrl || video.thumbnail_url || video.imageUrl || video.image_url),
    contentUrl: compact(video.videoUrl || video.video_url || video.contentUrl || video.content_url) || undefined,
    embedUrl: compact(video.embedUrl || video.embed_url) || undefined,
  }));

  return [
    withContext({
      '@type': 'CollectionPage',
      name: 'Medora Beauty Video Cases',
      url: createCanonicalUrl('/video-cases'),
      description: `${PRIVACY_NOTE} Browse cosmetic procedure video case summaries for planning context.`,
      hasPart: videoItems,
    }),
    withContext({
      '@type': 'ImageGallery',
      name: 'Medora Beauty Video Case Gallery',
      url: createCanonicalUrl('/video-cases'),
      description: PRIVACY_NOTE,
      associatedMedia: videoItems,
    }),
    createBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Video Cases', url: '/video-cases' },
    ]),
  ];
}

export function createFaqSchema(faqItems = []) {
  const items = normalizeFaqItems(faqItems);

  if (!items.length) {
    return null;
  }

  return withContext({
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: compact(item.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: compact(item.answer),
      },
    })),
  });
}

export function renderJsonLdScripts(schemaItems = []) {
  return flatten(schemaItems)
    .filter(Boolean)
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`)
    .join('\n');
}

function normalizeFaqItems(faqItems) {
  return asArray(faqItems).filter(isFaqItem);
}

function hasVideoMetadata(video) {
  return Boolean(
    compact(video?.title || video?.name)
    && compact(video?.thumbnailUrl || video?.thumbnail_url || video?.imageUrl || video?.image_url)
    && compact(video?.videoUrl || video?.video_url || video?.contentUrl || video?.content_url || video?.embedUrl || video?.embed_url),
  );
}

function flatten(items) {
  return asArray(items).flatMap((item) => (Array.isArray(item) ? flatten(item) : item));
}

function pruneUndefined(value) {
  if (Array.isArray(value)) {
    return value.map(pruneUndefined);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined && !(Array.isArray(entry) && entry.length === 0))
      .map(([key, entry]) => [key, pruneUndefined(entry)]),
  );
}
