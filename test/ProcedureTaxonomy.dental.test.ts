import { describe, expect, it } from 'vitest';

import { proceduresByCategory } from '@/data/procedureTaxonomy';

describe('procedure taxonomy dental category', () => {
  it('exposes the homepage dental procedures for the procedures route', () => {
    expect(proceduresByCategory.dental.map((procedure) => procedure.label)).toEqual([
      'Teeth Whitening',
      'Porcelain Veneers',
      'Invisalign® / Clear Aligners',
      'Smile Design',
    ]);
  });
});
