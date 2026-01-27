import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import procedureNames from '../i18n/procedureNames.json';

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

interface Surgeon {
  surgeon_id: string;
  name: string;
}

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [surgeons, setSurgeons] = useState<Surgeon[]>([]);
  const [loadingSurgeons, setLoadingSurgeons] = useState(true);

  // Enable scroll reveal animations
  useScrollReveal(true);

  // Fetch surgeons from API
  useEffect(() => {
    const fetchSurgeons = async () => {
      try {
        const response = await fetch('/api/surgeons');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Get unique surgeons from all specialties
            const allSurgeons = Object.values(result.data.surgeonsBySpecialty).flat() as Surgeon[];
            const uniqueSurgeons = allSurgeons.filter((surgeon: Surgeon, index: number, self: Surgeon[]) =>
              index === self.findIndex((s: Surgeon) => s.surgeon_id === surgeon.surgeon_id)
            );
            // Sort by name
            uniqueSurgeons.sort((a, b) => a.name.localeCompare(b.name));
            setSurgeons(uniqueSurgeons);
          }
        }
      } catch (error) {
        console.error('Failed to fetch surgeons:', error);
      } finally {
        setLoadingSurgeons(false);
      }
    };

    fetchSurgeons();
  }, []);

  // Get translated procedure name
  const getTranslatedProcedure = (englishName: string): string => {
    const translation = typedProcedureNames[englishName];
    if (translation && translation[currentLanguage as keyof typeof translation]) {
      return translation[currentLanguage as keyof typeof translation];
    }
    return englishName;
  };

  // Define procedure categories
  const faceProcedures = [
    'Brow Lift', 'Eyelid Surgery', 'Facelift', 'Midface Lift', 'Mini Facelift',
    'Neck Lift', 'Deep Neck Contouring', 'Otoplasty', 'Rhinoplasty',
    'Revision Rhinoplasty', 'Cheek Augmentation', 'Chin Augmentation',
    'Jawline Contouring', 'Facial Implants', 'Buccal Fat Removal',
    'Fat Transfer', 'Lip Augmentation', 'Lip Lift'
  ];

  const bodyProcedures = [
    'Liposuction', 'Tummy Tuck', 'Mommy Makeover', 'Arm Lift', 'Thigh Lift',
    'Brazilian Butt Lift', 'Buttock Lift', 'Labiaplasty'
  ];

  const breastProcedures = [
    'Breast Augmentation', 'Breast Lift', 'Breast Reduction',
    'Gynecomastia Surgery'
  ];

  const nonSurgicalProcedures = [
    'BOTOX® Cosmetic', 'Dermal Fillers', 'Lip Filler',
    'Chemical Peels', 'Laser Skin Resurfacing', 'Microneedling',
    'Hair Restoration'
  ];

  // Build categorized procedures for select
  const allProcedureCategories = [
    { label: t('categoryFace'), procedures: faceProcedures },
    { label: t('categoryBody'), procedures: bodyProcedures },
    { label: t('categoryBreast') || 'Breast', procedures: breastProcedures },
    { label: t('categoryNonSurgical'), procedures: nonSurgicalProcedures },
  ];

  return (
    <section id="contact" className="relative py-24 bg-forest-gradient text-white">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
           }}>
      </div>

      {/* Gradient overlay to ensure text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f201b]/90 to-[#1e3a34]/90 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-7xl mb-6 tracking-wide text-white scroll-reveal">{t('contactTitle')}</h2>
          <div className="text-lg md:text-xl font-light text-sage-100 space-y-2 font-sans">
            <p className="font-semibold text-white">{t('contactPhone')}</p>
            <p>{t('contactEmailDisplay')}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto scroll-reveal">
          <p className="text-xs text-sage-300 mb-2 font-sans">{t('contactRequired')}</p>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder={t('contactFirstName')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
              <input required type="text" placeholder={t('contactLastName')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="email" placeholder={t('contactEmail')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
              <input required type="tel" placeholder={t('contactPhoneField')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder={t('contactZipCode')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />

              {/* Procedure Interest Dropdown - with all procedures */}
              <div className="relative">
                <select required className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 appearance-none rounded-none cursor-pointer">
                  <option value="" disabled selected className="text-navy-900">{t('contactProcedureInterest')}</option>
                  {allProcedureCategories.map((category) => (
                    <optgroup key={category.label} label={category.label} className="text-navy-900 font-semibold">
                      {category.procedures
                        .filter(name => typedProcedureNames[name])
                        .map((procedureName) => (
                          <option key={procedureName} value={procedureName} className="text-navy-900">
                            {getTranslatedProcedure(procedureName)}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Preferred Provider Dropdown - with all surgeons */}
            <div className="relative">
              <select className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 appearance-none rounded-none cursor-pointer">
                <option value="" disabled selected className="text-navy-900">{t('contactPreferredProvider')}</option>
                <option value="any" className="text-navy-900">{t('contactFirstAvailable')}</option>
                {!loadingSurgeons && surgeons.map((surgeon) => (
                  <option key={surgeon.surgeon_id} value={surgeon.surgeon_id} className="text-navy-900">
                    {surgeon.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 pointer-events-none" size={20} />
            </div>

            <textarea
              rows={6}
              placeholder={t('contactHowCanWeHelp')}
              className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all resize-none placeholder-sage-300"
            ></textarea>

            <div className="pt-8 text-center">
              <button type="submit" className="bg-gold-500 text-white px-12 py-4 uppercase tracking-[0.2em] text-sm font-bold hover:bg-gold-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-gold-500/20">
                {t('contactSubmit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
