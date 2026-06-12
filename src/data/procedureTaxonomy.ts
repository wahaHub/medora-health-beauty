import * as procedureTaxonomyCore from './procedureTaxonomyCore.js';

export type ProcedureCategoryKey = 'face' | 'body' | 'nonsurgical' | 'hair' | 'dental';

export interface ProcedureItem {
  label: string;
  category?: string;
}

export interface ProcedureOption extends ProcedureItem {
  area: ProcedureCategoryKey;
}

export const proceduresByCategory = procedureTaxonomyCore.proceduresByCategory as Record<
  ProcedureCategoryKey,
  ProcedureItem[]
>;

export const normalizeProcedureLabel = procedureTaxonomyCore.normalizeProcedureLabel as (label: string) => string;

export const getProcedureSlug = procedureTaxonomyCore.getProcedureSlug as (procedureName: string) => string;

export const getImplementedProcedureGuideUrl = procedureTaxonomyCore.getImplementedProcedureGuideUrl as (
  procedureName: string
) => string;

export const getImplementedProcedureGalleryUrl = procedureTaxonomyCore.getImplementedProcedureGalleryUrl as (
  procedureName: string
) => string;

export const getImplementedProcedureVideoUrl = procedureTaxonomyCore.getImplementedProcedureVideoUrl as (
  procedureName: string
) => string;

export const getImplementedProcedureCanonicalUrl = procedureTaxonomyCore.getImplementedProcedureCanonicalUrl as (
  procedureName: string
) => string;

export const getProcedureAreaQueryValue = procedureTaxonomyCore.getProcedureAreaQueryValue as (
  procedureName: string
) => ProcedureCategoryKey | 'breast' | 'all';

export const getProcedureVideoGalleryUrl = procedureTaxonomyCore.getProcedureVideoGalleryUrl as (
  procedureName: string
) => string;

export const getSupportedProcedureOptions = procedureTaxonomyCore.getSupportedProcedureOptions as () => ProcedureOption[];
