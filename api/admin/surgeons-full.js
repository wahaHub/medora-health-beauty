import { createClient } from '@supabase/supabase-js';
import { withAuth } from '../_utils/auth.js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yamlikuqgmqiigeaqzaz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODAyMzMsImV4cCI6MjA4MjY1NjIzM30.7VJLrsFbMsFt9A0Y74KBgDbK_sUFN5kQqbpVm9JiOnc';

// 使用 global fetch 配置避免 Vercel 环境的 fetch 问题
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
});

/**
 * API: 获取所有医生完整信息（包括 images）
 * GET /api/admin/surgeons-full
 *
 * 用于 Admin 后台管理照片
 */
async function handler(req, res) {
  console.log('🔵 [surgeons-full] Request received');
  console.log('🔵 [surgeons-full] Method:', req.method);
  console.log('🔵 [surgeons-full] Headers:', JSON.stringify(req.headers));
  console.log('🔵 [surgeons-full] User from auth:', req.user);

  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    console.log('🔵 [surgeons-full] OPTIONS request, returning 200');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    console.log('🔵 [surgeons-full] Invalid method:', req.method);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('🔵 [surgeons-full] Querying Supabase...');
    // 先尝试查询包含 images 字段
    let { data: surgeons, error } = await supabase
      .from('surgeons')
      .select('id, surgeon_id, name, title, experience_years, image_url, specialties, images')
      .order('name', { ascending: true });

    console.log('🔵 [surgeons-full] Query result - error:', error, 'data count:', surgeons?.length);

    // 如果查询失败（可能是因为 images 字段不存在），尝试不查询 images 字段
    if (error) {
      console.log('⚠️ [surgeons-full] First query failed, trying without images field:', error.message);
      const fallbackQuery = await supabase
        .from('surgeons')
        .select('id, surgeon_id, name, title, experience_years, image_url, specialties')
        .order('name', { ascending: true });

      surgeons = fallbackQuery.data;
      error = fallbackQuery.error;

      console.log('🔵 [surgeons-full] Fallback query - error:', error, 'data count:', surgeons?.length);

      // 如果还是失败，抛出错误
      if (error) {
        console.error('❌ [surgeons-full] Supabase error:', error);
        throw error;
      }

      // 为每个 surgeon 添加空的 images 对象
      surgeons = surgeons.map(s => ({ ...s, images: {} }));
    }

    // 记录有图片的医生
    const surgeonsWithImages = surgeons.filter(s => s.images && Object.keys(s.images).length > 0);
    console.log('🔵 [surgeons-full] Total surgeons:', surgeons.length);
    console.log('🔵 [surgeons-full] Surgeons with images:', surgeonsWithImages.length);
    if (surgeonsWithImages.length > 0) {
      console.log('🔵 [surgeons-full] Sample surgeon with images:', surgeonsWithImages[0]);
    }

    console.log('✅ [surgeons-full] Success, returning', surgeons.length, 'surgeons');
    return res.status(200).json({
      success: true,
      surgeons: surgeons || []
    });

  } catch (error) {
    console.error('❌ [surgeons-full] Error:', error);
    console.error('❌ [surgeons-full] Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: error.toString()
    });
  }
}

export default withAuth(handler);
