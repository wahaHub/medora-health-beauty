import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import procedureNames from '../i18n/procedureNames.json';
import { getProcedureImage } from '../utils/imageUtils';

// Type for procedure names translation
type ProcedureNameTranslations = {
  [key: string]: {
    en: string;
    zh: string;
    es: string;
    fr: string;
    de: string;
    ru: string;
    ar: string;
    vi: string;
    id: string;
  };
};

const typedProcedureNames = procedureNames as ProcedureNameTranslations;

interface ProcedureItem {
  label: string;
  category?: string;
}

const ProceduresList: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Helper function to translate procedure names
  const translateLabel = (englishLabel: string): string => {
    const translation = typedProcedureNames[englishLabel];
    if (translation && translation[currentLanguage as keyof typeof translation]) {
      return translation[currentLanguage as keyof typeof translation];
    }
    return englishLabel;
  };

  // Define procedures for each category
  const proceduresByCategory: { [key: string]: ProcedureItem[] } = {
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
  };

  const currentProcedures = proceduresByCategory[category || 'face'] || [];

  const getCategoryTitle = () => {
    switch (category) {
      case 'face':
        return t('navFace');
      case 'body':
        return t('navBody');
      case 'nonsurgical':
        return t('navNonSurgical');
      default:
        return 'Procedures';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop title - only show on desktop */}
      <div className="hidden lg:block bg-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="font-serif text-5xl text-navy-900 text-center">
            {getCategoryTitle()}
          </h1>
        </div>
      </div>

      {/* Procedures Grid */}
      <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-12">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
          {currentProcedures.map((procedure, idx) => (
            <div
              key={idx}
              className="group cursor-pointer"
              onClick={() => {
                const procedureName = encodeURIComponent(procedure.label);
                navigate(`/procedure/${procedureName}`);
              }}
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gray-100 mb-3">
                <img
                  src={getProcedureImage(procedure.label, 'hero')}
                  alt={translateLabel(procedure.label)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to a default image if hero image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2670&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Category badge */}
                {procedure.category && (
                  <div className="absolute top-2 left-2">
                    <span className="text-[9px] bg-white/90 text-navy-900 px-2 py-1 rounded-full font-medium uppercase tracking-wider">
                      {translateLabel(procedure.category)}
                    </span>
                  </div>
                )}
              </div>

              {/* Text */}
              <h3 className="text-sm font-medium text-navy-900 leading-tight group-hover:text-gold-600 transition-colors">
                {translateLabel(procedure.label)}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProceduresList;
