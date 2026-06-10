export type ProcedureCategoryKey = 'face' | 'body' | 'nonsurgical' | 'hair';

export interface ProcedureItem {
  label: string;
  category?: string;
}

export const proceduresByCategory: Record<ProcedureCategoryKey, ProcedureItem[]> = {
  face: [
    { label: 'Eyelid Surgery', category: 'Eye Surgery' },
    { label: 'Rhinoplasty', category: 'Nose Surgery' },
    { label: 'Revision Rhinoplasty', category: 'Nose Surgery' },
    { label: 'Nose Tip Refinement', category: 'Nose Surgery' },
    { label: 'Facelift', category: 'Facelift Surgery' },
    { label: 'Mini Facelift', category: 'Facelift Surgery' },
    { label: 'Midface Lift (Mid Facelift)', category: 'Facelift Surgery' },
    { label: 'Neck Lift', category: 'Facelift Surgery' },
    { label: 'Deep Neck Contouring', category: 'Facelift Surgery' },
    { label: 'Brow Lift', category: 'Facelift Surgery' },
    { label: 'Temples Lift / Temporofrontal Lift', category: 'Facelift Surgery' },
    { label: 'Forehead Reduction Surgery', category: 'Facelift Surgery' },
    { label: 'Cheek Augmentation', category: 'Facial Contouring' },
    { label: 'Chin Augmentation', category: 'Facial Contouring' },
    { label: 'Jawline Contouring', category: 'Facial Contouring' },
    { label: 'Zygomatic Arch Contouring', category: 'Facial Contouring' },
    { label: 'Otoplasty (Ear Pinning)', category: 'Other Facial Surgery' },
    { label: 'Buccal Fat Removal', category: 'Other Facial Surgery' },
    { label: 'Renuvion® Skin Tightening Treatment', category: 'Skin Tightening' },
    { label: 'Laser Liposuction', category: 'Skin Tightening' },
    { label: 'Skin Resurfacing', category: 'Skin Tightening' },
    { label: 'Microdermabrasion', category: 'Skin Tightening' },
    { label: 'Facial Injectables', category: 'Injectables' },
    { label: 'BOTOX® & Neurotoxins', category: 'Injectables' },
    { label: 'Dermal Fillers', category: 'Injectables' },
    { label: 'Fat Dissolving Injections', category: 'Injectables' },
    { label: 'Fat Transfer (Facial Fat Grafting)', category: 'Injectables' },
    { label: 'Facial Rejuvenation with PRP', category: 'Injectables' },
    { label: 'Lip Filler', category: 'Injectables' },
    { label: 'Lip Injections', category: 'Injectables' },
    { label: 'Lip Augmentation', category: 'Injectables' },
    { label: 'Lip Lift', category: 'Injectables' },
    { label: 'Neck Liposuction', category: 'Neck Surgery' },
    { label: 'Neck Tightening', category: 'Neck Surgery' },
    { label: 'Platysmaplasty', category: 'Neck Surgery' },
    { label: 'Cervicoplasty', category: 'Neck Surgery' },
    { label: 'Hair Restoration', category: 'Hair Restoration' },
    { label: 'Mohs Skin Cancer Reconstruction', category: 'Other Procedures' },
    { label: 'Facial Implants', category: 'Other Procedures' },
    { label: 'Submalar Implants', category: 'Other Procedures' },
  ],
  body: [
    { label: 'Liposuction', category: 'Core Body Contouring' },
    { label: 'Tummy Tuck', category: 'Core Body Contouring' },
    { label: 'Mommy Makeover', category: 'Core Body Contouring' },
    { label: 'Scar Reduction & Revision', category: 'Core Body Contouring' },
    { label: 'Renuvion® Skin Tightening Treatment', category: 'Core Body Contouring' },
    { label: 'Weight Loss Injections', category: 'Core Body Contouring' },
    { label: 'Arm Lift', category: 'Arms / Legs / Back' },
    { label: 'Thigh Lift', category: 'Arms / Legs / Back' },
    { label: 'Bra Line Back Lift', category: 'Arms / Legs / Back' },
    { label: 'Body Contouring After Weight Loss', category: 'After Weight Loss' },
    { label: 'Lower Body Lift / 360 Body Lift', category: 'After Weight Loss' },
    { label: 'Upper Body Lift', category: 'After Weight Loss' },
    { label: 'Panniculectomy', category: 'After Weight Loss' },
    { label: 'Mons Pubis Reduction / Lift', category: 'After Weight Loss' },
    { label: 'Breast Augmentation', category: 'Breast / Chest' },
    { label: 'Breast Lift', category: 'Breast / Chest' },
    { label: 'Breast Reduction', category: 'Breast / Chest' },
    { label: 'Breast Implant Removal / Exchange & Revision', category: 'Breast / Chest' },
    { label: 'Gynecomastia Surgery', category: 'Breast / Chest' },
    { label: 'Brazilian Butt Lift (BBL)', category: 'Buttocks' },
    { label: 'Buttock Lift', category: 'Buttocks' },
    { label: 'Labiaplasty', category: 'Intimate' },
    { label: 'Avéli® Cellulite Treatment', category: 'Cellulite' },
  ],
  nonsurgical: [
    { label: 'BOTOX® Cosmetic', category: 'Injectables' },
    { label: 'BOTOX® & Neurotoxins', category: 'Injectables' },
    { label: 'Dermal Fillers', category: 'Injectables' },
    { label: 'Lip Injections', category: 'Injectables' },
    { label: 'Lip Filler', category: 'Injectables' },
    { label: 'Avéli® Cellulite Treatment', category: 'Cellulite' },
    { label: 'Non-surgical Skin Tightening', category: 'Skin Tightening' },
    { label: 'Chemical Peels', category: 'Resurfacing' },
    { label: 'Skin Resurfacing', category: 'Resurfacing' },
    { label: 'Laser Skin Resurfacing', category: 'Resurfacing' },
    { label: 'Microdermabrasion', category: 'Resurfacing' },
    { label: 'IPL / Photofacial', category: 'Light / Laser-Based' },
    { label: 'Laser Hair Removal', category: 'Hair Removal' },
    { label: 'Collagen Stimulators / Non-HA Fillers', category: 'Collagen / Regenerative' },
    { label: 'Microneedling', category: 'Collagen / Regenerative' },
    { label: 'PRP / PRF', category: 'Collagen / Regenerative' },
  ],
  hair: [
    { label: 'Hair Restoration', category: 'Hair Restoration' },
    { label: 'Hair Transplant', category: 'Hair Restoration' },
    { label: 'PRP Hair Treatment', category: 'Regenerative Hair' },
    { label: 'Hairline Restoration', category: 'Hairline Design' },
  ],
};

const normalizeProcedureLabel = (label: string) =>
  label
    .toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const getSupportedProcedureOptions = () => {
  const seen = new Set<string>();
  return (Object.entries(proceduresByCategory) as Array<[ProcedureCategoryKey, ProcedureItem[]]>)
    .flatMap(([area, procedures]) =>
      procedures.map((procedure) => ({
        ...procedure,
        area,
      }))
    )
    .filter((procedure) => {
      const key = normalizeProcedureLabel(procedure.label);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};
