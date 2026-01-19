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

            {/* III. Preparing for a Virtual Consultation */}
            <div className="mt-20 max-w-4xl mx-auto">
               <h3 className="font-serif text-3xl md:text-4xl text-navy-900 mb-6">
                  III. Preparing for a Virtual Consultation
               </h3>
               <p className="text-stone-600 font-light leading-relaxed mb-6">
                  If you are having a virtual consultation, you will need to take care of the following in advance:
               </p>
               <ul className="space-y-4 text-stone-600 font-light leading-relaxed">
                  <li className="flex gap-3">
                     <span className="text-gold-600 font-bold">•</span>
                     <span>Complete an online health history and patient intake forms, including our consent to participate in a virtual visit/consultation.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-gold-600 font-bold">•</span>
                     <span>Submit your photos at least 48 hours before your consultation to give our team time to review. See our photo guide for details.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-gold-600 font-bold">•</span>
                     <span>Plan to be in a private, well-lit room during your virtual consultation.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-gold-600 font-bold">•</span>
                     <span>Allow 1 hour for a typical virtual consultation.</span>
                  </li>
                  <li className="flex gap-3">
                     <span className="text-gold-600 font-bold">•</span>
                     <span>We strongly recommend connecting to Wi-Fi to avoid service interruptions during your visit.</span>
                  </li>
               </ul>
            </div>

            {/* IV. What To Expect */}
            <div className="mt-20 max-w-4xl mx-auto">
               <h3 className="font-serif text-3xl md:text-4xl text-navy-900 mb-6">
                  IV. What To Expect
               </h3>
               <p className="text-stone-600 font-light leading-relaxed mb-8">
                  During your consultation, you will meet with a member of our staff, a Patient Consultant, and one of our plastic surgeons.* Each of our plastic surgeons has their own dedicated Patient Consultant. A typical consultation proceeds as follows:
               </p>

               <div className="space-y-8">
                  <div>
                     <h4 className="font-bold text-navy-900 text-lg mb-3">Review your health history:</h4>
                     <p className="text-stone-600 font-light leading-relaxed">
                        A staff member will review your health history before you speak with your plastic surgeon. Please have the names of any medications you take at hand.
                     </p>
                  </div>

                  <div>
                     <h4 className="font-bold text-navy-900 text-lg mb-3">Meet with a plastic surgeon:</h4>
                     <p className="text-stone-600 font-light leading-relaxed mb-4">
                        One of our plastic surgeons will talk with you about your aesthetic goals and procedures of interest, determine whether you are a good candidate, recommend a personalized surgical plan, and describe what to expect during recovery.
                     </p>
                     <ul className="space-y-3 ml-6">
                        <li className="text-stone-600 font-light leading-relaxed">
                           <span className="font-semibold">Breast and body procedures:</span> You may be asked to disrobe so that Dr. Amalfi or Dr. Krasniak can evaluate you thoroughly and recommend a treatment plan.
                        </li>
                        <li className="text-stone-600 font-light leading-relaxed">
                           <span className="font-semibold">Facial procedures:</span> Dr. Quatela, Dr. Lee, or Dr. Montague may use digital imaging software during or after your appointment to help simulate possible outcomes.
                        </li>
                     </ul>
                  </div>

                  <div>
                     <h4 className="font-bold text-navy-900 text-lg mb-3">Review costs and payment options:</h4>
                     <p className="text-stone-600 font-light leading-relaxed">
                        After meeting with your surgeon, your Patient Consultant will present you with a personalized surgical proposal based on the agreed-upon treatment plan. We offer patient financing through CareCredit® to ease financial concerns for interested patients.
                     </p>
                  </div>

                  <div>
                     <h4 className="font-bold text-navy-900 text-lg mb-3">Discuss logistics:</h4>
                     <p className="text-stone-600 font-light leading-relaxed">
                        Your Patient Consultant will advise you how far out your surgeon is booked and review a travel plan with related recommendations.
                     </p>
                  </div>

                  <div>
                     <h4 className="font-bold text-navy-900 text-lg mb-3">Review other preparations:</h4>
                     <p className="text-stone-600 font-light leading-relaxed">
                        If you need a specific medical clearance or imaging before surgery, your Patient Consultant will give you directions on appropriate timeframes.
                     </p>
                  </div>
               </div>

               <div className="mt-8 p-6 bg-sage-50 border-l-4 border-gold-600">
                  <p className="text-stone-600 font-light leading-relaxed text-sm">
                     <span className="font-bold">*NOTE:</span> If you are interested in a procedure with Dr. Quatela, you will start with an Image Enhancement Session with his dedicated Patient Consultant Brooke, who has worked with him for nearly 20 years, instead of an initial consultation. During this appointment, Brooke will discuss your concerns, goals, and procedure options, perform imaging, and review pricing. If you decide to move forward, Brooke will schedule a consultation with Dr. Quatela to finesse your surgical plan. Because Image Enhancement Sessions give patients a better understanding of their procedure(s), they feel more relaxed and able to concentrate on getting to know Dr. Quatela during the initial consultation.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* 5. STEP 2 DETAIL */}
      <section className="py-24 bg-white border-t border-sage-100">
         <div className="container mx-auto px-6">
            <div className="text-center mb-16">
               <h3 className="text-gold-600 font-bold text-4xl md:text-5xl font-serif mb-2">Step 2</h3>
               <h2 className="font-serif text-4xl md:text-5xl text-navy-900 uppercase font-light">
                  Planning Your Surgery & Trip
               </h2>
               <div className="w-24 h-0.5 bg-gold-600 mx-auto mt-6 mb-8"></div>
               <p className="text-stone-600 text-lg max-w-3xl mx-auto font-light">
                  Next comes the exciting part: getting ready for your trip! Your Patient Consultant will assist you with the following every step of the way:
               </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
               {/* I. Schedule Your Surgery */}
               <div>
                  <h3 className="font-serif text-3xl text-navy-900 mb-4">I. Schedule Your Surgery</h3>
                  <p className="text-stone-600 font-light leading-relaxed">
                     After your consultation, you can schedule your surgery at your convenience. While most patients book during their consultation, we will not pressure you to move forward. Your Patient Consultant will give you a comprehensive pre-operative checklist, including necessary medical clearances, a list of medications to avoid, and instructions for optimal recovery.
                  </p>
               </div>

               {/* II. Schedule Your In-Person Consult and Pre-Op Visit */}
               <div>
                  <h3 className="font-serif text-3xl text-navy-900 mb-4">II. Schedule Your In-Person Consult and Pre-Op Visit</h3>
                  <p className="text-stone-600 font-light leading-relaxed mb-4">
                     We require an in-person consultation and a pre-operative visit with your surgeon before surgery at no additional cost. Sometimes, patients can combine these appointments with their travel for surgery. Your Patient Consultant will assist you with these logistics.
                  </p>
                  <div className="p-6 bg-sage-50 border-l-4 border-gold-600">
                     <p className="text-stone-600 font-light leading-relaxed text-sm">
                        <span className="font-bold">IMPORTANT:</span> After the pre-op visit, our surgeons reserve the right to alter surgical plans to fit the patient's needs better.
                     </p>
                  </div>
               </div>

               {/* III. Arrange Payment */}
               <div>
                  <h3 className="font-serif text-3xl text-navy-900 mb-4">III. Arrange Payment (and Financing, if desired)</h3>
                  <p className="text-stone-600 font-light leading-relaxed">
                     We require payment in full before the day of surgery, typically at the pre-op appointment. Your Patient Consultant will review your payment and financing options and help you arrange the one that works for you.
                  </p>
               </div>

               {/* IV. Make Your Travel Plans */}
               <div>
                  <h3 className="font-serif text-3xl text-navy-900 mb-4">IV. Make Your Travel Plans</h3>
                  <p className="text-stone-600 font-light leading-relaxed">
                     Your Patient Consultant is experienced in helping patients from all over the world plan travel to our practice and home again. She will provide recommendations for flights, transportation, and lodging based on your anticipated needs before and after surgery and assist you with appropriate scheduling plans.
                  </p>
               </div>

               {/* V. Plan Your Stay in Rochester */}
               <div>
                  <h3 className="font-serif text-3xl text-navy-900 mb-6">V. Plan Your Stay in Rochester</h3>
                  <p className="text-stone-600 font-light leading-relaxed mb-6">
                     Your Patient Consultant will help you decide whether to stay in our onsite lodging or a nearby offsite option. She can also recommend local attractions, restaurants, and activities based on your needs and interests. Visit our Accommodations & Attractions page for more information.
                  </p>

                  <div className="p-6 bg-sage-50 border-l-4 border-gold-600 mb-8">
                     <p className="text-stone-600 font-light leading-relaxed text-sm">
                        <span className="font-bold">Note:</span> If you are staying offsite after surgery, you must designate an adult caretaker, friend, or family member who will transport you there.
                     </p>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <h4 className="font-bold text-navy-900 text-lg mb-3">Private Onsite Accommodations:</h4>
                        <p className="text-stone-600 font-light leading-relaxed">
                           For added convenience and comfort, we offer our patients an option to stay in a medically supervised setting at our private post-operative recovery suite, the Carriage House. Conveniently located adjacent to the Lindsay House, the Carriage House offers comfort for guests traveling alone or without the benefit of family or friends in the Rochester area. Our staff is happy to assist you with overnight arrangements if you'd like the peace of mind that having a registered nurse nearby on your first post-operative night may provide.
                        </p>
                     </div>

                     <div>
                        <h4 className="font-bold text-navy-900 text-lg mb-3">Offsite Accommodations Options:</h4>
                        <p className="text-stone-600 font-light leading-relaxed">
                           To assist you with your stay in Rochester, we have secured special rates with premier hotels close to our facility. Each option includes amenities to enhance your stay. Remember to mention the Quatela Center when booking to secure the discounted rate. Please ask your Patient Consultant for more information. While we do not have any relationships with specific Airbnb or VRBO rentals, we can recommend areas in and around Rochester.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. STEP 3 DETAIL */}
      <section className="py-24 bg-sage-50">
         <div className="container mx-auto px-6">
            <div className="text-center mb-16">
               <h3 className="text-gold-600 font-bold text-4xl md:text-5xl font-serif mb-2">Step 3</h3>
               <h2 className="font-serif text-4xl md:text-5xl text-navy-900 uppercase font-light">
                  Surgery & Recovery
               </h2>
               <div className="w-24 h-0.5 bg-gold-600 mx-auto mt-6 mb-8"></div>
               <p className="text-stone-600 text-lg max-w-3xl mx-auto font-light">
                  Your surgery will take place at the Lindsay House Surgery Center, our private, onsite, state-of-the-art AAAHC-accredited ambulatory surgery center.
               </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
               {/* Transportation the Day of Surgery */}
               <div>
                  <h3 className="font-serif text-3xl text-navy-900 mb-4">Transportation the Day of Surgery</h3>
                  <p className="text-stone-600 font-light leading-relaxed mb-4">
                     Our dedicated, highly trained team will ensure you feel comfortable throughout your surgical experience while maintaining the highest safety standards. You will be discharged on the same day as your surgery.
                  </p>
                  <ul className="space-y-3 text-stone-600 font-light leading-relaxed ml-6">
                     <li className="flex gap-3">
                        <span className="text-gold-600 font-bold">•</span>
                        <span>If you stay at the Carriage House, a nurse will take you there directly from our surgical center.</span>
                     </li>
                     <li className="flex gap-3">
                        <span className="text-gold-600 font-bold">•</span>
                        <span>If you stay offsite, you will need transportation from or accompanied by, a designated caretaker. (You will not be discharged to a taxi, hotel shuttle, Uber, etc., on your own.)</span>
                     </li>
                  </ul>
               </div>

               {/* Around-the-Clock Aftercare */}
               <div>
                  <h3 className="font-serif text-3xl text-navy-900 mb-4">Around-the-Clock Aftercare</h3>
                  <p className="text-stone-600 font-light leading-relaxed mb-6">
                     Our physicians and medical team are here to assist you through every step of the process. We will call you on the night of surgery to check in on your progress.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="bg-white p-6 border border-sage-200">
                        <h4 className="font-bold text-navy-900 mb-3">Business hours:</h4>
                        <ul className="space-y-2 text-stone-600 font-light text-sm">
                           <li className="flex gap-2">
                              <span className="text-gold-600">•</span>
                              <span>Call our office at <a href="tel:585-523-2925" className="text-navy-900 font-semibold hover:text-gold-600">(585) 523-2925</a></span>
                           </li>
                           <li className="flex gap-2">
                              <span className="text-gold-600">•</span>
                              <span>Use the Klara app by clicking the Message Us button at the bottom right of the screen. We review Klara messages during office hours (Monday–Friday: 8:30 a.m.–5 p.m.).</span>
                           </li>
                        </ul>
                     </div>

                     <div className="bg-white p-6 border border-sage-200">
                        <h4 className="font-bold text-navy-900 mb-3">Weekends and outside of business hours:</h4>
                        <p className="text-stone-600 font-light text-sm flex gap-2">
                           <span className="text-gold-600">•</span>
                           <span>Call our on-call EMERGENCY line at <a href="tel:585-258-4851" className="text-navy-900 font-semibold hover:text-gold-600">(585) 258-4851</a></span>
                        </p>
                     </div>
                  </div>
               </div>

               {/* Post-Operative Appointments */}
               <div>
                  <h3 className="font-serif text-3xl text-navy-900 mb-4">Post-Operative Appointments</h3>
                  <p className="text-stone-600 font-light leading-relaxed">
                     Your Patient Consultant will create an appointment schedule for in-person visits during your time in the area and virtual visits after you have returned home. These visits help us ensure you are healing as expected and have any concerns addressed promptly.
                  </p>
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