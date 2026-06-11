import { describe, expect, it } from 'vitest';

import {
  getProcedureAreaQueryValue,
  getProcedureVideoGalleryUrl,
  proceduresByCategory,
} from '@/data/procedureTaxonomy';

describe('procedure taxonomy dental category', () => {
  it('exposes the homepage dental procedures for the procedures route', () => {
    expect(proceduresByCategory.dental.map((procedure) => procedure.label)).toEqual([
      'Teeth Whitening',
      'Porcelain Veneers',
      'Invisalign® / Clear Aligners',
      'Smile Design',
    ]);
  });

  it('maps procedures back to the same area buckets used by the procedure navigation', () => {
    expect(getProcedureAreaQueryValue('Revision Rhinoplasty')).toBe('face');
    expect(getProcedureAreaQueryValue('Breast Augmentation')).toBe('breast');
    expect(getProcedureAreaQueryValue('BOTOX® & Neurotoxins')).toBe('nonsurgical');
    expect(getProcedureAreaQueryValue('Hair Transplant')).toBe('hair');
    expect(getProcedureAreaQueryValue('Smile Design')).toBe('dental');
  });

  it('builds procedure video gallery links with procedure and area filters', () => {
    expect(getProcedureVideoGalleryUrl('Revision Rhinoplasty')).toBe(
      '/procedure/videos?procedure=Revision+Rhinoplasty&area=face'
    );
  });
});
