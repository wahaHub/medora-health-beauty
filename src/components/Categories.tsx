import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useOptionalLanguage } from '@/contexts/LanguageContext';
import {
  getDiscoveryLabel,
  getDiscoveryVideoUrl,
  procedureDiscoveryGroups,
  type DiscoveryArea,
  type ProcedureDiscoveryItem,
} from '@/data/procedureDiscovery';
import { useTranslation } from '@/hooks/useTranslation';
import { getHomepageImage } from '@/utils/imageUtils';

const HOMEPAGE_VIDEO_BASE_URL = (
  import.meta.env.VITE_R2_CUSTOM_DOMAIN ||
  import.meta.env.VITE_R2_PUBLIC_URL ||
  'https://videos.medorabeauty.com'
).replace(/\/+$/, '');

const getHomepageVideo = (filename: string) => `${HOMEPAGE_VIDEO_BASE_URL}/homepage/${filename}`;

interface CategoryProps {
  title: string;
  subtitle: string;
  description: string;
  items: ProcedureDiscoveryItem[];
  image: string;
  theme: 'light' | 'dark' | 'warm';
  align: 'left' | 'right';
  id: DiscoveryArea;
  videoSrc?: string;
  ctaLabel: string;
}

const CategorySection: React.FC<CategoryProps> = ({ title, subtitle, description, items, image, theme, align, id, videoSrc, ctaLabel }) => {
  const { t } = useTranslation();
  const languageContext = useOptionalLanguage();
  const currentLanguage = languageContext?.currentLanguage ?? 'en';
  const isDark = theme === 'dark';
  
  // Define colors
  const textColor = isDark ? 'text-white' : 'text-white';
  const subTitleColor = isDark ? 'text-gold-400' : 'text-white';
  const descColor = isDark ? 'text-sage-100' : 'text-white';
  const linkColor = isDark ? 'text-gold-300 hover:text-white' : 'text-white hover:text-gold-200';
  const lineColor = isDark ? 'bg-gold-500' : 'bg-white';
  
  // IMPROVED Gradient Logic
  // 1. We use w-full (full width) instead of w-3/4 to prevent gaps.
  // 2. We add specific stops (from-30% via-60%) to ensure the text area has a SOLID background
  //    before it starts fading out.
  
  const gradientClass = align === 'left'
    ? (isDark
        ? 'bg-gradient-to-r from-[#0f201b]/30 from-15% via-[#0f201b]/15 via-40% to-transparent'
        : 'bg-gradient-to-r from-[#f4f7f5]/30 from-15% via-[#f4f7f5]/15 via-40% to-transparent')
    : (isDark
        ? 'bg-gradient-to-l from-[#0f201b]/30 from-15% via-[#0f201b]/15 via-40% to-transparent'
        : 'bg-gradient-to-l from-[#f4f7f5]/30 from-15% via-[#f4f7f5]/15 via-40% to-transparent');

  // Text Alignment Logic
  // We constrain the text width and margin to ensure it sits perfectly inside the solid part of the gradient.
  const contentContainerClass = align === 'left' 
    ? 'mr-auto pl-6 md:pl-20 pr-10' 
    : 'ml-auto pr-6 md:pr-20 pl-10 text-right items-end'; // Added items-end for right align visuals

  // For right aligned text, we might want the text itself to be right aligned or left aligned?
  // Usually high-end sites keep paragraph text left-aligned even if the block is on the right,
  // but let's stick to a clean block structure.
  const textAlignment = align === 'left' ? 'text-left' : 'text-left'; // Keep text justified left for readability usually

  return (
    <div id={id} className="relative min-h-[700px] md:h-screen max-h-[900px] flex items-center overflow-hidden">
      {/* 1. Background Image/Video Layer */}
      <div className="absolute inset-0 z-0">
        {videoSrc ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className={`w-full h-full object-cover ${
              align === 'left' ? 'object-[80%_center]' : 'object-[20%_center]'
            }`}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <img
            src={image}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-[2000ms] ease-out ${
              align === 'left' ? 'object-[80%_center]' : 'object-[20%_center]'
            }`}
            onError={(e) => {
              // Fallback images if R2 loading fails
              const fallbacks: Record<string, string> = {
                'nonsurgical': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1964&auto=format&fit=crop'
              };
              e.currentTarget.src = fallbacks[id] || fallbacks['nonsurgical'];
            }}
          />
        )}
      </div>

      {/* 2. Gradient Overlay Layer - NOW FULL WIDTH */}
      <div className={`absolute inset-0 z-10 w-full ${gradientClass}`}></div>

      {/* 3. Content Layer */}
      <div className="container mx-auto px-6 relative z-20 h-full pointer-events-none">
        {/* pointer-events-auto allows interaction with buttons/links inside the container */}
        <div className={`max-w-xl flex flex-col justify-center h-full py-20 pointer-events-auto ${contentContainerClass}`}>
          
          {/* Decorative Label */}
          <div className={`text-xs font-bold tracking-[0.3em] uppercase mb-4 ${isDark ? 'text-sage-300' : 'text-gold-600'}`}>
             {t('medoraHealthProcedures')}
          </div>

          <h2 className={`font-serif text-5xl md:text-7xl mb-6 tracking-wide uppercase leading-none ${textColor}`}>
            {title}
          </h2>
          
          <div className={`w-24 h-1 mb-8 ${lineColor}`}></div>

          <p className={`font-serif text-xl md:text-2xl italic mb-6 leading-relaxed ${subTitleColor}`}>
            "{subtitle}"
          </p>
          
          <p className={`text-lg mb-10 leading-relaxed font-light ${descColor}`}>
            {description}
          </p>

          <div className={`space-y-4 mb-12 ${align === 'right' ? 'flex flex-col items-start' : ''}`}>
            {items.map((item) => (
              <a
                key={item.id}
                href={getDiscoveryVideoUrl(item)}
                className={`text-lg font-medium tracking-wide flex items-center gap-3 group/link transition-all ${linkColor}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-transform group-hover/link:scale-150 ${isDark ? 'bg-gold-400' : 'bg-gold-600'}`}></span>
                {getDiscoveryLabel(item, currentLanguage)}
                <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300" />
              </a>
            ))}
          </div>

          <a
            href={`/procedure/videos?area=${id}`}
            className={`uppercase tracking-[0.2em] text-xs font-bold py-4 px-10 border transition-all duration-300 w-max
            ${isDark
              ? 'border-white text-white hover:bg-white hover:text-navy-900'
              : 'border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white'
            }`}
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </div>
  );
};

const Categories: React.FC = () => {
  const { t } = useTranslation();
  const languageContext = useOptionalLanguage();
  const currentLanguage = languageContext?.currentLanguage ?? 'en';
  const faceImage = getHomepageImage('face');
  const bodyImage = getHomepageImage('body');
  const nonSurgicalImage = getHomepageImage('non-surgical');
  const discoveryGroupsByArea = new Map(procedureDiscoveryGroups.map((group) => [group.id, group]));
  const getDiscoveryGroup = (area: DiscoveryArea) => {
    const group = discoveryGroupsByArea.get(area);
    if (!group) {
      throw new Error(`Missing homepage discovery group for ${area}`);
    }
    return group;
  };
  const faceGroup = getDiscoveryGroup('face');
  const bodyGroup = getDiscoveryGroup('body');
  const nonsurgicalGroup = getDiscoveryGroup('nonsurgical');
  const hairGroup = getDiscoveryGroup('hair');
  const dentalGroup = getDiscoveryGroup('dental');

  const categories: CategoryProps[] = [
    {
      id: "face",
      title: getDiscoveryLabel(faceGroup, currentLanguage),
      subtitle: t('categoryFaceSubtitle'),
      description: t('categoryFaceDescription'),
      items: faceGroup.items,
      image: faceImage,
      videoSrc: getHomepageVideo('face.mp4'),
      theme: 'warm', // Light Sage Gradient
      align: 'left',
      ctaLabel: t('exploreFace'),
    },
    {
      id: "body",
      title: getDiscoveryLabel(bodyGroup, currentLanguage),
      subtitle: t('categoryBodySubtitle'),
      description: t('categoryBodyDescription'),
      items: bodyGroup.items,
      image: bodyImage,
      videoSrc: getHomepageVideo('body.mp4'),
      theme: 'warm', // Light Sage Gradient
      align: 'right',
      ctaLabel: t('exploreBody'),
    },
    {
      id: "nonsurgical",
      title: getDiscoveryLabel(nonsurgicalGroup, currentLanguage),
      subtitle: t('categoryNonsurgicalSubtitle'),
      description: t('categoryNonsurgicalDescription'),
      items: nonsurgicalGroup.items,
      image: nonSurgicalImage,
      videoSrc: getHomepageVideo('non-surgical.mp4'),
      theme: 'warm', // Dark Forest Gradient
      align: 'left',
      ctaLabel: t('exploreNonsurgical'),
    },
    {
      id: "hair",
      title: getDiscoveryLabel(hairGroup, currentLanguage),
      subtitle: t('categoryHairSubtitle'),
      description: t('categoryHairDescription'),
      items: hairGroup.items,
      image: nonSurgicalImage,
      videoSrc: getHomepageVideo('hair.mp4'),
      theme: 'warm',
      align: 'left',
      ctaLabel: t('exploreHair'),
    },
    {
      id: "dental",
      title: getDiscoveryLabel(dentalGroup, currentLanguage),
      subtitle: t('categoryDentalSubtitle'),
      description: t('categoryDentalDescription'),
      items: dentalGroup.items,
      image: nonSurgicalImage,
      videoSrc: getHomepageVideo('dental.mp4'),
      theme: 'warm',
      align: 'left',
      ctaLabel: t('exploreDental'),
    }
  ];

  return (
    <section className="flex flex-col">
      {categories.map((cat, index) => (
        <React.Fragment key={index}>
          <CategorySection {...cat} />
          {/* Subtle divider between sections - elegant gold line */}
          {index < categories.length - 1 && (
            <div className="relative h-16 bg-gradient-to-b from-transparent via-sage-50 to-transparent">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                <div className="container mx-auto px-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent"></div>
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </section>
  );
};

export default Categories;
