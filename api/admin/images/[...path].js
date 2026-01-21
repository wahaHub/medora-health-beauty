import { withAuth } from '../../_utils/auth.js';
import { deleteFromR2 } from '../../_utils/r2.js';

/**
 * API: 删除图片（支持动态路径）
 * DELETE /api/admin/images/:path1/:path2/...
 *
 * 例如:
 * DELETE /api/admin/images/surgeons/1/hero.jpg
 * 会删除 R2 中的 surgeons/1/hero.jpg
 */
async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Vercel 将路径参数放在 req.query.path 数组中
    const pathParts = req.query.path || [];

    if (!pathParts || pathParts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Image path is required'
      });
    }

    // 重建完整的 R2 key
    const key = Array.isArray(pathParts) ? pathParts.join('/') : pathParts;

    // 从 R2 删除
    await deleteFromR2(key);

    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      key
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

export default withAuth(handler);
