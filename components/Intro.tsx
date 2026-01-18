import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { getHomepageImage } from '../utils/imageUtils';

const Intro: React.FC = () => {
  const { t } = useTranslation();
  const heroImage = getHomepageImage('hero');

  return (
    <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
      {/* Background Video - Luxury/Team Vibe */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center"
        >
          <source src="https://pub-364a76a828f94fbeb2b09c625907dcf5.r2.dev/homepage/hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gradient Overlay - Deep Forest Green to Transparent (Left to Right) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f201b] via-[#0f201b]/70 to-transparent z-10 w-full lg:w-3/4"></div>

      {/* Content Container */}
      <div className="container mx-auto px-6 relative z-20 h-full flex flex-col justify-center">
        <div className="max-w-3xl pt-20">
          
          {/* Logo Mark / Brand Text - Reduced size */}
          <div className="mb-6 animate-fade-in-up">
            <h3 className="text-gold-500 tracking-[0.25em] uppercase text-xs font-bold flex items-center gap-3">
              <span className="w-6 h-[1px] bg-gold-500 inline-block"></span>
              {t('centerForPlasticSurgery')}
            </h3>
          </div>

          {/* Main Heading - Reduced from 5xl/6xl/7xl to 4xl/5xl/6xl */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 text-white font-light tracking-wide animate-fade-in-up delay-100">
            {t('heroTitle')}
          </h1>

          {/* Subheading - Reduced from 2xl/3xl to xl/2xl */}
          <h2 className="text-lg md:text-xl font-sans text-sage-200 mb-6 font-light animate-fade-in-up delay-200 max-w-xl">
            {t('heroSubtitle')}
          </h2>

          {/* Description - Reduced font size slightly */}
          <p className="text-sage-50 text-base md:text-lg leading-relaxed mb-8 max-w-xl font-light border-l border-white/20 pl-6 animate-fade-in-up delay-300">
            {t('introDescriptionLong')}
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in-up delay-400">
            <button className="bg-[#8b5e3c] text-white px-8 py-3.5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#6d4a2f] transition-all hover:scale-105 shadow-xl">
              {t('requestConsultation')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/50 hidden md:block">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
        </svg>
      </div>
    </section>
  );
};

export default Intro;