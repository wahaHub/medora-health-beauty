import React from 'react';
import { ChevronRight } from 'lucide-react';
import { getHomepageImage } from '../utils/imageUtils';
import { useTranslation } from '../hooks/useTranslation';

const TravelProgram: React.FC = () => {
  const { t } = useTranslation();
  const conciergeImage = getHomepageImage('concierge');

  return (
    <section className="flex flex-col lg:flex-row min-h-[600px] bg-[#1a1a1a]">
      {/* Text Content with Map Background Effect */}
      <div className="lg:w-1/2 relative p-12 lg:p-24 flex flex-col justify-center overflow-hidden">
        {/* Subtle map pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
             }}>
        </div>

        <div className="relative z-10 max-w-xl mx-auto lg:mx-0">
          <h4 className="text-gold-500 uppercase tracking-widest text-sm font-bold mb-4">
            {t('travelInternationalDestination')}
          </h4>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-8 leading-tight">
            {t('travelConciergeProgram')}
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            {t('travelConciergeDescription')}
          </p>
          <a href="#" className="inline-flex items-center text-white hover:text-gold-500 transition-colors font-bold tracking-wide border-b border-transparent hover:border-gold-500 pb-1">
            {t('travelLearnMore')} <ChevronRight size={16} className="ml-2" />
          </a>
        </div>
      </div>

      {/* Image Side */}
      <div className="lg:w-1/2 relative h-[400px] lg:h-auto">
        <img
          src={conciergeImage}
          alt="Elegant traveler with luggage"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1569949381156-d5033c540289?q=80&w=2670&auto=format&fit=crop";
          }}
        />
      </div>
    </section>
  );
};

export default TravelProgram;