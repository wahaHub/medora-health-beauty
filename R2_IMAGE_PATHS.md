# 📸 Medora R2 图片路径命名规范

## 🎯 总览

所有图片存储在 Cloudflare R2，通过公开 URL 访问：
```
https://your-r2-public-url.com/{path}/{filename}
```

---

## 📁 路径结构

### 1. Homepage (首页) - 6 张图

**路径前缀**: `homepage/`

| 图片用途 | 文件名 | 完整路径 |
|---------|--------|---------|
| Hero 主图 | `hero.jpg` | `homepage/hero.jpg` |
| Face 分类 | `face.jpg` | `homepage/face.jpg` |
| Body 分类 | `body.jpg` | `homepage/body.jpg` |
| Non-Surgical 分类 | `non-surgical.jpg` | `homepage/non-surgical.jpg` |
| Concierge Program | `concierge.jpg` | `homepage/concierge.jpg` |
| Gallery 区域 | `gallery.jpg` | `homepage/gallery.jpg` |

**前端使用示例**:
```tsx
const R2_URL = import.meta.env.VITE_R2_PUBLIC_URL;

// Hero
<img src={`${R2_URL}/homepage/hero.jpg`} alt="Hero" />

// Face Category
<img src={`${R2_URL}/homepage/face.jpg`} alt="Face" />
```

---

### 2. Procedures (手术项目) - 100+ 项目

**路径前缀**: `procedures/{slug}/`

每个手术项目包含：
- 1 张 Hero
- 1 张 Benefits
- 1 张 Candidate
- N 个 Cases (每个 case 可包含多张图片)

#### 路径规则

| 图片类型 | 文件名格式 | 示例 |
|---------|-----------|------|
| Hero | `hero.jpg` | `procedures/facelift/hero.jpg` |
| Benefits | `benefits.jpg` | `procedures/facelift/benefits.jpg` |
| Candidate | `candidate.jpg` | `procedures/facelift/candidate.jpg` |
| Case 图片 | `case-{caseId}-{imageIndex}.jpg` | `procedures/facelift/case-1-1.jpg`<br>`procedures/facelift/case-1-2.jpg`<br>`procedures/facelift/case-2-1.jpg` |

#### Slug 生成规则

手术名称转换为 slug（小写、连字符分隔、去除特殊符号）：

```javascript
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 示例
"Facelift" → "facelift"
"Rhinoplasty (Nose Surgery)" → "rhinoplasty-nose-surgery"
"Botox® Injections" → "botox-injections"
```

**前端使用示例**:
```tsx
const procedureName = "Facelift";
const slug = createSlug(procedureName); // "facelift"

// Hero
<img src={`${R2_URL}/procedures/${slug}/hero.jpg`} />

// Benefits
<img src={`${R2_URL}/procedures/${slug}/benefits.jpg`} />

// Candidate
<img src={`${R2_URL}/procedures/${slug}/candidate.jpg`} />

// Case 1 的图片
<img src={`${R2_URL}/procedures/${slug}/case-1-1.jpg`} />
<img src={`${R2_URL}/procedures/${slug}/case-1-2.jpg`} />
<img src={`${R2_URL}/procedures/${slug}/case-1-3.jpg`} />

// Case 2 的图片
<img src={`${R2_URL}/procedures/${slug}/case-2-1.jpg`} />
<img src={`${R2_URL}/procedures/${slug}/case-2-2.jpg`} />
```

#### 常见手术项目 Slug 映射

| 手术名称 | Slug |
|---------|------|
| Facelift | `facelift` |
| Rhinoplasty | `rhinoplasty` |
| Brow Lift | `brow-lift` |
| Eyelid Surgery (Blepharoplasty) | `eyelid-surgery-blepharoplasty` |
| Botox® Injections | `botox-injections` |
| Brazilian Butt Lift (BBL) | `brazilian-butt-lift-bbl` |
| Tummy Tuck (Abdominoplasty) | `tummy-tuck-abdominoplasty` |
| Liposuction | `liposuction` |

---

### 3. Gallery (图库) - Face 子分类缩略图 - 6 张

**路径前缀**: `gallery/`

| 子分类名称 | 文件名 | 完整路径 |
|-----------|--------|---------|
| Face & Neck | `face-neck.jpg` | `gallery/face-neck.jpg` |
| Facial Contouring & Implants | `facial-contouring-implants.jpg` | `gallery/facial-contouring-implants.jpg` |
| Injectables & Regenerative | `injectables-regenerative.jpg` | `gallery/injectables-regenerative.jpg` |
| Lips | `lips.jpg` | `gallery/lips.jpg` |
| Skin Tightening & Resurfacing | `skin-tightening-resurfacing.jpg` | `gallery/skin-tightening-resurfacing.jpg` |
| Hair | `hair.jpg` | `gallery/hair.jpg` |

**前端使用示例**:
```tsx
// Gallery subcategory thumbnails
<img src={`${R2_URL}/gallery/face-neck.jpg`} alt="Face & Neck" />
<img src={`${R2_URL}/gallery/facial-contouring-implants.jpg`} alt="Facial Contouring" />
<img src={`${R2_URL}/gallery/injectables-regenerative.jpg`} alt="Injectables" />
```

