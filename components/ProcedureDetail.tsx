import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import type { CompleteProcedureData } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { useScrollReveal } from '../hooks/useScrollReveal';
import procedureNames from '../i18n/procedureNames.json';
import { getProcedureImage, getProcedureCaseImage } from '../utils/imageUtils';

interface ProcedureDetailProps {
  procedureName?: string;
  onBack?: () => void;
  onCaseClick?: (id: string) => void;
}

// Case data from Supabase
interface ProcedureCase {
  id: string;
  procedure_id: string;
  case_number: string;
  description: string | null;
  provider_name: string | null;
  patient_age: string | null;
  patient_gender: string | null;
  image_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const ProcedureDetail: React.FC<ProcedureDetailProps> = ({
  onBack,
  onCaseClick
}) => {
  const { procedureName } = useParams<{ procedureName: string }>();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const [procedure, setProcedure] = useState<CompleteProcedureData | null>(null);
  const [cases, setCases] = useState<ProcedureCase[]>([]);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseImageLoaded, setCaseImageLoaded] = useState(false);

  // Scroll reveal animation - must be called at top level with other hooks
  useScrollReveal(!loading && !!procedure);

  // Navigation handlers for cases with animation
  const handlePrevCase = () => {
    if (currentCaseIndex > 0 && !isAnimating) {
      setIsAnimating(true);
      setCaseImageLoaded(false); // Reset image loaded state for fade-in
      setSlideDirection('right');
      setTimeout(() => {
        setCurrentCaseIndex(currentCaseIndex - 1);
        setSlideDirection(null);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleNextCase = () => {
    if (currentCaseIndex < cases.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setCaseImageLoaded(false); // Reset image loaded state for fade-in
      setSlideDirection('left');
      setTimeout(() => {
        setCurrentCaseIndex(currentCaseIndex + 1);
        setSlideDirection(null);
        setIsAnimating(false);
      }, 300);
    }
  };

  // Get current case
  const currentCase = cases[currentCaseIndex];

  // Create slug from procedure name (must match import script logic)
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[®™©]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    async function fetchProcedure() {
      if (!procedureName) return;

      setLoading(true);
      setError(null);

      try {
        const decodedName = decodeURIComponent(procedureName);
        const slug = createSlug(decodedName);
        
        console.log('Searching for procedure:', decodedName);
        console.log('Generated slug:', slug);
        console.log('Language:', currentLanguage);

        // Try to fetch by slug first
        let { data, error: fetchError } = await supabase
          .from('procedures')
          .select(`
            *,
            procedure_translations!inner(*),
            procedure_recovery!inner(*),
            procedure_benefits(*),
            procedure_candidacy(*),
            procedure_techniques(*),
            procedure_recovery_timeline(*),
            procedure_recovery_tips(*),
            complementary_procedures(*),
            procedure_risks(*)
          `)
          .eq('slug', slug)
          .eq('procedure_translations.language_code', currentLanguage)
          .eq('procedure_recovery.language_code', currentLanguage)
          .eq('procedure_benefits.language_code', currentLanguage)
          .eq('procedure_candidacy.language_code', currentLanguage)
          .eq('procedure_techniques.language_code', currentLanguage)
          .eq('procedure_recovery_timeline.language_code', currentLanguage)
          .eq('procedure_recovery_tips.language_code', currentLanguage)
          .eq('complementary_procedures.language_code', currentLanguage)
          .eq('procedure_risks.language_code', currentLanguage)
          .maybeSingle();

        // If not found by slug, try by procedure name with fuzzy matching
        if (!data && !fetchError) {
          console.log('Not found by slug, trying by procedure name (fuzzy match)...');
          
          // First, find matching procedure(s) by name
          const { data: matchingProcs, error: searchError } = await supabase
            .from('procedures')
            .select('id, procedure_name, slug')
            .ilike('procedure_name', `${decodedName}%`); // Match names starting with the search term
          
          if (searchError) {
            console.error('Search error:', searchError);
          }
          
          if (matchingProcs && matchingProcs.length > 0) {
            // Use the first matching procedure
            const matchedProc = matchingProcs[0];
            console.log('Found matching procedure:', matchedProc.procedure_name);
            
            // Now fetch the full procedure data
            const result = await supabase
              .from('procedures')
              .select(`
                *,
                procedure_translations!inner(*),
                procedure_recovery!inner(*),
                procedure_benefits(*),
                procedure_candidacy(*),
                procedure_techniques(*),
                procedure_recovery_timeline(*),
                procedure_recovery_tips(*),
                complementary_procedures(*),
                procedure_risks(*)
              `)
              .eq('id', matchedProc.id)
              .eq('procedure_translations.language_code', currentLanguage)
              .eq('procedure_recovery.language_code', currentLanguage)
              .eq('procedure_benefits.language_code', currentLanguage)
              .eq('procedure_candidacy.language_code', currentLanguage)
              .eq('procedure_techniques.language_code', currentLanguage)
              .eq('procedure_recovery_timeline.language_code', currentLanguage)
              .eq('procedure_recovery_tips.language_code', currentLanguage)
              .eq('complementary_procedures.language_code', currentLanguage)
              .eq('procedure_risks.language_code', currentLanguage)
              .maybeSingle();
            
            data = result.data;
            fetchError = result.error;
          }
        }

        if (fetchError) {
          console.error('Supabase error:', fetchError);
          throw fetchError;
        }
        
        if (!data) {
          throw new Error('Procedure not found');
        }

        // Sort arrays by sort_order
        if (data) {
          data.procedure_benefits?.sort((a, b) => a.sort_order - b.sort_order);
          data.procedure_candidacy?.sort((a, b) => a.sort_order - b.sort_order);
          data.procedure_techniques?.sort((a, b) => a.sort_order - b.sort_order);
          data.procedure_recovery_timeline?.sort((a, b) => a.sort_order - b.sort_order);
          data.procedure_recovery_tips?.sort((a, b) => a.sort_order - b.sort_order);
          data.complementary_procedures?.sort((a, b) => a.sort_order - b.sort_order);
          data.procedure_risks?.sort((a, b) => a.sort_order - b.sort_order);
        }

        setProcedure(data as CompleteProcedureData);

        // Fetch cases directly from Supabase (works in both dev and production)
        try {
          console.log('Fetching cases for procedure_id:', data.id, 'slug:', slug);
          const { data: casesData, error: casesError } = await supabase
            .from('procedure_cases')
            .select('*')
            .eq('procedure_id', data.id)
            .order('sort_order', { ascending: true });

          if (casesError) {
            console.error('Error fetching cases:', casesError);
          } else {
            console.log('Cases fetched:', casesData);
            setCases(casesData || []);
          }
        } catch (casesErr) {
          console.error('Error fetching cases:', casesErr);
        }
      } catch (err) {
        console.error('Error fetching procedure:', err);
        setError('Failed to load procedure details');
      } finally {
        setLoading(false);
      }
    }

    fetchProcedure();
  }, [procedureName, currentLanguage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-stone-600 text-lg">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !procedure) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <h2 className="font-serif text-3xl text-navy-900 mb-4">{t('procedureNotFound')}</h2>
          <p className="text-stone-600 mb-8">{error || t('failedToLoad')}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-navy-900 text-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-gold-600 transition-colors"
          >
            {t('backToHome')}
          </button>
        </div>
      </div>
    );
  }

  const translation = procedure.procedure_translations[0];
  const recovery = procedure.procedure_recovery[0];
  
  // Get translated procedure name from procedureNames.json
  const getTranslatedName = () => {
    const enName = procedure.procedure_name;
    const translations = procedureNames[enName as keyof typeof procedureNames];
    if (translations && currentLanguage in translations) {
      return translations[currentLanguage as keyof typeof translations] as string;
    }
    return enName; // Fallback to English name
  };
  
  const displayName = getTranslatedName();

  return (
    <div className="bg-white animate-fade-in-up spring-scroll-container">
      {/* 1. HERO SECTION */}
      <section className="relative h-[60vh] min-h-[600px] bg-[#1a1a1a] overflow-hidden flex items-center pt-24 md:pt-32">
        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center h-full">
          <div className="md:w-1/2 text-white z-20">
            <div className="mb-8 opacity-90">
               <div className="font-serif text-3xl italic tracking-wide">Medora Health</div>
               <div className="text-xs uppercase tracking-[0.2em] font-light border-t border-white/30 pt-1 mt-1 inline-block">
                 Center for Plastic Surgery
               </div>
            </div>

            <div className="text-[10px] md:text-xs uppercase tracking-widest text-gold-400 mb-4 flex gap-2">
               <span className="cursor-pointer hover:text-white" onClick={() => navigate('/')}>HOME</span>
               <span>|</span>
               <span className="uppercase">{procedure.category}</span>
               <span>|</span>
               <span className="text-white">{displayName}</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 text-white leading-none">
              {displayName.toUpperCase()}
            </h1>

            <div className="max-w-md text-gray-300 text-sm md:text-base leading-relaxed hidden md:block">
              {translation?.overview?.substring(0, 150)}...
            </div>
          </div>

          <div className="absolute inset-0 md:relative md:w-1/2 h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent md:via-[#1a1a1a] z-10 md:hidden"></div>
            <img
              src={procedureName ? getProcedureImage(decodeURIComponent(procedureName), 'hero') : "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=2574&auto=format&fit=crop"}
              alt="Procedure Model"
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=2574&auto=format&fit=crop";
              }}
            />
          </div>
        </div>
      </section>

      {/* 2. OVERVIEW & PROCEDURE SNAPSHOT */}
      <section className="py-20 bg-white scroll-reveal">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
             <div className="lg:w-1/2">
                <h2 className="font-serif text-3xl text-navy-900 mb-6">{t('overview')}</h2>
                <div className="text-stone-600 text-lg leading-relaxed font-light space-y-4">
                  {translation?.overview?.split('\n\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
             </div>
             <div className="lg:w-1/2 w-full">
                <h3 className="uppercase tracking-[0.15em] text-navy-900 text-xl font-serif mb-6 border-b border-stone-300 pb-2">
                  {t('procedureSnapshot')}
                </h3>
                <div className="space-y-4">
                  {translation?.anesthesia && (
                    <div className="flex justify-between items-start border-b border-stone-200 pb-4 text-stone-600">
                       <span className="font-bold text-navy-900">{t('anesthesia')}:</span>
                       <span className="font-light text-right max-w-md">{translation.anesthesia}</span>
                    </div>
                  )}
                  {recovery?.recovery_time && (
                    <div className="flex justify-between items-start border-b border-stone-200 pb-4 text-stone-600">
                       <span className="font-bold text-navy-900">{t('recovery')}:</span>
                       <span className="font-light text-right max-w-md">{recovery.recovery_time}</span>
                    </div>
                  )}
                  {recovery?.ready_to_go_out && (
                    <div className="flex justify-between items-start border-b border-stone-200 pb-4 text-stone-600">
                       <span className="font-bold text-navy-900">{t('readyToGoOut')}:</span>
                       <span className="font-light text-right max-w-md">{recovery.ready_to_go_out}</span>
                    </div>
                  )}
                  {recovery?.resume_exercise && (
                    <div className="flex justify-between items-start border-b border-stone-200 pb-4 text-stone-600">
                       <span className="font-bold text-navy-900">{t('resumeExercise')}:</span>
                       <span className="font-light text-right max-w-md">{recovery.resume_exercise}</span>
                    </div>
                  )}
                  {recovery?.final_results && (
                    <div className="flex justify-between items-start border-b border-stone-200 pb-4 text-stone-600">
                       <span className="font-bold text-navy-900">{t('finalResults')}:</span>
                       <span className="font-light text-right max-w-md">{recovery.final_results}</span>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. BENEFITS SECTION */}
      {procedure.procedure_benefits && procedure.procedure_benefits.length > 0 && (
        <section className="py-20 md:py-28 bg-stone-50 scroll-reveal">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="font-serif text-4xl text-navy-900 mb-8">{t('benefitsDescription')} {displayName}{t('benefitsDescriptionSuffix')}</h2>
                <ul className="space-y-4 text-stone-600 text-lg leading-relaxed font-light">
                  {procedure.procedure_benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2.5 shrink-0"></span>
                      <span>{benefit.benefit_text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:w-1/2">
                 <img
                   src={procedureName ? getProcedureImage(decodeURIComponent(procedureName), 'benefits') : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop"}
                   alt="Benefits"
                   className="w-full h-auto shadow-xl"
                   onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                     e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop";
                   }}
                 />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. CANDIDACY SECTION */}
      {procedure.procedure_candidacy && procedure.procedure_candidacy.length > 0 && (
        <section className="py-20 md:py-28 bg-white scroll-reveal">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="font-serif text-4xl text-navy-900 mb-8">{t('youMayBeGoodCandidate')} {displayName} {t('if')}</h2>
                <ul className="space-y-4 text-stone-600 text-lg font-light">
                   {procedure.procedure_candidacy.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2.5 shrink-0"></span>
                        <span>{item.candidacy_text}</span>
                      </li>
                    ))}
                </ul>
              </div>
              <div className="lg:w-1/2">
                 <img
                   src={procedureName ? getProcedureImage(decodeURIComponent(procedureName), 'candidate') : "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop"}
                   alt="Candidacy"
                   className="w-full h-auto shadow-xl"
                   onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                     e.currentTarget.src = "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop";
                   }}
                 />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. CASE STUDY (Featured Before & After) */}
      <section className="py-24 bg-sage-50/50 scroll-reveal-scale">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-12 border-b border-stone-300 pb-4">
              <div>
                <h4 className="text-gold-600 uppercase tracking-widest text-sm font-bold mb-2">{t('featured')}</h4>
                <h2 className="font-serif text-3xl md:text-4xl text-navy-900 uppercase">
                  {displayName} {t('beforeAfterPhotos')}
                </h2>
              </div>
              <div className="text-navy-900 font-bold text-lg hidden md:block">
                {cases.length > 0 ? `${t('caseOf')} ${currentCaseIndex + 1} ${t('of')} ${cases.length}` : ''}
              </div>
            </div>

            {cases.length > 0 && currentCase ? (
              /* 有案例时显示实际案例 */
              <div className="relative">
                 {/* 箭头导航 - 始终显示在容器外部 */}
                 {cases.length > 1 && (
                   <div className="hidden lg:flex absolute -left-20 top-1/2 -translate-y-1/2 z-10">
                     <button
                       onClick={handlePrevCase}
                       disabled={currentCaseIndex === 0 || isAnimating}
                       className={`p-2 rounded-full transition-all duration-300 ${
                         currentCaseIndex === 0
                           ? 'text-stone-300 cursor-not-allowed'
                           : 'text-gold-600 hover:text-navy-900 hover:bg-gold-100'
                       }`}
                     >
                       <ChevronLeft size={48} strokeWidth={1.5} />
                     </button>
                   </div>
                 )}
                 {cases.length > 1 && (
                   <div className="hidden lg:flex absolute -right-20 top-1/2 -translate-y-1/2 z-10">
                     <button
                       onClick={handleNextCase}
                       disabled={currentCaseIndex >= cases.length - 1 || isAnimating}
                       className={`p-2 rounded-full transition-all duration-300 ${
                         currentCaseIndex >= cases.length - 1
                           ? 'text-stone-300 cursor-not-allowed'
                           : 'text-gold-600 hover:text-navy-900 hover:bg-gold-100'
                       }`}
                     >
                       <ChevronRight size={48} strokeWidth={1.5} />
                     </button>
                   </div>
                 )}

                 {/* Case 内容区域，带滑动动画 */}
                 <div
                   className={`flex flex-col lg:flex-row gap-12 items-start transition-all duration-300 ease-in-out ${
                     slideDirection === 'left' ? 'opacity-0 -translate-x-8' :
                     slideDirection === 'right' ? 'opacity-0 translate-x-8' :
                     'opacity-100 translate-x-0'
                   }`}
                 >
                 <div className="lg:w-1/3 space-y-8">
                    <h3 className="font-serif text-4xl text-navy-900">{t('caseNumber')} #{currentCase.case_number}</h3>
                    <div className="border-t border-stone-300 pt-4">
                      <h4 className="uppercase tracking-widest text-xs font-bold text-navy-900 mb-2">{t('proceduresPerformed')}</h4>
                      <p className="text-gold-500 text-lg">{displayName}</p>
                    </div>
                    <div className="border-t border-stone-300 pt-4">
                      <h4 className="uppercase tracking-widest text-xs font-bold text-navy-900 mb-2">Provider</h4>
                      <p className="text-stone-600">{t('provider')}: <span className="text-gold-600">{currentCase.provider_name || 'Dr. Heather Lee'}</span></p>
                    </div>
                    <div className="border-t border-stone-300 pt-4">
                      <h4 className="uppercase tracking-widest text-xs font-bold text-navy-900 mb-2">{t('description')}</h4>
                      <p className="text-stone-600 leading-relaxed font-light">
                        {currentCase.description || `${displayName} performed by ${currentCase.provider_name || 'Dr. Heather Lee'} with excellent results.`}
                      </p>
                    </div>
                 </div>

                 <div className="lg:w-2/3">
                   <div
                     className="relative group cursor-pointer overflow-hidden aspect-[16/9] bg-sage-100 rounded-lg shadow-lg"
                     onClick={() => onCaseClick && onCaseClick(currentCase.case_number || '1')}
                   >
                     {procedureName && (
                       <img
                         key={currentCase.case_number} // Force re-render on case change
                         src={getProcedureCaseImage(decodeURIComponent(procedureName), currentCase.case_number, 1)}
                         alt={`Case ${currentCase.case_number}`}
                         className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                           caseImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                         }`}
                         onLoad={() => setCaseImageLoaded(true)}
                         onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                           e.currentTarget.style.display = 'none';
                         }}
                       />
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                     <div className="absolute bottom-0 left-0 right-0 text-center py-4 uppercase tracking-widest text-xs font-bold text-white bg-black/40">
                       {t('viewCaseDetails')}
                     </div>
                     <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
                       <div className="font-serif text-4xl text-white italic">M</div>
                     </div>
                   </div>
                   <div className="text-center mt-4 text-xs text-stone-400 font-light tracking-wide italic">{t('clickToViewFullCase')}</div>
                 </div>
                 </div>

                 {/* 移动端底部导航按钮 */}
                 {cases.length > 1 && (
                   <div className="flex lg:hidden justify-center items-center gap-6 mt-8">
                     <button
                       onClick={handlePrevCase}
                       disabled={currentCaseIndex === 0 || isAnimating}
                       className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                         currentCaseIndex === 0
                           ? 'text-stone-300 cursor-not-allowed'
                           : 'text-gold-600 hover:bg-gold-100'
                       }`}
                     >
                       <ChevronLeft size={24} />
                       <span className="text-sm font-medium">Prev</span>
                     </button>
                     <span className="text-stone-500 text-sm">
                       {currentCaseIndex + 1} / {cases.length}
                     </span>
                     <button
                       onClick={handleNextCase}
                       disabled={currentCaseIndex >= cases.length - 1 || isAnimating}
                       className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                         currentCaseIndex >= cases.length - 1
                           ? 'text-stone-300 cursor-not-allowed'
                           : 'text-gold-600 hover:bg-gold-100'
                       }`}
                     >
                       <span className="text-sm font-medium">Next</span>
                       <ChevronRight size={24} />
                     </button>
                   </div>
                 )}
              </div>
            ) : (
              /* 没有案例时显示 placeholder */
              <div className="flex flex-col lg:flex-row gap-12 items-center">
                 <div className="lg:w-1/3 space-y-6 text-center lg:text-left">
                    <div className="w-20 h-20 mx-auto lg:mx-0 rounded-full bg-sage-100 flex items-center justify-center">
                      <svg className="w-10 h-10 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-3xl text-navy-900">{t('comingSoon')}</h3>
                    <p className="text-stone-600 leading-relaxed font-light">
                      {t('noCasesYet')}
                    </p>
                 </div>

                 <div className="lg:w-2/3">
                   <div className="grid grid-cols-2 gap-1">
                      <div className="relative overflow-hidden aspect-[3/4] bg-sage-100">
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-sage-400">
                          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm uppercase tracking-widest">{t('beforePhotos')}</span>
                        </div>
                      </div>
                      <div className="relative overflow-hidden aspect-[3/4] bg-sage-100">
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-sage-400">
                          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm uppercase tracking-widest">{t('afterPhotos')}</span>
                        </div>
                      </div>
                   </div>
                 </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-center gap-6 mt-16">
               <button
                 onClick={() => navigate(`/procedure/${encodeURIComponent(procedureName || '')}/gallery`)}
                 className="bg-navy-900 text-white px-10 py-4 uppercase tracking-[0.15em] hover:bg-navy-800 transition-colors text-sm"
               >
                 {t('viewPhotoGallery')}
               </button>
               <button
                 onClick={() => navigate('/patient-form')}
                 className="bg-gold-600 text-white px-10 py-4 uppercase tracking-[0.15em] hover:bg-gold-500 transition-colors text-sm"
               >
                 {t('requestConsultation')}
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TECHNIQUES SECTION */}
      {procedure.procedure_techniques && procedure.procedure_techniques.length > 0 && (
        <section className="py-20 md:py-28 bg-sage-50/50 scroll-reveal">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-serif text-4xl text-navy-900 mb-4 text-center">{t('techniquesApproaches')}</h2>
              <p className="text-stone-600 text-lg text-center mb-12 max-w-2xl mx-auto">
                {t('techniquesDescription')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {procedure.procedure_techniques.map((tech, i) => (
                  <div key={i} className="bg-white p-8 shadow-sm border border-stone-200 hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-gold-600 font-bold text-xl mb-4">{tech.technique_name}</h3>
                    <p className="text-stone-600 leading-relaxed">{tech.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. THE PROCEDURE */}
      {translation?.procedure_description && (
        <section className="py-20 bg-white scroll-reveal">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-4xl text-navy-900 mb-8">{t('procedureDescription')}</h2>
              <div className="text-stone-600 text-lg leading-relaxed font-light space-y-4">
                {translation.procedure_description.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. RECOVERY TIMELINE */}
      {procedure.procedure_recovery_timeline && procedure.procedure_recovery_timeline.length > 0 && (
        <section className="py-24 bg-[#f9f5f1] scroll-reveal">
           <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                 <h2 className="font-serif text-4xl text-navy-900 mb-6">{t('recoveryTimeline')}</h2>
                 <p className="text-stone-600 max-w-3xl mx-auto leading-relaxed font-light text-lg">
                    {t('recoveryTimelineDescription')}
                 </p>
              </div>

              <div className="max-w-4xl mx-auto relative">
                 <div className="absolute left-[30px] md:left-[50%] top-0 bottom-0 w-1 bg-gold-200 -translate-x-1/2"></div>
                 
                 <div className="space-y-12 relative z-10">
                    {procedure.procedure_recovery_timeline.map((item, idx) => (
                       <div key={idx} className="flex flex-col md:flex-row md:items-center w-full group">
                          <div className="md:w-1/2 md:pr-12 md:text-right pl-16 md:pl-0 mb-2 md:mb-0">
                             <h4 className="text-navy-900 font-bold text-lg md:text-xl">{item.timepoint}</h4>
                          </div>
                          
                          <div className="absolute left-[30px] md:left-[50%] w-5 h-5 rounded-full bg-gold-600 border-4 border-[#f9f5f1] -translate-x-1/2 group-hover:scale-125 transition-transform"></div>

                          <div className="md:w-1/2 md:pl-12 pl-16">
                             <p className="text-stone-600 font-light">{item.guidance}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* 9. RECOVERY TIPS */}
      {procedure.procedure_recovery_tips && procedure.procedure_recovery_tips.length > 0 && (
        <section className="py-20 bg-white scroll-reveal">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-4xl text-navy-900 mb-12">{t('recoveryTips')}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {procedure.procedure_recovery_tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-4 p-6 bg-sage-50 rounded">
                    <div className="w-8 h-8 rounded-full bg-gold-600 text-white flex items-center justify-center font-bold shrink-0 text-sm">
                      {i + 1}
                    </div>
                    <p className="text-stone-600 leading-relaxed">{tip.tip_text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 10. COMPLEMENTARY PROCEDURES */}
      {procedure.complementary_procedures && procedure.complementary_procedures.length > 0 && (
        <section className="py-20 bg-stone-50 scroll-reveal">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-4xl text-navy-900 mb-4 text-center">{t('complementaryProcedures')}</h2>
              <p className="text-stone-600 text-lg text-center mb-12 max-w-2xl mx-auto">
                {t('complementaryDescription')} {displayName.toLowerCase()} {t('complementaryDescriptionEnd')}
              </p>
              
              <div className="space-y-6">
                {procedure.complementary_procedures.map((comp, i) => (
                  <div key={i} className="bg-white p-6 shadow-sm border-l-4 border-gold-600">
                    <h3 className="text-navy-900 font-bold text-xl mb-3">{comp.complementary_name}</h3>
                    <p className="text-stone-600 leading-relaxed">{comp.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 11. RISKS & CONSIDERATIONS */}
      {procedure.procedure_risks && procedure.procedure_risks.length > 0 && (
        <section className="py-20 bg-white scroll-reveal">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-4xl text-navy-900 mb-4">{t('risksConsiderations')}</h2>
              <p className="text-stone-600 text-lg mb-8">
                {t('risksIntro')}
              </p>
              
              <ul className="space-y-4">
                {procedure.procedure_risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-3 text-stone-600 leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-stone-400 mt-2.5 shrink-0"></span>
                    <span>{risk.risk_text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 12. CHOOSING THE RIGHT SURGEON */}
      <section className="bg-[#1c1c1c] py-24 text-white scroll-reveal-scale">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h4 className="text-gold-600 uppercase tracking-widest text-sm font-bold mb-4">
              {t('medoraHealthCenterFull')}
            </h4>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white">
              {t('choosingTheRightSurgeon')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
            <div className="flex flex-col">
              <div className="mb-6 aspect-[4/3] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=2670&auto=format&fit=crop" 
                  alt="Dr. Vito Medora" 
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="font-bold text-xl mb-4">Dr. Vito Medora</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-6 font-light">
                Dr. Vito Medora is a double board-certified facial plastic and reconstructive surgeon with over 30 years of experience.
              </p>
              <a href="#" className="text-gold-500 hover:text-white uppercase tracking-wider text-xs font-bold flex items-center gap-1 mt-auto">
                Meet Dr. Medora <ChevronRight size={14} />
              </a>
            </div>

            <div className="flex flex-col">
              <div className="mb-6 aspect-[4/3] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2665&auto=format&fit=crop" 
                  alt="Dr. Heather Lee" 
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="font-bold text-xl mb-4">Dr. Heather Lee</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-6 font-light">
                Dr. Heather Lee is a double board-certified facial plastic surgeon who specializes in aesthetic and functional procedures.
              </p>
              <a href="#" className="text-gold-500 hover:text-white uppercase tracking-wider text-xs font-bold flex items-center gap-1 mt-auto">
                Meet Dr. Lee <ChevronRight size={14} />
              </a>
            </div>

            <div className="flex-col">
              <div className="mb-6 aspect-[4/3] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2670&auto=format&fit=crop" 
                  alt="Dr. Alex Montague" 
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="font-bold text-xl mb-4">Dr. Alex Montague</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-6 font-light">
                Dr. Alex Montague is a board-certified facial plastic surgeon specializing in cosmetic and reconstructive surgery.
              </p>
              <a href="#" className="text-gold-500 hover:text-white uppercase tracking-wider text-xs font-bold flex items-center gap-1 mt-auto">
                Meet Dr. Montague <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 13. CTA SECTION */}
      <section className="py-20 bg-sage-50/50 scroll-reveal">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl text-navy-900 mb-6">{t('readyToGetStarted')}</h2>
          <p className="text-stone-600 text-lg mb-10 max-w-2xl mx-auto">
            {t('scheduleConsultationDescription')} {displayName.toLowerCase()} {t('andDiscoverHow')}
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
             <button
               onClick={() => navigate(`/procedure/${encodeURIComponent(procedureName || '')}/gallery`)}
               className="bg-navy-900 text-white px-10 py-4 uppercase tracking-[0.15em] hover:bg-navy-800 transition-colors text-sm"
             >
               {t('viewPhotoGallery')}
             </button>
             <button
               onClick={() => navigate('/patient-form')}
               className="bg-gold-600 text-white px-10 py-4 uppercase tracking-[0.15em] hover:bg-gold-500 transition-colors text-sm"
             >
               {t('requestConsultation')}
             </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProcedureDetail;
