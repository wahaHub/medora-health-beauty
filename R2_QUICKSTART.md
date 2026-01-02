# ⚡ Cloudflare R2 快速开始（5分钟）

快速配置 Cloudflare R2 来存储网站图片。

---

## 🎯 简化版流程

### 步骤 1: 创建 R2 Bucket（2分钟）

1. 访问: https://dash.cloudflare.com
2. 左侧点击 **R2**
3. 点击 **Create bucket**
4. 配置：
   ```
   Name: medora-health-images
   Location: Automatic
   ```
5. 点击 **Create bucket**

### 步骤 2: 绑定自定义域名（2分钟）

1. 进入刚创建的 bucket
2. **Settings** → **Public bucket**
3. 点击 **Connect domain**
4. 输入：`images.medorahealth.com`
5. 点击 **Continue**

**完成！** DNS 会自动配置。

### 步骤 3: 上传图片（1分钟）

**方法 A: 使用 Web 界面（最简单）**

1. 在 R2 Dashboard 进入 bucket
2. 点击 **Upload**
3. 拖拽图片
4. 点击 **Upload**

**方法 B: 使用上传脚本**

```bash
# 1. 安装依赖
npm install @aws-sdk/client-s3

# 2. 编辑 upload-to-r2.js，填入凭证
# 获取凭证: R2 → Manage R2 API Tokens → Create API token

# 3. 上传图片
node upload-to-r2.js upload ./my-images/ procedures/
```

### 步骤 4: 在代码中使用

```typescript
// 在组件中使用
const CDN_URL = 'https://images.medorahealth.com';

<img 
  src={`${CDN_URL}/procedures/facelift.jpg`} 
  alt="Facelift"
  loading="lazy"
/>
```

---

## 📁 推荐的目录结构

```
medora-health-images/
├── procedures/        # 手术类型图片
│   ├── facelift.jpg
│   ├── rhinoplasty.jpg
│   └── ...
├── cases/            # 案例对比图
│   ├── case-001-before.jpg
│   ├── case-001-after.jpg
│   └── ...
├── team/             # 医生照片
│   ├── dr-zhang.jpg
│   └── ...
├── gallery/          # Gallery 图片
│   ├── face/
│   ├── body/
│   └── nonsurgical/
└── ui/               # Logo, favicon
    ├── logo.png
    └── favicon.ico
```

---

## 🖼️ 图片优化建议

### 上传前优化：

**1. 格式转换**
```bash
# 转换为 WebP（更小的文件）
for f in *.jpg; do 
  convert "$f" "${f%.jpg}.webp"
done
```

**2. 调整大小**
```bash
# 创建多个尺寸
convert input.jpg -resize 400x400 output-400.jpg
convert input.jpg -resize 800x800 output-800.jpg
convert input.jpg -resize 1200x1200 output-1200.jpg
```

**3. 压缩质量**
```bash
# JPEG 压缩
convert input.jpg -quality 85 output.jpg

# WebP 压缩
cwebp -q 85 input.jpg -o output.webp
```

---

## 💰 费用估算

**免费额度**:
- 存储: 10GB
- 每月 100 万次请求
- 无限出口流量 🎉

**一般网站使用**（500 张图片，每月 1 万访问）:
```
存储: ~0.1GB → 免费
请求: ~5 万次 → 免费
带宽: ~10GB → 免费
总成本: $0/月
```

---

## ✅ 使用配置文件（推荐）

我已经创建了 `config/images.ts`，使用方式：

```typescript
import { IMAGES, getImageUrl } from '@/config/images';

// 预定义的图片
<img src={IMAGES.procedures.facelift} alt="Facelift" />

// 动态图片
<img src={getImageUrl('procedures/rhinoplasty.jpg')} alt="Rhinoplasty" />

// 案例图片
<img src={IMAGES.cases.getBefore(1)} alt="Before" />
<img src={IMAGES.cases.getAfter(1)} alt="After" />
```

---

## 🆘 常见问题

**Q: 图片无法访问？**
- 检查域名是否绑定成功（DNS 需要几分钟）
- 确认 bucket 设置为 public access

**Q: 需要 API Token 做什么？**
- 只有使用脚本上传时需要
- Web 界面上传不需要 Token

**Q: 可以上传视频吗？**
- 可以，R2 支持任何文件类型
- 建议视频放在专门的 `videos/` 目录

**Q: 如何删除图片？**
- 在 R2 Dashboard 选中文件点击 Delete
- 或使用脚本（参考完整文档）

---

## 📚 完整文档

查看详细配置：`CLOUDFLARE_R2_SETUP.md`

---

**预计配置时间**: 5-10 分钟 ⏱️  
**费用**: $0（免费套餐）💰

