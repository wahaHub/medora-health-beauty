# 📸 Medora Admin Console - 图片管理系统总结

## 🎯 系统概述

完整的图片管理系统，支持官网所有页面的图片上传和管理。

---

## 📊 图片统计

### 1. **Homepage (首页)** - 约 15 张图
- Hero Banner (2张): 主图 + 背景
- Introduction (2张): 介绍区域
- Features (3张): 特色服务
- Popular Procedures (4张): 热门项目展示
- Testimonials (1张): 客户评价背景
- CTA (1张): 行动号召背景

### 2. **Procedures (手术项目)** - 100+ 项目 × 4 类图片
每个手术项目包含:
- **Hero** (1张): 主横幅
- **Benefits** (1张): 优势展示
- **Candidate** (1张): 理想候选人
- **Cases** (无限): 每个案例可包含多张图片（支持不同尺寸智能布局）

**路径**: `procedures/{procedure-slug}/`
- `hero.jpg`
- `benefits.jpg`
- `candidate.jpg`
- `case-1-1.jpg`, `case-1-2.jpg`, ...
- `case-2-1.jpg`, `case-2-2.jpg`, ...

### 3. **Gallery (图库)** - 3个分类 × 50张 = 150张
- **Face** (50张): 面部手术案例
- **Body** (50张): 身体塑形案例
- **Non-Surgical** (50张): 非手术项目案例

每个分类还有:
- Category Hero (1张): 分类横幅

**路径**: `gallery/{category}/`
- `face-hero.jpg`, `body-hero.jpg`, `nonsurgical-hero.jpg`
- `face/001.jpg`, `face/002.jpg`, ...
- `body/001.jpg`, `body/002.jpg`, ...

### 4. **Reviews (评价页)** - 约 25 张图
- Hero (1张): 页面横幅
- Featured Reviews (4张): 精选评价配图
- Patient Photos (12张): 患者真实照片
- Video Thumbnails (6张): 视频评价缩略图
- Background Images (2张): 区域背景

**路径**: `reviews/`
- `hero.jpg`
- `featured-1.jpg` ~ `featured-4.jpg`
- `patient-1.jpg` ~ `patient-12.jpg`
- `video-thumb-1.jpg` ~ `video-thumb-6.jpg`
- `bg-1.jpg`, `bg-2.jpg`

### 5. **Travel (旅游页)** - 约 11 张图
- Hero (1张): 页面横幅
- Destinations (4张): 目的地展示
- Accommodations (6张): 住宿图片

**路径**: `travel/`
- `hero.jpg`
- `dest-1.jpg` ~ `dest-4.jpg`
- `hotel-1.jpg` ~ `hotel-6.jpg`

### 6. **About (关于我们)** - 约 12 张图
- Hero (1张): 页面横幅
- Team Photos (3张): 团队照片
- Facility (8张): 设施照片

**路径**: `about/`
- `hero.jpg`
- `team-1.jpg` ~ `team-3.jpg`
- `facility-1.jpg` ~ `facility-8.jpg`

### 7. **Contact (联系页)** - 约 3 张图
- Hero (1张): 页面横幅
- Location (2张): 位置照片（外观、前台）

**路径**: `contact/`
- `hero.jpg`
- `exterior.jpg`, `reception.jpg`

---

## 🚀 管理入口

### 从 Dashboard 访问

http://localhost:5001/admin

侧边栏导航:
- 🏠 **Homepage** → 首页图片管理
- 👨‍⚕️ **Surgeons** → 医生照片管理（待开发）
- 💉 **Procedures** → 手术项目图片管理（100+项目）
- 🖼️ **Gallery** → 图库管理（3大分类）
- ⭐ **Reviews** → 评价页图片管理
- ✈️ **Travel** → 旅游页图片管理

---

## 📁 完整的 R2 路径结构

```
medora-images/
├── homepage/
│   ├── hero-main.jpg
│   ├── hero-bg.jpg
│   ├── intro-1.jpg, intro-2.jpg
│   ├── feature-1.jpg, feature-2.jpg, feature-3.jpg
│   ├── procedure-1.jpg ~ procedure-4.jpg
│   ├── testimonial-bg.jpg
│   └── cta-bg.jpg
│
├── procedures/
│   ├── facelift/
│   │   ├── hero.jpg
│   │   ├── benefits.jpg
│   │   ├── candidate.jpg
│   │   ├── case-1-1.jpg, case-1-2.jpg, case-1-3.jpg
│   │   ├── case-2-1.jpg, case-2-2.jpg
│   │   └── ...
│   ├── rhinoplasty/
│   │   └── ...
│   └── [100+ procedures]/
│
├── gallery/
│   ├── face-hero.jpg
│   ├── body-hero.jpg
│   ├── nonsurgical-hero.jpg
│   ├── face/
│   │   ├── 001.jpg, 002.jpg, ... (50 张)
│   ├── body/
│   │   ├── 001.jpg, 002.jpg, ... (50 张)
│   └── non-surgical/
│       ├── 001.jpg, 002.jpg, ... (50 张)
│
├── reviews/
│   ├── hero.jpg
│   ├── featured-1.jpg ~ featured-4.jpg
│   ├── patient-1.jpg ~ patient-12.jpg
│   ├── video-thumb-1.jpg ~ video-thumb-6.jpg
│   └── bg-1.jpg, bg-2.jpg
│
├── travel/
│   ├── hero.jpg
│   ├── dest-1.jpg ~ dest-4.jpg
│   └── hotel-1.jpg ~ hotel-6.jpg
│
├── about/
│   ├── hero.jpg
│   ├── team-1.jpg ~ team-3.jpg
│   └── facility-1.jpg ~ facility-8.jpg
│
└── contact/
    ├── hero.jpg
    ├── exterior.jpg
    └── reception.jpg
```

