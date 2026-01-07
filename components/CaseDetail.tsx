import React from 'react';
import { ChevronLeft, ChevronRight, Heart, User } from 'lucide-react';
import Contact from './Contact';
import { getProcedureCaseImage } from '../utils/imageUtils';

interface CaseDetailProps {
  caseId?: string;
  procedureName?: string;
  onBack?: () => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({
  caseId = "1001510",
  procedureName = "Deep Neck Contouring",
  onBack
}) => {
  // 从 R2 获取 case 图片
  const beforeImage = getProcedureCaseImage(procedureName, 1, 1);
  const afterImage = getProcedureCaseImage(procedureName, 1, 2);

  // 备用图片
  const fallbackBefore = "https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=1000&auto=format&fit=crop";
  const fallbackAfter = "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=1000&auto=format&fit=crop";

  const caseData = {
    provider: "Dr. Vito Medora",
    procedures: procedureName,
    age: "25",
    gender: "Female",
    description: "Deep neck contouring details...",
    images: {
       beforeSide: beforeImage,
       afterSide: afterImage,
    }
  };

  return (
    <div className="bg-white animate-fade-in-up pt-24">
      {/* 1. Dark Header Section */}
      <section className="bg-[#2a2624] text-white py-12 md:py-16">
        <div className="container mx-auto px-6">
           <div className="mb-12">
              <div className="font-serif text-4xl italic tracking-wide">Medora Health</div>
               <div className="text-xs uppercase tracking-[0.2em] font-light border-t border-white/30 pt-1 mt-1 inline-block">
                 Center for Plastic Surgery
               </div>
           </div>
           
           <div className="text-[10px] md:text-xs uppercase tracking-widest text-stone-400 mb-4 font-sans">
             <span className="hover:text-white cursor-pointer transition-colors" onClick={() => window.location.reload()}>HOME</span> 
             <span className="mx-2">|</span> 
             <span className="hover:text-white cursor-pointer transition-colors" onClick={onBack}>PHOTO GALLERY</span> 
             <span className="mx-2">|</span> 
             <span className="text-stone-300">{procedureName.toUpperCase()}</span> 
             <span className="mx-2">|</span> 
             <span className="text-gold-500">CASE #{caseId}</span>
           </div>
           
           <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl uppercase tracking-wide text-white font-light">
             {procedureName} Case {caseId}
           </h1>
        </div>
      </section>

      {/* 2. Navigation Bar */}
      <section className="border-b border-stone-200 py-4 bg-white sticky top-20 z-30 shadow-sm">
         <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full md:w-auto">
               <button onClick={onBack} className="text-gold-600 hover:text-navy-900 font-bold uppercase tracking-wide text-left">
                 Back to Gallery Home
               </button>
               
               <div className="flex justify-between md:justify-start gap-4 md:gap-8 text-stone-400 font-normal w-full md:w-auto border-t md:border-t-0 border-stone-100 pt-2 md:pt-0">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-gold-600 text-gold-600 font-bold uppercase tracking-wide transition-colors">
                    <ChevronLeft size={14}/> <span className="hidden md:inline">Previous Case</span><span className="md:hidden">Prev</span>
                  </span>
                  
                  <span className="cursor-pointer hover:text-gold-600 text-stone-500 uppercase tracking-wide transition-colors text-center" onClick={onBack}>
                    Back to {procedureName} Gallery
                  </span>
                  
                  <span className="flex items-center gap-1 cursor-pointer hover:text-gold-600 text-gold-600 font-bold uppercase tracking-wide transition-colors">
                    <span className="hidden md:inline">Next Case</span><span className="md:hidden">Next</span> <ChevronRight size={14}/>
                  </span>
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

      {/* 3. Image Grid */}
      <section className="bg-stone-100 py-8 md:py-12">
         <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-1 h-auto lg:h-[700px]">
               {/* Large Left (Before Profile) */}
               <div className="flex-1 bg-black relative group overflow-hidden min-h-[400px]">
                  <img
                    src={caseData.images.beforeSide}
                    className="w-full h-full object-cover"
                    alt="Before Side Profile"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = fallbackBefore;
                    }}
                  />
                  <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-2">Before</div>
               </div>

