/**
 * 图片槽位配置 - 纯前端方案
 * R2 路径命名规范：{category}/{procedure-slug}/{slot-type}.jpg
 *
 * 示例：
 * - procedures/facelift/hero.jpg
 * - procedures/facelift/before-1.jpg
 * - procedures/facelift/after-1.jpg
 * - procedures/breast-augmentation/gallery-1.jpg
 */

import { createSlug } from './procedures-categories.js';

// Re-export createSlug for use in other files
export { createSlug };

/**
 * 每个手术项目的标准图片槽位
 */
export const PROCEDURE_IMAGE_SLOTS = {
  // Hero 主图 (1张)
  hero: {
    id: 'hero',
    label: 'Hero Banner',
    description: '手术项目页面的主要展示图片',
    maxCount: 1,
    recommended: { width: 1920, height: 1080 }
  },

  // Before/After 对比图 (最多10组)
  beforeAfter: {
    id: 'before-after',
    label: 'Before & After',
    description: '术前术后对比图',
    maxCount: 10, // 10组对比图
    recommended: { width: 800, height: 800 }
  },

  // 详情图/过程图 (最多8张)
  detail: {
    id: 'detail',
    label: 'Detail Images',
    description: '手术细节、过程展示图',
    maxCount: 8,
    recommended: { width: 1200, height: 800 }
  },

  // 案例图库 (最多20张)
  gallery: {
    id: 'gallery',
    label: 'Gallery',
    description: '更多案例图片',
    maxCount: 20,
    recommended: { width: 800, height: 600 }
  }
};

/**
 * 生成 R2 路径
 * @param {string} procedureName - 手术名称，如 "Facelift"
 * @param {string} slotType - 槽位类型，如 "hero", "before-1", "after-1"
 * @param {string} fileExtension - 文件扩展名，默认 "jpg"
 */
export function generateR2Path(procedureName, slotType, fileExtension = 'jpg') {
  const slug = createSlug(procedureName);
  return `procedures/${slug}/${slotType}.${fileExtension}`;
}

/**
 * 生成完整的图片 URL
 * @param {string} procedureName
 * @param {string} slotType
 */
export function generateImageUrl(r2PublicUrl, procedureName, slotType) {
  const path = generateR2Path(procedureName, slotType);
  return `${r2PublicUrl}/${path}`;
}

/**
 * 解析 R2 路径获取信息
 * @param {string} r2Key - 如 "procedures/facelift/hero.jpg"
 */
export function parseR2Path(r2Key) {
  const parts = r2Key.split('/');
  if (parts.length < 3) return null;

  const [category, slug, filename] = parts;
  const [slotType, ext] = filename.split('.');

  return {
    category,
    slug,
    slotType,
    extension: ext
  };
}

/**
 * 获取某个手术项目的所有槽位
 * @param {string} procedureName
 */
export function getProcedureSlots(procedureName) {
  const slots = [];

  // Hero (1张)
  slots.push({
    type: 'hero',
    label: 'Hero Banner',
    path: generateR2Path(procedureName, 'hero'),
    index: null
  });

  // Before/After (10组)
  for (let i = 1; i <= 10; i++) {
    slots.push({
      type: 'before',
      label: `Before ${i}`,
      path: generateR2Path(procedureName, `before-${i}`),
      index: i,
      pair: `after-${i}`
    });
    slots.push({
      type: 'after',
      label: `After ${i}`,
      path: generateR2Path(procedureName, `after-${i}`),
      index: i,
      pair: `before-${i}`
    });
  }

  // Detail (8张)
  for (let i = 1; i <= 8; i++) {
    slots.push({
      type: 'detail',
      label: `Detail ${i}`,
      path: generateR2Path(procedureName, `detail-${i}`),
      index: i
    });
  }

  // Gallery (20张)
  for (let i = 1; i <= 20; i++) {
    slots.push({
      type: 'gallery',
      label: `Gallery ${i}`,
      path: generateR2Path(procedureName, `gallery-${i}`),
      index: i
    });
  }

  return slots;
}

/**
 * 首页图片槽位
 */
export const HOMEPAGE_SLOTS = {
  hero: [
    { id: 'hero-main', label: 'Hero Main Image', path: 'homepage/hero-main.jpg' },
    { id: 'hero-bg', label: 'Hero Background', path: 'homepage/hero-bg.jpg' }
  ],
  features: [
    { id: 'feature-1', label: 'Feature 1', path: 'homepage/feature-1.jpg' },
    { id: 'feature-2', label: 'Feature 2', path: 'homepage/feature-2.jpg' },
    { id: 'feature-3', label: 'Feature 3', path: 'homepage/feature-3.jpg' }
  ],
  testimonials: [
    { id: 'testimonial-bg', label: 'Testimonial Background', path: 'homepage/testimonial-bg.jpg' }
  ]
};

/**
 * Gallery 分类槽位 (每个分类最多50张)
 */
export const GALLERY_SLOTS = {
  face: { category: 'gallery/face', maxCount: 50 },
  body: { category: 'gallery/body', maxCount: 50 },
  'non-surgical': { category: 'gallery/non-surgical', maxCount: 50 }
};

/**
 * 生成 Gallery 路径
 */
export function generateGalleryPath(category, index) {
  return `gallery/${category}/${String(index).padStart(3, '0')}.jpg`;
}

/**
 * 路径命名规范文档
 */
export const NAMING_CONVENTION = {
  procedures: {
    pattern: 'procedures/{procedure-slug}/{slot-type}.{ext}',
    examples: [
      'procedures/facelift/hero.jpg',
      'procedures/facelift/before-1.jpg',
      'procedures/facelift/after-1.jpg',
      'procedures/rhinoplasty/detail-1.jpg',
      'procedures/breast-augmentation/gallery-5.jpg'
    ]
  },
  homepage: {
    pattern: 'homepage/{slot-name}.{ext}',
    examples: [
      'homepage/hero-main.jpg',
      'homepage/hero-bg.jpg',
      'homepage/feature-1.jpg'
    ]
  },
  gallery: {
    pattern: 'gallery/{category}/{index}.{ext}',
    examples: [
      'gallery/face/001.jpg',
      'gallery/body/012.jpg',
      'gallery/non-surgical/005.jpg'
    ]
  },
  surgeons: {
    pattern: 'surgeons/{surgeon-id}/{type}.{ext}',
    examples: [
      'surgeons/dr-zhang/profile.jpg',
      'surgeons/dr-zhang/action-1.jpg'
    ]
  }
};
