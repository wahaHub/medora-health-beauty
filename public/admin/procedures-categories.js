/**
 * 完整的医美手术分类数据
 * 3大类别，100+手术项目
 */

export const PROCEDURE_CATEGORIES = {
  FACE: {
    id: 'face',
    name: 'Face & Neck',
    icon: '👤',
    subcategories: [
      {
        id: 'face-neck',
        name: 'Face & Neck Procedures',
        procedures: [
          'Brow Lift',
          'Temples Lift / Temporofrontal Lift',
          'Forehead Reduction Surgery',
          'Eyelid Surgery',
          'Facelift',
          'Midface Lift (Mid Facelift)',
          'Mini Facelift',
          'Neck Lift',
          'Deep Neck Contouring',
          'Neck Liposuction',
          'Platysmaplasty',
          'Cervicoplasty',
          'Otoplasty (Ear Pinning)',
          'Rhinoplasty',
          'Revision Rhinoplasty',
          'Nose Tip Refinement',
          'Mohs Skin Cancer Reconstruction',
        ]
      },
      {
        id: 'contouring-implants',
        name: 'Facial Contouring & Implants',
        procedures: [
          'Cheek Augmentation',
          'Chin Augmentation',
          'Jawline Contouring',
          'Zygomatic Arch Contouring',
          'Facial Implants',
          'Submalar Implants',
          'Buccal Fat Removal',
        ]
      },
      {
        id: 'injectables',
        name: 'Injectables & Regenerative',
        procedures: [
          'Facial Injectables',
          'BOTOX® & Neurotoxins',
          'Dermal Fillers',
          'Lip Filler',
          'Lip Injections',
          'Fat Dissolving Injections',
          'Fat Transfer (Facial Fat Grafting)',
          'Facial Rejuvenation with PRP',
        ]
      },
      {
        id: 'lips',
        name: 'Lips',
        procedures: [
          'Lip Augmentation',
          'Lip Lift',
        ]
      },
      {
        id: 'skin-tightening',
        name: 'Skin Tightening & Resurfacing',
        procedures: [
          'Neck Tightening',
          'Renuvion® Skin Tightening Treatment',
          'Skin Resurfacing',
          'Microdermabrasion',
          'Laser Liposuction',
        ]
      },
      {
        id: 'hair',
        name: 'Hair',
        procedures: [
          'Hair Restoration',
        ]
      }
    ]
  },

  BODY: {
    id: 'body',
    name: 'Core Body Contouring',
    icon: '🏃',
    subcategories: [
      {
        id: 'core-contouring',
        name: 'Core Body Contouring',
        procedures: [
          'Liposuction',
          'Tummy Tuck',
          'Mommy Makeover',
          'Scar Reduction & Revision',
          'Renuvion® Skin Tightening Treatment',
          'Weight Loss Injections',
        ]
      },
      {
        id: 'arms-legs-back',
        name: 'Arms / Legs / Back',
        procedures: [
          'Arm Lift',
          'Thigh Lift',
          'Bra Line Back Lift',
        ]
      },
      {
        id: 'weight-loss',
        name: 'After Weight Loss / Body Lifts',
        procedures: [
          'Body Contouring After Weight Loss',
          'Lower Body Lift / 360 Body Lift',
          'Upper Body Lift',
          'Panniculectomy',
          'Mons Pubis Reduction / Lift',
        ]
      },
      {
        id: 'breast-chest',
        name: 'Breast / Chest',
        procedures: [
          'Breast Augmentation',
          'Breast Lift',
          'Breast Reduction',
          'Breast Implant Removal / Exchange & Revision',
          'Gynecomastia Surgery',
        ]
      },
      {
        id: 'buttocks',
        name: 'Buttocks',
        procedures: [
          'Brazilian Butt Lift (BBL)',
          'Buttock Lift',
        ]
      },
      {
        id: 'intimate',
        name: 'Intimate',
        procedures: [
          'Labiaplasty',
        ]
      },
      {
        id: 'cellulite',
        name: 'Cellulite',
        procedures: [
          'Avéli® Cellulite Treatment',
        ]
      }
    ]
  },

  NON_SURGICAL: {
    id: 'non-surgical',
    name: 'Injectables & Non-Surgical',
    icon: '💉',
    subcategories: [
      {
        id: 'injectables-ns',
        name: 'Injectables',
        procedures: [
          'BOTOX® Cosmetic',
          'BOTOX® & Neurotoxins',
          'Dermal Fillers',
          'Lip Injections',
          'Lip Filler',
        ]
      },
      {
        id: 'cellulite-ns',
        name: 'Cellulite',
        procedures: [
          'Avéli® Cellulite Treatment',
        ]
      },
      {
        id: 'skin-tightening-ns',
        name: 'Skin Tightening',
        procedures: [
          'Non-surgical Skin Tightening',
        ]
      },
      {
        id: 'resurfacing',
        name: 'Resurfacing / Skin Renewal',
        procedures: [
          'Chemical Peels',
          'Skin Resurfacing',
          'Laser Skin Resurfacing',
          'Microdermabrasion',
        ]
      },
      {
        id: 'laser-treatments',
        name: 'Light / Laser-Based Skin Treatments',
        procedures: [
          'IPL / Photofacial',
        ]
      },
      {
        id: 'hair-removal',
        name: 'Hair Removal',
        procedures: [
          'Laser Hair Removal',
        ]
      },
      {
        id: 'collagen',
        name: 'Collagen / Regenerative',
        procedures: [
          'Collagen Stimulators / Non-HA Fillers',
          'Microneedling',
          'PRP / PRF',
        ]
      }
    ]
  }
};

/**
 * 获取所有手术项目的扁平列表
 */
export function getAllProcedures() {
  const allProcedures = [];

  Object.values(PROCEDURE_CATEGORIES).forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.procedures.forEach(procedure => {
        allProcedures.push({
          name: procedure,
          category: category.id,
          categoryName: category.name,
          subcategory: subcategory.id,
          subcategoryName: subcategory.name,
        });
      });
    });
  });

  return allProcedures;
}

/**
 * 获取某个分类下的所有手术
 */
export function getProceduresByCategory(categoryId) {
  const category = Object.values(PROCEDURE_CATEGORIES).find(c => c.id === categoryId);
  if (!category) return [];

  const procedures = [];
  category.subcategories.forEach(subcategory => {
    subcategory.procedures.forEach(procedure => {
      procedures.push({
        name: procedure,
        subcategory: subcategory.id,
        subcategoryName: subcategory.name,
      });
    });
  });

  return procedures;
}

/**
 * 创建 URL slug
 */
export function createSlug(procedureName) {
  return procedureName
    .toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 统计信息
 */
export function getStats() {
  const allProcs = getAllProcedures();
  return {
    totalProcedures: allProcs.length,
    faceCount: allProcs.filter(p => p.category === 'face').length,
    bodyCount: allProcs.filter(p => p.category === 'body').length,
    nonSurgicalCount: allProcs.filter(p => p.category === 'non-surgical').length,
  };
}
