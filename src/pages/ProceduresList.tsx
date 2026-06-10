import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import procedureNames from '@/i18n/procedureNames.json';
import { getProcedureImage } from '@/utils/imageUtils';
import { proceduresByCategory } from '@/data/procedureTaxonomy';

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

  const currentProcedures = proceduresByCategory[category || 'face'] || [];

  const getCategoryTitle = () => {
    switch (category) {
      case 'face':
        return t('navFace');
      case 'body':
        return t('navBody');
      case 'nonsurgical':
        return t('navNonSurgical');
      case 'hair':
        return 'Hair Restoration';
      case 'dental':
        return t('categoryDental');
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
