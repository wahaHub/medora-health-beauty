import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

import {
  createHomeMetadata,
  createHospitalMetadata,
  createProcedureMetadata,
  createProcedureVideoMetadata,
  createStaticPageMetadata,
  createSurgeonMetadata,
  renderHeadTags,
} from './metadata.js';
import {
  createArticleSchema,
  createCategorySchema,
  createGallerySchema,
  createHomepageSchema,
  createHospitalSchema,
  createProcedureSchema,
  createProcedureVideoSchema,
  createSurgeonSchema,
  createVideoCasesCollectionSchema,
  renderJsonLdScripts,
} from './schema.js';

const routeTypeLabels = {
  home: 'Home',
  static: 'Page',
  procedure: 'Procedure Guide',
  procedureVideo: 'Video Cases',
  surgeon: 'Surgeon Profile',
  hospital: 'Hospital Profile',
};

const compact = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const escapeHtml = (value) =>
  compact(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const stripExistingSeoHead = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi, '')
    .replace(/<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>\s*/gi, '');

export function createSeoPayload(route, data) {
  if (route === '/') {
    return {
      route,
      type: 'home',
      metadata: createHomeMetadata(),
      schema: createHomepageSchema(),
      heading: 'Medora Beauty',
      summary: 'Compare cosmetic surgery procedures, trusted providers, case media, and global medical travel planning support.',
      links: [
        { label: 'Doctors', url: '/surgeons' },
        { label: 'Cases', url: '/video-cases' },
        { label: 'Travel', url: '/travel' },
      ],
    };
  }

  const procedure = data.procedures.find((item) => item.guideUrl === route || item.videoUrl === route);
  if (procedure && route === procedure.guideUrl) {
    return {
      route,
      type: 'procedure',
      metadata: createProcedureMetadata(procedure),
      schema: createProcedureSchema({
        ...procedure,
        description: procedure.description,
        recovery: procedure.recovery,
        risks: procedure.risks,
      }),
      heading: procedure.label,
      summary: procedure.description,
      sections: [
        { title: 'Benefits', items: procedure.benefits },
        { title: 'Candidacy', items: procedure.candidacy },
        { title: 'Risks', items: procedure.risks },
      ],
      links: [
        { label: 'Video Cases', url: procedure.videoUrl },
        { label: 'All Cases', url: '/procedure/videos' },
      ],
    };
  }

  if (procedure && route === procedure.videoUrl) {
    const videoCases = Array.isArray(procedure.videoCases) ? procedure.videoCases : [];
    return {
      route,
      type: 'procedureVideo',
      metadata: createProcedureVideoMetadata(procedure),
      schema: createProcedureVideoSchema(procedure, videoCases),
      heading: `${procedure.label} Video Cases`,
      summary: `Watch consent-backed ${procedure.label} case summaries and compare real procedure journeys with Medora Beauty.`,
      sections: [
        {
          title: 'Featured Video Case Summaries',
          items: videoCases
            .map((item) =>
              [
                item.title,
                item.caseContext,
                item.sourceContext,
                item.resultViewingContext,
                item.patientConcern,
                item.treatmentApproach,
                item.outcomeSummary || item.summary || item.description,
                item.timeline || item.timelineNote,
              ]
                .filter(Boolean)
                .join(' ')
            )
            .filter(Boolean),
        },
      ],
      links: [
        { label: 'Procedure Guide', url: procedure.guideUrl },
        { label: 'All Video Cases', url: '/procedure/videos' },
      ],
    };
  }

  const surgeon = data.surgeons.find((item) => item.route === route);
  if (surgeon) {
    return {
      route,
      type: 'surgeon',
      metadata: createSurgeonMetadata(surgeon),
      schema: createSurgeonSchema(surgeon),
      heading: surgeon.name,
      summary: surgeon.bio || `${surgeon.name} profile information for Medora Beauty patients comparing provider options.`,
      sections: [{ title: 'Specialties', items: surgeon.specialties }],
      links: [{ label: 'All Surgeons', url: '/surgeons' }],
    };
  }

  const hospital = data.hospitals.find((item) => item.route === route);
  if (hospital) {
    return {
      route,
      type: 'hospital',
      metadata: createHospitalMetadata(hospital),
      schema: createHospitalSchema(hospital),
      heading: hospital.name,
      summary: hospital.description || `${hospital.name} hospital profile for Medora Beauty patients comparing care options.`,
      links: [
        { label: 'Hospital Gallery', url: hospital.galleryRoute },
        { label: 'Doctors', url: '/surgeons' },
      ],
    };
  }

  const staticPayload = createStaticPayload(route, data);
  return staticPayload;
}

