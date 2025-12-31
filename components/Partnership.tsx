import React from 'react';
import { Globe, Award, Sparkles } from 'lucide-react';

const Partnership: React.FC = () => {
  return (
    <section className="py-24 bg-stone-50 text-center md:text-left">
      <div className="container mx-auto px-6">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h4 className="text-gold-600 uppercase tracking-[0.2em] text-xs font-bold mb-4">
            Global Strategy
          </h4>
          <h2 className="font-serif text-3xl md:text-5xl text-navy-900 leading-tight mb-8">
            Partnering with China’s Leading <br className="hidden md:block" />
            Aesthetic Institutions to Deliver <br className="hidden md:block" />
            <span className="italic text-gold-600">World-Class Cosmetic Services</span>
          </h2>
          <p className="text-stone-600 text-lg md:text-xl font-light leading-relaxed">
            We have established long-term strategic partnerships with China’s most prestigious and innovative aesthetic institutions, ensuring that we offer global clients the highest level of cosmetic surgery and beauty treatments.
          </p>
        </div>

        {/* 3 Columns Commitment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 max-w-6xl mx-auto border-t border-stone-200 pt-16">
          
          {/* Item 1 */}
          <div className="flex flex-col items-center md:items-start group hover:-translate-y-2 transition-transform duration-500">
            <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center mb-6 text-gold-500 shadow-sm group-hover:shadow-md transition-all">
              <Award size={24} strokeWidth={1} />
            </div>
            <h3 className="font-serif text-2xl text-navy-900 mb-4">Exceptional Expertise</h3>
            <p className="text-stone-500 leading-relaxed font-light text-center md:text-left">
              We collaborate with China’s top plastic surgeons and beauty specialists to ensure each treatment meets international standards of safety and artistry.
            </p>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col items-center md:items-start group hover:-translate-y-2 transition-transform duration-500 delay-100">
            <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center mb-6 text-gold-500 shadow-sm group-hover:shadow-md transition-all">
              <Globe size={24} strokeWidth={1} />
            </div>
            <h3 className="font-serif text-2xl text-navy-900 mb-4">Global Recognition</h3>
            <p className="text-stone-500 leading-relaxed font-light text-center md:text-left">
              Our partner institutions have a broad international client base and have been featured and recommended by leading global media outlets.
            </p>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col items-center md:items-start group hover:-translate-y-2 transition-transform duration-500 delay-200">
            <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center mb-6 text-gold-500 shadow-sm group-hover:shadow-md transition-all">
              <Sparkles size={24} strokeWidth={1} />
            </div>
            <h3 className="font-serif text-2xl text-navy-900 mb-4">Personalized Treatments</h3>
            <p className="text-stone-500 leading-relaxed font-light text-center md:text-left">
              We provide customized treatment plans that cater to individual needs, helping you achieve your beauty and confidence goals with precision.
            </p>
          </div>

        </div>

        {/* Footer Text */}
        <div className="mt-20 text-center max-w-3xl mx-auto">
          <p className="text-navy-900 text-lg font-serif italic">
            "Wherever you are, we offer the latest technologies and the most comfortable treatment experience to help you achieve your ideal appearance."
          </p>
        </div>

      </div>
    </section>
  );
};

export default Partnership;