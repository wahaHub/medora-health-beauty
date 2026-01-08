import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'medora-admin-jwt-secret-change-me';

/**
 * 验证 JWT token
 * @param {string} token - JWT token
 * @returns {object|null} - 解码后的 payload 或 null
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * 从请求中提取并验证 token
 * @param {object} req - 请求对象
 * @returns {object|null} - 解码后的 payload 或 null
 */
export function authenticateRequest(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

/**
 * 认证中间件包装器
 * @param {function} handler - API 处理函数
 * @returns {function} - 包装后的处理函数
 */
export function withAuth(handler) {
  return async (req, res) => {
    const user = authenticateRequest(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or missing token'
      });
    }

    req.user = user;
    return handler(req, res);
  };
}
