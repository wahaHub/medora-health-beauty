import { describe, expect, it } from 'vitest';
import {
  filterVideoCasesForProcedure,
  filterVideoCasesForProject,
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

  it('filters video cases to the procedure project', () => {
    expect(filterVideoCasesForProcedure(cases, 'Eyelid Surgery')).toEqual([cases[0]]);
  });

  it('filters video cases by a selected project slug', () => {
    expect(filterVideoCasesForProject(cases, 'nose-surgery')).toEqual([cases[1]]);
  });

  it('returns all video cases when the selected project is all', () => {
    expect(filterVideoCasesForProject(cases, 'all')).toEqual(cases);
  });
});
