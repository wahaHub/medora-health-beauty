import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { getHomepageImage } from '../utils/imageUtils';
import SearchBar from './SearchBar';

const Intro: React.FC = () => {
  const { t } = useTranslation();
  const heroImage = getHomepageImage('hero');

  const handleSearch = (query: string, country: string, priceRange: string) => {
    // TODO: Implement search navigation
    console.log('Search:', { query, country, priceRange });
  };

  return (
    <section className="relative min-h-screen flex items-center py-20 z-10">
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

      {/* Gradient Overlay - Centered Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f201b]/80 via-[#0f201b]/60 to-[#0f201b]/80 z-10"></div>

      {/* Content Container */}
      <div className="container mx-auto px-6 relative z-20 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl pt-20">

          {/* Logo Mark / Brand Text */}
          <div className="mb-6 animate-fade-in-up">
            <h3 className="text-gold-500 tracking-[0.25em] uppercase text-xs font-bold flex items-center justify-center gap-3">
              <span className="w-6 h-[1px] bg-gold-500 inline-block"></span>
              {t('centerForPlasticSurgery')}
              <span className="w-6 h-[1px] bg-gold-500 inline-block"></span>
            </h3>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight mb-6 text-white font-light tracking-wide animate-fade-in-up delay-100">
            {t('heroTitle')}
          </h1>

          {/* Subheading */}
          <h2 className="text-base md:text-lg lg:text-xl font-sans text-sage-200 mb-4 font-light animate-fade-in-up delay-200 max-w-3xl mx-auto">
            {t('heroSubtitle')}
          </h2>

          {/* Description */}
          <p className="text-sage-50 text-sm md:text-base leading-relaxed mb-10 max-w-2xl mx-auto font-light animate-fade-in-up delay-300">
            {t('introDescriptionLong')}
          </p>

          {/* Search Bar */}
          <div className="animate-fade-in-up delay-400 w-full">
            <SearchBar onSearch={handleSearch} />
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