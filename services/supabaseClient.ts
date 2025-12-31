import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yamlikuqgmqiigeaqzaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODAyMzMsImV4cCI6MjA4MjY1NjIzM30.7VJLrsFbMsFt9A0Y74KBgDbK_sUFN5kQqbpVm9JiOnc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database tables
export interface Procedure {
  id: string;
  procedure_name: string;
  slug: string;
  category: 'face' | 'body' | 'non-surgical';
  created_at: string;
  updated_at: string;
}

export interface ProcedureTranslation {
  id: string;
  procedure_id: string;
  language_code: string;
  overview: string | null;
  anesthesia: string | null;
  procedure_description: string | null;
}

export interface ProcedureRecovery {
  id: string;
  procedure_id: string;
  language_code: string;
  recovery_time: string | null;
  ready_to_go_out: string | null;
  resume_exercise: string | null;
  final_results: string | null;
}

export interface ProcedureBenefit {
  id: string;
  procedure_id: string;
  language_code: string;
  benefit_text: string;
  sort_order: number;
}

export interface ProcedureCandidacy {
  id: string;
  procedure_id: string;
  language_code: string;
  candidacy_text: string;
  sort_order: number;
}

export interface ProcedureTechnique {
  id: string;
  procedure_id: string;
  language_code: string;
  technique_name: string;
  description: string;
  sort_order: number;
}

export interface ProcedureRecoveryTimeline {
  id: string;
  procedure_id: string;
  language_code: string;
  timepoint: string;
  guidance: string;
  sort_order: number;
}

export interface ProcedureRecoveryTip {
  id: string;
  procedure_id: string;
  language_code: string;
  tip_text: string;
  sort_order: number;
}

export interface ComplementaryProcedure {
  id: string;
  procedure_id: string;
  language_code: string;
  complementary_name: string;
  reason: string;
  sort_order: number;
}

export interface ProcedureRisk {
  id: string;
  procedure_id: string;
  language_code: string;
  risk_text: string;
  sort_order: number;
}

