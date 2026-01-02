#!/usr/bin/env node

/**
 * Cloudflare R2 图片上传脚本
 * 
 * 使用方法:
 * 1. 安装依赖: npm install @aws-sdk/client-s3
 * 2. 配置下方的凭证信息
 * 3. 运行: node upload-to-r2.js
 */

const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// ==================== 配置区 ====================
// 从 Cloudflare R2 Dashboard 获取这些信息

const R2_CONFIG = {
  accountId: 'YOUR_ACCOUNT_ID',          // 替换为你的 Account ID
  accessKeyId: 'YOUR_ACCESS_KEY_ID',      // 替换为你的 Access Key
  secretAccessKey: 'YOUR_SECRET_KEY',     // 替换为你的 Secret Key
  bucketName: 'medora-health-images',     // Bucket 名称
};

// ==================== 初始化 S3 客户端 ====================

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
});

// ==================== 工具函数 ====================

// 获取文件的 Content-Type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
  };
  return types[ext] || 'application/octet-stream';
}

// 上传单个文件
async function uploadFile(localPath, remotePath) {
  try {
    const fileContent = fs.readFileSync(localPath);
    const contentType = getContentType(localPath);
    const fileSize = fs.statSync(localPath).size;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);

    console.log(`📤 Uploading: ${remotePath} (${fileSizeMB} MB)`);

    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: remotePath,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 缓存 1 年
    });

    await s3Client.send(command);
    console.log(`✅ Success: ${remotePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${remotePath}`, error.message);
    return false;
  }
}

// 递归上传目录
async function uploadDirectory(localDir, remotePrefix = '') {
  const files = fs.readdirSync(localDir);
  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const localPath = path.join(localDir, file);
    const remotePath = remotePrefix ? `${remotePrefix}/${file}` : file;
    const stat = fs.statSync(localPath);

    if (stat.isDirectory()) {
      // 递归上传子目录
      const result = await uploadDirectory(localPath, remotePath);
      successCount += result.success;
      failCount += result.fail;
    } else {
      // 上传文件
      const success = await uploadFile(localPath, remotePath);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }
  }

  return { success: successCount, fail: failCount };
}

// 列出 Bucket 中的所有文件
async function listFiles(prefix = '') {
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.bucketName,
      Prefix: prefix,
      MaxKeys: 1000,
    });

    const response = await s3Client.send(command);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log(`\n📋 Files in bucket (prefix: ${prefix || 'root'}):\n`);
      response.Contents.forEach(item => {
        const sizeMB = (item.Size / 1024 / 1024).toFixed(2);
        console.log(`  - ${item.Key} (${sizeMB} MB)`);
      });
      console.log(`\nTotal: ${response.Contents.length} files`);
    } else {
      console.log('📭 No files found');
    }
  } catch (error) {
    console.error('❌ Error listing files:', error.message);
  }
}

// ==================== 主函数 ====================

async function main() {
  console.log('🚀 Cloudflare R2 Upload Tool\n');
  console.log(`Bucket: ${R2_CONFIG.bucketName}`);
  console.log(`Account: ${R2_CONFIG.accountId}\n`);

  // 检查配置
  if (R2_CONFIG.accountId === 'YOUR_ACCOUNT_ID') {
    console.error('❌ Error: Please configure R2_CONFIG with your credentials!');
    console.log('\nSteps:');
    console.log('1. Go to Cloudflare Dashboard → R2');
    console.log('2. Create API token and get credentials');
    console.log('3. Edit this file and replace YOUR_ACCOUNT_ID, YOUR_ACCESS_KEY_ID, YOUR_SECRET_KEY');
    process.exit(1);
  }

  // 获取命令行参数
  const args = process.argv.slice(2);
  const command = args[0];
  const param1 = args[1];
  const param2 = args[2];

  switch (command) {
    case 'upload':
      if (!param1) {
        console.log('Usage: node upload-to-r2.js upload <local-path> [remote-path]');
        console.log('\nExamples:');
        console.log('  node upload-to-r2.js upload ./images/photo.jpg procedures/photo.jpg');
        console.log('  node upload-to-r2.js upload ./images/ procedures/');
        process.exit(1);
      }

      const localPath = param1;
      const remotePath = param2 || path.basename(param1);

      if (!fs.existsSync(localPath)) {
        console.error(`❌ Error: ${localPath} does not exist`);
        process.exit(1);
      }

      const stat = fs.statSync(localPath);
      
      if (stat.isDirectory()) {
        console.log(`📁 Uploading directory: ${localPath}\n`);
        const result = await uploadDirectory(localPath, remotePath);
        console.log(`\n✅ Upload complete!`);
        console.log(`Success: ${result.success} files`);
        console.log(`Failed: ${result.fail} files`);
      } else {
        console.log(`📄 Uploading file: ${localPath}\n`);
        await uploadFile(localPath, remotePath);
      }
      break;

    case 'list':
      const prefix = param1 || '';
      await listFiles(prefix);
      break;

    case 'help':
    default:
      console.log('Commands:');
      console.log('  upload <local> [remote]  - Upload file or directory');
      console.log('  list [prefix]            - List files in bucket');
      console.log('  help                     - Show this help\n');
      console.log('Examples:');
      console.log('  node upload-to-r2.js upload ./images/logo.png ui/logo.png');
      console.log('  node upload-to-r2.js upload ./images procedures');
      console.log('  node upload-to-r2.js list procedures');
      break;
  }
}

// 运行
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

