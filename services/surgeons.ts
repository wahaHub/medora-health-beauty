import { supabase } from './supabaseClient';

export interface Surgeon {
  surgeon_id: string;
  name: string;
  title: string;
  specialties: string[];
  experience_years: number;
  image_url: string | null;
  images?: {
    hero?: string;
    [key: string]: string | undefined;
  };
}

export interface SurgeonsData {
  surgeonsBySpecialty: Record<string, Surgeon[]>;
  allSpecialties: string[];
  totalSurgeons: number;
}

interface SurgeonsApiResponse {
  success: boolean;
  data: SurgeonsData;
}

function normalizeSurgeonsData(surgeons: Surgeon[]): SurgeonsData {
  const surgeonsBySpecialty: Record<string, Surgeon[]> = {};
  const specialtySet = new Set<string>();

  surgeons.forEach((surgeon) => {
    const specialties = Array.isArray(surgeon.specialties) ? surgeon.specialties : [];

    specialties.forEach((specialty) => {
      specialtySet.add(specialty);

      if (!surgeonsBySpecialty[specialty]) {
        surgeonsBySpecialty[specialty] = [];
      }

      surgeonsBySpecialty[specialty].push(surgeon);
    });
  });

  return {
    surgeonsBySpecialty,
    allSpecialties: Array.from(specialtySet).sort(),
    totalSurgeons: surgeons.length,
  };
}

async function fetchSurgeonsFromSupabase(): Promise<SurgeonsData> {
  const { data, error } = await supabase
    .from('surgeons')
    .select('surgeon_id, name, title, image_url, images, specialties, experience_years')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return normalizeSurgeonsData((data ?? []) as Surgeon[]);
}

export async function fetchSurgeonsData(): Promise<SurgeonsData> {
  if (import.meta.env.DEV) {
    return fetchSurgeonsFromSupabase();
  }

  const response = await fetch('/api/surgeons');

  if (!response.ok) {
    throw new Error(`Failed to fetch surgeons data: ${response.status}`);
  }

  const result: SurgeonsApiResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error('API returned unsuccessful response');
  }

  return result.data;
}
