import { describe, expect, it } from 'vitest';
import {
  getP1PriorityProcedures,
  getP1StaticPublicRoutes,
  getP1ProcedureGuideRoutes,
  getP1ProcedureVideoRoutes,
  getPublicSeoRoutes,
} from '../src/seo/routes.js';

describe('P1 public SEO routes', () => {
  it('selects exactly 20 priority procedures', () => {
    const procedures = getP1PriorityProcedures();
    const labels = procedures.map((item) => item.label);

    expect(procedures).toHaveLength(20);
    expect(labels).toContain('Rhinoplasty');
    expect(labels).toContain('Brazilian Butt Lift (BBL)');
    expect(labels).toContain('BOTOX® & Neurotoxins');
    expect(labels).not.toContain('Hair Transplant');
    expect(labels).not.toContain('Porcelain Veneers');
  });

  it('keeps static public routes inside implemented route boundaries', () => {
    expect(getP1StaticPublicRoutes()).toEqual([
      '/',
      '/surgeons',
      '/gallery',
      '/travel',
      '/reviews',
      '/video-cases',
      '/procedure/videos',
      '/procedures/face',
      '/procedures/body',
      '/procedures/nonsurgical',
      '/procedures/hair',
      '/procedures/dental',
    ]);
  });

  it('uses current implemented procedure routes for guides and videos', () => {
    expect(getP1ProcedureGuideRoutes()).toContain('/procedure/Rhinoplasty');
    expect(getP1ProcedureVideoRoutes()).toContain('/procedure/Rhinoplasty/videos');
    expect(getPublicSeoRoutes()).not.toContain('/procedures/face/rhinoplasty');
    expect(getPublicSeoRoutes()).not.toContain('/procedures/face/rhinoplasty/video-cases');
    expect(getPublicSeoRoutes()).not.toContain('/procedure/videos?procedure=Rhinoplasty&area=face');
  });
});
