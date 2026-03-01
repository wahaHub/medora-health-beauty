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

// ============================================
// Hospital Types
// ============================================

/**
 * CRM Metadata stored in hospitals.crm_metadata JSONB field
 */
export interface CRMMetadata {
  bedCount?: number;
  patientCapacity?: number;
  multilingualStaff?: string[];  // 语言代码数组: ['en', 'zh', 'ar', ...]
  airportServices?: string[];    // 服务代码数组: ['complimentary_transfer', 'paid_transfer', ...]
  followUpCare?: string[];       // 服务代码数组: ['lifetime', 'telemedicine', ...]
  amenities?: string[];          // 设施代码数组: ['wifi', 'concierge', ...]
  certifications?: Array<{
    id: string;
    name: string;
    nameEn: string;
    year?: number;
    isActive: boolean;
  }>;
  videoTestimonials?: Array<{
    id: string;
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
    patientName?: string;
    procedureType?: string;
  }>;
}

export interface Hospital {
  id: string;
  slug: string;
  name: string;
  year_established: number | null;
  rating: number;
  review_count: number;
  hero_image: string | null;
  total_patients: number;
  recommend_rate: number;
  photos: string[];
  payment_methods: string[];
  highlights: { icon: string; text: string }[];
  crm_metadata: CRMMetadata | null;
  is_active: boolean;
  sort_order: number;
}

export interface HospitalTranslation {
  tagline: string | null;
  description: string | null;
  highlights: { icon: string; text: string }[];
}

export interface HospitalRatingBreakdown {
  label: string;
  score: number;
  sort_order: number;
}

export interface HospitalProcedure {
  id: string;
  price_range: string | null;
  price_min: number | null;
  price_max: number | null;
  is_popular: boolean;
  sort_order: number;
  procedures: {
    id: string;
    procedure_name: string;
    slug: string;
  };
}

