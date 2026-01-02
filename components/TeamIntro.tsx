import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const TeamIntro: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-24 bg-white text-center">
      <div className="container mx-auto px-6">
        <h3 className="text-gold-600 uppercase tracking-[0.2em] text-sm font-bold mb-6">
          {t('yiMeiCenter')}
        </h3>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-navy-900 max-w-5xl mx-auto leading-tight">
          {t('ourTeamIncludes')} <br className="hidden md:block" />
          {t('internationallyAcclaimed')}
        </h2>
      </div>
    </section>
  );
};

export default TeamIntro;