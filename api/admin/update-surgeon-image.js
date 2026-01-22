import { createClient } from '@supabase/supabase-js';
import { withAuth } from '../_utils/auth.js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yamlikuqgmqiigeaqzaz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODAyMzMsImV4cCI6MjA4MjY1NjIzM30.7VJLrsFbMsFt9A0Y74KBgDbK_sUFN5kQqbpVm9JiOnc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * API: 更新医生照片 URL
 * POST /api/admin/update-surgeon-image
 *
 * Body: {
 *   surgeonId: string,
 *   slot: 'hero' | 'certification' | 'with_patients',
 *   imageUrl: string
 * }
 */
async function handler(req, res) {
  console.log('🟢 [update-surgeon-image] Request received');
  console.log('🟢 [update-surgeon-image] Method:', req.method);
  console.log('🟢 [update-surgeon-image] Headers:', JSON.stringify(req.headers));
  console.log('🟢 [update-surgeon-image] User from auth:', req.user);
  console.log('🟢 [update-surgeon-image] Body:', JSON.stringify(req.body));

  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    console.log('🟢 [update-surgeon-image] OPTIONS request, returning 200');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('🟢 [update-surgeon-image] Invalid method:', req.method);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { surgeonId, slot, imageUrl } = req.body;
    console.log('🟢 [update-surgeon-image] Parsed params:', { surgeonId, slot, imageUrl });

    if (!surgeonId || !slot) {
      console.log('🟢 [update-surgeon-image] Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: surgeonId, slot'
      });
    }

    // 验证 slot 值
    const validSlots = ['hero', 'certification', 'with_patients'];
    if (!validSlots.includes(slot)) {
      console.log('🟢 [update-surgeon-image] Invalid slot:', slot);
      return res.status(400).json({
        success: false,
        message: `Invalid slot. Must be one of: ${validSlots.join(', ')}`
      });
    }

    console.log('🟢 [update-surgeon-image] Fetching current surgeon...');
    // 先获取当前的 images - 支持使用 surgeon_id (slug) 或 id (UUID)
    const { data: surgeon, error: fetchError } = await supabase
      .from('surgeons')
      .select('id, images')
      .eq('surgeon_id', surgeonId)
      .single();

    console.log('🟢 [update-surgeon-image] Fetch result - error:', fetchError, 'data:', surgeon);

    if (fetchError) {
      console.error('❌ [update-surgeon-image] Fetch surgeon error:', fetchError);
      throw fetchError;
    }

    // 更新 images JSONB
    const currentImages = surgeon.images || {};
    console.log('🟢 [update-surgeon-image] Current images:', currentImages);

    if (imageUrl) {
      currentImages[slot] = imageUrl;
      console.log('🟢 [update-surgeon-image] Adding image to slot:', slot);
    } else {
      delete currentImages[slot];
      console.log('🟢 [update-surgeon-image] Deleting image from slot:', slot);
    }
    console.log('🟢 [update-surgeon-image] Updated images:', currentImages);

    console.log('🟢 [update-surgeon-image] Updating database...');
    // 更新到数据库 - 使用正确的 UUID
    const { error: updateError } = await supabase
      .from('surgeons')
      .update({ images: currentImages })
      .eq('id', surgeon.id);

    console.log('🟢 [update-surgeon-image] Update result - error:', updateError);

    if (updateError) {
      console.error('❌ [update-surgeon-image] Update surgeon error:', updateError);
      throw updateError;
    }

    console.log('✅ [update-surgeon-image] Success');
    return res.status(200).json({
      success: true,
      message: 'Image updated successfully',
      images: currentImages
    });

  } catch (error) {
    console.error('❌ [update-surgeon-image] Error:', error);
    console.error('❌ [update-surgeon-image] Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

export default withAuth(handler);
