/**
 * 图片工具函数
 * 根据 R2_IMAGE_PATHS.md 规范访问 Cloudflare R2 图片
 */

// Prefer custom domain if configured, then fall back to the R2 public URL.
const R2_BASE_URL =
  import.meta.env.VITE_R2_CUSTOM_DOMAIN ||
  import.meta.env.VITE_R2_PUBLIC_URL ||
  'https://pub-364a76a828f94fbeb2b09c625907dcf5.r2.dev';

// Debug: Log the R2 base URL configuration
console.log('🖼️ [imageUtils] R2_BASE_URL:', R2_BASE_URL);
console.log('🖼️ [imageUtils] VITE_R2_CUSTOM_DOMAIN:', import.meta.env.VITE_R2_CUSTOM_DOMAIN);
console.log('🖼️ [imageUtils] VITE_R2_PUBLIC_URL:', import.meta.env.VITE_R2_PUBLIC_URL);

// 缓存破坏：每小时更新一次（平衡缓存效率和内容新鲜度）
const CACHE_BUSTER = `?v=${Math.floor(Date.now() / 3600000)}`;

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
export function getHomepageImage(
  type: 'hero' | 'face' | 'body' | 'non-surgical' | 'concierge' | 'gallery'
): string {
  // Special case: concierge uses uppercase filename
  const filename = type === 'concierge' ? 'CONCIERGE.jpg' : `${type}.jpg`;
  const url = `${R2_BASE_URL}/homepage/${filename}${CACHE_BUSTER}`;
  console.log(`🖼️ [getHomepageImage] ${type} ->`, url);
  return url;
}

/**
 * 获取手术项目图片 URL
 */
export function getProcedureImage(
  procedureName: string,
  type: 'hero' | 'benefits' | 'candidate'
): string {
  const slug = createSlug(procedureName);
  return `${R2_BASE_URL}/procedures/${slug}/${type}.jpg${CACHE_BUSTER}`;
}

/**
 * 获取手术项目 Case 图片 URL
 */
export function getProcedureCaseImage(
  procedureName: string,
  caseNumber: string,
  imageIndex: number
): string {
  const slug = createSlug(procedureName);
  return `${R2_BASE_URL}/procedures/${slug}/case-${caseNumber}-${imageIndex}.jpg${CACHE_BUSTER}`;
}

/**
 * 获取 Gallery 子分类缩略图 URL
 */
export function getGallerySubcategoryImage(
  subcategory: 'face-neck' | 'facial-contouring-implants' | 'injectables-regenerative' | 'lips' | 'skin-tightening-resurfacing' | 'hair'
): string {
  const url = `${R2_BASE_URL}/gallery/${subcategory}.jpg${CACHE_BUSTER}`;
  console.log(`🖼️ [getGallerySubcategoryImage] ${subcategory} ->`, url);
  return url;
}

/**
 * 获取 Reviews 步骤图片 URL
 */
export function getReviewsStepImage(step: 1 | 2 | 3): string {
  return `${R2_BASE_URL}/reviews/step-${step}.jpg${CACHE_BUSTER}`;
}

/**
 * 检查图片是否存在（可选的辅助函数）
 */
export async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 获取图片 URL，如果不存在则返回默认图片
 */
export function getImageWithFallback(
  imageUrl: string,
  fallbackUrl: string = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop'
): string {
  return imageUrl || fallbackUrl;
}
