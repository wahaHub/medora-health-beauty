import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, User } from 'lucide-react';
import Contact from './Contact';
import { getProcedureCaseImage, createSlug } from '../utils/imageUtils';
import { supabase } from '../services/supabaseClient';

interface CaseDetailProps {
  caseId?: string;
  procedureName?: string;
  onBack?: () => void;
}

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

const CaseDetail: React.FC<CaseDetailProps> = ({ onBack }) => {
  const { procedureName: urlProcedureName, caseId: urlCaseId } = useParams<{ procedureName: string; caseId: string }>();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [allCases, setAllCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const procedureName = urlProcedureName ? decodeURIComponent(urlProcedureName) : 'Unknown Procedure';
  const caseId = urlCaseId || '';

  useEffect(() => {
    async function fetchCaseData() {
      setLoading(true);
      try {
        // Get procedure by slug
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

        // Get all cases for this procedure
        const { data: cases, error: casesError } = await supabase
          .from('procedure_cases')
          .select('*')
          .eq('procedure_id', procedure.id)
          .order('sort_order', { ascending: true });

        if (casesError) {
          console.error('Error fetching cases:', casesError);
          setLoading(false);
          return;
        }

        setAllCases(cases || []);

        // Find the specific case
        const currentCase = cases?.find(c => c.case_number === caseId);
        if (currentCase) {
          setCaseData(currentCase);
          const idx = cases?.findIndex(c => c.case_number === caseId) || 0;
          setCurrentIndex(idx);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    if (procedureName && caseId) {
      fetchCaseData();
    }
  }, [procedureName, caseId]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(`/procedure/${encodeURIComponent(procedureName)}`);
    }
  };

  const handlePrevCase = () => {
    if (currentIndex > 0 && allCases.length > 0) {
      const prevCase = allCases[currentIndex - 1];
      navigate(`/procedure/${encodeURIComponent(procedureName)}/case/${prevCase.case_number}`);
    }
  };

  const handleNextCase = () => {
    if (currentIndex < allCases.length - 1 && allCases.length > 0) {
      const nextCase = allCases[currentIndex + 1];
      navigate(`/procedure/${encodeURIComponent(procedureName)}/case/${nextCase.case_number}`);
    }
  };

  // Generate image URLs using caseNumber
  const caseNumber = caseData?.case_number || caseId;
  const imageCount = caseData?.image_count || 2;

  // Get images based on caseNumber (use caseNumber string directly, e.g., "140856")
  const beforeImage = getProcedureCaseImage(procedureName, caseNumber, 1);
  const afterImage = getProcedureCaseImage(procedureName, caseNumber, 2);

  // Additional images if available
  const image3 = imageCount >= 3 ? getProcedureCaseImage(procedureName, caseNumber, 3) : null;
  const image4 = imageCount >= 4 ? getProcedureCaseImage(procedureName, caseNumber, 4) : null;

  // No fallback images - hide image if not available

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-stone-500">Loading case details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white animate-fade-in-up">
      {/* 1. Dark Header Section - extends to top like ProcedureDetail */}
      <section className="relative min-h-[400px] bg-[#1a1a1a] overflow-hidden flex items-end pt-24 md:pt-32 pb-12 md:pb-16">
        <div className="container mx-auto px-6">
           <div className="mb-8 opacity-90">
              <div className="font-serif text-3xl italic tracking-wide text-white">Medora Health</div>
               <div className="text-xs uppercase tracking-[0.2em] font-light border-t border-white/30 pt-1 mt-1 inline-block text-white">
                 Center for Plastic Surgery
               </div>
           </div>

           <div className="text-[10px] md:text-xs uppercase tracking-widest text-gold-400 mb-4 flex gap-2">
             <span className="cursor-pointer hover:text-white" onClick={() => navigate('/')}>HOME</span>
             <span>|</span>
             <span className="cursor-pointer hover:text-white" onClick={() => navigate('/gallery')}>PHOTO GALLERY</span>
             <span>|</span>
             <span className="cursor-pointer hover:text-white" onClick={handleBack}>{procedureName.toUpperCase()}</span>
             <span>|</span>
             <span className="text-white">CASE #{caseNumber}</span>
           </div>

           <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl uppercase tracking-wide text-white font-light">
             {procedureName} Case #{caseNumber}
           </h1>
        </div>
      </section>

      {/* 2. Navigation Bar */}
      <section className="border-b border-stone-200 py-4 bg-white sticky top-20 z-30 shadow-sm">
         <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full md:w-auto">
               <button onClick={handleBack} className="text-gold-600 hover:text-navy-900 font-bold uppercase tracking-wide text-left">
                 Back to Gallery Home
               </button>

               <div className="flex justify-between md:justify-start gap-4 md:gap-8 text-stone-400 font-normal w-full md:w-auto border-t md:border-t-0 border-stone-100 pt-2 md:pt-0">
                  <button
                    onClick={handlePrevCase}
                    disabled={currentIndex === 0}
                    className={`flex items-center gap-1 uppercase tracking-wide transition-colors ${
                      currentIndex === 0 ? 'text-stone-300 cursor-not-allowed' : 'cursor-pointer hover:text-gold-600 text-gold-600 font-bold'
                    }`}
                  >
                    <ChevronLeft size={14}/> <span className="hidden md:inline">Previous Case</span><span className="md:hidden">Prev</span>
                  </button>

                  <span className="cursor-pointer hover:text-gold-600 text-stone-500 uppercase tracking-wide transition-colors text-center" onClick={handleBack}>
                    Back to {procedureName} Gallery
                  </span>

                  <button
                    onClick={handleNextCase}
                    disabled={currentIndex >= allCases.length - 1}
                    className={`flex items-center gap-1 uppercase tracking-wide transition-colors ${
                      currentIndex >= allCases.length - 1 ? 'text-stone-300 cursor-not-allowed' : 'cursor-pointer hover:text-gold-600 text-gold-600 font-bold'
                    }`}
                  >
                    <span className="hidden md:inline">Next Case</span><span className="md:hidden">Next</span> <ChevronRight size={14}/>
                  </button>
               </div>
            </div>

            <div className="flex gap-6 items-center mt-4 md:mt-0 hidden md:flex">
               <Heart className="text-red-400 w-5 h-5 cursor-pointer hover:fill-red-400 transition-all" />
               <div className="flex items-center gap-2 cursor-pointer hover:text-navy-900 text-stone-500 font-normal">
                  <User size={16} /> Sign In
               </div>
            </div>
         </div>
      </section>

      {/* 3. Image Grid - Dynamic layout based on image count */}
      <section className="bg-stone-100 py-8 md:py-12">
         <div className="container mx-auto px-6">
            {/* Layout for 1 image: Single centered image */}
            {imageCount === 1 && (
              <div className="flex justify-center">
                <div className="w-full max-w-3xl bg-sage-200 relative group overflow-hidden">
                  <img
                    src={beforeImage}
                    className="w-full h-auto object-contain"
                    alt="Case photo"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    <div className="font-serif text-9xl text-white italic">M</div>
                  </div>
                </div>
              </div>
            )}

            {/* Layout for 2 images: Side by side Before/After */}
            {imageCount === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-w-6xl mx-auto">
                <div className="bg-sage-200 relative group overflow-hidden">
                  <img
                    src={beforeImage}
                    className="w-full h-auto object-contain"
                    alt="Before"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-2">Before</div>
                </div>
                <div className="bg-sage-200 relative group overflow-hidden">
                  <img
                    src={afterImage}
                    className="w-full h-auto object-contain"
                    alt="After"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-2">After</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    <div className="font-serif text-9xl text-white italic">M</div>
                  </div>
                </div>
              </div>
            )}

            {/* Layout for 3 images: 2 large + 1 small on right */}
            {imageCount === 3 && (
              <div className="flex flex-col lg:flex-row gap-1 h-auto lg:h-[700px]">
                <div className="flex-1 bg-sage-200 relative group overflow-hidden min-h-[400px]">
                  <img
                    src={beforeImage}
                    className="w-full h-full object-cover"
                    alt="Before"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-2">Before</div>
                </div>
                <div className="flex-1 bg-sage-200 relative group overflow-hidden min-h-[400px]">
                  <img
                    src={afterImage}
                    className="w-full h-full object-cover"
                    alt="After"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-2">After</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    <div className="font-serif text-9xl text-white italic">M</div>
                  </div>
                </div>
                <div className="lg:w-1/4 bg-sage-200 relative overflow-hidden group min-h-[300px] lg:min-h-0">
                  <img
                    src={image3 || ''}
                    className="w-full h-full object-cover"
                    alt="Additional view"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-1">View 3</div>
                </div>
              </div>
            )}

            {/* Layout for 4+ images: 2 large + 2 small stacked on right */}
            {imageCount >= 4 && (
              <div className="flex flex-col lg:flex-row gap-1 h-auto lg:h-[700px]">
                <div className="flex-1 bg-sage-200 relative group overflow-hidden min-h-[400px]">
                  <img
                    src={beforeImage}
                    className="w-full h-full object-cover"
                    alt="Before"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-2">Before</div>
                </div>
                <div className="flex-1 bg-sage-200 relative group overflow-hidden min-h-[400px]">
                  <img
                    src={afterImage}
                    className="w-full h-full object-cover"
                    alt="After"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-2">After</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    <div className="font-serif text-9xl text-white italic">M</div>
                  </div>
                </div>
                <div className="lg:w-1/4 flex flex-col gap-1 h-[400px] lg:h-auto">
                  <div className="flex-1 bg-sage-200 relative overflow-hidden group">
                    <img
                      src={image3 || ''}
                      className="w-full h-full object-cover"
                      alt="View 3"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-1">View 3</div>
                  </div>
                  <div className="flex-1 bg-sage-200 relative overflow-hidden group">
                    <img
                      src={image4 || ''}
                      className="w-full h-full object-cover"
                      alt="View 4"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-1">View 4</div>
                  </div>
                </div>
              </div>
            )}
         </div>
      </section>

      {/* 4. Case Details Info Bar */}
      <section className="py-12 border-b border-stone-200 bg-white">
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
               <div>
                  <h4 className="text-stone-400 font-bold text-lg mb-2">Provider</h4>
                  <p className="text-stone-600 font-light text-lg">{caseData?.provider_name || 'Dr. Heather Lee'}</p>
               </div>
               <div>
                  <h4 className="text-stone-400 font-bold text-lg mb-2">Procedures Performed</h4>
                  <p className="text-stone-600 font-light text-lg">{procedureName}</p>
               </div>
               <div>
                  <h4 className="text-stone-400 font-bold text-lg mb-2">Patient Age</h4>
                  <p className="text-stone-600 font-light text-lg">{caseData?.patient_age || 'N/A'}</p>
               </div>
               <div>
                  <h4 className="text-stone-400 font-bold text-lg mb-2">Patient Gender</h4>
                  <p className="text-stone-600 font-light text-lg">{caseData?.patient_gender || 'N/A'}</p>
               </div>
            </div>
         </div>
      </section>

      {/* 5. Description & Bottom Nav */}
      <section className="py-16 bg-white">
         <div className="container mx-auto px-6 max-w-5xl">
            <h3 className="text-navy-900 font-bold text-2xl mb-6 font-serif">Case Details</h3>
            <p className="text-stone-600 font-light text-lg mb-16 leading-relaxed">
               {caseData?.description || `${procedureName} performed by ${caseData?.provider_name || 'Dr. Heather Lee'} with excellent results. Patient experienced optimal recovery and is highly satisfied with the outcome.`}
            </p>

            <div className="flex justify-between items-center text-gold-600 font-bold uppercase tracking-wide text-xs md:text-sm mb-16 border-t border-b border-stone-100 py-6">
               <button
                 onClick={handlePrevCase}
                 disabled={currentIndex === 0}
                 className={`flex items-center gap-2 transition-colors ${
                   currentIndex === 0 ? 'text-stone-300 cursor-not-allowed' : 'cursor-pointer hover:text-navy-900'
                 }`}
               >
                 <ChevronLeft size={16}/> Previous Case
               </button>
               <span className="cursor-pointer hover:text-navy-900 transition-colors hidden md:block" onClick={handleBack}>Back to {procedureName} Gallery</span>
               <button
                 onClick={handleNextCase}
                 disabled={currentIndex >= allCases.length - 1}
                 className={`flex items-center gap-2 transition-colors ${
                   currentIndex >= allCases.length - 1 ? 'text-stone-300 cursor-not-allowed' : 'cursor-pointer hover:text-navy-900'
                 }`}
               >
                 Next Case <ChevronRight size={16}/>
               </button>
            </div>

            <div className="text-center">
               <button className="bg-[#8b5e3c] text-white px-12 py-5 uppercase tracking-[0.15em] font-bold text-sm hover:bg-[#6d4a2f] transition-all duration-300 mb-6 hover:shadow-lg">
                  Request a Consultation
               </button>
               <div className="mt-4">
                 <a href="#" className="text-gold-600 hover:text-navy-900 text-sm transition-colors" onClick={(e) => { e.preventDefault(); handleBack(); }}>List All Photo Gallery Cases</a>
               </div>
               <p className="text-stone-400 text-xs italic mt-8 max-w-lg mx-auto">
                  *Keep in mind that each patient is unique and your results may vary. Photos are for educational purposes.
               </p>
            </div>
         </div>
      </section>

      {/* 6. Reputation Section */}
      <section className="py-20 bg-white text-center border-t border-stone-100">
         <h2 className="font-serif text-3xl md:text-4xl text-navy-900 uppercase tracking-wide mb-2">
            A REPUTATION BUILT ON RESULTS
         </h2>
      </section>

      {/* 7. Reused Contact Section */}
      <Contact />
    </div>
  );
};

export default CaseDetail;