               {/* Large Middle (After Profile) */}
               <div className="flex-1 bg-black relative group overflow-hidden min-h-[400px]">
                  <img
                    src={caseData.images.afterSide}
                    className="w-full h-full object-cover"
                    alt="After Side Profile"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = fallbackAfter;
                    }}
                  />
                   <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-2">After</div>
                  {/* Watermark */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                     <div className="font-serif text-9xl text-white italic">M</div>
                  </div>
               </div>

               {/* Right Column (Smaller Angle Views) */}
               <div className="lg:w-1/4 flex flex-col gap-1 h-[400px] lg:h-auto">
                  <div className="flex-1 bg-black relative overflow-hidden group">
                     {/* Flipping image to simulate a different angle/photo */}
                     <img
                       src={caseData.images.beforeSide}
                       className="w-full h-full object-cover scale-x-[-1]"
                       alt="Before 45 Degree"
                       onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                         e.currentTarget.src = fallbackBefore;
                       }}
                     />
                     <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-1">Before</div>
                  </div>
                   <div className="flex-1 bg-black relative overflow-hidden group">
                     <img
                       src={caseData.images.afterSide}
                       className="w-full h-full object-cover scale-x-[-1]"
                       alt="After 45 Degree"
                       onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                         e.currentTarget.src = fallbackAfter;
                       }}
                     />
                     <div className="absolute bottom-4 left-0 w-full text-center text-white/80 uppercase tracking-widest text-xs font-bold bg-black/30 py-1">After</div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 4. Case Details Info Bar */}
      <section className="py-12 border-b border-stone-200 bg-white">
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
               <div>
                  <h4 className="text-stone-400 font-bold text-lg mb-2">Provider</h4>
                  <p className="text-stone-600 font-light text-lg">{caseData.provider}</p>
               </div>
               <div>
                  <h4 className="text-stone-400 font-bold text-lg mb-2">Procedures Performed</h4>
                  <p className="text-stone-600 font-light text-lg">{caseData.procedures}</p>
               </div>
               <div>
                  <h4 className="text-stone-400 font-bold text-lg mb-2">Patient Age</h4>
                  <p className="text-stone-600 font-light text-lg">{caseData.age}</p>
               </div>
               <div>
                  <h4 className="text-stone-400 font-bold text-lg mb-2">Patient Gender</h4>
                  <p className="text-stone-600 font-light text-lg">{caseData.gender}</p>
               </div>
            </div>
         </div>
      </section>

      {/* 5. Description & Bottom Nav */}
      <section className="py-16 bg-white">
         <div className="container mx-auto px-6 max-w-5xl">
            <h3 className="text-navy-900 font-bold text-2xl mb-6 font-serif">Case Details</h3>
            <p className="text-stone-600 font-light text-lg mb-16 leading-relaxed">
               {procedureName.toLowerCase()}
            </p>

            <div className="flex justify-between items-center text-gold-600 font-bold uppercase tracking-wide text-xs md:text-sm mb-16 border-t border-b border-stone-100 py-6">
               <span className="flex items-center gap-2 cursor-pointer hover:text-navy-900 transition-colors"><ChevronLeft size={16}/> Previous Case</span>
               <span className="cursor-pointer hover:text-navy-900 transition-colors hidden md:block" onClick={onBack}>Back to {procedureName} Gallery</span>
               <span className="flex items-center gap-2 cursor-pointer hover:text-navy-900 transition-colors">Next Case <ChevronRight size={16}/></span>
            </div>

            <div className="text-center">
               <button className="bg-[#8b5e3c] text-white px-12 py-5 uppercase tracking-[0.15em] font-bold text-sm hover:bg-[#6d4a2f] transition-all duration-300 mb-6 hover:shadow-lg">
                  Request a Consultation
               </button>
               <div className="mt-4">
                 <a href="#" className="text-gold-600 hover:text-navy-900 text-sm transition-colors" onClick={onBack}>List All Photo Gallery Cases</a>
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