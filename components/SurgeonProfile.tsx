import React from 'react';
import { ArrowRight, Mic2, Award, Users, Heart } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const SurgeonProfile: React.FC = () => {
  // Enable scroll reveal animations
  useScrollReveal(true);

  return (
    <div className="bg-white animate-fade-in-up">
      {/* 1. HERO SECTION - Green Gradient */}
      <section className="relative h-screen min-h-[600px] bg-luxury-green flex items-center overflow-hidden">
        {/* Background Image Area */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f201b] via-[#0f201b]/80 to-transparent z-10 w-full lg:w-2/3"></div>
          <img 
            src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=2670&auto=format&fit=crop" 
            alt="Dr. Vito Medora" 
            className="absolute inset-0 w-full h-full object-cover object-[70%_20%] lg:object-[center_20%]"
          />
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 relative z-20 pt-20">
          <div className="max-w-2xl">
             <div className="mb-8">
               <div className="font-serif text-3xl italic tracking-wide text-white">Medora Health</div>
               <div className="text-xs uppercase tracking-[0.2em] font-light text-sage-200 border-t border-sage-200/30 pt-1 mt-1 inline-block">
                 Center for Plastic Surgery
               </div>
            </div>

            <div className="text-[10px] md:text-xs uppercase tracking-widest text-gold-500 mb-4 font-sans">
              Home <span className="mx-2 text-white/40">|</span> About <span className="mx-2 text-white/40">|</span> Our Surgeons <span className="mx-2 text-white/40">|</span> Dr. Vito Medora
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white uppercase tracking-wide font-light mb-4 leading-tight scroll-reveal">
              Dr. Vito Medora
            </h1>
            <p className="text-sage-100 text-sm md:text-base uppercase tracking-[0.2em] mb-8 font-light border-l-2 border-gold-500 pl-4 scroll-reveal">
              Double Board-Certified Facial Plastic Surgeon
            </p>

            <p className="text-sage-200 text-lg leading-relaxed mb-10 max-w-lg font-light scroll-reveal">
              Founder of the Medora Health Center, pioneer of the deep plane facelift, and recognized nationally and internationally as a leader in modern facial plastic surgery.
            </p>

            <button className="bg-[#8b5e3c] text-white px-8 py-4 uppercase tracking-[0.15em] text-sm font-bold hover:bg-[#6d4a2f] transition-colors">
              Request A Consultation
            </button>
          </div>
        </div>
      </section>

      {/* 2. EXPERTISE / SPEAKING */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
           <div className="flex flex-col lg:flex-row gap-16 items-center">
             <div className="lg:w-1/2">
                <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-8 leading-tight scroll-reveal">
                  Internationally Recognized Facial Plastic Surgery Expertise
                </h2>
                <div className="space-y-6 text-stone-600 text-lg leading-relaxed font-light">
                  <p>
                    Dr. Medora's stellar reputation as a facial plastic surgeon who produces remarkable, natural-looking results attracts patients from throughout the world to our Rochester, New York, plastic surgery practice. Women and men have traveled from Brazil, Portugal, Japan, England, Germany, Iran, and Canada to have Dr. Medora perform their cosmetic and reconstructive procedures.
                  </p>
                  <p>
                    Fluent in Italian, Dr. Medora also travels to international conferences, where he has been invited to lecture and conduct training. That included lecturing in 2023 at the European Academy of Facial Plastic Surgery (EAFPS) in Verona, Italy.
                  </p>
                </div>
             </div>
             <div className="lg:w-1/2 relative group scroll-reveal">
                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1544531696-b85360980593?q=80&w=2069&auto=format&fit=crop"
                    alt="Dr. Medora Speaking"
                    className="w-full h-auto shadow-xl"
                  />
                </div>
                {/* Gradient Box */}
                <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 mt-[-10px] relative z-10 mx-6 lg:mx-12 shadow-lg text-center">
                   <p className="font-serif text-lg italic">
                     Dr. Medora speaking at the 2023 European Academy of Facial Plastic Surgery annual meeting in Verona.
                   </p>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* 3. STATS - Light Sage Background */}
      <section className="py-20 bg-sage-50">
        <div className="container mx-auto px-6 text-center">
           <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-6 scroll-reveal">Expertise Refined Through Experience</h2>
           <p className="text-stone-500 text-lg mb-16 max-w-2xl mx-auto font-light">
             Dr. Medora's expertise in facial plastic surgery comes from decades of focused experience. He has performed:
           </p>

           <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <div className="bg-white p-12 shadow-sm hover:shadow-md transition-shadow border border-sage-100 scroll-reveal">
                <div className="flex justify-center mb-6 text-navy-900">
                  {/* Custom Facelift Icon SVG */}
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M12 2v20"/>
                    <path d="M8 10h8"/>
                  </svg>
                </div>
                <div className="font-serif text-5xl md:text-6xl text-navy-900 mb-2">4,500+</div>
                <div className="text-gold-600 font-bold uppercase tracking-widest text-sm">Facelifts</div>
              </div>

              <div className="bg-white p-12 shadow-sm hover:shadow-md transition-shadow border border-sage-100 scroll-reveal">
                <div className="flex justify-center mb-6 text-navy-900">
                   {/* Custom Rhinoplasty Icon SVG */}
                   <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4C12 4 15 8 15 14C15 17 14 20 12 20C10 20 9 17 9 14C9 8 12 4 12 4Z" />
                    <path d="M9 14C7 14 4 16 4 18" />
                    <path d="M15 14C17 14 20 16 20 18" />
                   </svg>
                </div>
                <div className="font-serif text-5xl md:text-6xl text-navy-900 mb-2">3,500+</div>
                <div className="text-gold-600 font-bold uppercase tracking-widest text-sm">Rhinoplasties</div>
              </div>
           </div>
        </div>
      </section>

      {/* 4. CREDENTIALS & LEADERSHIP */}
      <section className="py-24 bg-white">
         <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16">
               {/* Left Column - Image */}
               <div className="lg:w-1/2">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop" 
                    alt="Dr. Medora at Conference" 
                    className="w-full h-auto shadow-lg mb-6"
                  />
                  {/* Green Gradient Box */}
                  <div className="bg-gradient-to-r from-navy-900 to-[#1e3a34] text-white p-6 text-center">
                    <p className="font-serif italic text-sm">
                      Dr. Medora at the 2023 AAFPRS meeting with Dr. Lee and Dr. Montague.
                    </p>
                  </div>

                  <div className="mt-12 space-y-4">
                     <h3 className="font-serif text-2xl text-navy-900">Education & Training</h3>
                     <div className="space-y-4">
                        <div>
                           <h4 className="font-bold text-stone-600">Facial Plastic Surgery Fellowship:</h4>
                           <p className="text-stone-500 font-light">Oregon Health Science University</p>
                           <p className="text-stone-500 font-light">Tulane University</p>
                        </div>
                        <div>
                           <h4 className="font-bold text-stone-600">Otolaryngology Residency:</h4>
                           <p className="text-stone-500 font-light">Northwestern University</p>
                        </div>
                        <div>
                           <h4 className="font-bold text-stone-600">Doctor of Medicine (MD):</h4>
                           <p className="text-stone-500 font-light">Northwestern University</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Column - Info */}
               <div className="lg:w-1/2">
                  <div className="mb-12 scroll-reveal">
                     <h2 className="font-serif text-3xl text-navy-900 mb-6 border-b border-gold-200 pb-4">
                        Professional Society Leadership Positions
                     </h2>
                     <ul className="space-y-4 text-stone-600 text-lg font-light">
                        <li className="flex gap-3">
                           <span className="text-gold-500 mt-1"><Award size={20} /></span>
                           <span>President, International Federation of Facial Plastic Surgery Societies (2021-Present)</span>
                        </li>
                        <li className="flex gap-3">
                           <span className="text-gold-500 mt-1"><Award size={20} /></span>
                           <span>Treasurer, Board of the American Council for Post-Residency Specialty Education</span>
                        </li>
                        <li className="flex gap-3">
                           <span className="text-gold-500 mt-1"><Award size={20} /></span>
                           <span>Past President, American Board of Facial Plastic & Reconstructive Surgery</span>
                        </li>
                        <li className="flex gap-3">
                           <span className="text-gold-500 mt-1"><Award size={20} /></span>
                           <span>Board Examiner, American Board of Facial Plastic & Reconstructive Surgery</span>
                        </li>
                     </ul>
                  </div>

                  <div className="mb-12 scroll-reveal">
                     <h2 className="font-serif text-3xl text-navy-900 mb-6 border-b border-gold-200 pb-4">
                        Board Certifications
                     </h2>
                     <div className="space-y-6">
                        <div>
                           <h4 className="text-lg font-bold text-navy-900">Board Certification:</h4>
                           <p className="text-stone-600 font-light">Diplomate of the American Board of Facial Plastic & Reconstructive Surgery</p>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-navy-900">Board Certification:</h4>
                           <p className="text-stone-600 font-light">Diplomate of the American Board of Otolaryngology</p>
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-navy-900">Board Certification:</h4>
                           <p className="text-stone-600 font-light">Diplomate of the American Board of Hair Restoration Surgery</p>
                        </div>
                     </div>
                  </div>

                  <button className="bg-gradient-to-r from-[#2a2624] to-[#3d3632] text-white px-10 py-4 uppercase tracking-[0.15em] hover:from-gold-600 hover:to-gold-500 transition-all text-sm font-bold w-full md:w-auto">
                     Review Dr. Medora's CV
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* 5. MENTORSHIP */}
      <section className="py-24 bg-sage-50">
        <div className="container mx-auto px-6">
           <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 order-2 lg:order-1">
                 <h2 className="font-serif text-4xl text-navy-900 mb-6 leading-tight">
                    Educating the Next Generation of Facial Plastic Surgeons
                 </h2>
                 <div className="space-y-6 text-stone-600 text-lg leading-relaxed font-light">
                    <p>
                       As a mentor and educator, Dr. Medora's legacy of training medical school students and surgeons at the outset of their careers is virtually unmatched. Through the Medora Health Center's AAFPRS facial plastic and reconstructive surgery fellowship program, young surgeons spend a year gaining valuable expertise through comprehensive training under Dr. Medora.
                    </p>
                    <p>
                       <span className="text-gold-600 font-medium">Dr. Heather Lee</span> and <span className="text-gold-600 font-medium">Dr. Alex Montague</span> are among the many facial plastic surgeons who trained under Dr. Medora.
                    </p>
                    <p>
                       Dr. Medora's educational contributions also include:
                    </p>
                    <ul className="list-disc pl-5 space-y-3">
                       <li>Serving as a clinical instructor in otolaryngology since 1999 for residents and medical students.</li>
                       <li>Composing and teaching basic and advanced soft tissue principles and cadaver courses.</li>
                    </ul>
                 </div>
              </div>
              <div className="lg:w-1/2 order-1 lg:order-2">
                 <img 
                   src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop" 
                   alt="Fellowship Team" 
                   className="w-full h-auto shadow-xl"
                 />
                 <div className="bg-gradient-to-r from-navy-900 to-[#1e3a34] text-white p-6 mt-4 text-center">
                    <p className="font-serif text-sm">
                       A majority of Dr. Medora's past fellows traveled to Rochester to celebrate his birthday.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 6. QUOTE */}
      <section className="py-24 bg-[#f5f0eb]">
         <div className="container mx-auto px-6 max-w-4xl">
            <div className="flex gap-6 md:gap-10">
               <div className="w-2 md:w-3 bg-[#8b5e3c] shrink-0"></div>
               <div>
                  <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-navy-900 mb-8 leading-tight">
                     "There are no shortcuts to quality."
                  </h2>
                  <p className="text-stone-600 text-lg leading-relaxed font-light mb-8 italic">
                     "Patient satisfaction is my top priority, and I know that in order to achieve true quality, no shortcuts can be taken. This is evident in my care and attention to detail while operating, and the fact that I give patients my undivided attention while in an appointment. What seems superficially to be the same endpoint, in the face of shortcuts, will have quantitatively a very different outcome."
                  </p>
                  <p className="text-navy-900 font-bold text-xl font-serif">
                     Vito Medora, M.D.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* 7. COMPASSION / HUGS */}
      <section className="py-24 bg-white">
         <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
               <div className="lg:w-1/2">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=2532&auto=format&fit=crop" 
                      alt="Dr. Medora with Child" 
                      className="w-full h-auto shadow-xl"
                    />
                    <div className="bg-gradient-to-r from-navy-900 to-[#1e3a34] text-white p-6 text-center mt-[-10px] relative z-10 mx-6">
                       <p className="font-serif text-sm font-bold">
                          Dr. Medora shares a moment during a HUGS Foundation medical mission trip.
                       </p>
                    </div>
                  </div>
               </div>
               <div className="lg:w-1/2">
                  <h2 className="font-serif text-4xl text-navy-900 mb-8">
                     A Career Defined by Compassion
                  </h2>
                  <div className="space-y-6 text-stone-600 text-lg leading-relaxed font-light">
                     <p>
                        Dr. Medora's compassion for others, especially children, is exemplified by the foundation he formed in 2003 to support medical missions to Latin America and Vietnam. The <span className="text-[#8b5e3c] font-bold">HUGS (Helping Us Give Smiles) Foundation</span> has sent teams of surgeons to Ecuador, Guatemala, Peru, and Vietnam, where they donate their time and resources to correct congenital deformities.
                     </p>
                     <p>
                        Dr. Medora has served as team leader and surgeon for HUGS medical missions annually for the past 20 years, focusing on cleft lips, cleft noses, microtia (severe ear deformity), and other abnormalities.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default SurgeonProfile;