import React from 'react';

const TeamIntro: React.FC = () => {
  return (
    <section className="py-24 bg-white text-center">
      <div className="container mx-auto px-6">
        <h3 className="text-gold-600 uppercase tracking-[0.2em] text-sm font-bold mb-6">
          The YiMei Center for Plastic Surgery
        </h3>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-navy-900 max-w-5xl mx-auto leading-tight">
          OUR TEAM INCLUDES <br className="hidden md:block" />
          INTERNATIONALLY ACCLAIMED SURGEONS
        </h2>
      </div>
    </section>
  );
};

export default TeamIntro;