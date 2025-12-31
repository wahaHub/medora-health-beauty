import React from 'react';
import { Star, ChevronRight } from 'lucide-react';

const Reputation: React.FC = () => {
  const gridReviews = [
    {
      text: "I recently had the pleasure of working with Dr. Ashley Amalfi. I had originally gone in last year for...",
      author: "Christina Ohrenstein",
      date: "Dec 09, 2025"
    },
    {
      text: "I just saw dr. Peter krasniak for some injectables in my face!!!! This is my first time meeting Dr....",
      author: "Michele Czapnik",
      date: "Oct 27, 2025"
    },
    {
      text: "Beyond happy with Dr. Quatela’s work. My only regret is not doing it sooner!",
      author: "jhanna white",
      date: "Sep 16, 2025"
    },
    {
      text: "Beyond meticulous and Professional in every way",
      author: "Gary Palumbo",
      date: "Sep 04, 2025"
    }
  ];

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
      <section className="py-24 bg-white border-t border-stone-100">
          <div className="container mx-auto px-6">
              <h2 className="text-center font-serif text-3xl md:text-4xl text-navy-900 mb-16 uppercase tracking-wide">
                  A REPUTATION BUILT ON RESULTS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {gridReviews.map((review, idx) => (
                      <div key={idx} className="bg-[#f9f5f1] p-8 flex flex-col h-full min-h-[340px]">
                          <div className="flex-grow mb-6">
                              <p className="text-stone-600 font-light leading-relaxed text-lg mb-6">
                                 {review.text}
                              </p>
                              <h4 className="text-navy-900 font-bold text-lg mb-1">{review.author}</h4>
                              <p className="text-stone-500 text-sm">Review from Google</p>
                          </div>
                          <div className="flex items-center gap-4 mt-auto pt-6 border-t border-stone-200/50">
                              <GoogleIcon />
                              <div>
                                   <div className="flex items-center gap-1 mb-1">
                                      <span className="font-bold text-navy-900 mr-1">5</span>
                                      {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-gold-500 text-gold-500" />)}
                                   </div>
                                   <div className="text-[10px] text-stone-500 font-bold leading-tight">
                                      Source: Google <br/>
                                      {review.date}
                                   </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
              <div className="text-center mt-16">
                  <a href="#" className="text-navy-900 font-bold hover:text-gold-600 uppercase tracking-widest text-sm inline-flex items-center gap-2 transition-colors">
                      Read More Featured Reviews <ChevronRight size={16} />
                  </a>
              </div>
          </div>
      </section>
  );
};

export default Reputation;