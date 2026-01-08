import { withAuth } from '../_utils/auth.js';
import { uploadToR2 } from '../_utils/r2.js';

// Vercel Serverless 配置：禁用默认的 body 解析，因为我们要处理 multipart
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * 解析 multipart/form-data
 * 简单实现，用于处理单文件上传
 */
async function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const contentType = req.headers['content-type'];

        if (!contentType || !contentType.includes('multipart/form-data')) {
          reject(new Error('Content-Type must be multipart/form-data'));
          return;
        }

        // 提取 boundary
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        if (!boundaryMatch) {
          reject(new Error('Boundary not found'));
          return;
        }
        const boundary = boundaryMatch[1] || boundaryMatch[2];

        // 解析 multipart 数据
        const parts = parseMultipartBuffer(buffer, boundary);
        resolve(parts);
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

/**
 * 解析 multipart buffer
 */
function parseMultipartBuffer(buffer, boundary) {
  const result = { fields: {}, file: null };
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const endBoundaryBuffer = Buffer.from(`--${boundary}--`);

  let start = 0;
  let end = buffer.indexOf(boundaryBuffer, start);

  while (end !== -1) {
    start = end + boundaryBuffer.length;

    // 跳过 CRLF
    if (buffer[start] === 0x0d && buffer[start + 1] === 0x0a) {
      start += 2;
    }

    // 找下一个 boundary
    let nextBoundary = buffer.indexOf(boundaryBuffer, start);
    if (nextBoundary === -1) {
      nextBoundary = buffer.indexOf(endBoundaryBuffer, start);
    }
    if (nextBoundary === -1) break;

    // 提取这个 part
    const partBuffer = buffer.slice(start, nextBoundary - 2); // -2 去掉结尾的 CRLF

    // 解析 headers 和 body
    const headerEndIndex = partBuffer.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) {
      end = nextBoundary;
      continue;
    }

    const headerStr = partBuffer.slice(0, headerEndIndex).toString('utf8');
    const body = partBuffer.slice(headerEndIndex + 4);

    // 解析 Content-Disposition
    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    const contentTypeMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);

    if (nameMatch) {
      const name = nameMatch[1];

      if (filenameMatch) {
        // 这是文件
        result.file = {
          fieldname: name,
          originalname: filenameMatch[1],
          mimetype: contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream',
          buffer: body,
          size: body.length,
        };
      } else {
        // 这是普通字段
        result.fields[name] = body.toString('utf8');
      }
    }

    end = nextBoundary;
  }

  return result;
}

async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // 解析 multipart 数据
    const { fields, file } = await parseMultipart(req);

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const remotePath = fields.path || '';
    const customFilename = fields.filename || file.originalname;

    // 构建 R2 key
    const key = remotePath ? `${remotePath}/${customFilename}` : customFilename;

    // 上传到 R2
    const url = await uploadToR2(file.buffer, key, file.mimetype);

    return res.status(200).json({
      success: true,
      message: 'Upload successful',
      url,
      key,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export default withAuth(handler);
