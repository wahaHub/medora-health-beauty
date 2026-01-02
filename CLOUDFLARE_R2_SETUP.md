# 🖼️ Cloudflare R2 图片存储配置指南

使用 Cloudflare R2 (对象存储) + CDN 来存储和加速网站图片。

---

## 📋 什么是 Cloudflare R2？

**Cloudflare R2** = AWS S3 + CloudFront 的替代品

### 优势：
- ✅ **免费额度**: 10GB 存储免费
- ✅ **零出口费用**: 不像 AWS S3，R2 访问图片不收费
- ✅ **全球 CDN**: 自动集成 Cloudflare 全球 CDN
- ✅ **兼容 S3 API**: 可以使用 AWS SDK

### 价格：
```
存储: $0.015/GB/月 (超出免费 10GB)
A 类操作 (上传): $4.50/百万次
B 类操作 (下载): $0.36/百万次
```

**对比 AWS S3**:
- S3 出口费用: $0.09/GB
- CloudFront: 额外费用
- R2 出口: **免费** 🎉

---

## 🚀 步骤 1: 创建 R2 Bucket

### A. 启用 R2

1. 登录 Cloudflare Dashboard: https://dash.cloudflare.com
2. 左侧菜单点击 **R2**
3. 如果第一次使用，点击 **Purchase R2**
   - 免费套餐: $0/月
   - 点击 **Proceed**

### B. 创建 Bucket

1. 点击 **Create bucket**
2. 配置：
   ```
   Bucket name: medora-health-images
   Location: Automatic (推荐)
   Storage Class: Standard
   ```
3. 点击 **Create bucket**

---

## 🔑 步骤 2: 创建 API Token

### A. 生成 R2 API Token

1. 在 R2 页面，点击右上角 **Manage R2 API Tokens**
2. 点击 **Create API token**
3. 配置：
   ```
   Token name: medora-images-token
   Permissions: 
     - Object Read & Write
   TTL: Forever (或设置过期时间)
   Bucket: medora-health-images (或选择 All buckets)
   ```
4. 点击 **Create API Token**

### B. 保存凭证

**重要**: 这些信息只显示一次，立即保存！

```bash
Access Key ID: xxxxxxxxxxxxxxxxxxxx
Secret Access Key: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
Endpoint: https://xxxxxxxxxxxx.r2.cloudflarestorage.com
```

---

## 🌐 步骤 3: 配置自定义域名

### A. 绑定自定义域名

1. 进入您的 bucket: **medora-health-images**
2. 点击 **Settings** → **Public Bucket Access**
3. 点击 **Connect Domain**
4. 配置：
   ```
   Domain: images.medorahealth.com
   或者: cdn.medorahealth.com
   ```
5. 点击 **Continue**

### B. 添加 DNS 记录

Cloudflare 会自动添加 DNS 记录：
```
Type: CNAME
Name: images (或 cdn)
Target: 自动生成的 R2 地址
Proxy: Proxied (橙色云)
```

**完成后，您的图片地址将是**:
```
https://images.medorahealth.com/your-image.jpg
```

---

## 📤 步骤 4: 上传图片

### 方法 1: 使用 Web 界面（简单）

1. 进入 bucket: **medora-health-images**
2. 点击 **Upload**
3. 拖拽或选择图片
4. 点击 **Upload**

**建议目录结构**:
```
medora-health-images/
├── procedures/
│   ├── facelift-01.jpg
│   ├── rhinoplasty-01.jpg
│   └── ...
├── cases/
│   ├── case-001-before.jpg
│   ├── case-001-after.jpg
│   └── ...
├── gallery/
│   ├── face/
│   ├── body/
│   └── nonsurgical/
├── team/
│   ├── dr-zhang.jpg
│   └── ...
└── misc/
    ├── logo.png
    └── hero-bg.jpg
```

### 方法 2: 使用命令行 (rclone)

#### 安装 rclone

```bash
# macOS
brew install rclone

# 配置 rclone
rclone config
```

#### 配置步骤：

```
n) New remote
name> cloudflare-r2
Storage> s3
Provider> Cloudflare
env_auth> 1 (False)
access_key_id> [你的 Access Key ID]
secret_access_key> [你的 Secret Access Key]
region> auto
endpoint> https://[你的账户ID].r2.cloudflarestorage.com
acl> private
```

#### 上传图片：

```bash
# 上传单个文件
rclone copy image.jpg cloudflare-r2:medora-health-images/procedures/

# 上传整个文件夹
rclone copy ./images/ cloudflare-r2:medora-health-images/ --progress

# 同步文件夹（删除远程不存在的文件）
rclone sync ./images/ cloudflare-r2:medora-health-images/
```

### 方法 3: 使用 Node.js 脚本

创建 `upload-images.js`:

