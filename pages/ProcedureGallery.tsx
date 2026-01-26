import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Grid3X3, LayoutGrid, Camera } from 'lucide-react';
import Contact from '../components/Contact';
import { getProcedureCaseImage, createSlug } from '../utils/imageUtils';
import { supabase } from '../services/supabaseClient';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import procedureNames from '../i18n/procedureNames.json';

interface CaseData {
  id: string;
  procedure_id: string;
  case_number: string;
  description: string | null;
  provider_name: string | null;
  patient_age: string | null;
  patient_gender: string | null;
  image_count: number;
  sort_order: number;
}

interface ProcedureGalleryProps {
  procedureName?: string;
  onBack?: () => void;
  onCaseClick?: (caseId: string) => void;
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

const ProcedureGallery: React.FC<ProcedureGalleryProps> = ({ onBack, onCaseClick }) => {
  const { procedureName: urlProcedureName } = useParams<{ procedureName: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);

  const procedureName = urlProcedureName ? decodeURIComponent(urlProcedureName) : 'Unknown Procedure';

  // Get translated procedure name
  const getTranslatedProcedureName = (name: string): string => {
    const translation = typedProcedureNames[name];
    if (translation && translation[currentLanguage as keyof typeof translation]) {
      return translation[currentLanguage as keyof typeof translation];
    }
    return name;
  };

  const displayName = getTranslatedProcedureName(procedureName);

  useEffect(() => {
    async function fetchCases() {
      setLoading(true);
      try {
        const slug = createSlug(procedureName);
        const { data: procedure, error: procError } = await supabase
          .from('procedures')
          .select('id')
          .eq('slug', slug)
          .single();

        if (procError || !procedure) {
          console.error('Procedure not found:', procError);
          setLoading(false);
          return;
        }

        const { data: casesData, error: casesError } = await supabase
          .from('procedure_cases')
          .select('*')
          .eq('procedure_id', procedure.id)
          .order('sort_order', { ascending: true });

        if (casesError) {
          console.error('Error fetching cases:', casesError);
          setLoading(false);
          return;
        }

        setCases(casesData || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    if (procedureName) {
      fetchCases();
    }
  }, [procedureName]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(`/procedure/${encodeURIComponent(procedureName)}`);
    }
  };

  const handleCaseClick = (caseNumber: string) => {
    if (onCaseClick) {
      onCaseClick(caseNumber);
    } else {
      navigate(`/procedure/${encodeURIComponent(procedureName)}/case/${caseNumber}`);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-stone-500">{t('loadingGallery')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative min-h-[450px] bg-gradient-to-br from-[#1a3a2f] via-[#1f4a3a] to-[#0d1f19] overflow-hidden flex items-end pt-24 md:pt-32 pb-16 md:pb-20">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-8 opacity-90">
            <div className="font-serif text-3xl italic tracking-wide text-white">{t('medoraHealth')}</div>
            <div className="text-xs uppercase tracking-[0.2em] font-light border-t border-white/30 pt-1 mt-1 inline-block text-white/80">
              {t('centerForPlasticSurgery')}
            </div>
          </div>

          <div className="text-[10px] md:text-xs uppercase tracking-widest text-gold-400 mb-6 flex flex-wrap gap-2">
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/')}>{t('navHome') || 'HOME'}</span>
            <span className="text-white/50">|</span>
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/gallery')}>{t('photoGallery').toUpperCase()}</span>
            <span className="text-white/50">|</span>
            <span className="cursor-pointer hover:text-white transition-colors" onClick={handleBack}>{displayName.toUpperCase()}</span>
            <span className="text-white/50">|</span>
            <span className="text-white">{t('galleryAllCases')}</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl uppercase tracking-wide text-white font-light mb-4">
            {displayName}
          </h1>
          <p className="text-white/70 text-lg md:text-xl font-light max-w-2xl">
            {t('photoGallery')} • {cases.length} {cases.length === 1 ? t('caseSingular') : t('cases')}
          </p>
        </div>
      </section>

      {/* Controls Bar */}
      <section className="border-b border-stone-200 py-4 bg-white sticky top-20 z-30 shadow-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gold-600 hover:text-navy-900 font-medium uppercase tracking-wide text-sm transition-colors"
          >
            <ChevronLeft size={18} />
            {t('backTo')} {displayName}
          </button>

          <div className="flex items-center gap-4">
            <span className="text-stone-500 text-sm">{cases.length} {t('results')}</span>
            <div className="flex bg-stone-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-gold-600' : 'text-stone-400 hover:text-stone-600'}`}
                title="Grid View"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('masonry')}
                className={`p-2 rounded transition-colors ${viewMode === 'masonry' ? 'bg-white shadow-sm text-gold-600' : 'text-stone-400 hover:text-stone-600'}`}
                title="Masonry View"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 md:py-16 bg-stone-50">
        <div className="container mx-auto px-6">
          {cases.length === 0 ? (
            <div className="text-center py-20">
              <Camera className="w-16 h-16 text-stone-300 mx-auto mb-6" />
              <h3 className="text-2xl font-serif text-navy-900 mb-4">{t('noCasesYet')}</h3>
              <p className="text-stone-500 max-w-md mx-auto mb-8">
                {t('noCasesYet')}
              </p>
              <button
                onClick={handleBack}
                className="bg-gold-600 text-white px-8 py-3 uppercase tracking-wider text-sm hover:bg-gold-500 transition-colors"
              >
                {t('backTo')} {displayName}
              </button>
            </div>
          ) : (
            <div className={`${viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'
            }`}>
              {cases.map((caseItem) => {
                // 每个案例只用第一张图（已经包含 before/after）
                const caseImage = getProcedureCaseImage(procedureName, caseItem.case_number, 1);
                const isHovered = hoveredCase === caseItem.case_number;

                return (
                  <div
                    key={caseItem.id}
                    className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                      viewMode === 'masonry' ? 'break-inside-avoid mb-6' : ''
                    }`}
                    onClick={() => handleCaseClick(caseItem.case_number)}
                    onMouseEnter={() => setHoveredCase(caseItem.case_number)}
                    onMouseLeave={() => setHoveredCase(null)}
                  >
                    {/* Image Container - 单张图片（已包含 before/after） */}
                    <div className="relative">
                      <div className="aspect-[4/3] bg-sage-100 overflow-hidden">
                        <img
                          src={caseImage}
                          alt={`${t('caseSingular')} #${caseItem.case_number}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Hover Overlay */}
                      <div className={`absolute inset-0 bg-navy-900/70 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="text-center">
                          <span className="text-white uppercase tracking-widest text-sm font-medium">
                            {t('viewCaseDetails')}
                          </span>
                          <div className="mt-2 w-12 h-0.5 bg-gold-500 mx-auto"></div>
                        </div>
                      </div>
                    </div>

                    {/* Case Info */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-navy-900 font-semibold text-lg">
                          {t('caseSingular')} #{caseItem.case_number}
                        </h3>
                        {caseItem.image_count > 1 && (
                          <span className="text-xs bg-gold-100 text-gold-700 px-2 py-1 rounded-full">
                            {caseItem.image_count} {t('photos')}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-stone-500">
                        {caseItem.provider_name && (
                          <p><span className="text-stone-400">{t('provider')}:</span> {caseItem.provider_name}</p>
                        )}
                        {caseItem.patient_age && caseItem.patient_gender && (
                          <p>
                            <span className="text-stone-400">{t('patient')}:</span> {caseItem.patient_gender}, {caseItem.patient_age}
                          </p>
                        )}
                      </div>

                      {caseItem.description && (
                        <p className="mt-3 text-stone-600 text-sm line-clamp-2">
                          {caseItem.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
            {t('readyToTransform')}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-10 text-lg">
            {t('scheduleConsultationCTA')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              className="bg-gold-600 text-white px-10 py-4 uppercase tracking-[0.15em] hover:bg-gold-500 transition-colors text-sm font-medium"
              onClick={() => navigate('/patient-form')}
            >
              {t('requestConsultation')}
            </button>
            <button
              className="bg-white/10 text-white px-10 py-4 uppercase tracking-[0.15em] hover:bg-white/20 transition-colors text-sm font-medium border border-white/20"
              onClick={handleBack}
            >
              {t('learnMoreAbout')} {displayName}
            </button>
          </div>
        </div>
      </section>

      {/* Reputation Section */}
      <section className="py-20 bg-white text-center border-t border-stone-100">
        <h2 className="font-serif text-3xl md:text-4xl text-navy-900 uppercase tracking-wide mb-2">
          {t('reputationTitle')}
        </h2>
        <p className="text-stone-500 max-w-2xl mx-auto mt-4">
          {t('reputationSubtitle')}
        </p>
      </section>

      {/* Contact Section */}
      <Contact />
    </div>
  );
};

export default ProcedureGallery;
