import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2_CONFIG = {
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME || 'medora-images',
  publicUrl: process.env.R2_PUBLIC_URL || '',
};

let s3Client = null;

/**
 * 获取 S3 客户端实例（懒加载）
 */
export function getS3Client() {
  if (!s3Client) {
    if (!R2_CONFIG.accountId || !R2_CONFIG.accessKeyId || !R2_CONFIG.secretAccessKey) {
      throw new Error('R2 credentials not configured');
    }

    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_CONFIG.accessKeyId,
        secretAccessKey: R2_CONFIG.secretAccessKey,
      },
    });
  }

  return s3Client;
}

/**
 * 上传文件到 R2
 * @param {Buffer} fileBuffer - 文件内容
 * @param {string} key - R2 对象 key
 * @param {string} contentType - MIME 类型
 * @returns {Promise<string>} - 公开 URL
 */
export async function uploadToR2(fileBuffer, key, contentType) {
  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: R2_CONFIG.bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  });

  await client.send(command);

  return `${R2_CONFIG.publicUrl}/${key}`;
}

/**
 * 列出 R2 中的图片
 * @param {string} prefix - 路径前缀
 * @returns {Promise<Array>} - 图片列表
 */
export async function listImages(prefix = '') {
  const client = getS3Client();

  const command = new ListObjectsV2Command({
    Bucket: R2_CONFIG.bucketName,
    Prefix: prefix,
  });

  const response = await client.send(command);

  if (!response.Contents) {
    return [];
  }

  return response.Contents
    .filter(item => !item.Key.endsWith('/'))
    .map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      url: `${R2_CONFIG.publicUrl}/${item.Key}`,
    }));
}

/**
 * 删除 R2 中的图片
 * @param {string} key - R2 对象 key
 */
export async function deleteFromR2(key) {
  const client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: R2_CONFIG.bucketName,
    Key: key,
  });

  await client.send(command);
}

export { R2_CONFIG };
