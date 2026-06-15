import { describe, expect, it } from 'vitest';

import {
  discoveryItemsWithVideos,
  procedureDiscoveryGroups,
  getDiscoveryVideoUrl,
} from '@/data/procedureDiscovery';

describe('procedure discovery taxonomy', () => {
  it('groups only public procedure video projects into patient-friendly categories', () => {
    expect(procedureDiscoveryGroups.map((group) => group.label)).toEqual([
      'Face',
      'Body',
      'Skin & Injectables',
      'Hair',
      'Dental / Smile',
    ]);

    expect(discoveryItemsWithVideos.map((item) => item.label)).toEqual([
      'Eyes: eyelids, eye bags, eye rejuvenation',
      'Nose',
      'Facial Rejuvenation',
      'Body Contouring',
      'Breast Surgery',
      'Botox & Fillers',
      'Laser Skin Treatment',
      'Skin Tightening',
      'Anti-aging Treatments',
      'Hair Transplant',
      'Veneers',
      'Teeth Whitening',
      'Smile Design',
    ]);
    expect(discoveryItemsWithVideos.map((item) => item.project)).not.toContain('invisalign-clear-aligners');
  });

  it('builds video gallery URLs from project and area filters', () => {
    expect(getDiscoveryVideoUrl(discoveryItemsWithVideos[0])).toBe(
      '/procedure/videos?project=eye-surgery&area=face',
    );
    expect(getDiscoveryVideoUrl(discoveryItemsWithVideos.find((item) => item.label === 'Veneers')!)).toBe(
      '/procedure/videos?project=porcelain-veneers&area=dental',
    );
  });
});
