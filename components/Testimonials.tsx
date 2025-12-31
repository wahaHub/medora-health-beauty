import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const reviews = [
    {
      name: "Amanda Lewandowski",
      source: "Review from Google",
      text: "Dr. Zhang is an absolute artist. I'm two weeks out from a mommy makeover with breast lift and upper back lipo and I'm almost completely recovered already. The first 4 or 5 days were pretty sore but never unmanageable. She takes the time to listen to your concerns and will follow your wish list to perfection. I cannot believe how life changing this surgery already is for me. Zero regrets!"
    },
    {
      name: "Sarah Jenkins",
      source: "Review from RealSelf",
      text: "The entire team at YiMei was phenomenal. From the initial consultation to the post-op care, I felt supported and understood. The results of my rhinoplasty are subtle yet transformative, exactly what I wanted. It's rare to find such a combination of medical expertise and genuine care."
    },
    {
      name: "Michelle T.",
      source: "Review from Google",
      text: "I traveled from Shanghai for my procedure and the concierge team made everything seamless. The results of my facelift are incredibly natural. I look 10 years younger but still like myself. Highly recommend Dr. Chen for anyone considering facial rejuvenation."
    }
  ];

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-navy-900">
            A REPUTATION BUILT ON RESULTS
          </h2>
        </div>

        {/* Slider Area */}
        <div className="relative max-w-5xl mx-auto">
          {/* Navigation Buttons */}
          <button 
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 lg:-translate-x-24 p-2 text-navy-900 hover:text-gold-600 transition-colors hidden md:block"
          >
            <ChevronLeft size={48} strokeWidth={1} />
          </button>
          
          <button 
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 lg:translate-x-24 p-2 text-navy-900 hover:text-gold-600 transition-colors hidden md:block"
          >
            <ChevronRight size={48} strokeWidth={1} />
          </button>

          {/* Content Box */}
          <div className="bg-[#f9f5f1] p-8 md:p-16 lg:p-20 relative min-h-[300px] flex items-center">
            <div className="border-l-4 border-gold-600 pl-6 md:pl-10">
              <p className="text-stone-700 text-lg md:text-xl leading-relaxed mb-8 font-light">
                {reviews[currentIndex].text}
              </p>
              <div>
                <h4 className="font-bold text-navy-900 text-lg">
                  {reviews[currentIndex].name}
                </h4>
                <p className="text-stone-500 text-sm">
                  {reviews[currentIndex].source}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-navy-900' : 'bg-stone-300'
                }`}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="#" className="text-gold-600 hover:text-navy-900 font-bold tracking-wide uppercase text-sm inline-flex items-center gap-1">
              Read More Reviews <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;