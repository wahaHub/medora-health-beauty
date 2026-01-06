# 📸 手术项目图片管理系统使用指南

## 🎯 系统概述

这是一个简单高效的图片管理系统，支持 **100+ 医美手术项目** 的图片上传和管理。

### 支持的手术分类

1. **Face & Neck (面部颈部)** - 50+ 项目
   - Brow Lift, Facelift, Rhinoplasty, Eyelid Surgery 等

2. **Body Contouring (身体塑形)** - 40+ 项目
   - Liposuction, Tummy Tuck, Breast Augmentation, BBL 等

3. **Non-Surgical (非手术)** - 30+ 项目
   - BOTOX®, Dermal Fillers, Laser Treatments 等

---

## 🚀 快速开始

### 1. 启动 Admin Console

```bash
# 确保已配置 .env 文件中的 R2 凭证
npm run admin
```

访问: http://localhost:5000/admin

### 2. 访问 Procedures Manager

登录后，点击侧边栏 **"Procedures"** 或直接访问:
http://localhost:5000/admin/procedures-manager.html

### 3. 选择手术项目

- 使用分类标签筛选 (Face / Body / Non-Surgical)
- 或使用搜索框查找特定项目
- 点击项目卡片进入图片管理页面

### 4. 上传图片

每个手术项目支持以下图片槽位:

- **Hero Banner** (1张) - 主页横幅图
- **Before & After** (10组) - 术前术后对比图
- **Detail Images** (8张) - 详细展示图
- **Gallery** (20张) - 案例图库

---

## 📁 R2 路径命名规范

### 自动命名规则

上传的图片会自动按以下规则存储在 R2:

```
medora-images/
└── procedures/
    └── {procedure-slug}/
        ├── hero.jpg                    # Hero 图片
        ├── before-1.jpg                # Before/After 对比图
        ├── after-1.jpg
        ├── before-2.jpg
        ├── after-2.jpg
        ├── ...
        ├── detail-1.jpg                # 详情图
        ├── detail-2.jpg
        ├── ...
        ├── gallery-1.jpg               # 图库
        ├── gallery-2.jpg
        └── ...
```

### Slug 转换示例

手术名称会自动转换为 URL 友好的 slug:

| 手术名称 | Slug |
|---------|------|
| Facelift | `facelift` |
| Rhinoplasty | `rhinoplasty` |
| Breast Augmentation | `breast-augmentation` |
| BOTOX® & Neurotoxins | `botox-neurotoxins` |
| Brazilian Butt Lift (BBL) | `brazilian-butt-lift-bbl` |

---

## 🖼️ 图片规格建议

| 图片类型 | 推荐尺寸 | 用途 |
|---------|---------|------|
| Hero Banner | 1920x1080 | 手术页面主图 |
| Before/After | 800x800 | 对比图（正方形） |
| Detail | 1200x800 | 手术细节展示 |
| Gallery | 800x600 | 案例图库 |

### 文件格式

- 支持: JPG, PNG, WebP
- 最大文件: 10MB
- 建议: 优化后的 JPG (质量 80-90%)

---

## 💻 前端使用方法

### 方法 1: 直接使用 R2 URL

```typescript
// 在官网代码中引用图片
const r2PublicUrl = 'https://pub-xxxxx.r2.dev';

// Hero 图片
<img src={`${r2PublicUrl}/procedures/facelift/hero.jpg`} alt="Facelift" />

// Before/After 对比图
<div className="before-after">
  <img src={`${r2PublicUrl}/procedures/facelift/before-1.jpg`} />
  <img src={`${r2PublicUrl}/procedures/facelift/after-1.jpg`} />
</div>

// Gallery
{[1, 2, 3, 4, 5].map(i => (
  <img key={i} src={`${r2PublicUrl}/procedures/facelift/gallery-${i}.jpg`} />
))}
```

### 方法 2: 使用辅助函数