// Cases (Before/After Photos) Types
export interface Case {
  id: string;
  case_number: string;
  procedure_id: string;
  surgeon_name: string | null;
  surgery_date: string | null;
  patient_age: number | null;
  patient_gender: string | null;
  patient_location: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CaseTranslation {
  id: string;
  case_id: string;
  language_code: string;
  description: string | null;
  patient_goals: string | null;
  outcome_summary: string | null;
}

export interface CasePhoto {
  id: string;
  case_id: string;
  photo_type: 'before' | 'after';
  view_angle: string | null;
  image_url: string;
  thumbnail_url: string | null;
  display_order: number;
  caption: string | null;
  created_at: string;
}

export interface CaseProcedure {
  id: string;
  case_id: string;
  procedure_id: string;
  is_primary: boolean;
  created_at: string;
}

// Complete case data with all related information
export interface CompleteCaseData extends Case {
  case_translations: CaseTranslation[];
  case_photos: CasePhoto[];
  case_procedures: CaseProcedure[];
}

// Complete procedure data with all related information
export interface CompleteProcedureData extends Procedure {
  procedure_translations: ProcedureTranslation[];
  procedure_recovery: ProcedureRecovery[];
  procedure_benefits: ProcedureBenefit[];
  procedure_candidacy: ProcedureCandidacy[];
  procedure_techniques: ProcedureTechnique[];
  procedure_recovery_timeline: ProcedureRecoveryTimeline[];
  procedure_recovery_tips: ProcedureRecoveryTip[];
  complementary_procedures: ComplementaryProcedure[];
  procedure_risks: ProcedureRisk[];
}

/**
 * Fetch a single procedure by slug with all related data
 * @param slug - The procedure slug (e.g., 'brow-lift-forehead-lift')
 * @param languageCode - Language code (default: 'en')
 * @returns Complete procedure data or null if not found
 */
export async function getProcedureBySlug(
  slug: string,
  languageCode: string = 'en'
): Promise<CompleteProcedureData | null> {
  const { data, error } = await supabase
    .from('procedures')
    .select(`
      *,
      procedure_translations!inner(
        overview,
        anesthesia,
        procedure_description
      ),
      procedure_recovery!inner(
        recovery_time,
        ready_to_go_out,
        resume_exercise,
        final_results
      ),
      procedure_benefits(
        benefit_text,
        sort_order
      ),
      procedure_candidacy(
        candidacy_text,
        sort_order
      ),
      procedure_techniques(
        technique_name,
        description,
        sort_order
      ),
      procedure_recovery_timeline(
        timepoint,
        guidance,
        sort_order
      ),
      procedure_recovery_tips(
        tip_text,
        sort_order
      ),
      complementary_procedures(
        complementary_name,
        reason,
        sort_order
      ),
      procedure_risks(
        risk_text,
        sort_order
      )
    `)
    .eq('slug', slug)
    .eq('procedure_translations.language_code', languageCode)
    .eq('procedure_recovery.language_code', languageCode)
    .eq('procedure_benefits.language_code', languageCode)
    .eq('procedure_candidacy.language_code', languageCode)
    .eq('procedure_techniques.language_code', languageCode)
    .eq('procedure_recovery_timeline.language_code', languageCode)
    .eq('procedure_recovery_tips.language_code', languageCode)
    .eq('complementary_procedures.language_code', languageCode)
    .eq('procedure_risks.language_code', languageCode)
    .single();

  if (error) {
    console.error('Error fetching procedure:', error);
    return null;
  }

  return data as CompleteProcedureData;
}

/**
 * Fetch all procedures by category
 * @param category - The category ('face', 'body', or 'non-surgical')
 * @param languageCode - Language code (default: 'en')
 * @returns Array of procedures with translations
 */
export async function getProceduresByCategory(
  category: 'face' | 'body' | 'non-surgical',
  languageCode: string = 'en'
) {
  const { data, error } = await supabase
    .from('procedures')
    .select(`
      *,
      procedure_translations!inner(
        overview,
        anesthesia
      )
    `)
    .eq('category', category)
    .eq('procedure_translations.language_code', languageCode)
    .order('procedure_name');

  if (error) {
    console.error('Error fetching procedures:', error);
    return [];
  }

  return data;
}

/**
 * Search procedures by name
 * @param searchTerm - The search term
 * @param languageCode - Language code (default: 'en')
 * @returns Array of matching procedures
 */
export async function searchProcedures(
  searchTerm: string,
  languageCode: string = 'en'
) {
  const { data, error } = await supabase
    .from('procedures')
    .select(`
      *,
      procedure_translations!inner(
        overview
      )
    `)
    .ilike('procedure_name', `%${searchTerm}%`)
    .eq('procedure_translations.language_code', languageCode)
    .order('procedure_name');

  if (error) {
    console.error('Error searching procedures:', error);
    return [];
  }

  return data;
}

/**
 * Fetch cases for a specific procedure
 * @param procedureId - The procedure ID
 * @param languageCode - Language code (default: 'en')
 * @param limit - Maximum number of cases to return
 * @returns Array of cases with photos and translations
 */
export async function getCasesByProcedure(
  procedureId: string,
  languageCode: string = 'en',
  limit: number = 10
): Promise<CompleteCaseData[]> {
  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      case_translations!inner(
        description,
        patient_goals,
        outcome_summary
      ),
      case_photos(
        photo_type,
        view_angle,
        image_url,
        thumbnail_url,
        display_order,
        caption
      ),
      case_procedures(
        procedure_id,
        is_primary
      )
    `)
    .eq('procedure_id', procedureId)
    .eq('case_translations.language_code', languageCode)
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching cases:', error);
    return [];
  }

  // Sort photos by display_order
  const casesWithSortedPhotos = data?.map(caseData => ({
    ...caseData,
    case_photos: caseData.case_photos?.sort((a, b) => a.display_order - b.display_order) || []
  })) || [];

  return casesWithSortedPhotos as CompleteCaseData[];
}

/**
 * Fetch a single case by case number
 * @param caseNumber - The case number (e.g., "1001510")
 * @param languageCode - Language code (default: 'en')
 * @returns Complete case data or null if not found
 */
export async function getCaseByCaseNumber(
  caseNumber: string,
  languageCode: string = 'en'
): Promise<CompleteCaseData | null> {
  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      case_translations!inner(
        description,
        patient_goals,
        outcome_summary
      ),
      case_photos(
        photo_type,
        view_angle,
        image_url,
        thumbnail_url,
        display_order,
        caption
      ),
      case_procedures(
        procedure_id,
        is_primary
      )
    `)
    .eq('case_number', caseNumber)
    .eq('case_translations.language_code', languageCode)
    .single();

  if (error) {
    console.error('Error fetching case:', error);
    return null;
  }

  // Sort photos by display_order
  if (data && data.case_photos) {
    data.case_photos.sort((a, b) => a.display_order - b.display_order);
  }

  return data as CompleteCaseData;
}

/**
 * Get featured cases across all procedures
 * @param languageCode - Language code (default: 'en')
 * @param limit - Maximum number of cases to return
 * @returns Array of featured cases
 */
export async function getFeaturedCases(
  languageCode: string = 'en',
  limit: number = 6
): Promise<CompleteCaseData[]> {
  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      case_translations!inner(
        description,
        patient_goals,
        outcome_summary
      ),
      case_photos(
        photo_type,
        view_angle,
        image_url,
        thumbnail_url,
        display_order,
        caption
      ),
      case_procedures(
        procedure_id,
        is_primary
      )
    `)
    .eq('is_featured', true)
    .eq('case_translations.language_code', languageCode)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured cases:', error);
    return [];
  }

  const casesWithSortedPhotos = data?.map(caseData => ({
    ...caseData,
    case_photos: caseData.case_photos?.sort((a, b) => a.display_order - b.display_order) || []
  })) || [];

  return casesWithSortedPhotos as CompleteCaseData[];
}