export interface HospitalLocation {
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: string | null;
  map_embed: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface HospitalNearbyAttraction {
  name: string;
  distance: string | null;
  sort_order: number;
}

export interface HospitalReview {
  id: string;
  author_name: string;
  country: string | null;
  rating: number;
  review_date: string | null;
  review_text: string;
  is_verified: boolean;
  procedures: {
    procedure_name: string;
  } | null;
}

export interface HospitalVideoTestimonial {
  id: string;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  country: string | null;
  sort_order: number;
  procedures: {
    procedure_name: string;
  } | null;
}

export interface HospitalSurgeon {
  surgeon_id: string;
  name: string;
  title: string | null;
  specialties: string[];
  experience_years: number | null;
  images: any;
}

export interface HospitalCase {
  id: string;
  case_number: string;
  patient_age: string | null;
  patient_gender: string | null;
  image_count: number | null;
  sort_order: number | null;
  procedures: {
    id: string;
    procedure_name: string;
    slug: string;
  } | null;
  surgeons: {
    surgeon_id: string;
    name: string;
    hospital_id: string;
  } | null;
}

export interface CompleteHospitalData {
  hospital: Hospital;
  translation: HospitalTranslation | null;
  ratingBreakdown: HospitalRatingBreakdown[];
  procedures: HospitalProcedure[];
  location: HospitalLocation | null;
  nearbyAttractions: HospitalNearbyAttraction[];
  reviews: HospitalReview[];
  videoTestimonials: HospitalVideoTestimonial[];
  surgeons: HospitalSurgeon[];
  cases: HospitalCase[];
}

// ============================================
// Hospital Query Keys
// ============================================

queryKeys.hospitals = {
  all: ['hospitals'] as const,
  list: () => [...queryKeys.hospitals.all, 'list'] as const,
  detail: (slug: string, lang: string) => [...queryKeys.hospitals.all, 'detail', slug, lang] as const,
};

// ============================================
// Hospital Fetch Functions
// ============================================

async function fetchHospitalBySlug(
  slug: string,
  languageCode: string
): Promise<CompleteHospitalData | null> {
  console.log('🏥 [fetchHospitalBySlug] START - slug:', slug, 'lang:', languageCode);
  const startTime = performance.now();

  // 1. First fetch hospital (needed for hospital_id)
  // Note: Don't filter by is_active here - direct URL access should work regardless
  // is_active filtering is only for search results
  const hospitalStart = performance.now();
  const { data: hospital, error: hospitalError } = await supabase
    .from('hospitals')
    .select('*')
    .eq('slug', slug)
    .single();
  console.log('🏥 [fetchHospitalBySlug] Hospital query took:', (performance.now() - hospitalStart).toFixed(0), 'ms');

  if (hospitalError || !hospital) {
    console.error('🏥 [fetchHospitalBySlug] Error fetching hospital:', hospitalError);
    return null;
  }
  console.log('🏥 [fetchHospitalBySlug] Hospital found:', hospital.id, hospital.name);

  // 2. Fetch all related data in PARALLEL
  console.log('🏥 [fetchHospitalBySlug] Starting parallel queries...');
  const parallelStart = performance.now();
  const [
    translationResult,
    ratingBreakdownResult,
    proceduresResult,
    locationResult,
    nearbyAttractionsResult,
    reviewsResult,
    videoTestimonialsResult,
    surgeonsResult,
    casesResult,
  ] = await Promise.all([
    // Translation
    supabase
      .from('hospital_translations')
      .select('tagline, description, highlights')
      .eq('hospital_id', hospital.id)
      .eq('language_code', languageCode)
      .single(),

    // Rating breakdown
    supabase
      .from('hospital_rating_breakdown')
      .select('label, score, sort_order')
      .eq('hospital_id', hospital.id)
      .eq('language_code', languageCode)
      .order('sort_order'),

    // Procedures with pricing
    supabase
      .from('hospital_procedures')
      .select(`
        id, price_range, price_min, price_max, is_popular, sort_order,
        procedures (id, procedure_name, slug)
      `)
      .eq('hospital_id', hospital.id)
      .order('sort_order'),

    // Location
    supabase
      .from('hospital_location')
      .select('address, phone, email, website, hours, map_embed, latitude, longitude')
      .eq('hospital_id', hospital.id)
      .single(),

    // Nearby attractions
    supabase
      .from('hospital_nearby_attractions')
      .select('name, distance, sort_order')
      .eq('hospital_id', hospital.id)
      .eq('language_code', languageCode)
      .order('sort_order'),

    // Reviews
    supabase
      .from('reviews')
      .select(`
        id, author_name, country, rating, review_date, review_text, is_verified,
        procedures (procedure_name)
      `)
      .eq('hospital_id', hospital.id)
      .eq('language_code', languageCode)
      .order('review_date', { ascending: false }),

    // Video testimonials
    supabase
      .from('video_testimonials')
      .select(`
        id, title, video_url, thumbnail_url, duration, country, sort_order,
        procedures (procedure_name)
      `)
      .eq('hospital_id', hospital.id)
      .eq('language_code', languageCode)
      .order('sort_order'),

    // Surgeons
    supabase
      .from('surgeons')
      .select('surgeon_id, name, title, specialties, experience_years, images')
      .eq('hospital_id', hospital.id),

    // Cases (before/after)
    supabase
      .from('procedure_cases')
      .select(`
        id, case_number, patient_age, patient_gender, image_count, sort_order,
        procedures (id, procedure_name, slug),
        surgeons!inner (surgeon_id, name, hospital_id)
      `)
      .eq('surgeons.hospital_id', hospital.id)
      .order('sort_order', { ascending: true })
      .order('case_number', { ascending: false })
      .limit(6),
  ]);

  console.log('🏥 [fetchHospitalBySlug] Parallel queries took:', (performance.now() - parallelStart).toFixed(0), 'ms');
  console.log('🏥 [fetchHospitalBySlug] Results:', {
    translation: !!translationResult.data,
    translationError: translationResult.error?.message,
    ratingBreakdown: ratingBreakdownResult.data?.length || 0,
    procedures: proceduresResult.data?.length || 0,
    location: !!locationResult.data,
    nearbyAttractions: nearbyAttractionsResult.data?.length || 0,
    reviews: reviewsResult.data?.length || 0,
    videoTestimonials: videoTestimonialsResult.data?.length || 0,
    surgeons: surgeonsResult.data?.length || 0,
    cases: casesResult.data?.length || 0,
    casesError: casesResult.error?.message,
  });

  // ✅ For beauty hospitals (role=hospital): Transform crm_metadata.videoTestimonials
  let finalVideoTestimonials = videoTestimonialsResult.data || [];
  if (hospital.crm_metadata?.videoTestimonials && Array.isArray(hospital.crm_metadata.videoTestimonials)) {
    console.log('🏥 [fetchHospitalBySlug] Using crm_metadata.videoTestimonials:', hospital.crm_metadata.videoTestimonials.length);
    finalVideoTestimonials = hospital.crm_metadata.videoTestimonials.map((video: any, index: number) => ({
      id: video.id || `video-${index}`,
      title: video.title || '',
      video_url: video.videoUrl || null,
      thumbnail_url: video.thumbnailUrl || null,
      // Transform to match frontend expectations (HospitalDetail.tsx uses these fields)
      thumbnail: video.thumbnailUrl || null,
      duration: '2:00', // Default duration since CRM doesn't store it
      procedure: video.procedureType || '',
      country: video.patientName || '',
      sort_order: index,
      procedures: video.procedureType ? { procedure_name: video.procedureType } : null,
    }));
  }

  console.log('🏥 [fetchHospitalBySlug] TOTAL TIME:', (performance.now() - startTime).toFixed(0), 'ms');

  return {
    hospital,
    translation: translationResult.data || null,
    ratingBreakdown: ratingBreakdownResult.data || [],
    procedures: proceduresResult.data || [],
    location: locationResult.data || null,
    nearbyAttractions: nearbyAttractionsResult.data || [],
    reviews: reviewsResult.data || [],
    videoTestimonials: finalVideoTestimonials,
    surgeons: surgeonsResult.data || [],
    cases: casesResult.data || [],
  };
}

// ============================================
// Hospital React Query Hook
// ============================================

/**
 * Hook to fetch complete hospital data by slug
 */
export function useHospital(slug: string | undefined, languageCode: string = 'en') {
  return useQuery({
    queryKey: queryKeys.hospitals.detail(slug || '', languageCode),
    queryFn: () => fetchHospitalBySlug(slug!, languageCode),
    enabled: !!slug,
    staleTime: Infinity,
  });
}

// ============================================
// Hospital Gallery - All Cases
// ============================================

export interface HospitalGalleryData {
  hospital: { id: string; slug: string; name: string } | null;
  cases: HospitalCase[];
  surgeons: { surgeon_id: string; name: string }[];
  procedures: { id: string; procedure_name: string; slug: string }[];
}

async function fetchHospitalGallery(slug: string): Promise<HospitalGalleryData | null> {
  // 1. Get hospital by slug (no is_active filter - direct URL access should work)
  const { data: hospital, error: hospitalError } = await supabase
    .from('hospitals')
    .select('id, slug, name')
    .eq('slug', slug)
    .single();

  if (hospitalError || !hospital) {
    console.error('Error fetching hospital for gallery:', hospitalError);
    return null;
  }

  // 2. Fetch ALL cases for this hospital's surgeons (no limit)
  const { data: cases } = await supabase
    .from('procedure_cases')
    .select(`
      id, case_number, patient_age, patient_gender, image_count, sort_order,
      procedures (id, procedure_name, slug),
      surgeons!inner (surgeon_id, name, hospital_id)
    `)
    .eq('surgeons.hospital_id', hospital.id)
    .order('sort_order', { ascending: true })
    .order('case_number', { ascending: false });

  // 3. Extract unique surgeons and procedures from cases
  const surgeonMap = new Map<string, { surgeon_id: string; name: string }>();
  const procedureMap = new Map<string, { id: string; procedure_name: string; slug: string }>();

  (cases || []).forEach(c => {
    if (c.surgeons) {
      surgeonMap.set(c.surgeons.surgeon_id, {
        surgeon_id: c.surgeons.surgeon_id,
        name: c.surgeons.name,
      });
    }
    if (c.procedures) {
      procedureMap.set(c.procedures.id, {
        id: c.procedures.id,
        procedure_name: c.procedures.procedure_name,
        slug: c.procedures.slug,
      });
    }
  });

  return {
    hospital,
    cases: cases || [],
    surgeons: Array.from(surgeonMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    procedures: Array.from(procedureMap.values()).sort((a, b) => a.procedure_name.localeCompare(b.procedure_name)),
  };
}

/**
 * Hook to fetch all cases for hospital gallery page
 */
export function useHospitalGallery(slug: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.hospitals.all, 'gallery', slug] as const,
    queryFn: () => fetchHospitalGallery(slug!),
    enabled: !!slug,
    staleTime: Infinity,
  });
}

