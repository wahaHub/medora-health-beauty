/**
 * ⚠️ DEPRECATED - 此文件未被使用
 *
 * 创建日期: 2024-01
 * 废弃日期: 2026-01-26
 * 废弃原因: 项目中没有组件 import 使用此配置文件，
 *          图片 URL 直接硬编码或从 Supabase 获取
 *
 * 如需恢复使用，请移回 config/ 目录
 */

// Cloudflare R2 Configuration
// 请在 Cloudflare Dashboard 创建 R2 bucket 后，替换以下 PUBLIC_URL

export const R2_CONFIG = {
  // 你的 R2 bucket 公开 URL
  PUBLIC_URL: process.env.VITE_R2_PUBLIC_URL || 'https://pub-364a76a828f94fbeb2b09c625907dcf5.r2.dev',
  
  // Bucket 名称
  BUCKET_NAME: 'medora-images',
  
  // 自定义域名（可选，如果配置了自定义域名）
  CUSTOM_DOMAIN: process.env.VITE_R2_CUSTOM_DOMAIN || '',
};

/**
 * 获取图片完整URL
 * @param imagePath - 图片路径（相对于bucket根目录）
 * @returns 完整的图片URL
 * 
 * @example
 * getImageUrl('hero-banner.jpg') 
 * // => https://pub-xxxxxxxxxxxxx.r2.dev/hero-banner.jpg
 * 
 * getImageUrl('doctors/dr-zhang.jpg')
 * // => https://pub-xxxxxxxxxxxxx.r2.dev/doctors/dr-zhang.jpg
 */
export function getImageUrl(imagePath: string): string {
  // 如果已经是完整URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // 移除开头的斜杠（如果有）
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // 优先使用自定义域名，否则使用公开URL
  const baseUrl = R2_CONFIG.CUSTOM_DOMAIN || R2_CONFIG.PUBLIC_URL;
  
  return `${baseUrl}/${cleanPath}`;
}

/**
 * 获取响应式图片URL（用于不同尺寸）
 * @param imagePath - 图片路径
 * @param size - 尺寸标识 (sm, md, lg, xl)
 * @returns 完整的图片URL
 * 
 * @example
 * getResponsiveImageUrl('hero.jpg', 'lg')
 * // => https://pub-xxxxxxxxxxxxx.r2.dev/hero-lg.jpg
 * 
 * // 配合 <picture> 使用
 * <picture>
 *   <source media="(min-width: 1024px)" srcSet={getResponsiveImageUrl('hero.jpg', 'xl')} />
 *   <source media="(min-width: 768px)" srcSet={getResponsiveImageUrl('hero.jpg', 'lg')} />
 *   <img src={getResponsiveImageUrl('hero.jpg', 'md')} alt="Hero" />
 * </picture>
 */
export function getResponsiveImageUrl(
  imagePath: string, 
  size?: 'sm' | 'md' | 'lg' | 'xl'
): string {
  if (!size) {
    return getImageUrl(imagePath);
  }
  
  // 分离文件名和扩展名
  const lastDotIndex = imagePath.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return getImageUrl(imagePath);
  }
  
  const pathWithoutExt = imagePath.substring(0, lastDotIndex);
  const ext = imagePath.substring(lastDotIndex);
  
  // 构建带尺寸后缀的路径
  const resizedPath = `${pathWithoutExt}-${size}${ext}`;
  
  return getImageUrl(resizedPath);
}

/**
 * 图片路径映射表（用于快速迁移）
 * 可以将 Unsplash 等外部链接映射到 R2 存储
 */
export const IMAGE_PATHS = {
  // Hero Images
  heroMain: 'hero/hero-main.jpg',
  heroBackground: 'hero/hero-bg.jpg',
  
  // Doctors
  drZhang: 'doctors/dr-zhang.jpg',
  drChen: 'doctors/dr-chen.jpg',
  drLin: 'doctors/dr-lin.jpg',
  
  // Procedures
  facelift: 'procedures/facelift/main.jpg',
  rhinoplasty: 'procedures/rhinoplasty/main.jpg',
  eyelidSurgery: 'procedures/eyelid-surgery/main.jpg',
  
  // Logos & Branding
  logo: 'logos/logo.svg',
  logoWhite: 'logos/logo-white.svg',
  
  // Fallback
  placeholder: 'placeholder.jpg',
};

/**
 * 获取预定义图片URL
 * @param key - IMAGE_PATHS 中的键名
 * @returns 完整的图片URL
 * 
 * @example
 * getImageByKey('heroMain')
 * // => https://pub-xxxxxxxxxxxxx.r2.dev/hero/hero-main.jpg
 */
export function getImageByKey(key: keyof typeof IMAGE_PATHS): string {
  const path = IMAGE_PATHS[key];
  return getImageUrl(path);
}

/**
 * 图片尺寸配置（用于响应式图片）
 */
export const IMAGE_SIZES = {
  sm: { width: 640, quality: 80 },
  md: { width: 1024, quality: 85 },
  lg: { width: 1920, quality: 85 },
  xl: { width: 2560, quality: 90 },
} as const;

export default {
  R2_CONFIG,
  getImageUrl,
  getResponsiveImageUrl,
  getImageByKey,
  IMAGE_PATHS,
  IMAGE_SIZES,
};

