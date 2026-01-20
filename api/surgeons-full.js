import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yamlikuqgmqiiqeaqzaz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODAyMzMsImV4cCI6MjA4MjY1NjIzM30.7VJLrsFbMsFt9A0Y74KBgDbK_sUFN5kQqbpVm9JiOnc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * API: 获取所有医生完整信息（包括 images）
 * GET /api/surgeons-full
 *
 * 用于 Admin 后台管理照片
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
    // 获取所有医生信息，包括 images JSONB 字段
    const { data: surgeons, error } = await supabase
      .from('surgeons')
      .select('id, surgeon_id, name, title, experience_years, image_url, specialties, images')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return res.status(200).json({
      success: true,
      surgeons: surgeons || []
    });

  } catch (error) {
    console.error('Get surgeons-full error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
