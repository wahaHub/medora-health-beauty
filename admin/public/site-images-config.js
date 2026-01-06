/**
 * 网站各页面图片配置
 * 基于 medorabeauty.com 的实际页面结构
 */

export const SITE_IMAGES_CONFIG = {
  // 1. Homepage (首页)
  homepage: {
    id: 'homepage',
    name: 'Homepage',
    icon: '🏠',
    sections: [
      {
        id: 'hero',
        name: 'Hero Banner',
        description: '首页主横幅',
        slots: [
          { id: 'hero-main', name: 'Main Hero Image', path: 'homepage/hero-main.jpg', recommended: '1920x1080' },
          { id: 'hero-bg', name: 'Hero Background', path: 'homepage/hero-bg.jpg', recommended: '1920x1080' }
        ]
      },
      {
        id: 'intro',
        name: 'Introduction Section',
        description: '介绍区域图片',
        slots: [
          { id: 'intro-1', name: 'Intro Image 1', path: 'homepage/intro-1.jpg', recommended: '800x600' },
          { id: 'intro-2', name: 'Intro Image 2', path: 'homepage/intro-2.jpg', recommended: '800x600' }
        ]
      },
      {
        id: 'features',
        name: 'Features',
        description: '特色服务展示',
        slots: [
          { id: 'feature-1', name: 'Feature 1', path: 'homepage/feature-1.jpg', recommended: '600x400' },
          { id: 'feature-2', name: 'Feature 2', path: 'homepage/feature-2.jpg', recommended: '600x400' },
          { id: 'feature-3', name: 'Feature 3', path: 'homepage/feature-3.jpg', recommended: '600x400' }
        ]
      },
      {
        id: 'procedures',
        name: 'Popular Procedures',
        description: '热门手术项目',
        slots: [
          { id: 'procedure-showcase-1', name: 'Procedure 1', path: 'homepage/procedure-1.jpg', recommended: '500x500' },
          { id: 'procedure-showcase-2', name: 'Procedure 2', path: 'homepage/procedure-2.jpg', recommended: '500x500' },
          { id: 'procedure-showcase-3', name: 'Procedure 3', path: 'homepage/procedure-3.jpg', recommended: '500x500' },
          { id: 'procedure-showcase-4', name: 'Procedure 4', path: 'homepage/procedure-4.jpg', recommended: '500x500' }
        ]
      },
      {
        id: 'testimonials',
        name: 'Testimonials',
        description: '客户评价背景',
        slots: [
          { id: 'testimonial-bg', name: 'Testimonial Background', path: 'homepage/testimonial-bg.jpg', recommended: '1920x800' }
        ]
      },
      {
        id: 'cta',
        name: 'Call to Action',
        description: '行动号召区域',
        slots: [
          { id: 'cta-bg', name: 'CTA Background', path: 'homepage/cta-bg.jpg', recommended: '1920x600' }
        ]
      }
    ]
  },

  // 2. Gallery (图库页)
  gallery: {
    id: 'gallery',
    name: 'Gallery',
    icon: '🖼️',
    description: '按分类展示的案例图库',
    categories: [
      {
        id: 'face',
        name: 'Face',
        description: '面部手术案例',
        path: 'gallery/face',
        maxImages: 50,
        subcategories: [
          'Face & Neck',
          'Facial Contouring & Implants',
          'Injectables & Regenerative',
          'Lips',
          'Skin Tightening & Resurfacing',
          'Hair'
        ]
      },
      {
        id: 'body',
        name: 'Body',
        description: '身体塑形案例',
        path: 'gallery/body',
        maxImages: 50,
        subcategories: [
          'Core Body Contouring',
          'Arms / Legs / Back',
          'After Weight Loss / Body Lifts',
          'Breast / Chest',
          'Buttocks',
          'Intimate',
          'Cellulite'
        ]
      },
      {
        id: 'non-surgical',
        name: 'Non-Surgical',
        description: '非手术项目案例',
        path: 'gallery/non-surgical',
        maxImages: 50,
        subcategories: [
          'Injectables',
          'Cellulite',
          'Skin Tightening',
          'Resurfacing / Skin Renewal',
          'Light / Laser-Based Skin Treatments',
          'Hair Removal',
          'Collagen / Regenerative'
        ]
      }
    ],
    // Gallery hero images for each category
    heroes: [
      { id: 'gallery-face-hero', name: 'Face Category Hero', path: 'gallery/face-hero.jpg', recommended: '1920x600' },
      { id: 'gallery-body-hero', name: 'Body Category Hero', path: 'gallery/body-hero.jpg', recommended: '1920x600' },
      { id: 'gallery-nonsurgical-hero', name: 'Non-Surgical Hero', path: 'gallery/nonsurgical-hero.jpg', recommended: '1920x600' }
    ]
  },

  // 3. Reviews (评价页)
  reviews: {
    id: 'reviews',
    name: 'Reviews',
    icon: '⭐',
    sections: [
      {
        id: 'hero',
        name: 'Reviews Hero',
        slots: [
          { id: 'reviews-hero', name: 'Reviews Page Hero', path: 'reviews/hero.jpg', recommended: '1920x800' }
        ]
      },
      {
        id: 'featured',
        name: 'Featured Reviews',
        description: '精选评价配图',
        slots: [
          { id: 'featured-review-1', name: 'Featured Review 1', path: 'reviews/featured-1.jpg', recommended: '600x600' },
          { id: 'featured-review-2', name: 'Featured Review 2', path: 'reviews/featured-2.jpg', recommended: '600x600' },
          { id: 'featured-review-3', name: 'Featured Review 3', path: 'reviews/featured-3.jpg', recommended: '600x600' },
          { id: 'featured-review-4', name: 'Featured Review 4', path: 'reviews/featured-4.jpg', recommended: '600x600' }
        ]
      },
      {
        id: 'testimonial-photos',
        name: 'Patient Photos',
        description: '患者真实照片（带评价的）',
        slots: Array.from({ length: 12 }, (_, i) => ({
          id: `patient-photo-${i + 1}`,
          name: `Patient Photo ${i + 1}`,
          path: `reviews/patient-${i + 1}.jpg`,
          recommended: '400x400'
        }))
      },
      {
        id: 'video-thumbnails',
        name: 'Video Review Thumbnails',
        description: '视频评价缩略图',
        slots: Array.from({ length: 6 }, (_, i) => ({
          id: `video-thumb-${i + 1}`,
          name: `Video Thumbnail ${i + 1}`,
          path: `reviews/video-thumb-${i + 1}.jpg`,
          recommended: '600x400'
        }))
      },
      {
        id: 'background',
        name: 'Background Images',
        slots: [
          { id: 'reviews-bg-1', name: 'Section Background 1', path: 'reviews/bg-1.jpg', recommended: '1920x600' },
          { id: 'reviews-bg-2', name: 'Section Background 2', path: 'reviews/bg-2.jpg', recommended: '1920x600' }
        ]
      }
    ]
  },

  // 4. About Page (关于我们)
  about: {
    id: 'about',
    name: 'About Us',
    icon: 'ℹ️',
    sections: [
      {
        id: 'hero',
        name: 'About Hero',
        slots: [
          { id: 'about-hero', name: 'About Page Hero', path: 'about/hero.jpg', recommended: '1920x800' }
        ]
      },
      {
        id: 'team',
        name: 'Team Photos',
        slots: [
          { id: 'team-photo-1', name: 'Team Photo 1', path: 'about/team-1.jpg', recommended: '800x600' },
          { id: 'team-photo-2', name: 'Team Photo 2', path: 'about/team-2.jpg', recommended: '800x600' },
          { id: 'team-photo-3', name: 'Team Photo 3', path: 'about/team-3.jpg', recommended: '800x600' }
        ]
      },
      {
        id: 'facility',
        name: 'Facility Photos',
        slots: Array.from({ length: 8 }, (_, i) => ({
          id: `facility-${i + 1}`,
          name: `Facility Photo ${i + 1}`,
          path: `about/facility-${i + 1}.jpg`,
          recommended: '800x600'
        }))
      }
    ]
  },

  // 5. Travel Page (旅游页)
  travel: {
    id: 'travel',
    name: 'Travel',
    icon: '✈️',
    sections: [
      {
        id: 'hero',
        name: 'Travel Hero',
        slots: [
          { id: 'travel-hero', name: 'Travel Page Hero', path: 'travel/hero.jpg', recommended: '1920x1080' }
        ]
      },
      {
        id: 'destinations',
        name: 'Destinations',
        slots: [
          { id: 'dest-1', name: 'Destination 1', path: 'travel/dest-1.jpg', recommended: '800x600' },
          { id: 'dest-2', name: 'Destination 2', path: 'travel/dest-2.jpg', recommended: '800x600' },
          { id: 'dest-3', name: 'Destination 3', path: 'travel/dest-3.jpg', recommended: '800x600' },
          { id: 'dest-4', name: 'Destination 4', path: 'travel/dest-4.jpg', recommended: '800x600' }
        ]
      },
      {
        id: 'accommodations',
        name: 'Accommodations',
        slots: Array.from({ length: 6 }, (_, i) => ({
          id: `hotel-${i + 1}`,
          name: `Hotel/Accommodation ${i + 1}`,
          path: `travel/hotel-${i + 1}.jpg`,
          recommended: '600x400'
        }))
      }
    ]
  },

  // 6. Contact Page (联系页)
  contact: {
    id: 'contact',
    name: 'Contact',
    icon: '📞',
    sections: [
      {
        id: 'hero',
        name: 'Contact Hero',
        slots: [
          { id: 'contact-hero', name: 'Contact Page Hero', path: 'contact/hero.jpg', recommended: '1920x600' }
        ]
      },
      {
        id: 'location',
        name: 'Location Photos',
        slots: [
          { id: 'location-exterior', name: 'Building Exterior', path: 'contact/exterior.jpg', recommended: '800x600' },
          { id: 'location-reception', name: 'Reception Area', path: 'contact/reception.jpg', recommended: '800x600' }
        ]
      }
    ]
  }
};

