import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_OG_IMAGE,
  SITE_ORIGIN,
  createHomeMetadata,
  createHospitalMetadata,
  createProcedureMetadata,
  createProcedureVideoMetadata,
  createStaticPageMetadata,
  createSurgeonMetadata,
  renderHeadTags,
} from '../src/seo/metadata.js';

const expectCompleteMetadata = (metadata: ReturnType<typeof createHomeMetadata>) => {
  expect(metadata.title).toEqual(expect.any(String));
  expect(metadata.title.length).toBeGreaterThan(10);
  expect(metadata.description).toEqual(expect.any(String));
  expect(metadata.description.length).toBeGreaterThan(40);
  expect(metadata.canonicalUrl).toMatch(/^https:\/\/medorabeauty\.com\//);
  expect(metadata.openGraph.title).toBe(metadata.title);
  expect(metadata.openGraph.description).toBe(metadata.description);
  expect(metadata.openGraph.url).toBe(metadata.canonicalUrl);
  expect(metadata.openGraph.image).toMatch(/^https:\/\/medorabeauty\.com\//);
  expect(metadata.twitter.card).toBe('summary_large_image');
  expect(metadata.twitter.title).toBe(metadata.title);
  expect(metadata.twitter.description).toBe(metadata.description);
};

describe('SEO metadata builders', () => {
  it('uses an existing default Open Graph image asset', () => {
    expect(DEFAULT_OG_IMAGE).toMatch(/^\/.+\.(png|jpe?g|webp)$/);
    expect(existsSync(join(process.cwd(), 'public', DEFAULT_OG_IMAGE))).toBe(true);
  });

  it('builds complete home and static page metadata with absolute canonicals', () => {
    const home = createHomeMetadata();
    const travel = createStaticPageMetadata('/travel');

    expectCompleteMetadata(home);
    expect(home.canonicalUrl).toBe(`${SITE_ORIGIN}/`);
    expect(home.title).toContain('Global');
    expect(home.description).toContain('global medical travel');
    expectCompleteMetadata(travel);
    expect(travel.canonicalUrl).toBe(`${SITE_ORIGIN}/travel`);
    expect(travel.title).toContain('Travel');
    expect(travel.description).toContain('international medical travel');
  });

  it('builds procedure and procedure video metadata on implemented canonical URLs', () => {
    const procedure = { label: 'Rhinoplasty', category: 'face', description: 'Nose reshaping consultation guidance for international patients.' };
    const guide = createProcedureMetadata(procedure);
    const video = createProcedureVideoMetadata(procedure);

    expectCompleteMetadata(guide);
    expect(guide.title).toContain('Rhinoplasty');
    expect(guide.title).not.toContain('in China');
    expect(guide.canonicalUrl).toBe(`${SITE_ORIGIN}/procedure/Rhinoplasty`);
    expectCompleteMetadata(video);
    expect(video.title).toContain('Rhinoplasty');
    expect(video.canonicalUrl).toBe(`${SITE_ORIGIN}/procedure/Rhinoplasty/videos`);
  });

  it('builds surgeon and hospital metadata with safe fallbacks', () => {
    const surgeon = createSurgeonMetadata({
      name: 'Dr. Lin Mei',
      route: '/surgeon/dr-lin-mei',
      title: 'Plastic Surgeon',
      specialties: ['Rhinoplasty', 'Facelift'],
      image_url: '/brand/medora-beauty-mark.png',
    });
    const hospital = createHospitalMetadata({
      name: 'Shanghai Aesthetic Center',
      route: '/hospital/shanghai-aesthetic-center',
      city: 'Shanghai',
      specialties: ['Facial plastic surgery'],
    });

    expectCompleteMetadata(surgeon);
    expect(surgeon.canonicalUrl).toBe(`${SITE_ORIGIN}/surgeon/dr-lin-mei`);
    expect(surgeon.description).toContain('Rhinoplasty');
    expectCompleteMetadata(hospital);
    expect(hospital.canonicalUrl).toBe(`${SITE_ORIGIN}/hospital/shanghai-aesthetic-center`);
    expect(hospital.description).toContain('Shanghai');
  });

  it('renders escaped head tags without hreflang', () => {
    const html = renderHeadTags(createStaticPageMetadata('/gallery', {
      title: 'Before < After Gallery',
      description: 'Consent-aware cosmetic case gallery for Medora Beauty patients.',
    }));

    expect(html).toContain('<title>Before &lt; After Gallery</title>');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('name="twitter:card"');
    expect(html).not.toMatch(/hreflang/i);
    expect(html).not.toContain('Before < After');
  });
});
