import React from 'react';
import { ChevronRight } from 'lucide-react';
import { getHomepageImage } from '../utils/imageUtils';

interface GalleryCTAProps {
  onNavigate?: (page: string) => void;
}

const GalleryCTA: React.FC<GalleryCTAProps> = ({ onNavigate }) => {
  const galleryImage = getHomepageImage('gallery');

  const handleGalleryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('gallery');
    }
  };

  return (
    <section id="gallery" className="relative h-[600px] lg:h-[700px] w-full overflow-hidden group">
      {/* Background Image - Elegant fashion aesthetic */}
      <img
        src={galleryImage}
        alt="Envision a new you"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
        onError={(e) => {
          e.currentTarget.src = "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=2070&auto=format&fit=crop";
        }}
      />
      
      {/* Mobile Overlay for readability */}
      <div className="absolute inset-0 bg-black/20 md:bg-transparent"></div>
      
      {/* Floating White Content Box */}
      <div className="absolute bottom-0 right-0 w-full md:w-auto md:bottom-12 md:right-12 lg:bottom-20 lg:right-20">
        <div className="bg-white p-10 md:p-16 lg:px-24 lg:py-20 shadow-2xl max-w-xl mx-auto md:mx-0">
          <div className="flex flex-col items-center text-center">
            <h4 className="text-gold-600 uppercase tracking-[0.25em] text-xs md:text-sm font-bold mb-5">
              Envision a New You
            </h4>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl text-navy-900 mb-8 tracking-wide">
              GALLERY
            </h2>
            <a 
              href="#" 
              onClick={handleGalleryClick}
              className="inline-flex items-center text-navy-900 hover:text-gold-600 transition-colors font-bold tracking-wide uppercase text-xs md:text-sm group/link"
            >
              Explore Our Photo Gallery 
              <ChevronRight size={16} className="ml-2 transition-transform duration-300 group-hover/link:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GalleryCTA;