---

## 💻 前端使用示例

### Homepage

```tsx
const R2_URL = import.meta.env.VITE_R2_PUBLIC_URL;

// Hero
<img src={`${R2_URL}/homepage/hero-main.jpg`} />

// Features
<img src={`${R2_URL}/homepage/feature-1.jpg`} />
```

### Procedures

```tsx
import { createSlug } from '@/utils';

const procedureName = "Facelift";
const slug = createSlug(procedureName); // "facelift"

// Hero
<img src={`${R2_URL}/procedures/${slug}/hero.jpg`} />

// Benefits
<img src={`${R2_URL}/procedures/${slug}/benefits.jpg`} />

// Case images
<img src={`${R2_URL}/procedures/${slug}/case-1-1.jpg`} />
<img src={`${R2_URL}/procedures/${slug}/case-1-2.jpg`} />
```

### Gallery

```tsx
// Category hero
<img src={`${R2_URL}/gallery/face-hero.jpg`} />

// Gallery images
<img src={`${R2_URL}/gallery/face/001.jpg`} />
<img src={`${R2_URL}/gallery/face/002.jpg`} />
```

### Reviews

```tsx
// Hero
<img src={`${R2_URL}/reviews/hero.jpg`} />

// Patient photos
{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
  <img key={i} src={`${R2_URL}/reviews/patient-${i}.jpg`} />
))}

// Video thumbnails
{[1, 2, 3, 4, 5, 6].map(i => (
  <img key={i} src={`${R2_URL}/reviews/video-thumb-${i}.jpg`} />
))}
```

---

## 📝 已创建的文件

### Admin Console 页面
1. ✅ `admin/public/procedures-manager.html` - 手术项目列表
2. ✅ `admin/public/procedure-detail-v2.html` - 手术项目详情（图片上传）
3. ✅ `admin/public/gallery-manager.html` - Gallery 管理入口
4. ✅ `admin/public/dashboard-new.html` - 主 Dashboard（已更新导航）

### 配置文件
1. ✅ `admin/public/procedures-categories.js` - 100+ 手术项目分类
2. ✅ `admin/public/image-slots-config.js` - 图片槽位配置
3. ✅ `admin/public/site-images-config.js` - 网站页面图片配置

### 后端
1. ✅ `admin/server.js` - 已更新支持自定义文件名上传

### 文档
1. ✅ `PROCEDURES_IMAGE_MANAGEMENT.md` - 手术项目图片管理文档
2. ✅ `QUICKSTART_PROCEDURES.md` - 快速开始指南
3. ✅ `ADMIN_IMAGES_SUMMARY.md` - 本文档

---

## 🎯 待开发功能

1. **Site Pages Manager** (`site-pages-manager.html`)
   - Homepage 图片管理
   - Reviews 图片管理
   - Travel 图片管理
   - About 图片管理
   - Contact 图片管理

2. **Gallery Subcategory Manager** (`gallery-subcategory.html`)
   - 每个子分类的图片上传
   - 支持 50 张图片/分类

3. **Surgeons Manager**
   - 医生照片管理
   - Profile, Action, Team 照片

---

## 🔥 核心特性

### ✨ 智能布局系统
- 自动识别图片尺寸（横向、竖向、大图）
- 智能排列不同尺寸的图片
- Masonry 瀑布流布局

### 📤 灵活的上传系统
- 拖拽上传
- 点击选择
- 自动命名
- 即时预览

### 🗂️ 简洁的路径规范
- 无需数据库
- 纯文件路径
- 易于理解和维护

### 🎨 直观的管理界面
- 分类清晰
- 操作简单
- 实时反馈

---

## 📞 技术支持

遇到问题？
1. 检查 R2 配置是否正确
2. 查看服务器日志
3. 确认文件路径符合规范
4. 参考各个文档

---

**系统已就绪！开始上传图片吧！** 🚀
