import { withAuth } from '../_utils/auth.js';
import { deleteFromR2 } from '../_utils/r2.js';

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
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ success: false, message: 'Key is required' });
    }

    await deleteFromR2(key);

    return res.status(200).json({
      success: true,
      message: 'Delete successful',
      key
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export default withAuth(handler);
