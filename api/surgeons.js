import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yamlikuqgmqiigeaqzaz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODAyMzMsImV4cCI6MjA4MjY1NjIzM30.7VJLrsFbMsFt9A0Y74KBgDbK_sUFN5kQqbpVm9JiOnc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * API: 获取所有医生及其科室分类
 * GET /api/surgeons
 *
 * 返回格式：
 * {
 *   success: true,
 *   data: {
 *     surgeonsBySpecialty: {
 *       "Facial Plastic Surgery": [{ surgeon_id, name, title, image_url, specialties }],
 *       "Body Contouring": [...]
 *     },
 *     allSpecialties: ["Facial Plastic Surgery", "Body Contouring", ...],
 *     totalSurgeons: 50
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

  try {
    // 获取所有医生的基本信息
    const { data: surgeons, error } = await supabase
      .from('surgeons')
      .select('surgeon_id, name, title, image_url, images, specialties, experience_years')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    if (!surgeons || surgeons.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          surgeonsBySpecialty: {},
          allSpecialties: [],
          totalSurgeons: 0
        }
      });
    }

    // 按科室分类医生
    const surgeonsBySpecialty = {};
    const specialtySet = new Set();

    surgeons.forEach(surgeon => {
      // 处理 specialties JSONB 字段
      const specialties = Array.isArray(surgeon.specialties) ? surgeon.specialties : [];

      // 为每个专长创建分类
      specialties.forEach(specialty => {
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
          experience_years: surgeon.experience_years
        });
      });
    });

    // 转换 Set 为数组并排序
    const allSpecialties = Array.from(specialtySet).sort();

    return res.status(200).json({
      success: true,
      data: {
        surgeonsBySpecialty,
        allSpecialties,
        totalSurgeons: surgeons.length
      }
    });

  } catch (error) {
    console.error('Get surgeons error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
