import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yamlikuqgmqiigeaqzaz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODAyMzMsImV4cCI6MjA4MjY1NjIzM30.7VJLrsFbMsFt9A0Y74KBgDbK_sUFN5kQqbpVm9JiOnc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 翻译文本（使用 Google Translate API 或其他翻译服务）
 * 这里先返回英文原文，后续可以集成翻译 API
 */
function translateText(text, targetLang) {
  // TODO: 集成翻译 API (Google Translate, DeepL, 等)
  // 目前先返回原文
  if (targetLang === 'en' || !targetLang) {
    return text;
  }

  // 未来可以调用翻译 API
  // const translated = await translateAPI(text, targetLang);
  // return translated;

  return text; // 暂时返回英文原文
}

/**
 * 翻译医生的 bio 对象
 */
function translateBio(bio, targetLang) {
  if (!bio || targetLang === 'en' || !targetLang) {
    return bio;
  }

  return {
    intro: translateText(bio.intro, targetLang),
    expertise: translateText(bio.expertise, targetLang),
    philosophy: translateText(bio.philosophy, targetLang),
    achievements: Array.isArray(bio.achievements)
      ? bio.achievements.map(achievement => translateText(achievement, targetLang))
      : []
  };
}

/**
 * 翻译数组内容
 */
function translateArray(arr, targetLang) {
  if (!Array.isArray(arr) || targetLang === 'en' || !targetLang) {
    return arr;
  }
  return arr.map(item => translateText(item, targetLang));
}

/**
 * API: 获取单个医生的详细信息（支持多语言）
 * GET /api/surgeon-detail?surgeon_id=min-zhang&lang=zh
 *
 * Query Parameters:
 * - surgeon_id (required): 医生的 ID (如 "min-zhang")
 * - lang (optional): 语言代码 (如 "en", "zh", "es" 等)，默认 "en"
 *
 * 返回格式：
 * {
 *   success: true,
 *   data: {
 *     surgeon_id: "min-zhang",
 *     name: "Dr. Min Zhang",
 *     title: "Board-Certified Plastic Surgeon",
 *     experience_years: 20,
 *     image_url: "https://...",
 *     image_prompt: "...",
 *     specialties: ["Deep Plane Facelift", "Rhinoplasty", ...],
 *     languages: ["English", "Mandarin Chinese"],
 *     education: ["MD - Harvard Medical School", ...],
 *     certifications: ["American Board of Plastic Surgery", ...],
 *     procedures_count: { facelifts: 600, rhinoplasty: 500, ... },
 *     bio: {
 *       intro: "...",
 *       expertise: "...",
 *       philosophy: "...",
 *       achievements: ["...", "...", "..."]
 *     }
 *   }
 * }
 */
export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { surgeon_id, lang = 'en' } = req.query;

  if (!surgeon_id) {
    return res.status(400).json({
      success: false,
      message: 'surgeon_id is required'
    });
  }

  try {
    // 从 Supabase 获取医生详细信息
    const { data: surgeon, error } = await supabase
      .from('surgeons')
      .select('*')
      .eq('surgeon_id', surgeon_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到医生
        return res.status(404).json({
          success: false,
          message: 'Surgeon not found'
        });
      }
      throw error;
    }

    if (!surgeon) {
      return res.status(404).json({
        success: false,
        message: 'Surgeon not found'
      });
    }

    // 如果需要翻译（lang 不是 'en'）
    let translatedData = {
      surgeon_id: surgeon.surgeon_id,
      name: surgeon.name,
      title: translateText(surgeon.title, lang),
      experience_years: surgeon.experience_years,
      image_url: surgeon.image_url,
      image_prompt: surgeon.image_prompt,
      specialties: translateArray(surgeon.specialties, lang),
      languages: surgeon.languages, // 语言名称通常不翻译
      education: translateArray(surgeon.education, lang),
      certifications: translateArray(surgeon.certifications, lang),
      procedures_count: surgeon.procedures_count,
      bio: translateBio(surgeon.bio, lang),
      created_at: surgeon.created_at,
      updated_at: surgeon.updated_at
    };

    return res.status(200).json({
      success: true,
      data: translatedData,
      lang: lang // 返回使用的语言
    });

  } catch (error) {
    console.error('Get surgeon detail error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