```typescript
// config/images.ts
import { createSlug } from '../admin/procedures-categories.js';

export function getProcedureImageUrl(
  procedureName: string,
  slotType: 'hero' | 'before' | 'after' | 'detail' | 'gallery',
  index?: number
): string {
  const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
  const slug = createSlug(procedureName);

  let filename = slotType;
  if (index !== undefined) {
    filename = `${slotType}-${index}`;
  }

  return `${r2PublicUrl}/procedures/${slug}/${filename}.jpg`;
}

// 使用示例
import { getProcedureImageUrl } from '@/config/images';

// Hero
<img src={getProcedureImageUrl('Facelift', 'hero')} />

// Before/After
<img src={getProcedureImageUrl('Facelift', 'before', 1)} />
<img src={getProcedureImageUrl('Facelift', 'after', 1)} />

// Gallery
<img src={getProcedureImageUrl('Facelift', 'gallery', 3)} />
```

### 方法 3: 批量加载（推荐）

```typescript
// hooks/useProcedureImages.ts
export function useProcedureImages(procedureName: string) {
  const slug = createSlug(procedureName);
  const baseUrl = `${R2_PUBLIC_URL}/procedures/${slug}`;

  return {
    hero: `${baseUrl}/hero.jpg`,
    beforeAfter: Array.from({ length: 10 }, (_, i) => ({
      before: `${baseUrl}/before-${i + 1}.jpg`,
      after: `${baseUrl}/after-${i + 1}.jpg`,
    })),
    details: Array.from({ length: 8 }, (_, i) =>
      `${baseUrl}/detail-${i + 1}.jpg`
    ),
    gallery: Array.from({ length: 20 }, (_, i) =>
      `${baseUrl}/gallery-${i + 1}.jpg`
    ),
  };
}

// 组件中使用
function ProcedurePage({ procedureName }: { procedureName: string }) {
  const images = useProcedureImages(procedureName);

  return (
    <div>
      <img src={images.hero} alt={procedureName} />

      <div className="before-after-grid">
        {images.beforeAfter.map((pair, i) => (
          <BeforeAfterCard key={i} before={pair.before} after={pair.after} />
        ))}
      </div>

      <Gallery images={images.gallery} />
    </div>
  );
}
```

---

## 🔄 图片更新流程

### 替换现有图片

1. 进入对应手术项目的管理页面
2. 找到要替换的图片槽位
3. 点击图片，选择新文件上传
4. 系统会自动覆盖原图片（相同文件名）
5. 前端会立即显示新图片（可能需要清除浏览器缓存）

### 删除图片

1. 悬停在已上传的图片上
2. 点击 🗑️ 删除按钮
3. 确认删除
4. 槽位变回空白状态

---

## 📊 完整的手术项目列表

### Face & Neck (50+ 项目)

<details>
<summary>点击展开</summary>

**Face & Neck Procedures**
- Brow Lift
- Temples Lift / Temporofrontal Lift
- Forehead Reduction Surgery
- Eyelid Surgery
- Facelift
- Midface Lift (Mid Facelift)
- Mini Facelift
- Neck Lift
- Deep Neck Contouring
- Neck Liposuction
- Platysmaplasty
- Cervicoplasty
- Otoplasty (Ear Pinning)
- Rhinoplasty
- Revision Rhinoplasty
- Nose Tip Refinement
- Mohs Skin Cancer Reconstruction

**Facial Contouring & Implants**
- Cheek Augmentation
- Chin Augmentation
- Jawline Contouring
- Zygomatic Arch Contouring
- Facial Implants
- Submalar Implants
- Buccal Fat Removal

**Injectables & Regenerative**
- Facial Injectables
- BOTOX® & Neurotoxins
- Dermal Fillers
- Lip Filler
- Lip Injections
- Fat Dissolving Injections
- Fat Transfer (Facial Fat Grafting)
- Facial Rejuvenation with PRP

**Lips**
- Lip Augmentation
- Lip Lift

**Skin Tightening & Resurfacing**
- Neck Tightening
- Renuvion® Skin Tightening Treatment
- Skin Resurfacing
- Microdermabrasion
- Laser Liposuction

**Hair**
- Hair Restoration

</details>

### Body Contouring (40+ 项目)

