/**
 * ⚠️ DEPRECATED - 此文件未被使用
 *
 * 创建日期: 2024-01
 * 废弃日期: 2026-01-26
 * 废弃原因: 项目中的图片 URL 直接从 Supabase 数据库获取，
 *          或直接使用 https://images.medorahealth.com/... 硬编码
 *
 * 如需恢复使用，请移回 config/ 目录
 */

/**
 * 图片 CDN 配置
 *
 * 所有网站图片都从 Cloudflare R2 加载
 */

// Cloudflare R2 自定义域名
// 在 R2 Dashboard 绑定后替换这个 URL
export const CDN_URL = 'https://images.medorahealth.com';

// 或者使用 R2.dev 公开 URL（临时）
// export const CDN_URL = 'https://pub-xxxxx.r2.dev';

/**
 * 获取图片完整 URL
 */
export function getImageUrl(path: string): string {
  // 移除开头的斜杠（如果有）
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${CDN_URL}/${cleanPath}`;
}

/**
 * 获取响应式图片 srcset
 */
export function getResponsiveImageSet(basePath: string, sizes: number[] = [400, 800, 1200]): string {
  const ext = basePath.split('.').pop();
  const basePathWithoutExt = basePath.replace(`.${ext}`, '');
  
  return sizes
    .map(size => `${getImageUrl(`${basePathWithoutExt}-${size}.webp`)} ${size}w`)
    .join(', ');
}

/**
 * 预定义的图片路径
 * 
 * 使用方式:
 * import { IMAGES } from '@/config/images';
 * <img src={IMAGES.logo} alt="Logo" />
 */
export const IMAGES = {
  // Logo 和 UI
  logo: getImageUrl('ui/logo.png'),
  logoWhite: getImageUrl('ui/logo-white.png'),
  favicon: getImageUrl('ui/favicon.ico'),
  
  // Hero 背景图
  hero: {
    main: getImageUrl('hero/main-bg.jpg'),
    procedures: getImageUrl('hero/procedures-bg.jpg'),
    gallery: getImageUrl('hero/gallery-bg.jpg'),
  },

  // 手术类型图片
  procedures: {
    // Face
    facelift: getImageUrl('procedures/facelift.jpg'),
    browLift: getImageUrl('procedures/brow-lift.jpg'),
    eyelidSurgery: getImageUrl('procedures/eyelid-surgery.jpg'),
    rhinoplasty: getImageUrl('procedures/rhinoplasty.jpg'),
    neckLift: getImageUrl('procedures/neck-lift.jpg'),
    
    // Body
    liposuction: getImageUrl('procedures/liposuction.jpg'),
    tummyTuck: getImageUrl('procedures/tummy-tuck.jpg'),
    mommyMakeover: getImageUrl('procedures/mommy-makeover.jpg'),
    breastAugmentation: getImageUrl('procedures/breast-augmentation.jpg'),
    
    // Non-surgical
    botox: getImageUrl('procedures/botox.jpg'),
    fillers: getImageUrl('procedures/fillers.jpg'),
    lipInjections: getImageUrl('procedures/lip-injections.jpg'),
  },

  // 医生团队
  team: {
    drZhang: getImageUrl('team/dr-zhang-yimei.jpg'),
    drChen: getImageUrl('team/dr-michael-chen.jpg'),
    drLiu: getImageUrl('team/dr-liu-wei.jpg'),
    drZhao: getImageUrl('team/dr-emily-zhao.jpg'),
    drWang: getImageUrl('team/dr-david-wang.jpg'),
  },

  // 案例图片（示例）
  cases: {
    // 使用函数动态生成
    getBefore: (caseId: number) => getImageUrl(`cases/case-${String(caseId).padStart(3, '0')}-before.jpg`),
    getAfter: (caseId: number) => getImageUrl(`cases/case-${String(caseId).padStart(3, '0')}-after.jpg`),
  },

  // Gallery 分类封面
  gallery: {
    face: getImageUrl('gallery/face-cover.jpg'),
    body: getImageUrl('gallery/body-cover.jpg'),
    nonsurgical: getImageUrl('gallery/nonsurgical-cover.jpg'),
  },

  // 占位图（开发时使用）
  placeholder: {
    square: getImageUrl('placeholder/square.jpg'),
    landscape: getImageUrl('placeholder/landscape.jpg'),
    portrait: getImageUrl('placeholder/portrait.jpg'),
  },
};

/**
 * 图片加载优化配置
 */
export const IMAGE_CONFIG = {
  // 懒加载配置
  lazyLoad: {
    rootMargin: '50px',
    threshold: 0.01,
  },
  
  // 默认图片质量
  quality: {
    thumbnail: 75,
    standard: 85,
    high: 95,
  },
  
  // 响应式断点
  breakpoints: {
    mobile: 400,
    tablet: 800,
    desktop: 1200,
    large: 1600,
  },
};

/**
 * React 组件辅助函数
 */
export interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * 获取响应式图片属性
 */
export function getResponsiveImageProps(
  basePath: string,
  alt: string,
  options?: Partial<ResponsiveImageProps>
): ResponsiveImageProps {
  return {
    src: getImageUrl(`${basePath}-800.webp`),
    srcSet: getResponsiveImageSet(basePath),
    sizes: options?.sizes || '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px',
    alt,
    loading: options?.loading || 'lazy',
    className: options?.className,
  };
}

