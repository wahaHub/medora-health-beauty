import { describe, expect, it } from 'vitest';

import {
  createArticleSchema,
  createBreadcrumbSchema,
  createCategorySchema,
  createFaqSchema,
  createGallerySchema,
  createHomepageSchema,
  createHospitalSchema,
  createProcedureSchema,
  createProcedureVideoSchema,
  createSurgeonSchema,
  createVideoCasesCollectionSchema,
  renderJsonLdScripts,
} from '../src/seo/schema.js';

const types = (items: unknown[]) => items.map((item: any) => item['@type']);

describe('SEO JSON-LD schema builders', () => {
  it('builds homepage Organization, WebSite, and MedicalBusiness schema', () => {
    const schema = createHomepageSchema();

    expect(types(schema)).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'MedicalBusiness']));
    expect(JSON.stringify(schema)).toContain('https://medorabeauty.com/');
    expect(JSON.stringify(schema)).toContain('global medical travel options');
    expect(JSON.stringify(schema)).not.toContain('treatment in China');
  });

  it('builds breadcrumb schema from route items', () => {
    const breadcrumb = createBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Gallery', url: '/gallery' },
    ]);

    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(2);
    expect(breadcrumb.itemListElement[1].item).toBe('https://medorabeauty.com/gallery');
  });

  it('builds procedure schema with FAQ only when real FAQ items are provided', () => {
    const procedure = {
      label: 'Rhinoplasty',
      category: 'face',
      description: 'Nose reshaping guidance for patients comparing aesthetic care options.',
      bodyLocation: 'Nose',
      risks: ['Swelling', 'Bleeding'],
      recovery: 'Most patients plan visible social recovery time before travel.',
      faq: [{ question: 'Is consultation required?', answer: 'Yes, a surgeon consultation is required before treatment planning.' }],
    };

    const schema = createProcedureSchema(procedure);
    const noFaqSchema = createProcedureSchema({ label: 'Facelift' });

    expect(types(schema)).toEqual(expect.arrayContaining(['MedicalProcedure', 'BreadcrumbList', 'FAQPage']));
    expect(types(noFaqSchema)).not.toContain('FAQPage');
    expect(JSON.stringify(schema)).not.toMatch(/AggregateRating|reviewCount|ratingValue/);
    expect(JSON.stringify(schema)).not.toContain('uploadDate');
  });

  it('builds category, gallery, travel article, and video-cases collection route schemas', () => {
    const category = createCategorySchema({ name: 'Face Procedures', route: '/procedures/face', description: 'Facial aesthetic procedure guides.' });
    const gallery = createGallerySchema([
      { title: 'Rhinoplasty case', imageUrl: '/homepage/aesthetic-cases-collage.png', procedure: 'Rhinoplasty' },
    ]);
    const article = createArticleSchema({
      title: 'Travel to China for cosmetic surgery',
      route: '/travel',
      description: 'Planning guidance for international Medora Beauty patients.',
      faq: [{ question: 'Can Medora help with logistics?', answer: 'Medora can coordinate planning steps around selected providers.' }],
    });
    const videos = createVideoCasesCollectionSchema([
      { title: 'Rhinoplasty patient story', thumbnailUrl: '/homepage/aesthetic-cases-collage.png', videoUrl: 'https://cdn.example.com/video.mp4' },
    ]);

    expect(types(category)).toEqual(expect.arrayContaining(['CollectionPage', 'BreadcrumbList']));
    expect(types(gallery)).toEqual(expect.arrayContaining(['ImageGallery', 'BreadcrumbList']));
    expect(JSON.stringify(gallery)).toContain('Consent-backed case media');
    expect(types(article)).toEqual(expect.arrayContaining(['Article', 'BreadcrumbList', 'FAQPage']));
    expect(types(videos)).toEqual(expect.arrayContaining(['CollectionPage', 'ImageGallery', 'BreadcrumbList']));
  });

  it('builds procedure video schema without fabricated duration or upload date', () => {
    const withoutVideos = createProcedureVideoSchema({ label: 'Rhinoplasty', category: 'face' }, []);
    const withVideos = createProcedureVideoSchema({ label: 'Rhinoplasty', category: 'face' }, [
      {
        title: 'Rhinoplasty consultation story',
        description: 'Consent-backed patient video summary.',
        outcomeSummary: 'Rhinoplasty planning case with privacy-safe outcome context.',
        mediaAltText: 'Rhinoplasty video case media.',
        caseContext: 'Manifest lists this media as Rhinoplasty case video abcd1234.',
        resultViewingContext: 'Use this media for consultation research, not as a guaranteed individual result.',
        timelineNote: 'Exact treatment and recovery dates are not published.',
        thumbnailUrl: '/homepage/aesthetic-cases-collage.png',
        videoUrl: 'https://cdn.example.com/rhinoplasty.mp4',
      },
    ]);

    expect(types(withoutVideos)).toEqual(expect.arrayContaining(['MedicalProcedure', 'BreadcrumbList']));
    expect(types(withoutVideos)).not.toContain('VideoObject');
    expect(types(withVideos)).toEqual(expect.arrayContaining(['MedicalProcedure', 'BreadcrumbList', 'VideoObject']));
    expect(JSON.stringify(withVideos)).not.toMatch(/duration|uploadDate/);
    expect(JSON.stringify(withVideos)).toContain('Consent-backed');
    expect(JSON.stringify(withVideos)).toContain('Manifest lists this media as Rhinoplasty case video');
    expect(JSON.stringify(withVideos)).toContain('Rhinoplasty video case media');
  });

  it('builds surgeon and hospital schemas without invented credentials or ratings', () => {
    const surgeon = createSurgeonSchema({
      name: 'Dr. Lin Mei',
      route: '/surgeon/dr-lin-mei',
      specialties: ['Rhinoplasty'],
      hospital: 'Shanghai Aesthetic Center',
    });
    const hospital = createHospitalSchema({
      name: 'Shanghai Aesthetic Center',
      route: '/hospital/shanghai-aesthetic-center',
      city: 'Shanghai',
      specialties: ['Rhinoplasty'],
    });

    expect(types(surgeon)).toEqual(expect.arrayContaining(['Physician', 'BreadcrumbList']));
    expect(types(hospital)).toEqual(expect.arrayContaining(['Hospital', 'BreadcrumbList']));
    expect((surgeon[0] as any).url).toBe('https://medorabeauty.com/surgeon/dr-lin-mei');
    expect((surgeon[1] as any).itemListElement.at(-1).item).toBe('https://medorabeauty.com/surgeon/dr-lin-mei');
    expect((hospital[0] as any).url).toBe('https://medorabeauty.com/hospital/shanghai-aesthetic-center');
    expect((hospital[1] as any).itemListElement.at(-1).item).toBe('https://medorabeauty.com/hospital/shanghai-aesthetic-center');
    expect(JSON.stringify([surgeon, hospital])).not.toMatch(/AggregateRating|reviewCount|ratingValue|medicalSpecialty":\[\]/);
  });

  it('returns FAQPage only for non-empty real FAQ items', () => {
    expect(createFaqSchema([])).toBeNull();
    expect(createFaqSchema([{ question: '', answer: 'Present answer' }])).toBeNull();
    expect(createFaqSchema([{ question: 'What is included?', answer: 'A consultation and planning support.' }])?.['@type']).toBe('FAQPage');
  });

  it('renders JSON-LD scripts and escapes less-than characters', () => {
    const html = renderJsonLdScripts([
      { '@context': 'https://schema.org', '@type': 'Article', headline: 'Safety < first' },
      null,
      undefined,
    ]);

    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain('\\u003c');
    expect(html).not.toContain('Safety < first');
    expect(() => JSON.parse(html.match(/>(.*)<\/script>/s)?.[1] ?? '')).not.toThrow();
  });
});