<details>
<summary>点击展开</summary>

**Core Body Contouring**
- Liposuction
- Tummy Tuck
- Mommy Makeover
- Scar Reduction & Revision
- Renuvion® Skin Tightening Treatment
- Weight Loss Injections

**Arms / Legs / Back**
- Arm Lift
- Thigh Lift
- Bra Line Back Lift

**After Weight Loss / Body Lifts**
- Body Contouring After Weight Loss
- Lower Body Lift / 360 Body Lift
- Upper Body Lift
- Panniculectomy
- Mons Pubis Reduction / Lift

**Breast / Chest**
- Breast Augmentation
- Breast Lift
- Breast Reduction
- Breast Implant Removal / Exchange & Revision
- Gynecomastia Surgery

**Buttocks**
- Brazilian Butt Lift (BBL)
- Buttock Lift

**Intimate**
- Labiaplasty

**Cellulite**
- Avéli® Cellulite Treatment

</details>

### Non-Surgical (30+ 项目)

<details>
<summary>点击展开</summary>

**Injectables**
- BOTOX® Cosmetic
- BOTOX® & Neurotoxins
- Dermal Fillers
- Lip Injections
- Lip Filler

**Cellulite**
- Avéli® Cellulite Treatment

**Skin Tightening**
- Non-surgical Skin Tightening

**Resurfacing / Skin Renewal**
- Chemical Peels
- Skin Resurfacing
- Laser Skin Resurfacing
- Microdermabrasion

**Light / Laser-Based Skin Treatments**
- IPL / Photofacial

**Hair Removal**
- Laser Hair Removal

**Collagen / Regenerative**
- Collagen Stimulators / Non-HA Fillers
- Microneedling
- PRP / PRF

</details>

---

## ❓ 常见问题

### Q: 图片上传后前端看不到怎么办？

A: 可能是浏览器缓存问题，尝试:
1. 硬刷新页面 (Cmd+Shift+R 或 Ctrl+F5)
2. 检查 R2 公开 URL 是否配置正确
3. 在 R2 Dashboard 中确认文件已上传成功

### Q: 如何批量上传多张图片？

A: 目前需要逐个上传。如需批量上传，可以:
1. 直接在 Cloudflare R2 Dashboard 中批量上传
2. 确保文件名符合命名规范 (如 `before-1.jpg`, `after-1.jpg`)

### Q: 可以上传视频吗？

A: 当前系统仅支持图片。视频建议上传到其他平台（如 YouTube, Vimeo）然后嵌入链接。

### Q: 图片会自动压缩优化吗？

A: 当前不会。建议在上传前使用工具（如 TinyPNG, ImageOptim）优化图片。

### Q: 如何为图片添加 alt text 和 caption？

A: 当前版本仅存储图片文件。alt text 和 caption 建议在前端代码中硬编码或存储在 CMS 系统中。

---

## 🔒 安全注意事项

1. **不要提交敏感凭证到 Git**
   - `.env` 文件已在 `.gitignore` 中
   - R2 API Token 仅在服务器端使用

2. **生产环境建议**
   - 使用 HTTPS
   - 添加 IP 白名单
   - 定期更换 Admin 密码
   - 启用操作日志

3. **图片审核**
   - 确保上传的图片符合医疗行业规范
   - 患者照片需获得授权
   - 避免上传包含个人信息的图片

---

## 📞 技术支持

遇到问题？

1. 检查 Admin Console 健康状态: http://localhost:5000/admin/api/health
2. 查看服务器日志: 在运行 `npm run admin` 的终端中
3. 检查浏览器控制台是否有错误
4. 确认 R2 凭证配置正确

---

## 🎉 完成！

你现在可以为所有 100+ 手术项目上传和管理图片了！

**系统特点:**
- ✅ 简单直观的界面
- ✅ 自动化的文件命名
- ✅ 支持 100+ 手术项目
- ✅ 无需数据库管理
- ✅ 直接使用 R2 存储
- ✅ 前端代码简洁高效

开始上传你的第一张图片吧! 🚀
