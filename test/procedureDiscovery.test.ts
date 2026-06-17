import { describe, expect, it } from 'vitest';

import {
  discoveryItemsWithVideos,
  procedureDiscoveryGroups,
  getDiscoveryVideoUrl,
  matchesDiscoverySubtype,
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
      'Eyes',
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
      '/procedure/videos?area=face&project=eye-surgery',
    );
    expect(getDiscoveryVideoUrl(discoveryItemsWithVideos.find((item) => item.label === 'Veneers')!)).toBe(
      '/procedure/videos?area=dental&project=porcelain-veneers',
    );
  });

  it('defines eye treatment focus filters without expanding the homepage label', () => {
    const eyes = discoveryItemsWithVideos.find((item) => item.id === 'eyes');

    expect(eyes?.label).toBe('Eyes');
    expect(eyes?.subtypes?.map((subtype) => subtype.label)).toEqual([
      'Eyelids',
      'Eye Bags',
      'Eye Rejuvenation',
    ]);
    expect(getDiscoveryVideoUrl(eyes!, eyes!.subtypes![1])).toBe(
      '/procedure/videos?area=face&project=eye-surgery&subtype=eye-bags',
    );
  });

  it('matches eye treatment focus filters from available manifest metadata', () => {
    const eyes = discoveryItemsWithVideos.find((item) => item.id === 'eyes')!;
    const eyelids = eyes.subtypes!.find((subtype) => subtype.id === 'eyelids')!;
    const eyeBags = eyes.subtypes!.find((subtype) => subtype.id === 'eye-bags')!;
    const eyeRejuvenation = eyes.subtypes!.find((subtype) => subtype.id === 'eye-rejuvenation')!;
    const eyelidCase = {
      project: 'eye-surgery',
      sourcePath: '/Users/haowang/Desktop/雷鸣视频下载/Dr.刘春案例【眼睛】1/video.mp4',
      objectKey: 'video_cases_v4/videos/eye-surgery/example/video.mp4',
      projectName: 'Eye Surgery',
    };
    const eyeBagCase = {
      project: 'eye-surgery',
      sourcePath: '/Users/haowang/Desktop/雷鸣视频下载/提眉眼袋合集/video.mp4',
      objectKey: 'video_cases_v4/videos/eye-surgery/example/video.mp4',
      projectName: 'Eye Surgery',
    };
    const rejuvenationCase = {
      project: 'eye-surgery',
      sourcePath: '/Users/haowang/Desktop/雷鸣视频下载/张培医生五官定制《眼部综合》案例/video.mp4',
      objectKey: 'video_cases_v4/videos/eye-surgery/example/video.mp4',
      projectName: 'Eye Surgery',
    };

    expect(matchesDiscoverySubtype(eyelidCase, eyelids)).toBe(true);
    expect(matchesDiscoverySubtype(eyeBagCase, eyeBags)).toBe(true);
    expect(matchesDiscoverySubtype(rejuvenationCase, eyeRejuvenation)).toBe(true);
    expect(matchesDiscoverySubtype(eyeBagCase, eyelids)).toBe(false);
  });
});
