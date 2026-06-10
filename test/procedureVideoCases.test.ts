import { describe, expect, it } from 'vitest';
import { getSupportedProcedureOptions } from '@/data/procedureTaxonomy';
import {
  filterVideoCasesForProcedure,
  filterVideoCasesForProject,
  getVideoCaseManifestUrl,
  paginateVideoCases,
  resolveVideoProjectForProcedure,
  type VideoCase,
} from '@/utils/procedureVideoCases';

const cases: VideoCase[] = [
  {
    id: 'eye-1',
    doctor: 'hu-wanyin',
    doctorName: '胡婉银',
    project: 'eye-surgery',
    projectName: 'Eye Surgery',
    objectKey: 'video_cases_v2/eye-surgery/hu-wanyin/eye-1/video.mp4',
    videoUrl: 'https://example.com/eye-1.mp4',
    size: 1024,
  },
  {
    id: 'nose-1',
    doctor: 'wang-qiang',
    doctorName: '王强',
    project: 'nose-surgery',
    projectName: 'Nose Surgery',
    objectKey: 'video_cases_v2/nose-surgery/wang-qiang/nose-1/video.mp4',
    videoUrl: 'https://example.com/nose-1.mp4',
    size: 2048,
  },
];

describe('procedure video case helpers', () => {
  it('maps Eyelid Surgery to the eye-surgery video project', () => {
    expect(resolveVideoProjectForProcedure('Eyelid Surgery')).toBe('eye-surgery');
  });

  it('maps detailed supported procedures onto the v4 video buckets', () => {
    expect(resolveVideoProjectForProcedure('Rhinoplasty')).toBe('nose-surgery');
    expect(resolveVideoProjectForProcedure('Facial Injectables')).toBe('injectables');
    expect(resolveVideoProjectForProcedure('Non-surgical Skin Tightening')).toBe('skin-tightening-ns');
    expect(resolveVideoProjectForProcedure('Hair Restoration')).toBe('hair-transplant');
    expect(resolveVideoProjectForProcedure('Teeth Whitening')).toBe('dental');
    expect(resolveVideoProjectForProcedure('Porcelain Veneers')).toBe('dental');
    expect(resolveVideoProjectForProcedure('Invisalign® / Clear Aligners')).toBe('dental');
    expect(resolveVideoProjectForProcedure('Smile Design')).toBe('dental');
  });

  it('does not reuse broad video buckets for procedures without matching source data', () => {
    expect(resolveVideoProjectForProcedure('Nose Tip Refinement')).toBeNull();
    expect(resolveVideoProjectForProcedure('Revision Rhinoplasty')).toBeNull();
    expect(resolveVideoProjectForProcedure('Dermal Fillers')).toBeNull();
  });

  it('filters video cases to the procedure project', () => {
    expect(filterVideoCasesForProcedure(cases, 'Eyelid Surgery')).toEqual([cases[0]]);
  });

  it('filters video cases by a selected project slug', () => {
    expect(filterVideoCasesForProject(cases, 'nose-surgery')).toEqual([cases[1]]);
  });

  it('returns all video cases when the selected project is all', () => {
    expect(filterVideoCasesForProject(cases, 'all')).toEqual(cases);
  });

  it('uses a single v4 R2 manifest source', () => {
    expect(getVideoCaseManifestUrl('https://cdn.example.com')).toBe(
      'https://cdn.example.com/video_cases_v4/manifest.json?v=20260610-v5'
    );
  });

  it('paginates all video cases without dropping the total count', () => {
    const allCases = Array.from({ length: 41 }, (_, index) => ({
      ...cases[index % cases.length],
      id: `case-${index + 1}`,
      objectKey: `video_cases_v4/all/case-${index + 1}/video.mp4`,
    }));

    expect(paginateVideoCases(allCases, 2, 18)).toEqual({
      currentPage: 2,
      totalPages: 3,
      totalItems: 41,
      startItem: 19,
      endItem: 36,
      items: allCases.slice(18, 36),
    });
  });

  it('exposes the full supported procedure taxonomy for video filters', () => {
    expect(getSupportedProcedureOptions()).toHaveLength(78);
  });
});