/**
 * 获取所有页面的图片总数
 */
export function getTotalImagesCount() {
  let total = 0;

  Object.values(SITE_IMAGES_CONFIG).forEach(page => {
    if (page.sections) {
      page.sections.forEach(section => {
        total += section.slots.length;
      });
    }
    if (page.heroes) {
      total += page.heroes.length;
    }
  });

  return total;
}

/**
 * 获取某个页面的所有图片槽位
 */
export function getPageSlots(pageId) {
  const page = SITE_IMAGES_CONFIG[pageId];
  if (!page) return [];

  const slots = [];

  if (page.sections) {
    page.sections.forEach(section => {
      section.slots.forEach(slot => {
        slots.push({
          ...slot,
          section: section.name,
          sectionId: section.id
        });
      });
    });
  }

  if (page.heroes) {
    page.heroes.forEach(hero => {
      slots.push({
        ...hero,
        section: 'Heroes',
        sectionId: 'heroes'
      });
    });
  }

  return slots;
}

/**
 * 统计摘要
 */
export function getImagesSummary() {
  return {
    homepage: getPageSlots('homepage').length,
    gallery: 3 + (3 * 50), // 3个hero + 每个分类50张
    reviews: getPageSlots('reviews').length,
    about: getPageSlots('about').length,
    travel: getPageSlots('travel').length,
    contact: getPageSlots('contact').length,
    procedures: '100+ procedures × 40 images each',
  };
}
