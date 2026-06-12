import { createClient } from '@supabase/supabase-js';

const getSupabaseEnv = (env) => {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SERVICE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_ANON_KEY;

  return { supabaseUrl, supabaseKey };
};

const encodePathSegment = (value) => encodeURIComponent(decodeURIComponent(String(value || '')));

const createPublicClient = (env) => {
  const { supabaseUrl, supabaseKey } = getSupabaseEnv(env);
  if (!supabaseUrl || !supabaseKey) return null;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const queryPublicRows = async (client, warnings, label, query) => {
  try {
    const { data, error } = await query(client);
    if (error) throw error;
    return data || [];
  } catch (error) {
    warnings.push(`Supabase ${label} query failed; using fallback data where available. ${error.message}`);
    return [];
  }
};

export async function loadPublicSeoSupabaseData(config = {}) {
  const env = config.env || process.env;
  const warnings = [];
  const client = createPublicClient(env);

  if (!client) {
    return {
      surgeons: [],
      hospitals: [],
      warnings: ['Supabase env is missing; using public SEO fallback data.'],
    };
  }

  const [surgeonRows, hospitalRows] = await Promise.all([
    queryPublicRows(client, warnings, 'surgeon', (supabase) =>
      supabase
        .from('surgeons')
        .select('surgeon_id, name, full_name, title, specialties, languages, bio, image_url')
        .not('surgeon_id', 'is', null)
        .order('surgeon_id', { ascending: true })
    ),
    queryPublicRows(client, warnings, 'hospital', (supabase) =>
      supabase
        .from('hospitals')
        .select('slug, name, city, country, description, image_url')
        .not('slug', 'is', null)
        .order('slug', { ascending: true })
    ),
  ]);

  return {
    surgeons: surgeonRows
      .map((surgeon) => ({
        id: surgeon.surgeon_id,
        name: surgeon.name || surgeon.full_name || surgeon.surgeon_id,
        slug: surgeon.surgeon_id,
        route: `/surgeon/${encodePathSegment(surgeon.surgeon_id)}`,
        title: surgeon.title || 'Aesthetic surgeon',
        specialties: Array.isArray(surgeon.specialties) ? surgeon.specialties : [],
        languages: Array.isArray(surgeon.languages) ? surgeon.languages : [],
        bio: typeof surgeon.bio === 'string' ? surgeon.bio : surgeon.bio?.intro || '',
        imageUrl: surgeon.image_url || '',
      }))
      .filter((surgeon) => surgeon.id && surgeon.name),
    hospitals: hospitalRows
      .map((hospital) => ({
        id: hospital.slug,
        name: hospital.name || hospital.slug,
        slug: hospital.slug,
        route: `/hospital/${encodePathSegment(hospital.slug)}`,
        galleryRoute: `/hospital/${encodePathSegment(hospital.slug)}/gallery`,
        city: hospital.city || '',
        country: hospital.country || '',
        description: hospital.description || '',
        imageUrl: hospital.image_url || '',
      }))
      .filter((hospital) => hospital.slug && hospital.name),
    warnings,
  };
}
