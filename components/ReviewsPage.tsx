import React from 'react';
import { Star, Activity, Heart } from 'lucide-react';
import Contact from './Contact';
import Reputation from './Reputation';

const ReviewsPage: React.FC = () => {
  const platforms = [
    { 
      name: 'Google', 
      icon: <span className="font-bold text-xl"><span className="text-blue-500">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-500">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span></span>, 
      count: 524, 
      rating: '4.9/5',
      bgColor: 'bg-[#f8f9fa]'
    },
    { 
      name: 'Citysearch', 
      icon: <div className="w-8 h-8 rounded-full border-4 border-blue-400"></div>, 
      count: 1, 
      rating: 'Reviews',
      bgColor: 'bg-[#f8f9fa]' 
    },
    { 
      name: 'Yellow Pages', 
      icon: <div className="bg-yellow-400 text-black font-bold font-serif px-1 rounded-sm text-xl">YP</div>, 
      count: 3, 
      rating: '5/5',
      bgColor: 'bg-[#f8f9fa]' 
    },
    { 
      name: 'RateMDs', 
      icon: <Activity className="text-teal-600 w-8 h-8" />, 
      count: 2, 
      rating: '5/5',
      bgColor: 'bg-[#f8f9fa]' 
    },
    { 
      name: 'Healthgrades', 
      icon: <Heart className="text-blue-600 fill-blue-600 w-8 h-8" />, 
      count: 53, 
      rating: '4.3/5',
      bgColor: 'bg-[#f8f9fa]' 
    },
    { 
      name: 'Realself', 
      icon: <span className="font-bold text-xl text-navy-900">rs<span className="text-gold-500">.</span></span>, 
      count: 260, 
      rating: '4.9/5',
      bgColor: 'bg-[#f8f9fa]' 
    },
  ];

  return (
    <div className="bg-white animate-fade-in-up">
      {/* 1. HERO SECTION */}
      <section className="relative h-[60vh] min-h-[500px]">
        <img 
          src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop" 
          alt="YiMei Team" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-6 container mx-auto">
           <div className="text-white pt-20 max-w-4xl">
             <div className="text-[10px] md:text-xs uppercase tracking-widest mb-4 opacity-90 font-sans text-gold-400">
               Home <span className="mx-2 text-white">|</span> About <span className="mx-2 text-white">|</span> Reviews
             </div>
             <h1 className="font-serif text-5xl md:text-7xl text-white uppercase tracking-wide font-light mb-6">
               Reviews
             </h1>
             <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed max-w-2xl">
               Our surgeons' exceptional expertise and dedication have garnered over 1,500 patient reviews, reflecting the profound impact and satisfaction experienced by those in their care.
             </p>
           </div>
        </div>
      </section>

      {/* 2. INTRO TEXT & STATS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
           <div className="mb-20">
              <p className="text-stone-600 text-lg leading-relaxed mb-8 font-light">
                 With a multitude of heartfelt testimonials praising their skill, compassion, and remarkable outcomes, our surgeons' commitment to delivering exceptional care resonates deeply within our community of patients.
              </p>
              <p className="text-stone-600 text-lg leading-relaxed font-light">
                 We understand that women and men searching for the best plastic surgeons from Buffalo to Rochester to Syracuse have many resources. Some of the most popular—and reliable—resources are verified reviews posted by actual patients on respected, independent websites such as RealSelf, Google, and Vitals.com. Reading what previous patients say about their results and experiences is a valuable tool for people starting their plastic surgery journey.
              </p>
           </div>

           {/* Platforms Grid */}
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {platforms.map((platform, idx) => (
                <div key={idx} className={`${platform.bgColor} border border-stone-200 p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow`}>
                   <div className="mb-4 h-10 flex items-center justify-center">
                     {platform.icon} 
                     {typeof platform.icon === 'string' ? <span className="font-bold text-stone-700">{platform.name}</span> : null}
                     {/* If simple text icon wasn't rendered */}
                     {!React.isValidElement(platform.icon) && <span className="font-bold text-stone-700 ml-2">{platform.name}</span>}
                   </div>
                   
                   <div className="text-3xl text-teal-600 font-bold mb-1">
                     {platform.count}
                   </div>
                   <div className="text-xs uppercase tracking-wider font-bold text-navy-900 mb-2">
                     Reviews
                   </div>
                   <div className="text-gold-500 font-bold text-xl">
                     {platform.rating}
                   </div>
                   <div className="text-[10px] uppercase tracking-wider font-bold text-navy-900">
                     Avg. Rating
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 3. FEATURED REVIEW */}
      <section className="py-12 bg-white">
         <div className="container mx-auto px-6 border-t border-stone-200 pt-16">
            <h2 className="font-serif text-3xl md:text-4xl text-navy-900 mb-8 border-b border-stone-200 pb-4">
               Featured Reviews
            </h2>

            <div className="max-w-5xl">
               {/* Review Header */}
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-stone-100">
                        <img 
                           src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop" 
                           alt="Christina Ohrenstein" 
                           className="w-full h-full object-cover"
                        />
                     </div>
                     <div>
                        <h4 className="font-bold text-navy-900 text-sm">Christina Ohrenstein</h4>
                        <div className="flex items-center gap-1 my-1">
                           {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={14} className="fill-gold-500 text-gold-500" />
                           ))}
                        </div>
                        <p className="text-stone-400 text-xs">Review from Google</p>
                     </div>
                  </div>
                  <div className="text-xs text-stone-500 font-bold">Dec 09, 2025</div>
               </div>

               {/* Review Body */}
               <div className="space-y-4 text-stone-600 font-light leading-relaxed mb-8">
                  <p>
                     I recently had the pleasure of working with Dr. Ashley Amalfi. I had originally gone in last year for my first consult and worked with Dr. Amalfi as well as her patient coordinator Melissa. I went in for a regular breast aug consult. While they absolutely were thorough... I chickened out. I can add that even after this there was no pushy emails or calls following. They were so accepting of the decision and noted they were there for anything in the future or any change of heart.
                  </p>
                  <p>
                     Fast forward to this year, the new Preserve technique was marketed through their instagram. I went in for the second consult and was absolutely in love with everything this technique had to offer. Coming from someone who could barely get their wisdom teeth out, this was by far the easiest procedure as well as everything they said it would be.
                  </p>
                  <p>
                     From pre-op up to the day of and everything post-op, they made me feel so comfortable from the inside out. Their portal for messaging with questions/concerns is there for you at any hour etc. Now I am over a month after from my surgery date and I feel absolutely incredible. I felt great even days later. I highly recommend this procedure with Dr. Amalfi and will 1000% return for any/all procedures in the future.
                  </p>
               </div>

               {/* Business Reply */}
               <div className="bg-[#f2efe9] p-8 rounded-sm">
                  <h5 className="font-bold text-stone-600 text-sm mb-4">
                     Business Owner replied on Dec 10, 2025:
                  </h5>
                  <p className="text-stone-600 font-light leading-relaxed">
                     Thank you so much for sharing your experience! We are greatly appreciative of your review and openness about the process with Dr. Amalfi. Thank you!
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* 4. REPUTATION GRID (Reusable Component) */}
      <Reputation />

      {/* 5. CONTACT SECTION */}
      <Contact />
    </div>
  );
};

export default ReviewsPage;