---

### 4. Reviews (评价页) - 3 张 Step 图

**路径前缀**: `reviews/`

| 步骤 | 文件名 | 完整路径 |
|-----|--------|---------|
| Step 1 | `step-1.jpg` | `reviews/step-1.jpg` |
| Step 2 | `step-2.jpg` | `reviews/step-2.jpg` |
| Step 3 | `step-3.jpg` | `reviews/step-3.jpg` |

**前端使用示例**:
```tsx
// Reviews page steps
{[1, 2, 3].map(step => (
  <img
    key={step}
    src={`${R2_URL}/reviews/step-${step}.jpg`}
    alt={`Step ${step}`}
  />
))}
```

---

## 🔧 工具函数

### React/TypeScript 项目

```typescript
// utils/imageUtils.ts

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

/**
 * 生成手术项目的 slug
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 获取 Homepage 图片 URL
 */
export function getHomepageImage(type: 'hero' | 'face' | 'body' | 'non-surgical' | 'concierge' | 'gallery'): string {
  return `${R2_PUBLIC_URL}/homepage/${type}.jpg`;
}

/**
 * 获取手术项目图片 URL
 */
export function getProcedureImage(
  procedureName: string,
  type: 'hero' | 'benefits' | 'candidate'
): string {
  const slug = createSlug(procedureName);
  return `${R2_PUBLIC_URL}/procedures/${slug}/${type}.jpg`;
}

/**
 * 获取手术项目 Case 图片 URL
 */
export function getProcedureCaseImage(
  procedureName: string,
  caseId: number,
  imageIndex: number
): string {
  const slug = createSlug(procedureName);
  return `${R2_PUBLIC_URL}/procedures/${slug}/case-${caseId}-${imageIndex}.jpg`;
}

/**
 * 获取 Gallery 子分类缩略图 URL
 */
export function getGallerySubcategoryImage(
  subcategory: 'face-neck' | 'facial-contouring-implants' | 'injectables-regenerative' | 'lips' | 'skin-tightening-resurfacing' | 'hair'
): string {
  return `${R2_PUBLIC_URL}/gallery/${subcategory}.jpg`;
}

/**
 * 获取 Reviews 步骤图片 URL
 */
export function getReviewsStepImage(step: 1 | 2 | 3): string {
  return `${R2_PUBLIC_URL}/reviews/step-${step}.jpg`;
}
```

### 使用示例

```tsx
// components/ProcedureDetail.tsx
import { getProcedureImage, getProcedureCaseImage } from '@/utils/imageUtils';

export default function ProcedureDetail({ procedureName }: { procedureName: string }) {
  return (
    <div>
      {/* Hero */}
      <img src={getProcedureImage(procedureName, 'hero')} alt="Hero" />

      {/* Benefits */}
      <img src={getProcedureImage(procedureName, 'benefits')} alt="Benefits" />

      {/* Candidate */}
      <img src={getProcedureImage(procedureName, 'candidate')} alt="Candidate" />

      {/* Case 1 的多张图片 */}
      <div className="case-gallery">
        <img src={getProcedureCaseImage(procedureName, 1, 1)} alt="Case 1 - Image 1" />
        <img src={getProcedureCaseImage(procedureName, 1, 2)} alt="Case 1 - Image 2" />
        <img src={getProcedureCaseImage(procedureName, 1, 3)} alt="Case 1 - Image 3" />
      </div>
    </div>
  );
}
```

---

## 📝 命名约定总结

### 文件格式
- 默认使用 `.jpg`
- 支持 `.png`, `.webp`（上传时保留扩展名）

### 命名风格
- 全部小写
- 单词之间用 `-` (连字符) 分隔
- 不使用空格、下划线或特殊字符
- 去除商标符号 (®, ™, ©)

### 路径层级
```
bucket-root/
├── homepage/          (6 张)
├── procedures/        (100+ 子文件夹，每个包含多张图)
│   ├── facelift/
│   ├── rhinoplasty/
│   └── ...
├── gallery/           (6 张缩略图)
└── reviews/           (3 张步骤图)
```

---

## ✅ 检查清单

上传图片前确认：

- [ ] 文件名符合命名规范（小写、连字符）
- [ ] 路径前缀正确
- [ ] 手术项目使用正确的 slug
- [ ] Case 图片编号连续（case-1-1, case-1-2, case-1-3...）
- [ ] 图片尺寸适合用途（Hero: 1920x1080, 缩略图: 600x400）

---

## 🚀 环境变量配置

### `.env` 文件
```bash
# Cloudflare R2 公开 URL
VITE_R2_PUBLIC_URL=https://your-r2-bucket.your-account.r2.cloudflarestorage.com
```

### 前端访问
```typescript
const R2_URL = import.meta.env.VITE_R2_PUBLIC_URL;
```

---

## 📞 联系与支持

如有命名规则问题或需要添加新的图片类型，请联系开发团队。

**最后更新**: 2026-01-05
