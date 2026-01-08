import React, { useState } from 'react';
import { User, Search } from 'lucide-react';
import Reputation from './Reputation';
import Contact from './Contact';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import procedureNames from '../i18n/procedureNames.json';

interface GalleryProps {
  onNavigate?: (procedure: string) => void;
}

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

const Gallery: React.FC<GalleryProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'face' | 'body' | 'non-surgical'>('face');

  // Helper function to translate procedure/category names
  const translateLabel = (englishLabel: string): string => {
    const translation = typedProcedureNames[englishLabel];
    if (translation && translation[currentLanguage as keyof typeof translation]) {
      return translation[currentLanguage as keyof typeof translation];
    }
    return englishLabel; // Fallback to English if no translation found
  };

  const categories = {
    face: [
      {
        title: "Face & Neck",
        image: "https://images.unsplash.com/photo-1510526786859-99a38f8f267c?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Brow Lift",
          "Temples Lift / Temporofrontal Lift",
          "Forehead Reduction Surgery",
          "Eyelid Surgery",
          "Facelift",
          "Midface Lift",
          "Mini Facelift",
          "Neck Lift",
          "Deep Neck Contouring",
          "Neck Liposuction",
          "Platysmaplasty",
          "Cervicoplasty",
          "Otoplasty",
          "Rhinoplasty",
          "Revision Rhinoplasty",
          "Nose Tip Refinement",
          "Mohs Skin Cancer Reconstruction"
        ]
      },
      {
        title: "Facial Contouring & Implants",
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Cheek Augmentation",
          "Chin Augmentation",
          "Jawline Contouring",
          "Zygomatic Arch Contouring",
          "Facial Implants",
          "Submalar Implants",
          "Buccal Fat Removal"
        ]
      },
      {
        title: "Injectables & Regenerative",
        image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Facial Injectables",
          "BOTOX® & Neurotoxins",
          "Dermal Fillers",
          "Lip Filler",
          "Lip Injections",
          "Fat Dissolving Injections",
          "Fat Transfer",
          "Facial Rejuvenation with PRP"
        ]
      },
      {
        title: "Lips",
        image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Lip Augmentation",
          "Lip Lift"
        ]
      },
      {
        title: "Skin Tightening & Resurfacing",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Neck Tightening",
          "Renuvion® Skin Tightening Treatment",
          "Skin Resurfacing",
          "Microdermabrasion",
          "Laser Liposuction"
        ]
      },
      {
        title: "Hair",
        image: "https://images.unsplash.com/photo-1620216733221-d706598375e0?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Hair Restoration"
        ]
      }
    ],
    body: [
      {
        title: "Core Body Contouring",
        image: "https://images.unsplash.com/photo-1609121855913-9a3d4f40f3c5?q=80&w=1974&auto=format&fit=crop",
        items: [
          "Liposuction",
          "Tummy Tuck",
          "Mommy Makeover",
          "Scar Reduction & Revision",
          "Renuvion® Skin Tightening Treatment",
          "Weight Loss Injections"
        ]
      },
      {
        title: "Arms / Legs / Back",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Arm Lift",
          "Thigh Lift",
          "Bra Line Back Lift"
        ]
      },
      {
        title: "After Weight Loss / Body Lifts",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Body Contouring After Weight Loss",
          "Lower Body Lift / 360 Body Lift",
          "Upper Body Lift",
          "Panniculectomy",
          "Mons Pubis Reduction / Lift"
        ]
      },
      {
        title: "Breast / Chest",
        image: "https://images.unsplash.com/photo-1605763240004-7e93b172d754?q=80&w=1887&auto=format&fit=crop",
        items: [
          "Breast Augmentation",
          "Breast Lift",
          "Breast Reduction",
          "Breast Implant Removal / Exchange & Revision",
          "Gynecomastia Surgery"
        ]
      },
      {
        title: "Buttocks",
        image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Brazilian Butt Lift",
          "Buttock Lift"
        ]
      },
      {
        title: "Intimate",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Labiaplasty"
        ]
      },
      {
        title: "Cellulite",
        image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Avéli® Cellulite Treatment"
        ]
      }
    ],
    "non-surgical": [
      {
        title: "Injectables",
        image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=2070&auto=format&fit=crop",
        items: [
          "BOTOX® Cosmetic",
          "BOTOX® & Neurotoxins",
          "Dermal Fillers",
          "Lip Injections",
          "Lip Filler"
        ]
      },
      {
        title: "Cellulite",
        image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Avéli® Cellulite Treatment"
        ]
      },
      {
        title: "Skin Tightening",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Non-surgical Skin Tightening"
        ]
      },
      {
        title: "Resurfacing / Skin Renewal",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Chemical Peels",
          "Skin Resurfacing",
          "Laser Skin Resurfacing",
          "Microdermabrasion"
        ]
      },
      {
        title: "Light / Laser-Based Skin Treatments",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=2070&auto=format&fit=crop",
        items: [
          "IPL / Photofacial"
        ]
      },
      {
        title: "Hair Removal",
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Laser Hair Removal"
        ]
      },
      {
        title: "Collagen / Regenerative",
        image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=2070&auto=format&fit=crop",
        items: [
          "Collagen Stimulators",
          "Microneedling",
          "PRP / PRF"
        ]
      }
    ]
  };

  const currentCategories = categories[activeTab];

  return (
    <div className="bg-white animate-fade-in-up">
      {/* 1. Hero Section - Green Gradient */}
      <section className="bg-luxury-green pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }}>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-8">
             <div className="font-serif text-3xl italic tracking-wide text-white">Medora Health</div>
             <div className="text-xs uppercase tracking-[0.2em] font-light text-sage-200 border-t border-sage-200/30 pt-1 mt-1 inline-block">
               Center for Plastic Surgery
             </div>
          </div>
          
          <div className="text-[10px] md:text-xs uppercase tracking-widest text-sage-300 mb-6 font-sans">
             <span className="hover:text-white cursor-pointer transition-colors" onClick={() => window.location.reload()}>{t('galleryHome')}</span>
             <span className="mx-2">|</span>
             <span className="text-gold-500">{t('galleryPhotoGallery')}</span>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl text-white font-light tracking-wide uppercase">
            {t('galleryTitle')}
          </h1>
        </div>
      </section>

      {/* 2. Category Tabs */}
      <section className="bg-white py-8 border-b border-sage-100 sticky top-20 z-20 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-0">
            {/* Category Tabs */}
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('face')}
                className={`flex-1 md:flex-initial px-6 py-3 uppercase tracking-[0.15em] text-xs font-bold transition-colors ${
                  activeTab === 'face'
                    ? 'bg-navy-900 text-white'
                    : 'bg-sage-100 text-stone-600 hover:bg-sage-200'
                }`}
              >
                {t('galleryFace')}
              </button>
              <button
                onClick={() => setActiveTab('body')}
                className={`flex-1 md:flex-initial px-6 py-3 uppercase tracking-[0.15em] text-xs font-bold transition-colors ${
                  activeTab === 'body'
                    ? 'bg-navy-900 text-white'
                    : 'bg-sage-100 text-stone-600 hover:bg-sage-200'
                }`}
              >
                {t('galleryBody')}
              </button>
              <button
                onClick={() => setActiveTab('non-surgical')}
                className={`flex-1 md:flex-initial px-6 py-3 uppercase tracking-[0.15em] text-xs font-bold transition-colors ${
                  activeTab === 'non-surgical'
                    ? 'bg-navy-900 text-white'
                    : 'bg-sage-100 text-stone-600 hover:bg-sage-200'
                }`}
              >
                {t('galleryNonSurgical')}
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 cursor-pointer hover:text-gold-600 text-stone-500 font-bold uppercase text-xs tracking-wide transition-colors">
              <User size={16} /> {t('gallerySignIn')}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Categories Grid */}
      <section className="py-16 md:py-24 bg-sage-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {currentCategories.map((cat, idx) => (
              <div key={idx} className="flex flex-col">
                {/* Image */}
                <div className="aspect-[4/3] w-full overflow-hidden mb-8 relative group">
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-navy-900/10 group-hover:bg-transparent transition-colors"></div>
                  <div className="absolute bottom-4 left-4 text-xs text-white/90 uppercase tracking-widest font-bold">{t('galleryModel')}</div>
                </div>

                {/* Title */}
                <h2 className="font-serif text-3xl text-navy-900 mb-6">{translateLabel(cat.title)}</h2>

                {/* List */}
                <ul className="space-y-3">
                  {cat.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3 group/item">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2 shrink-0 group-hover/item:scale-125 transition-transform"></span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onNavigate) onNavigate(item);
                        }}
                        className="text-stone-500 hover:text-gold-600 transition-colors text-lg font-light leading-tight"
                      >
                        {translateLabel(item)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Reputation Section */}
      <Reputation />

      {/* 5. Contact Section */}
      <Contact />
    </div>
  );
};

export default Gallery;