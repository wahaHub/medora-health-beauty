import { withAuth } from '../_utils/auth.js';
import { listImages } from '../_utils/r2.js';

async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const prefix = req.query.prefix || '';
    const images = await listImages(prefix);

    return res.status(200).json({
      success: true,
      images
    });
  } catch (error) {
    console.error('List images error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export default withAuth(handler);
