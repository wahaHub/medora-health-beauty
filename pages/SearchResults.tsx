import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Grid3X3, LayoutGrid, Camera, ChevronLeft, Filter, X } from 'lucide-react';
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
  // Joined from procedures table
  procedure_name?: string;
  procedure_slug?: string;
}

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

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const procedureQuery = searchParams.get('procedure') || '';

  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Get translated procedure name
  const getTranslatedProcedureName = (name: string): string => {
    const translation = typedProcedureNames[name];
    if (translation && translation[currentLanguage as keyof typeof translation]) {
      return translation[currentLanguage as keyof typeof translation];
    }
    return name;
  };

  const displayProcedureName = procedureQuery ? getTranslatedProcedureName(procedureQuery) : t('allProcedures');

  useEffect(() => {
    async function fetchCases() {
      setLoading(true);
      try {
        if (procedureQuery) {
          // Search for specific procedure
          const slug = createSlug(procedureQuery);

          // First find the procedure
          const { data: procedure, error: procError } = await supabase
            .from('procedures')
            .select('id, procedure_name, slug')
            .eq('slug', slug)
            .single();

          if (procError || !procedure) {
            // Try fuzzy match
            const { data: matchingProcs } = await supabase
              .from('procedures')
              .select('id, procedure_name, slug')
              .ilike('procedure_name', `%${procedureQuery}%`);

            if (matchingProcs && matchingProcs.length > 0) {
              // Fetch cases for all matching procedures
              const procIds = matchingProcs.map(p => p.id);
              const { data: casesData, error: casesError } = await supabase
                .from('procedure_cases')
                .select('*')
                .in('procedure_id', procIds)
                .order('sort_order', { ascending: true });

              if (!casesError && casesData) {
                // Add procedure info to each case
                const casesWithProcInfo = casesData.map(c => {
                  const proc = matchingProcs.find(p => p.id === c.procedure_id);
                  return {
                    ...c,
                    procedure_name: proc?.procedure_name,
                    procedure_slug: proc?.slug
                  };
                });
                setCases(casesWithProcInfo);
                setTotalCount(casesWithProcInfo.length);
              }
            } else {
              setCases([]);
              setTotalCount(0);
            }
          } else {
            // Exact match found
            const { data: casesData, error: casesError } = await supabase
              .from('procedure_cases')
              .select('*')
              .eq('procedure_id', procedure.id)
              .order('sort_order', { ascending: true });

            if (!casesError && casesData) {
              const casesWithProcInfo = casesData.map(c => ({
                ...c,
                procedure_name: procedure.procedure_name,
                procedure_slug: procedure.slug
              }));
              setCases(casesWithProcInfo);
              setTotalCount(casesWithProcInfo.length);
            }
          }
        } else {
          // No procedure filter - get all cases with procedure info
          const { data: casesData, error: casesError } = await supabase
            .from('procedure_cases')
            .select(`
              *,
              procedures (
                procedure_name,
                slug
              )
            `)
            .order('sort_order', { ascending: true })
            .limit(50);

          if (!casesError && casesData) {
            const casesWithProcInfo = casesData.map((c: any) => ({
              ...c,
              procedure_name: c.procedures?.procedure_name,
              procedure_slug: c.procedures?.slug
            }));
            setCases(casesWithProcInfo);
            setTotalCount(casesWithProcInfo.length);
          }
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setCases([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, [procedureQuery]);

  const handleCaseClick = (caseItem: CaseData) => {
    const procName = caseItem.procedure_name || procedureQuery;
    navigate(`/procedure/${encodeURIComponent(procName)}/case/${caseItem.case_number}`);
    window.scrollTo(0, 0);
  };

  const handleClearSearch = () => {
    navigate('/search');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-stone-500">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white animate-fade-in-up">
      {/* Hero Section */}
      <section className="relative min-h-[400px] bg-gradient-to-br from-[#1a3a2f] via-[#1f4a3a] to-[#0d1f19] overflow-hidden flex items-end pt-24 md:pt-32 pb-16 md:pb-20">
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
            <span className="text-white">{t('searchResults') || 'SEARCH RESULTS'}</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Search size={32} className="text-gold-400" />
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl uppercase tracking-wide text-white font-light">
              {t('searchResults') || 'Search Results'}
            </h1>
          </div>

          {/* Search Query Display */}
          {procedureQuery && (
            <div className="flex items-center gap-3 mt-6">
              <span className="text-white/60 text-sm">{t('searchingFor') || 'Searching for'}:</span>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <span className="text-gold-400 font-medium">{displayProcedureName}</span>
                <button
                  onClick={handleClearSearch}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <p className="text-white/70 text-lg md:text-xl font-light mt-4">
            {totalCount} {totalCount === 1 ? (t('caseSingular') || 'case') : (t('cases') || 'cases')} {t('found') || 'found'}
          </p>
        </div>
      </section>

      {/* Controls Bar */}
      <section className="border-b border-stone-200 py-4 bg-white sticky top-20 z-30 shadow-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gold-600 hover:text-navy-900 font-medium uppercase tracking-wide text-sm transition-colors"
          >
            <ChevronLeft size={18} />
            {t('backToHome') || 'Back to Home'}
          </button>

          <div className="flex items-center gap-4">
            <span className="text-stone-500 text-sm">{totalCount} {t('results') || 'results'}</span>
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

      {/* Results Grid */}
      <section className="py-12 md:py-16 bg-stone-50">
        <div className="container mx-auto px-6">
          {cases.length === 0 ? (
            <div className="text-center py-20">
              <Camera className="w-16 h-16 text-stone-300 mx-auto mb-6" />
              <h3 className="text-2xl font-serif text-navy-900 mb-4">{t('noResultsFound') || 'No Results Found'}</h3>
              <p className="text-stone-500 max-w-md mx-auto mb-8">
                {t('noResultsDescription') || 'We couldn\'t find any cases matching your search. Try a different procedure or browse our gallery.'}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigate('/gallery')}
                  className="bg-gold-600 text-white px-8 py-3 uppercase tracking-wider text-sm hover:bg-gold-500 transition-colors"
                >
                  {t('browseGallery') || 'Browse Gallery'}
                </button>
                <button
                  onClick={handleClearSearch}
                  className="border border-gold-600 text-gold-600 px-8 py-3 uppercase tracking-wider text-sm hover:bg-gold-50 transition-colors"
                >
                  {t('clearSearch') || 'Clear Search'}
                </button>
              </div>
            </div>
          ) : (
            <div className={`${viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6'
            }`}>
              {cases.map((caseItem) => {
                const procName = caseItem.procedure_name || procedureQuery;
                const caseImage = getProcedureCaseImage(procName, caseItem.case_number, 1);
                const isHovered = hoveredCase === caseItem.id;
                const translatedProcName = getTranslatedProcedureName(procName);

                return (
                  <div
                    key={caseItem.id}
                    className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                      viewMode === 'masonry' ? 'break-inside-avoid mb-6' : ''
                    }`}
                    onClick={() => handleCaseClick(caseItem)}
                    onMouseEnter={() => setHoveredCase(caseItem.id)}
                    onMouseLeave={() => setHoveredCase(null)}
                  >
                    {/* Image Container */}
                    <div className="relative">
                      <div className="aspect-[4/3] bg-sage-100 overflow-hidden">
                        <img
                          src={caseImage}
                          alt={`${t('caseSingular') || 'Case'} #${caseItem.case_number}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                                  <div class="text-center">
                                    <svg class="w-12 h-12 text-stone-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span class="text-stone-400 text-xs">${t('imageNotAvailable') || 'Image not available'}</span>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>

                      {/* Procedure Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-navy-900/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
                          {translatedProcName}
                        </span>
                      </div>

                      {/* Photos Count Badge */}
                      {caseItem.image_count > 1 && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-gold-500/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                            <Camera size={12} />
                            {caseItem.image_count}
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/50 to-transparent flex items-end justify-center pb-8 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="text-center">
                          <span className="text-white uppercase tracking-widest text-sm font-medium">
                            {t('viewCaseDetails') || 'View Details'}
                          </span>
                          <div className="mt-2 w-12 h-0.5 bg-gold-500 mx-auto"></div>
                        </div>
                      </div>
                    </div>

                    {/* Case Info */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-navy-900 font-semibold">
                          {t('caseSingular') || 'Case'} #{caseItem.case_number}
                        </h3>
                      </div>

                      <div className="space-y-1 text-sm text-stone-500">
                        {caseItem.provider_name && (
                          <p className="truncate">
                            <span className="text-stone-400">{t('provider') || 'Provider'}:</span> {caseItem.provider_name}
                          </p>
                        )}
                        {caseItem.patient_age && caseItem.patient_gender && (
                          <p>
                            <span className="text-stone-400">{t('patient') || 'Patient'}:</span> {caseItem.patient_gender}, {caseItem.patient_age}
                          </p>
                        )}
                      </div>
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
            {t('readyToTransform') || 'Ready to Transform?'}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-10 text-lg">
            {t('scheduleConsultationCTA') || 'Schedule a consultation with our expert surgeons to discuss your goals.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              className="bg-gold-600 text-white px-10 py-4 uppercase tracking-[0.15em] hover:bg-gold-500 transition-colors text-sm font-medium"
              onClick={() => navigate('/patient-form')}
            >
              {t('requestConsultation') || 'Request Consultation'}
            </button>
            <button
              className="bg-white/10 text-white px-10 py-4 uppercase tracking-[0.15em] hover:bg-white/20 transition-colors text-sm font-medium border border-white/20"
              onClick={() => navigate('/gallery')}
            >
              {t('browseAllProcedures') || 'Browse All Procedures'}
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <Contact />
    </div>
  );
};

export default SearchResults;
