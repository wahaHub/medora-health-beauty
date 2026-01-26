/**
 * React Query hooks for data fetching with caching
 * 使用 React Query 进行数据获取和缓存
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import type { CompleteProcedureData } from '../services/supabaseClient';

// ============================================
// Types
// ============================================

interface Surgeon {
  id: string;
  surgeon_id: string;
  name: string;
  title: string;
  experience_years: number;
  image_url: string | null;
  image_prompt: string;
  images?: {
    hero?: string;
    office?: string;
    [key: string]: string | undefined;
  };
  specialties: string[];
  languages: string[];
  education: string[];
  certifications: string[];
  procedures_count: { [key: string]: number };
  bio: {
    intro: string;
    expertise: string;
    philosophy: string;
    achievements: string[];
  };
  translations?: {
    [langCode: string]: {
      title: string;
      specialties: string[];
      languages: string[];
      education: string[];
      certifications: string[];
      bio: {
        intro: string;
        expertise: string;
        philosophy: string;
        achievements: string[];
      };
    };
  };
  created_at: string;
  updated_at: string;
}

interface ProcedureCase {
  id: string;
  procedure_id: string;
  case_number: string;
  description: string | null;
  provider_name: string | null;
  patient_age: string | null;
  patient_gender: string | null;
  image_count: number;
  sort_order: number;
  surgeon_id?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  procedure_name?: string;
  procedure_slug?: string;
}

// ============================================
// Query Key Factories
// ============================================

export const queryKeys = {
  surgeons: {
    all: ['surgeons'] as const,
    list: () => [...queryKeys.surgeons.all, 'list'] as const,
    detail: (surgeonId: string) => [...queryKeys.surgeons.all, 'detail', surgeonId] as const,
    cases: (surgeonId: string) => [...queryKeys.surgeons.all, 'cases', surgeonId] as const,
  },
  procedures: {
    all: ['procedures'] as const,
    list: () => [...queryKeys.procedures.all, 'list'] as const,
    byCategory: (category: string) => [...queryKeys.procedures.all, 'category', category] as const,
    detail: (slug: string, lang: string) => [...queryKeys.procedures.all, 'detail', slug, lang] as const,
    cases: (procedureId: string) => [...queryKeys.procedures.all, 'cases', procedureId] as const,
  },
};

// ============================================
// Fetch Functions
// ============================================

const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

async function fetchSurgeonBySlug(surgeonSlug: string): Promise<Surgeon | null> {
  const { data, error } = await supabase
    .from('surgeons')
    .select('*')
    .eq('surgeon_id', surgeonSlug)
    .single();

  if (error) {
    console.error('Error fetching surgeon:', error);
    throw error;
  }

  return data;
}

async function fetchSurgeonCases(surgeonUuid: string): Promise<ProcedureCase[]> {
  const { data, error } = await supabase
    .from('procedure_cases')
    .select(`
      id,
      procedure_id,
      case_number,
      description,
      provider_name,
      patient_age,
      patient_gender,
      image_count,
      sort_order,
      procedures (
        procedure_name,
        slug
      )
    `)
    .eq('surgeon_id', surgeonUuid)
    .order('sort_order', { ascending: true })
    .limit(12);

  if (error) {
    console.error('Error fetching surgeon cases:', error);
    throw error;
  }

  // Transform to flatten procedures join
  return (data || []).map((c: any) => ({
    id: c.id,
    procedure_id: c.procedure_id,
    case_number: c.case_number,
    description: c.description,
    provider_name: c.provider_name,
    patient_age: c.patient_age,
    patient_gender: c.patient_gender,
    image_count: c.image_count,
    sort_order: c.sort_order,
    procedure_name: c.procedures?.procedure_name,
    procedure_slug: c.procedures?.slug,
  }));
}

async function fetchProcedureBySlug(
  procedureName: string,
  languageCode: string
): Promise<CompleteProcedureData | null> {
  const slug = createSlug(procedureName);

  let { data, error } = await supabase
    .from('procedures')
    .select(`
      *,
      procedure_translations!inner(*),
      procedure_recovery!inner(*),
      procedure_benefits(*),
      procedure_candidacy(*),
      procedure_techniques(*),
      procedure_recovery_timeline(*),
      procedure_recovery_tips(*),
      complementary_procedures(*),
      procedure_risks(*)
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
    .maybeSingle();

  // Fuzzy match fallback
  if (!data && !error) {
    const { data: matchingProcs } = await supabase
      .from('procedures')
      .select('id, procedure_name, slug')
      .ilike('procedure_name', `${procedureName}%`);

    if (matchingProcs && matchingProcs.length > 0) {
      const result = await supabase
        .from('procedures')
        .select(`
          *,
          procedure_translations!inner(*),
          procedure_recovery!inner(*),
          procedure_benefits(*),
          procedure_candidacy(*),
          procedure_techniques(*),
          procedure_recovery_timeline(*),
          procedure_recovery_tips(*),
          complementary_procedures(*),
          procedure_risks(*)
        `)
        .eq('id', matchingProcs[0].id)
        .eq('procedure_translations.language_code', languageCode)
        .eq('procedure_recovery.language_code', languageCode)
        .eq('procedure_benefits.language_code', languageCode)
        .eq('procedure_candidacy.language_code', languageCode)
        .eq('procedure_techniques.language_code', languageCode)
        .eq('procedure_recovery_timeline.language_code', languageCode)
        .eq('procedure_recovery_tips.language_code', languageCode)
        .eq('complementary_procedures.language_code', languageCode)
        .eq('procedure_risks.language_code', languageCode)
        .maybeSingle();

      data = result.data;
      error = result.error;
    }
  }

  if (error) throw error;

  // Sort arrays
  if (data) {
    data.procedure_benefits?.sort((a: any, b: any) => a.sort_order - b.sort_order);
    data.procedure_candidacy?.sort((a: any, b: any) => a.sort_order - b.sort_order);
    data.procedure_techniques?.sort((a: any, b: any) => a.sort_order - b.sort_order);
    data.procedure_recovery_timeline?.sort((a: any, b: any) => a.sort_order - b.sort_order);
    data.procedure_recovery_tips?.sort((a: any, b: any) => a.sort_order - b.sort_order);
    data.complementary_procedures?.sort((a: any, b: any) => a.sort_order - b.sort_order);
    data.procedure_risks?.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  return data as CompleteProcedureData;
}

async function fetchProcedureCases(procedureId: string): Promise<ProcedureCase[]> {
  const { data, error } = await supabase
    .from('procedure_cases')
    .select('*')
    .eq('procedure_id', procedureId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function fetchAllSurgeons() {
  const { data, error } = await supabase
    .from('surgeons')
    .select('surgeon_id, name, title, image_url, images, specialties, experience_years')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ============================================
// React Query Hooks
// ============================================

/**
 * Hook to fetch surgeon detail by slug
 * 永不自动刷新，数据缓存直到页面刷新
 */