```javascript
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// 配置 S3 客户端（R2 兼容 S3 API）
const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  },
});

// 上传单个文件
async function uploadFile(filePath, key) {
  const fileContent = fs.readFileSync(filePath);
  const contentType = getContentType(filePath);

  const command = new PutObjectCommand({
    Bucket: 'medora-health-images',
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    console.log(`✅ Uploaded: ${key}`);
  } catch (error) {
    console.error(`❌ Error uploading ${key}:`, error);
  }
}

// 获取内容类型
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}

// 批量上传
async function uploadDirectory(dirPath, prefix = '') {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await uploadDirectory(fullPath, `${prefix}${file}/`);
    } else {
      const key = `${prefix}${file}`;
      await uploadFile(fullPath, key);
    }
  }
}

// 使用示例
uploadDirectory('./local-images', 'procedures/');
```

安装依赖：
```bash
npm install @aws-sdk/client-s3
```

运行脚本：
```bash
node upload-images.js
```

---

## 🔗 步骤 5: 在项目中使用图片

### A. 在 React 组件中使用

```tsx
// 定义 CDN 基础 URL
const CDN_URL = 'https://images.medorahealth.com';

// 使用图片
<img 
  src={`${CDN_URL}/procedures/facelift-01.jpg`} 
  alt="Facelift procedure"
  loading="lazy"
/>
```

### B. 创建图片配置文件

创建 `config/images.ts`:

```typescript
export const CDN_URL = 'https://images.medorahealth.com';

export const getImageUrl = (path: string) => {
  return `${CDN_URL}/${path}`;
};

// 预定义的图片路径
export const IMAGES = {
  procedures: {
    facelift: getImageUrl('procedures/facelift-01.jpg'),
    rhinoplasty: getImageUrl('procedures/rhinoplasty-01.jpg'),
    // ...
  },
  team: {
    drZhang: getImageUrl('team/dr-zhang.jpg'),
    // ...
  },
  logo: getImageUrl('misc/logo.png'),
};
```

使用：

```tsx
import { IMAGES, getImageUrl } from '@/config/images';

// 预定义图片
<img src={IMAGES.procedures.facelift} alt="Facelift" />

// 动态图片
<img src={getImageUrl(`cases/case-${id}-before.jpg`)} alt="Before" />
```

### C. 优化：响应式图片

使用 `srcset` 提供不同尺寸：

```tsx
<img
  src={getImageUrl('procedures/facelift-800.jpg')}
  srcSet={`
    ${getImageUrl('procedures/facelift-400.jpg')} 400w,
    ${getImageUrl('procedures/facelift-800.jpg')} 800w,
    ${getImageUrl('procedures/facelift-1200.jpg')} 1200w
  `}
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="Facelift procedure"
  loading="lazy"
/>
```

---

## 🖼️ 步骤 6: 图片优化

### A. 使用 Cloudflare Image Resizing（付费功能）

如果升级到 Pro 套餐（$20/月），可以自动调整图片大小：

```html
<img 
  src="https://images.medorahealth.com/cdn-cgi/image/width=800,quality=85,format=auto/procedures/facelift-01.jpg"
  alt="Facelift"
/>
```

参数：
- `width=800`: 宽度 800px
- `height=600`: 高度 600px
- `quality=85`: JPEG 质量
- `format=auto`: 自动选择格式（WebP/AVIF）
- `fit=cover`: 裁剪模式

### B. 本地预处理（免费方案）

在上传前使用工具优化：

**1. 使用 ImageMagick**

```bash
# 安装
brew install imagemagick

# 批量转换为 WebP
for f in *.jpg; do 
  convert "$f" -quality 85 "${f%.jpg}.webp"
done

# 批量调整大小
for f in *.jpg; do
  convert "$f" -resize 1200x1200\> "${f%.jpg}-1200.jpg"
  convert "$f" -resize 800x800\> "${f%.jpg}-800.jpg"
  convert "$f" -resize 400x400\> "${f%.jpg}-400.jpg"
done
```

**2. 使用 Node.js Sharp**

```javascript
const sharp = require('sharp');
const fs = require('fs');

async function optimizeImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(1200, 1200, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .webp({ quality: 85 })
    .toFile(outputPath);
}

// 批量处理
const images = fs.readdirSync('./input');
for (const img of images) {
  await optimizeImage(
    `./input/${img}`,
    `./output/${img.replace(/\.\w+$/, '.webp')}`
  );
}
```

---

## 🔒 步骤 7: 安全和权限

### A. 公开访问 vs 私有访问

**公开 Bucket（推荐用于网站图片）**:
```
Settings → Public access → Allow Access
```

**私有 Bucket（敏感图片）**:
```
使用 Pre-signed URLs
```

### B. 生成临时访问链接

