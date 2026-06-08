import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import SearchBar from './SearchBar';

const Intro: React.FC = () => {
  const { t } = useTranslation();

  const handleSearch = (query: string, country: string, priceRange: string) => {
    // TODO: Implement search navigation
    console.log('Search:', { query, country, priceRange });
  };

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-[#07120f] pb-16 pt-28 lg:pb-24 lg:pt-32">
      {/* Before-and-after case collage background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/homepage/aesthetic-cases-collage.png"
          alt="Before and after aesthetic treatment case collage"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_44%,rgba(5,10,9,0.10),rgba(5,10,9,0.00)_44%,rgba(3,8,7,0.20)_100%),linear-gradient(180deg,rgba(3,8,7,0.06)_0%,rgba(3,8,7,0.00)_38%,rgba(3,8,7,0.24)_100%)]" />
      <div className="absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-[#07120f]/18 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 h-36 bg-gradient-to-t from-[#07120f]/45 to-transparent" />

      {/* Content Container */}
      <div className="container relative z-20 mx-auto flex flex-col items-center justify-center px-6 text-center">
        <div className="relative w-full max-w-6xl">
          <div className="pointer-events-none absolute left-1/2 top-[-4.5rem] h-[25rem] w-[min(136rem,145vw)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(3,8,7,0.74)_0%,rgba(3,8,7,0.58)_42%,rgba(3,8,7,0.30)_72%,rgba(3,8,7,0)_92%)] blur-xl" />
          <div className="pointer-events-none absolute left-1/2 top-[5.5rem] h-56 w-[min(124rem,132vw)] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(3,8,7,0)_0%,rgba(3,8,7,0.54)_48%,rgba(3,8,7,0)_100%)] blur-2xl" />

          <div className="relative mb-7 animate-fade-in-up">
            <h3 className="flex items-center justify-center gap-5 text-xs font-bold uppercase tracking-[0.38em] text-[#d0a36b] drop-shadow-[0_0_18px_rgba(208,163,107,0.42)]">
              <span className="hidden h-px w-16 bg-[#d0a36b] sm:inline-block"></span>
              {t('centerForPlasticSurgery')}
              <span className="hidden h-px w-16 bg-[#d0a36b] sm:inline-block"></span>
            </h3>
          </div>

          <h1 className="relative mx-auto mb-6 max-w-5xl animate-fade-in-up font-serif text-4xl font-light leading-[1.05] tracking-normal text-[#f8f5ee] drop-shadow-[0_12px_32px_rgba(0,0,0,0.70)] delay-100 md:text-6xl lg:text-7xl">
            {t('heroCasesTitle')}
          </h1>

          <h2 className="relative mx-auto mb-9 max-w-3xl animate-fade-in-up font-sans text-base font-light leading-relaxed text-[#d4ddd8] drop-shadow-[0_8px_22px_rgba(0,0,0,0.62)] delay-200 md:text-xl">
            {t('heroCasesSubtitle')}
          </h2>

          <div className="relative mx-auto w-full max-w-5xl animate-fade-in-up delay-300">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 animate-bounce text-white/50 md:block">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
        </svg>
      </div>
    </section>
  );
};

export default Intro;
