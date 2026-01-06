#!/usr/bin/env node

/**
 * Admin Console 后端服务器
 * 提供图片上传到 Cloudflare R2 的管理界面
 */

import express from 'express';
import multer from 'multer';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// Supabase 客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== 配置 ====================

const PORT = process.env.ADMIN_PORT || 5000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'medora-admin-secret-key-change-me';

const R2_CONFIG = {
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME || 'medora-images',
  publicUrl: process.env.R2_PUBLIC_URL || '',
};

// 验证配置
if (!R2_CONFIG.accountId || !R2_CONFIG.accessKeyId || !R2_CONFIG.secretAccessKey) {
  console.error('❌ 错误: 请在 .env 文件中配置 R2 凭证！');
  console.error('需要的变量: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL');
  process.exit(1);
}

// ==================== S3 客户端 ====================

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
});

// ==================== Express 应用 ====================

const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24小时
}));

// 静态文件
app.use('/admin', express.static(path.join(__dirname, 'public')));

// 上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件！'));
    }
  }
});

// ==================== 认证中间件 ====================

function requireAuth(req, res, next) {
  console.log('🔐 Auth Check:', {
    sessionID: req.sessionID,
    authenticated: req.session.authenticated,
    session: req.session
  });

  if (req.session.authenticated) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}

// ==================== 路由 ====================

// 登录页面
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 管理后台
app.get('/admin', (req, res) => {
  if (!req.session.authenticated) {
    return res.redirect('/admin/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard-new.html'));
});

// 登录 API
app.post('/admin/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    req.session.username = username;
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// 登出 API
app.post('/admin/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// 上传图片 API
app.post('/admin/api/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const remotePath = req.body.path || '';
    const customFilename = req.body.filename || file.originalname; // 支持自定义文件名

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // 构建 R2 key - 支持自定义文件名
    const key = remotePath ? `${remotePath}/${customFilename}` : customFilename;

    // 读取文件
    const fileContent = fs.readFileSync(file.path);

    // 上传到 R2
    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
      Body: fileContent,
      ContentType: file.mimetype,
      CacheControl: 'public, max-age=31536000',
    });

    await s3Client.send(command);

    // 删除临时文件
    fs.unlinkSync(file.path);

    // 返回 URL
    const url = `${R2_CONFIG.publicUrl}/${key}`;

    res.json({
      success: true,
      message: 'Upload successful',
      url,
      key,
      size: file.size,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 列出图片 API
app.get('/admin/api/images', requireAuth, async (req, res) => {
  try {
    const prefix = req.query.prefix || '';
    
    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.bucketName,
      Prefix: prefix,
      MaxKeys: 1000,
    });

    const response = await s3Client.send(command);
    
    const images = (response.Contents || []).map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      url: `${R2_CONFIG.publicUrl}/${item.Key}`,
    }));

    res.json({ success: true, images });
    
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除图片 API
app.delete('/admin/api/images/:key(*)', requireAuth, async (req, res) => {
  try {
    const key = req.params.key;
    
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: key,
    });

    await s3Client.send(command);
    
    res.json({ success: true, message: 'Image deleted' });
    
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取医生列表
app.get('/admin/api/surgeons', requireAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.json({ success: false, message: 'Supabase not configured', surgeons: [] });
    }

    const { data, error } = await supabase
      .from('surgeons')
      .select('id, name, title, specialty, image_url')
      .order('name');

    if (error) throw error;

    // 为每个医生添加图片计数（简化版，实际可能需要查询关联表）
    const surgeons = (data || []).map(surgeon => ({
      ...surgeon,
      imageCount: surgeon.image_url ? 1 : 0,
    }));

    res.json({ success: true, surgeons });
  } catch (error) {
    console.error('Error fetching surgeons:', error);
    res.json({ success: false, message: error.message, surgeons: [] });
  }
});

// 获取手术项目列表
app.get('/admin/api/procedures', requireAuth, async (req, res) => {
  try {
    if (!supabase) {
      return res.json({ success: false, message: 'Supabase not configured', procedures: [] });
    }

    const { data, error } = await supabase
      .from('procedures')
      .select('id, name, category, description')
      .eq('language_code', 'en')
      .order('name');

    if (error) throw error;

    // 为每个项目添加图片计数
    const procedures = (data || []).map(proc => ({
      ...proc,
      imageCount: 0, // TODO: 从实际的图片表中计数
    }));

    res.json({ success: true, procedures });
  } catch (error) {
    console.error('Error fetching procedures:', error);
    res.json({ success: false, message: error.message, procedures: [] });
  }
});

// 健康检查
app.get('/admin/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    authenticated: !!req.session.authenticated,
    bucket: R2_CONFIG.bucketName,
    publicUrl: R2_CONFIG.publicUrl,
    supabase: !!supabase,
  });
});

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
  console.log('\n🚀 Admin Console 启动成功！\n');
  console.log(`📊 管理后台: http://localhost:${PORT}/admin`);
  console.log(`🔐 登录页面: http://localhost:${PORT}/admin/login`);
  console.log(`\n🔑 登录凭证:`);
  console.log(`   用户名: ${ADMIN_USERNAME}`);
  console.log(`   密码: ${ADMIN_PASSWORD}`);
  console.log(`\n💾 R2 Bucket: ${R2_CONFIG.bucketName}`);
  console.log(`🌐 公开 URL: ${R2_CONFIG.publicUrl}\n`);
  console.log('按 Ctrl+C 停止服务器\n');
});