```javascript
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function getPresignedUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: 'medora-health-images',
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

// 使用
const url = await getPresignedUrl('private/patient-photo.jpg', 7200); // 2小时
```

### C. CORS 配置

如果需要从网页直接上传：

1. R2 Dashboard → Bucket Settings → CORS
2. 添加规则：

```json
[
  {
    "AllowedOrigins": ["https://medorahealth.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 📊 步骤 8: 监控和管理

### A. 查看使用情况

```
R2 Dashboard → Overview
→ 查看存储使用量、请求次数、带宽
```

### B. 设置使用限额提醒

```
Account Home → Notifications
→ 创建通知: R2 Storage Limit Alert
```

### C. 定期清理

```bash
# 使用 rclone 清理旧文件
rclone delete cloudflare-r2:medora-health-images/temp/ --min-age 30d
```

---

## 🚀 完整工作流程示例

### 1. 设计师提供图片

```
designers/
├── procedures/
│   ├── facelift-hero.jpg (原始文件, 5MB)
│   └── rhinoplasty-hero.jpg
```

### 2. 优化图片

```bash
# 创建多个尺寸
npm run optimize-images

# 输出:
optimized/
├── procedures/
│   ├── facelift-hero-400.webp (30KB)
│   ├── facelift-hero-800.webp (80KB)
│   ├── facelift-hero-1200.webp (150KB)
│   └── facelift-hero-original.webp (500KB)
```

### 3. 上传到 R2

```bash
rclone sync ./optimized/ cloudflare-r2:medora-health-images/
```

### 4. 在代码中使用

```tsx
<picture>
  <source
    type="image/webp"
    srcSet={`
      ${CDN_URL}/procedures/facelift-hero-400.webp 400w,
      ${CDN_URL}/procedures/facelift-hero-800.webp 800w,
      ${CDN_URL}/procedures/facelift-hero-1200.webp 1200w
    `}
  />
  <img
    src={`${CDN_URL}/procedures/facelift-hero-800.webp`}
    alt="Facelift procedure"
    loading="lazy"
  />
</picture>
```

---

## 💰 成本估算

### 网站图片存储示例：

假设：
- 500 张图片
- 平均每张 200KB (优化后)
- 每月 10,000 次访问
- 每次访问查看 5 张图片

**计算**:
```
存储: 500 × 0.2MB = 100MB ≈ 0.1GB
→ 免费 (在 10GB 以内)

请求: 10,000 × 5 = 50,000 次/月
→ 免费 (在 100 万次以内)

带宽: 50,000 × 0.2MB = 10GB
→ 免费 (R2 出口不收费)

总成本: $0/月 🎉
```

**对比 AWS S3 + CloudFront**:
```
S3 存储: $0.023/GB × 0.1GB = $0.002
S3 请求: $0.0004/千次 × 50 = $0.02
CloudFront 带宽: $0.085/GB × 10GB = $0.85
总成本: $0.87/月
```

---

## ✅ 配置完成检查清单

- [ ] R2 Bucket 已创建
- [ ] API Token 已生成并保存
- [ ] 自定义域名已绑定（images.medorahealth.com）
- [ ] DNS 记录已添加
- [ ] 测试图片已上传
- [ ] 图片可以通过 CDN URL 访问
- [ ] 项目代码已更新使用 CDN URL
- [ ] 图片已优化（WebP, 多尺寸）
- [ ] 设置了使用限额提醒

---

## 🎓 最佳实践

### 1. 命名规范

```
好的命名:
- procedure-facelift-hero.jpg
- case-001-before.jpg
- team-dr-zhang-profile.jpg

不好的命名:
- IMG_1234.jpg
- photo.jpg
- new image final v2.jpg
```

### 2. 目录结构

```
medora-health-images/
├── procedures/     # 手术类型图片
├── cases/          # 案例对比图
├── team/           # 医生团队照片
├── gallery/        # 图库
├── blog/           # 博客文章图片
└── ui/             # UI 相关（logo, icons）
```

### 3. 图片格式选择

```
照片 → WebP (或 JPEG)
透明背景 → PNG (或 WebP)
矢量图 → SVG
动画 → GIF (或 WebP animated)
```

### 4. 尺寸指南

```
Hero 图片: 1920×1080 (16:9)
卡片缩略图: 400×300
详情页: 1200×900
团队照片: 800×800 (1:1)
Logo: SVG (矢量) 或 PNG (512×512)
```

---

## 📞 需要帮助？

- **Cloudflare R2 文档**: https://developers.cloudflare.com/r2/
- **AWS SDK for JavaScript**: https://docs.aws.amazon.com/sdk-for-javascript/
- **rclone 文档**: https://rclone.org/s3/#cloudflare-r2

---

**下一步**: 开始上传图片并在项目中使用！🎨