export function useSurgeon(surgeonSlug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.surgeons.detail(surgeonSlug || ''),
    queryFn: () => fetchSurgeonBySlug(surgeonSlug!),
    enabled: !!surgeonSlug,
    staleTime: Infinity, // 永不过期
  });
}

/**
 * Hook to fetch surgeon's cases
 */
export function useSurgeonCases(surgeonUuid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.surgeons.cases(surgeonUuid || ''),
    queryFn: () => fetchSurgeonCases(surgeonUuid!),
    enabled: !!surgeonUuid,
    staleTime: Infinity,
  });
}

/**
 * Hook to fetch all surgeons (for listing pages)
 */
export function useAllSurgeons() {
  return useQuery({
    queryKey: queryKeys.surgeons.list(),
    queryFn: fetchAllSurgeons,
    staleTime: Infinity,
  });
}

/**
 * Hook to fetch procedure detail by name/slug
 */
export function useProcedure(procedureName: string | undefined, languageCode: string) {
  return useQuery({
    queryKey: queryKeys.procedures.detail(procedureName || '', languageCode),
    queryFn: () => fetchProcedureBySlug(decodeURIComponent(procedureName!), languageCode),
    enabled: !!procedureName,
    staleTime: Infinity,
  });
}

/**
 * Hook to fetch procedure cases
 */
export function useProcedureCases(procedureId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.procedures.cases(procedureId || ''),
    queryFn: () => fetchProcedureCases(procedureId!),
    enabled: !!procedureId,
    staleTime: Infinity,
  });
}
