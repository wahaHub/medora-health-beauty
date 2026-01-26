import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, GraduationCap, Languages, Loader2, ArrowLeft, Calendar, MapPin, Camera, ChevronRight } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { supabase } from '../services/supabaseClient';
import { getProcedureCaseImage } from '../utils/imageUtils';
import procedureNames from '../i18n/procedureNames.json';

// Case data structure (from procedure_cases table)
interface SurgeonCase {
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

// Translation data structure
interface SurgeonTranslation {
  title: string;
  specialties: string[];
  languages: string[];
  education: string[];
  certifications: string[];
  bio: {
    intro: string;
    expertise: string;
    philosophy: string;
    achievements: string[];
  };
}

interface SurgeonDetail {
  surgeon_id: string;
  name: string;
  title: string;
  experience_years: number;
  image_url: string | null;
  image_prompt: string;
  images?: {
    hero?: string;
    office?: string;
    [key: string]: string | undefined;
  };
  specialties: string[];
  languages: string[];
  education: string[];
  certifications: string[];
  procedures_count: { [key: string]: number };
  bio: {
    intro: string;
    expertise: string;
    philosophy: string;
    achievements: string[];
  };
  translations?: {
    [langCode: string]: SurgeonTranslation;
  };
  created_at: string;
  updated_at: string;
}

const SurgeonProfile: React.FC = () => {
  const { surgeonName } = useParams<{ surgeonName: string }>();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const [surgeon, setSurgeon] = useState<SurgeonDetail | null>(null);
  const [surgeonCases, setSurgeonCases] = useState<SurgeonCase[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);

  // Enable scroll reveal animations - only after data is loaded
  useScrollReveal(!loading && surgeon !== null);

  // Get translated data based on current language
  const translatedData = useMemo(() => {
    if (!surgeon) return null;

    // If language is English or no translations available, use original data
    if (currentLanguage === 'en' || !surgeon.translations || !surgeon.translations[currentLanguage]) {
      return {
        title: surgeon.title,
        specialties: surgeon.specialties,
        languages: surgeon.languages,
        education: surgeon.education,
        certifications: surgeon.certifications,
        bio: surgeon.bio,
      };
    }

    // Use translated data
    const trans = surgeon.translations[currentLanguage];
    return {
      title: trans.title || surgeon.title,
      specialties: trans.specialties || surgeon.specialties,
      languages: trans.languages || surgeon.languages,
      education: trans.education || surgeon.education,
      certifications: trans.certifications || surgeon.certifications,
      bio: {
        intro: trans.bio?.intro || surgeon.bio.intro,
        expertise: trans.bio?.expertise || surgeon.bio.expertise,
        philosophy: trans.bio?.philosophy || surgeon.bio.philosophy,
        achievements: trans.bio?.achievements || surgeon.bio.achievements,
      },
    };
  }, [surgeon, currentLanguage]);

  // Placeholder images
  const placeholderHeroImage = "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=2670&auto=format&fit=crop";
  const placeholderOfficeImage = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop";

  // Translate procedure name from database key to localized name
  const translateProcedureName = (procedureKey: string): string => {
    // Convert database key format to procedureNames.json format
    // e.g., "facelifts" -> "Facelift", "eyelid_surgery" -> "Eyelid Surgery"
    const normalized = procedureKey
      .replace(/_/g, ' ')  // Replace underscores with spaces
      .replace(/s$/, '')   // Remove trailing 's' (plural to singular)
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize each word
      .join(' ');

    // Look up in procedureNames.json
    const translations = procedureNames[normalized as keyof typeof procedureNames];
    if (translations && currentLanguage in translations) {
      return translations[currentLanguage as keyof typeof translations] as string;
    }

    // Fallback: return formatted English name
    return normalized;
  };

  useEffect(() => {
    const fetchSurgeonDetail = async () => {
      if (!surgeonName) {
        setError('Surgeon ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Extract surgeon_id from URL (could be "Dr.%20Min%20Zhang" or "min-zhang")
        const surgeonId = decodeURIComponent(surgeonName)
          .replace('Dr. ', '')
          .replace(/\s+/g, '-')
          .toLowerCase();

        console.log('Fetching surgeon:', surgeonId);
        console.log('Language:', currentLanguage);

        // 直接从 Supabase 查询，就像 Procedure 页面一样
        const { data, error: fetchError } = await supabase
          .from('surgeons')
          .select('*')
          .eq('surgeon_id', surgeonId)
          .single();

        if (fetchError) {
          console.error('Supabase error:', fetchError);
          throw fetchError;
        }

        if (!data) {
          throw new Error('Surgeon not found');
        }

        console.log('Surgeon data fetched:', data);
        console.log('Translations available:', data.translations ? Object.keys(data.translations) : 'none');

        setSurgeon(data as SurgeonDetail);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching surgeon details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurgeonDetail();
  }, [surgeonName, currentLanguage]);

  // Fetch cases for this surgeon
  useEffect(() => {
    const fetchSurgeonCases = async () => {
      if (!surgeon) return;

      try {
        setCasesLoading(true);

        // First get the surgeon's UUID from the surgeons table
        const { data: surgeonData, error: surgeonError } = await supabase
          .from('surgeons')
          .select('id')
          .eq('surgeon_id', surgeon.surgeon_id)
          .single();

        if (surgeonError || !surgeonData) {
          console.error('Error fetching surgeon UUID:', surgeonError);
          return;
        }

        // Fetch cases with procedure info joined
        const { data: casesData, error: casesError } = await supabase
          .from('procedure_cases')
          .select(`
            id,
            procedure_id,
            case_number,
            description,
            provider_name,
            patient_age,
            patient_gender,
            image_count,
            sort_order,
            procedures (
              procedure_name,
              slug
            )
          `)
          .eq('surgeon_id', surgeonData.id)
          .order('sort_order', { ascending: true })
          .limit(12);

        if (casesError) {
          console.error('Error fetching surgeon cases:', casesError);
          return;
        }

        // Transform the data to flatten the procedures join
        const transformedCases: SurgeonCase[] = (casesData || []).map((c: any) => ({
          id: c.id,
          procedure_id: c.procedure_id,
          case_number: c.case_number,
          description: c.description,
          provider_name: c.provider_name,
          patient_age: c.patient_age,
          patient_gender: c.patient_gender,
          image_count: c.image_count,
          sort_order: c.sort_order,
          procedure_name: c.procedures?.procedure_name,
          procedure_slug: c.procedures?.slug,
        }));

        console.log('Surgeon cases fetched:', transformedCases.length);
        setSurgeonCases(transformedCases);
      } catch (err) {
        console.error('Error fetching surgeon cases:', err);
      } finally {
        setCasesLoading(false);
      }
    };

    fetchSurgeonCases();
  }, [surgeon]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-gold-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{t('loadingSurgeonProfile')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !surgeon || !translatedData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="text-3xl font-serif text-navy-900 mb-4">{t('surgeonNotFound')}</h1>
          <p className="text-gray-600 mb-8">{error || t('surgeonNotFoundDesc')}</p>
          <button
            onClick={() => navigate('/surgeons')}
            className="bg-navy-900 text-white px-8 py-3 rounded-lg hover:bg-navy-800 transition-colors"
          >
            {t('viewAllSurgeons')}
          </button>
        </div>
      </div>
    );
  }

  // Calculate total procedures (with safe fallback)
  const totalProcedures = surgeon.procedures_count
    ? Object.values(surgeon.procedures_count).reduce((sum: number, count: number) => sum + count, 0)
    : 0;

  return (
    <div className="bg-white animate-fade-in-up">
      {/* 1. HERO SECTION - Green Gradient with Surgeon Photo */}
      <section className="relative h-screen min-h-[600px] bg-luxury-green flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f201b] via-[#0f201b]/80 to-transparent z-10 w-full lg:w-2/3"></div>
          <img
            src={surgeon.images?.hero || surgeon.image_url || placeholderHeroImage}
            alt={surgeon.name}
            className="absolute inset-0 w-full h-full object-cover object-[70%_20%] lg:object-[center_20%]"
          />
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 relative z-20 pt-20">
          <div className="flex flex-col lg:flex-row-reverse gap-8 items-start">
            {/* Left Sidebar - Stats & Certifications */}
            <div className="w-full lg:w-80 shrink-0 space-y-6 lg:order-first">
              {/* Surgical Volume Highlights */}
              {surgeon.procedures_count && Object.keys(surgeon.procedures_count).length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 scroll-reveal">
                  <h3 className="text-gold-400 uppercase tracking-[0.2em] text-xs font-bold mb-4">
                    {t('surgicalVolumeHighlights')}
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(surgeon.procedures_count).map(([procedure, count]: [string, number]) => {
                      const maxCount = Math.max(...(Object.values(surgeon.procedures_count) as number[]));
                      const percentage = (count / maxCount) * 100;
                      return (
                        <div key={procedure}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white text-sm capitalize">
                              {translateProcedureName(procedure)}
                            </span>
                            <span className="text-gold-400 font-bold text-sm">{count}</span>
                          </div>
                          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gold-400 h-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Board Certifications */}
              {translatedData.certifications && translatedData.certifications.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 scroll-reveal">
                  <h3 className="text-gold-400 uppercase tracking-[0.2em] text-xs font-bold mb-4">
                    {t('boardCertifications')}
                  </h3>
                  <div className="space-y-3">
                    {translatedData.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="shrink-0 w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center mt-0.5">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-white text-sm leading-relaxed">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Content - Main Info */}
            <div className="flex-1">
              <div className="mb-8">
                <div className="font-serif text-3xl italic tracking-wide text-white">{t('medoraHealth')}</div>
                <div className="text-xs uppercase tracking-[0.2em] font-light text-sage-200 border-t border-sage-200/30 pt-1 mt-1 inline-block">
                  {t('centerForPlasticSurgery')}
                </div>
              </div>

              {/* Breadcrumb */}
              <div className="text-[10px] md:text-xs uppercase tracking-widest mb-4 font-sans">
                <button
                  onClick={() => navigate('/')}
                  className="text-gold-500 hover:text-gold-400 transition-colors"
                >
                  {t('surgeonHome')}
                </button>
                <span className="mx-2 text-white/40">|</span>
                <button
                  onClick={() => navigate('/surgeons')}
                  className="text-gold-500 hover:text-gold-400 transition-colors"
                >
                  {t('surgeonAbout')}
                </button>
                <span className="mx-2 text-white/40">|</span>
                <button
                  onClick={() => navigate('/surgeons')}
                  className="text-gold-500 hover:text-gold-400 transition-colors"
                >
                  {t('ourSurgeons')}
                </button>
                <span className="mx-2 text-white/40">|</span>
                <span className="text-white">{surgeon.name}</span>
              </div>

              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white uppercase tracking-wide font-light mb-4 leading-tight scroll-reveal">
                {surgeon.name}
              </h1>

              <p className="text-sage-100 text-base md:text-lg mb-8 font-light scroll-reveal">
                {translatedData.title}
              </p>

              <p className="text-sage-200 text-lg leading-relaxed mb-10 max-w-lg font-light scroll-reveal">
                {translatedData.bio.intro}
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <div className="flex items-center gap-2 text-sage-200">
                  <Calendar size={18} />
                  <span>{surgeon.experience_years}+ {t('yearsExperience')}</span>
                </div>
                <div className="flex items-center gap-2 text-sage-200">
                  <Award size={18} />
                  <span>{translatedData.specialties.length} {t('specialtiesCount')}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/contact')}
                className="bg-[#8b5e3c] text-white px-8 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-[#6d4a2f] transition-colors"
              >
                {t('requestAConsultation')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPERTISE SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/2">
              <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-8 leading-tight scroll-reveal">
                {t('expertiseSpecialization')}
              </h2>
              <div className="prose prose-lg text-stone-600 leading-relaxed font-light">
                <div dangerouslySetInnerHTML={{ __html: translatedData.bio.expertise.replace(/\n\n/g, '</p><p class="mb-4">') }} />
              </div>
            </div>

            {/* Specialties Card */}
            <div className="lg:w-1/2">
              <div className="bg-sage-50 p-8 border border-sage-100 scroll-reveal">
                <h3 className="font-serif text-2xl text-navy-900 mb-6">{t('areasOfSpecialization')}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {translatedData.specialties.map((specialty: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-stone-700">
                      <div className="w-2 h-2 bg-gold-600 rounded-full"></div>
                      <span className="font-medium">{specialty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              {translatedData.languages && translatedData.languages.length > 0 && (
                <div className="mt-8 bg-white border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Languages size={24} className="text-gold-600" />
                    <h3 className="font-serif text-xl text-navy-900">{t('languagesSpoken')}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {translatedData.languages.map((lang: string, idx: number) => (
                      <span key={idx} className="bg-sage-50 text-stone-700 px-4 py-2 text-sm rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATS - Procedures Count */}
      {(totalProcedures as number) > 0 && (
        <section className="py-20 bg-sage-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-6 scroll-reveal">
              {t('expertiseRefinedExperience')}
            </h2>
            <p className="text-stone-500 text-lg mb-16 max-w-2xl mx-auto font-light">
              {surgeon.name} {t('proceduresPerformedExcellent')}
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {Object.entries(surgeon.procedures_count).map(([procedure, count]: [string, number], idx: number) => (
                <div key={idx} className="bg-white p-10 shadow-sm hover:shadow-md transition-shadow border border-sage-100 scroll-reveal">
                  <div className="font-serif text-5xl md:text-6xl text-navy-900 mb-2">{count.toLocaleString()}+</div>
                  <div className="text-gold-600 font-bold uppercase tracking-widest text-sm">
                    {translateProcedureName(procedure)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. CREDENTIALS & EDUCATION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Left Column - Image */}
            <div className="lg:w-1/2">
              <img
                src={placeholderOfficeImage}
                alt={`${surgeon.name} at conference`}
                className="w-full h-auto shadow-lg mb-6"
              />

              {/* Education */}
              <div className="mt-12 space-y-4 scroll-reveal">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap size={24} className="text-gold-600" />
                  <h3 className="font-serif text-2xl text-navy-900">{t('educationTraining')}</h3>
                </div>
                <div className="space-y-4">
                  {translatedData.education.map((edu: string, idx: number) => (
                    <div key={idx} className="pl-4 border-l-2 border-gold-200">
                      <p className="text-stone-600 font-light">{edu}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Certifications & Achievements */}
            <div className="lg:w-1/2">
              <div className="mb-12 scroll-reveal">
                <div className="flex items-center gap-3 mb-6">
                  <Award size={24} className="text-gold-600" />
                  <h2 className="font-serif text-3xl text-navy-900">{t('boardCertifications')}</h2>
                </div>
                <div className="space-y-4">
                  {translatedData.certifications.map((cert: string, idx: number) => (
                    <div key={idx} className="bg-sage-50 p-4 border-l-4 border-gold-600">
                      <p className="text-stone-700 font-medium">{cert}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              {translatedData.bio.achievements && translatedData.bio.achievements.length > 0 && (
                <div className="mb-12 scroll-reveal">
                  <h2 className="font-serif text-3xl text-navy-900 mb-6 border-b border-gold-200 pb-4">
                    {t('notableAchievements')}
                  </h2>
                  <ul className="space-y-4">
                    {translatedData.bio.achievements.map((achievement: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-stone-600 font-light">
                        <span className="text-gold-500 mt-1 shrink-0">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED CASES SECTION */}
      {surgeonCases.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16 scroll-reveal">
              <span className="text-gold-600 uppercase tracking-[0.2em] text-xs font-bold mb-4 block">
                {t('beforeAfterPhotos')}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-4">
                {t('caseStudy')}
              </h2>
              <p className="text-stone-500 max-w-2xl mx-auto">
                {t('viewRealResults')} {surgeon.name}
              </p>
            </div>

            {/* Cases Grid */}
            {casesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-gold-600 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {surgeonCases.map((caseItem) => {
                  const caseImage = caseItem.procedure_name
                    ? getProcedureCaseImage(caseItem.procedure_name, caseItem.case_number, 1)
                    : '';
                  const isHovered = hoveredCase === caseItem.case_number;

                  return (
                    <div
                      key={caseItem.id}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-stone-100"
                      onClick={() => {
                        if (caseItem.procedure_name) {
                          navigate(`/procedure/${encodeURIComponent(caseItem.procedure_name)}/case/${caseItem.case_number}`);
                          window.scrollTo(0, 0);
                        }
                      }}
                      onMouseEnter={() => setHoveredCase(caseItem.case_number)}
                      onMouseLeave={() => setHoveredCase(null)}
                    >
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-sage-50">
                        <img
                          src={caseImage}
                          alt={`${t('caseSingular')} #${caseItem.case_number}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />

                        {/* Hover Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/50 to-transparent flex items-end justify-center pb-8 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                          <div className="text-center">
                            <span className="inline-flex items-center gap-2 text-white uppercase tracking-widest text-sm font-medium bg-gold-600 px-6 py-3 rounded-full">
                              {t('viewCaseDetails')}
                              <ChevronRight size={16} />
                            </span>
                          </div>
                        </div>

                        {/* Procedure Badge */}
                        {caseItem.procedure_name && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-white/95 backdrop-blur-sm text-navy-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                              {caseItem.procedure_name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Case Info */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-navy-900 font-semibold text-lg group-hover:text-gold-600 transition-colors">
                            {t('caseSingular')} #{caseItem.case_number}
                          </h3>
                          {caseItem.image_count > 1 && (
                            <span className="flex items-center gap-1 text-xs bg-sage-100 text-sage-700 px-2.5 py-1 rounded-full">
                              <Camera size={12} />
                              {caseItem.image_count}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-sm text-stone-500">
                          {caseItem.patient_age && caseItem.patient_gender && (
                            <p className="flex items-center gap-2">
                              <span className="text-stone-400">{t('patient')}:</span>
                              <span>{caseItem.patient_gender}, {caseItem.patient_age}</span>
                            </p>
                          )}
                        </div>

                        {caseItem.description && (
                          <p className="mt-4 text-stone-600 text-sm line-clamp-2 leading-relaxed">
                            {caseItem.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View All Cases Button */}
            {surgeonCases.length >= 6 && (
              <div className="text-center mt-12">
                <button
                  onClick={() => navigate('/gallery')}
                  className="inline-flex items-center gap-2 bg-transparent border-2 border-navy-900 text-navy-900 px-10 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-navy-900 hover:text-white transition-all duration-300"
                >
                  {t('viewPhotoGallery')}
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. PHILOSOPHY QUOTE */}
      <section className="py-24 bg-[#f5f0eb]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex gap-6 md:gap-10">
            <div className="w-2 md:w-3 bg-[#8b5e3c] shrink-0"></div>
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-navy-900 mb-2 leading-tight">
                {t('surgeonPhilosophy')}
              </h2>
              <div className="text-stone-600 text-lg leading-relaxed font-light mb-8">
                {translatedData.bio.philosophy.split('\n\n').map((paragraph: string, idx: number) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
              <p className="text-navy-900 font-bold text-xl font-serif">
                {surgeon.name}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="py-24 bg-navy-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            {t('scheduleYourConsultation')}
          </h2>
          <p className="text-sage-200 text-lg max-w-2xl mx-auto mb-10 font-light">
            {t('takeFirstStep')} {surgeon.name}. {t('schedulePersonalizedConsultation')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/contact')}
              className="bg-gold-600 text-white px-12 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-gold-500 transition-colors"
            >
              {t('bookConsultation')}
            </button>
            <button
              onClick={() => navigate('/surgeons')}
              className="bg-transparent border-2 border-white text-white px-12 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-white hover:text-navy-900 transition-colors"
            >
              {t('viewAllSurgeons')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SurgeonProfile;
