import { describe, expect, it } from 'vitest';

import {
  getImplementedProcedureCanonicalUrl,
  getImplementedProcedureGalleryUrl,
  getImplementedProcedureGuideUrl,
  getImplementedProcedureVideoUrl,
  getProcedureAreaQueryValue,
  getProcedureSlug,
  getProcedureVideoGalleryUrl,
  getSupportedProcedureOptions,
} from '@/data/procedureTaxonomy';

describe('procedure taxonomy implemented URLs', () => {
  it('normalizes procedure labels into stable slugs', () => {
    expect(getProcedureSlug('BOTOX® & Neurotoxins')).toBe('botox-and-neurotoxins');
  });

  it('keeps guide URLs on the implemented legacy procedure route', () => {
    expect(getImplementedProcedureGuideUrl('Rhinoplasty')).toBe('/procedure/Rhinoplasty');
    expect(getImplementedProcedureGuideUrl('BOTOX® & Neurotoxins')).toBe('/procedure/BOTOX%C2%AE%20%26%20Neurotoxins');
  });

  it('keeps gallery URLs on the implemented legacy procedure route', () => {
    expect(getImplementedProcedureGalleryUrl('Rhinoplasty')).toBe('/procedure/Rhinoplasty/gallery');
  });

  it('keeps procedure video case URLs on the implemented path route', () => {
    expect(getImplementedProcedureVideoUrl('Rhinoplasty')).toBe('/procedure/Rhinoplasty/videos');
    expect(getImplementedProcedureVideoUrl('BOTOX® & Neurotoxins')).toBe(
      '/procedure/BOTOX%C2%AE%20%26%20Neurotoxins/videos'
    );
  });

  it('uses the implemented guide route as the P0 canonical URL', () => {
    expect(getImplementedProcedureCanonicalUrl('Rhinoplasty')).toBe('/procedure/Rhinoplasty');
  });

  it('keeps query video case URLs as compatibility filter URLs', () => {
    expect(getProcedureVideoGalleryUrl('Breast Augmentation')).toBe(
      '/procedure/videos?procedure=Breast+Augmentation&area=breast'
    );
  });

  it('dedupes supported procedure options by normalized label', () => {
    expect(getSupportedProcedureOptions().filter((procedure) => procedure.label === 'BOTOX® & Neurotoxins')).toHaveLength(
      1
    );
  });

  it('falls back to all for unknown procedure areas', () => {
    expect(getProcedureAreaQueryValue('Unknown Procedure')).toBe('all');
  });
});