function createStaticPayload(route, data = {}) {
  const metadata = createStaticPageMetadata(route);
  const heading = metadata.title.replace(/\s*\|\s*Medora Beauty.*$/i, '');
  let schema = createArticleSchema({ title: heading, route, description: metadata.description });
  const videoCases = Array.isArray(data.videoCases) ? data.videoCases.slice(0, 12) : [];

  if (route === '/gallery') {
    schema = createGallerySchema([]);
  } else if (route === '/video-cases' || route === '/procedure/videos') {
    schema = createVideoCasesCollectionSchema(videoCases);
  } else if (route.startsWith('/procedures/')) {
    schema = createCategorySchema({ name: heading, route, description: metadata.description });
  }

  return {
    route,
    type: 'static',
    metadata,
    schema,
    heading,
    summary: metadata.description,
    links: [
      { label: 'Procedures', url: '/procedure/videos' },
      { label: 'Consultation', url: '/get-quote' },
    ],
  };
}

export function createSeoBody(payload) {
  const sections = (payload.sections || [])
    .filter((section) => section.items?.length)
    .map(
      (section) =>
        `<section><h2>${escapeHtml(section.title)}</h2><ul>${section.items
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join('')}</ul></section>`,
    )
    .join('');
  const links = (payload.links || [])
    .map((link) => `<a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`)
    .join('');

  return [
    '<main data-seo-prerender="true">',
    `<p>${escapeHtml(routeTypeLabels[payload.type] || 'Medora Beauty')}</p>`,
    `<h1>${escapeHtml(payload.heading)}</h1>`,
    `<p>${escapeHtml(payload.summary)}</p>`,
    sections,
    links ? `<nav aria-label="Related pages">${links}</nav>` : '',
    '</main>',
  ].join('');
}

export function injectSeoIntoHtml(html, payload) {
  const strippedHtml = stripExistingSeoHead(html);
  const headTags = `${renderHeadTags(payload.metadata)}\n${renderJsonLdScripts(payload.schema)}`;
  const withHead = strippedHtml.replace('</head>', `${headTags}\n</head>`);
  const seoBody = createSeoBody(payload);

  if (withHead.includes('<div id="root"></div>')) {
    return withHead.replace('<div id="root"></div>', `<div id="root">${seoBody}</div>`);
  }

  return withHead.replace(/<div id=["']root["'][^>]*>[\s\S]*?<\/div>/i, `<div id="root">${seoBody}</div>`);
}

function getSafeRouteSegments(route) {
  const url = new URL(route, 'https://medorabeauty.com');
  return url.pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment))
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      if (segment === '.' || segment === '..' || segment.includes('/') || segment.includes('\\')) {
        throw new Error(`Unsafe SEO prerender route segment: ${segment}`);
      }

      return segment;
    });
}

function ensureInsideDist(outputPath, distDir) {
  const resolvedDistDir = resolve(distDir);
  const resolvedOutputPath = resolve(outputPath);
  const relativePath = relative(resolvedDistDir, resolvedOutputPath);

  if (relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath))) {
    return outputPath;
  }

  throw new Error(`SEO prerender output escaped dist directory: ${outputPath}`);
}

export function routeToOutputPath(route, distDir = 'dist') {
  const segments = getSafeRouteSegments(route);

  if (segments.length === 0) {
    return ensureInsideDist(join(distDir, 'index.html'), distDir);
  }

  return ensureInsideDist(join(distDir, ...segments, 'index.html'), distDir);
}

export function routeToCleanOutputPath(route, distDir = 'dist') {
  const segments = getSafeRouteSegments(route);

  if (segments.length === 0) {
    return null;
  }

  const fileName = `${segments[segments.length - 1]}.html`;
  return ensureInsideDist(join(distDir, ...segments.slice(0, -1), fileName), distDir);
}

export async function writeRouteHtml({ route, distDir, shellHtml, data }) {
  const payload = createSeoPayload(route, data);
  const outputPath = routeToOutputPath(route, distDir);
  const cleanOutputPath = routeToCleanOutputPath(route, distDir);
  const html = injectSeoIntoHtml(shellHtml, payload);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, 'utf8');
  if (cleanOutputPath) {
    await mkdir(dirname(cleanOutputPath), { recursive: true });
    await writeFile(cleanOutputPath, html, 'utf8');
  }

  return {
    route,
    outputPath,
    cleanOutputPath,
    title: payload.metadata.title,
    canonicalUrl: payload.metadata.canonicalUrl,
  };
}