// ============================================
// Surgeons Grouped by Specialty (for Header & ConsultationModal)
// ============================================

export interface SurgeonListItem {
  surgeon_id: string;
  name: string;
  title: string | null;
  image_url: string | null;
  images: any;
  specialties: string[];
  experience_years: number | null;
}

export interface SurgeonsBySpecialty {
  [specialty: string]: SurgeonListItem[];
}

export interface SurgeonsData {
  surgeons: SurgeonListItem[];
  surgeonsBySpecialty: SurgeonsBySpecialty;
  allSpecialties: string[];
  totalSurgeons: number;
}

async function fetchSurgeonsGrouped(): Promise<SurgeonsData> {
  const { data: surgeons, error } = await supabase
    .from('surgeons')
    .select('surgeon_id, name, title, image_url, images, specialties, experience_years')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching surgeons:', error);
    return { surgeons: [], surgeonsBySpecialty: {}, allSpecialties: [], totalSurgeons: 0 };
  }

  if (!surgeons || surgeons.length === 0) {
    return { surgeons: [], surgeonsBySpecialty: {}, allSpecialties: [], totalSurgeons: 0 };
  }

  // Keep an already-unique, already-sorted surgeons list.
  // This avoids expensive O(n^2) "unique filter + findIndex" patterns in components.
  const surgeonList: SurgeonListItem[] = (surgeons || [])
    .map((surgeon: any) => ({
      surgeon_id: surgeon.surgeon_id,
      name: surgeon.name,
      title: surgeon.title,
      image_url: surgeon.image_url,
      images: surgeon.images,
      specialties: Array.isArray(surgeon.specialties) ? surgeon.specialties : [],
      experience_years: surgeon.experience_years,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Group surgeons by specialty
  const surgeonsBySpecialty: SurgeonsBySpecialty = {};
  const specialtySet = new Set<string>();

  surgeonList.forEach((surgeon) => {
    surgeon.specialties.forEach((specialty: string) => {
      specialtySet.add(specialty);

      if (!surgeonsBySpecialty[specialty]) {
        surgeonsBySpecialty[specialty] = [];
      }

      surgeonsBySpecialty[specialty].push({
        surgeon_id: surgeon.surgeon_id,
        name: surgeon.name,
        title: surgeon.title,
        image_url: surgeon.image_url,
        images: surgeon.images,
        specialties: surgeon.specialties,
        experience_years: surgeon.experience_years,
      });
    });
  });

  const allSpecialties = Array.from(specialtySet).sort();

  return {
    surgeons: surgeonList,
    surgeonsBySpecialty,
    allSpecialties,
    totalSurgeons: surgeonList.length,
  };
}

/**
 * Hook to fetch all surgeons grouped by specialty
 */
export function useSurgeonsList(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['surgeons', 'grouped'] as const,
    queryFn: fetchSurgeonsGrouped,
    enabled: options?.enabled ?? true,
    staleTime: Infinity,
  });
}
