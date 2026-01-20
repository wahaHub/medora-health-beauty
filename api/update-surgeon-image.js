import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yamlikuqgmqiiqeaqzaz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODAyMzMsImV4cCI6MjA4MjY1NjIzM30.7VJLrsFbMsFt9A0Y74KBgDbK_sUFN5kQqbpVm9JiOnc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * API: 更新医生照片 URL
 * POST /api/update-surgeon-image
 *
 * Body: {
 *   surgeonId: string,
 *   slot: 'hero' | 'certification' | 'with_patients',
 *   imageUrl: string
 * }
 */
export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { surgeonId, slot, imageUrl } = req.body;

    if (!surgeonId || !slot) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: surgeonId, slot'
      });
    }

    // 验证 slot 值
    const validSlots = ['hero', 'certification', 'with_patients'];
    if (!validSlots.includes(slot)) {
      return res.status(400).json({
        success: false,
        message: `Invalid slot. Must be one of: ${validSlots.join(', ')}`
      });
    }

    // 先获取当前的 images
    const { data: surgeon, error: fetchError } = await supabase
      .from('surgeons')
      .select('images')
      .eq('id', surgeonId)
      .single();

    if (fetchError) {
      console.error('Fetch surgeon error:', fetchError);
      throw fetchError;
    }

    // 更新 images JSONB
    const currentImages = surgeon.images || {};

    if (imageUrl) {
      currentImages[slot] = imageUrl;
    } else {
      delete currentImages[slot];
    }

    // 更新到数据库
    const { error: updateError } = await supabase
      .from('surgeons')
      .update({ images: currentImages })
      .eq('id', surgeonId);

    if (updateError) {
      console.error('Update surgeon error:', updateError);
      throw updateError;
    }

    return res.status(200).json({
      success: true,
      message: 'Image updated successfully',
      images: currentImages
    });

  } catch (error) {
    console.error('Update surgeon image error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
