import React from 'react';
import { Plane, MapPin, Bed, Monitor, Stethoscope, ChevronRight, Phone } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const TravelPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white animate-fade-in-up">
      {/* 1. HERO SECTION */}
      <section className="relative h-[70vh] min-h-[600px]">
        <img 
          src="https://images.unsplash.com/photo-1520116468816-95b69f847357?q=80&w=2574&auto=format&fit=crop" 
          alt="Travel for Plastic Surgery" 
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/60 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-6 container mx-auto">
           <div className="text-white pt-20 max-w-2xl">
             {/* Logo Mark */}
             <div className="mb-8 opacity-90">
                <div className="font-serif text-3xl italic tracking-wide">Medora Health</div>
                <div className="text-xs uppercase tracking-[0.2em] font-light border-t border-white/30 pt-1 mt-1 inline-block">
                  Center for Plastic Surgery
                </div>
             </div>

             <div className="text-[10px] md:text-xs uppercase tracking-widest mb-4 opacity-90 font-sans text-gold-400">
               {t('travelHome')} <span className="mx-2 text-white">|</span> {t('travelTravel')}
             </div>
             <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white uppercase tracking-wide font-light mb-8 leading-tight">
               {t('travelTitle')}
             </h1>
             <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed">
               {t('travelDescription')}
             </p>
           </div>
        </div>
      </section>

      {/* 2. INTRO - Peace of Mind */}
      <section className="py-20 md:py-28 bg-white text-center">
        <div className="container mx-auto px-6 max-w-5xl">
           <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-8">{t('travelPeaceOfMind')}</h2>
           <p className="text-stone-600 text-lg leading-relaxed font-light mb-6">
             {t('travelPeaceOfMindDesc1')}
           </p>
           <p className="text-stone-600 text-lg leading-relaxed font-light">
             {t('travelPeaceOfMindDesc2')}
           </p>
        </div>
      </section>

      {/* 3. STEPS OVERVIEW - Sage Background */}
      <section className="py-20 bg-sage-50">
         <div className="container mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="font-serif text-4xl md:text-5xl text-navy-900 uppercase tracking-wide">
                  {t('travelEasyAs123')} <br/>
                  <span className="text-gold-600 font-bold">{t('travelEasyAs123Subtitle')}</span>
               </h2>
               <div className="w-24 h-0.5 bg-gold-600 mx-auto mt-6"></div>
               <p className="text-stone-600 mt-6 text-lg font-light">
                  {t('travelEasyAs123Desc')}
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                  { step: t('travelStep1'), title: t('travelInitialConsultation') },
                  { step: t('travelStep2'), title: t('travelPlanningYourSurgery') },
                  { step: t('travelStep3'), title: t('travelSurgeryRecovery') },
               ].map((item, i) => (
                  <div key={i} className="bg-white p-10 text-center shadow-sm hover:shadow-md transition-shadow border border-sage-100">
                     <h4 className="text-gold-600 font-bold uppercase tracking-widest text-sm mb-3">{item.step}</h4>
                     <h3 className="text-navy-900 font-bold text-xl">{item.title}</h3>
                  </div>
               ))}
            </div>

            <div className="text-center mt-12">
               <button className="bg-[#8b5e3c] text-white px-10 py-4 uppercase tracking-[0.15em] hover:bg-[#6d4a2f] transition-colors text-sm font-bold">
                  {t('travelRequestConsultation')}
               </button>
            </div>
         </div>
      </section>

      {/* 4. STEP 1 DETAIL */}
      <section className="py-24 bg-white">
         <div className="container mx-auto px-6">
            <div className="text-center mb-16">
               <h3 className="text-gold-600 font-bold text-4xl md:text-5xl font-serif mb-2">{t('travelStep1').replace(':', '')}</h3>
               <h2 className="font-serif text-4xl md:text-5xl text-navy-900 uppercase font-light">
                  {t('travelInitialConsultation')}
               </h2>
               <div className="w-24 h-0.5 bg-gold-600 mx-auto mt-6 mb-8"></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-16 items-start mb-20">
               <div className="lg:w-1/2 space-y-10">
                  <div>
                     <h4 className="font-bold text-navy-900 text-xl mb-4">{t('travelSubmitInquiry')}</h4>
                     <p className="text-stone-600 font-light leading-relaxed">
                        {t('travelSubmitInquiryDesc')}
                     </p>
                  </div>
                  <div>
                     <h4 className="font-bold text-navy-900 text-xl mb-4">{t('travelIntroductoryCall')}</h4>
                     <p className="text-stone-600 font-light leading-relaxed">
                        {t('travelIntroductoryCallDesc1')}
                     </p>
                     <p className="text-stone-600 font-light leading-relaxed mt-4">
                        {t('travelIntroductoryCallDesc2')}
                     </p>
                  </div>
               </div>
               <div className="lg:w-1/2">
                  <img
                     src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1887&auto=format&fit=crop"
                     alt="Happy Patient"
                     className="w-full shadow-lg"
                  />
               </div>
            </div>

            {/* In Person vs Virtual Cards */}
            <div className="grid md:grid-cols-2 gap-8 bg-sage-50 p-8 md:p-16">
               <div className="text-center p-8 bg-white shadow-sm border border-sage-100">
                  <Stethoscope size={48} className="mx-auto text-navy-900 mb-6" strokeWidth={1} />
                  <h3 className="font-serif text-2xl text-navy-900 uppercase mb-4">{t('travelInPerson')}</h3>
                  <p className="text-stone-600 font-light text-sm mb-8 leading-relaxed">
                     {t('travelInPersonDesc')}
                  </p>
                  <button className="bg-[#8b5e3c] text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-[#6d4a2f]">
                     {t('travelRequestConsultation')}
                  </button>
               </div>
               <div className="text-center p-8 bg-white shadow-sm border border-sage-100">
                  <Monitor size={48} className="mx-auto text-navy-900 mb-6" strokeWidth={1} />
                  <h3 className="font-serif text-2xl text-navy-900 uppercase mb-4">{t('travelVirtual')}</h3>
                  <p className="text-stone-600 font-light text-sm mb-8 leading-relaxed">
                     {t('travelVirtualDesc')}
                  </p>
                  <button className="bg-[#8b5e3c] text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-[#6d4a2f]">
                     {t('travelRequestConsultation')}
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* 5. STEP 2 DETAIL */}
      <section className="py-24 bg-white border-t border-sage-100">
         <div className="container mx-auto px-6">
            <div className="text-center mb-16">
               <h3 className="text-gold-600 font-bold text-4xl md:text-5xl font-serif mb-2">{t('travelStep2').replace(':', '')}</h3>
               <h2 className="font-serif text-4xl md:text-5xl text-navy-900 uppercase font-light">
                  {t('travelPlanningYourSurgery')}
               </h2>
               <div className="w-24 h-0.5 bg-gold-600 mx-auto mt-6 mb-8"></div>
               <p className="text-stone-600 text-lg max-w-3xl mx-auto font-light">
                  {t('travelEasyAs123Desc')}
               </p>
            </div>

            {/* Content omitted for brevity, structure remains identical but styling updated implicitly by parent classes */}
             <div className="flex flex-col lg:flex-row-reverse gap-16 items-start mb-20">
               <div className="lg:w-1/2 space-y-10">
                  <div>
                     <h4 className="font-bold text-navy-900 text-xl mb-4">{t('travelScheduleSurgery')}</h4>
                     <p className="text-stone-600 font-light leading-relaxed">
                        {t('travelScheduleSurgeryDesc')}
                     </p>
                  </div>
                  <div>
                     <h4 className="font-bold text-navy-900 text-xl mb-4">{t('travelSchedulePreOp')}</h4>
                     <p className="text-stone-600 font-light leading-relaxed">
                        {t('travelSchedulePreOpDesc')}
                     </p>
                  </div>
               </div>
               <div className="lg:w-1/2">
                  <img
                     src="https://images.unsplash.com/photo-1544654803-b69140b285a1?q=80&w=2070&auto=format&fit=crop"
                     alt="Travel Planning"
                     className="w-full shadow-lg"
                  />
               </div>
            </div>

            {/* Travel Cards */}
            <div className="grid md:grid-cols-2 gap-8 bg-sage-50 p-8 md:p-16">
               <div className="text-center p-8 bg-white shadow-sm border border-sage-100">
                  <MapPin size={48} className="mx-auto text-navy-900 mb-6" strokeWidth={1} />
                  <h3 className="font-serif text-2xl text-navy-900 uppercase mb-4">{t('travelLocalTravel')}</h3>
                  <p className="text-stone-600 font-light text-sm mb-6 leading-relaxed">
                     {t('travelLocalTravelDesc')}
                  </p>
                  <ul className="text-gold-600 text-sm font-bold space-y-2">
                     <li>{t('travelFromBuffalo')}</li>
                     <li>{t('travelFromSyracuse')}</li>
                  </ul>
               </div>
               <div className="text-center p-8 bg-white shadow-sm border border-sage-100">
                  <Plane size={48} className="mx-auto text-navy-900 mb-6" strokeWidth={1} />
                  <h3 className="font-serif text-2xl text-navy-900 uppercase mb-4">{t('travelTransportation')}</h3>
                  <p className="text-stone-600 font-light text-sm mb-6 leading-relaxed">
                     {t('travelTransportationDesc')}
                  </p>
                  <ul className="text-stone-600 text-sm font-light space-y-2 text-left inline-block">
                     <li>• {t('travelFlights')}</li>
                     <li>• {t('travelGroundTransport')}</li>
                     <li>• {t('travelCarRentals')}</li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* 8. CTA BANNER */}
      <section className="bg-sage-100/50 py-20">
         <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 max-w-5xl">
            <div className="md:w-1/2">
               <h2 className="font-serif text-3xl md:text-4xl text-navy-900 mb-6">{t('travelReadyToStart')}</h2>
               <p className="text-stone-600 text-lg font-light leading-relaxed">
                  {t('travelReadyToStartDesc')}
               </p>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end">
               <div className="text-navy-900 opacity-80">
                  <div className="font-serif text-5xl italic tracking-wide">Medora Health</div>
                  <div className="text-sm uppercase tracking-[0.2em] font-light border-t border-navy-900/30 pt-2 mt-2">
                     Center For <br/> Plastic Surgery
                  </div>
                  <div className="text-[10px] uppercase mt-2 tracking-wider text-sage-500">
                     {t('travelWeCreate')}
                  </div>
               </div>
            </div>
         </div>
      </section>

      <div className="text-right py-4 px-6 container mx-auto">
         <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-navy-900 font-bold flex items-center gap-1 justify-end ml-auto hover:text-gold-600 transition-colors">
            {t('travelBackToTop')} <div className="rotate-[-90deg]"><ChevronRight size={16} /></div>
         </button>
      </div>
    </div>
  );
};

export default TravelPage;