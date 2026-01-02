import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface CategoryProps {
  title: string;
  subtitle: string;
  description: string;
  items: string[];
  image: string;
  theme: 'light' | 'dark' | 'warm';
  align: 'left' | 'right';
  id: string;
}

const CategorySection: React.FC<CategoryProps> = ({ title, subtitle, description, items, image, theme, align, id }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  
  // Define colors
  const textColor = isDark ? 'text-white' : 'text-navy-900';
  const subTitleColor = isDark ? 'text-gold-400' : 'text-stone-500';
  const descColor = isDark ? 'text-sage-100' : 'text-stone-600';
  const linkColor = isDark ? 'text-gold-300 hover:text-white' : 'text-gold-600 hover:text-navy-900';
  const lineColor = isDark ? 'bg-gold-500' : 'bg-navy-900';
  
  // IMPROVED Gradient Logic
  // 1. We use w-full (full width) instead of w-3/4 to prevent gaps.
  // 2. We add specific stops (from-30% via-60%) to ensure the text area has a SOLID background
  //    before it starts fading out.
  
  const gradientClass = align === 'left'
    ? (isDark 
        ? 'bg-gradient-to-r from-[#0f201b] from-30% via-[#0f201b]/95 via-60% to-transparent' 
        : 'bg-gradient-to-r from-[#f4f7f5] from-30% via-[#f4f7f5]/95 via-60% to-transparent')
    : (isDark 
        ? 'bg-gradient-to-l from-[#0f201b] from-30% via-[#0f201b]/95 via-60% to-transparent' 
        : 'bg-gradient-to-l from-[#f4f7f5] from-30% via-[#f4f7f5]/95 via-60% to-transparent');

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
      {/* 1. Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt={title} 
          className={`w-full h-full object-cover transition-transform duration-[2000ms] ease-out ${
             align === 'left' ? 'object-[80%_center]' : 'object-[20%_center]'
          }`}
        />
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
            {items.map((item, idx) => (
              <a 
                key={idx} 
                href="#" 
                className={`text-lg font-medium tracking-wide flex items-center gap-3 group/link transition-all ${linkColor}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-transform group-hover/link:scale-150 ${isDark ? 'bg-gold-400' : 'bg-gold-600'}`}></span>
                {item} 
                <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300" />
              </a>
            ))}
          </div>

          <button className={`uppercase tracking-[0.2em] text-xs font-bold py-4 px-10 border transition-all duration-300 w-max 
            ${isDark 
              ? 'border-white text-white hover:bg-white hover:text-navy-900' 
              : 'border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white'
            }`}>
            {id === 'face' && t('exploreFace')}
            {id === 'body' && t('exploreBody')}
            {id === 'nonsurgical' && t('exploreNonsurgical')}
          </button>
        </div>
      </div>
    </div>
  );
};

const Categories: React.FC = () => {
  const categories: CategoryProps[] = [
    {
      id: "face",
      title: "Face",
      subtitle: "Personalized Facial Rejuvenation",
      description: "Designed around the unique facial anatomy of different ethnicities and your individual structure. Deep-plane lifting, eyelid refinement, and precision rhinoplasty—crafted for balance, harmony, and natural-looking results.",
      items: ["Facelift (面部提升)", "Eyelid Surgery (眼部整形)", "Rhinoplasty (综合隆鼻)", "Deep Neck Contouring (颈部塑形)"],
      image: "https://images.unsplash.com/photo-1510526786859-99a38f8f267c?q=80&w=2070&auto=format&fit=crop",
      theme: 'warm', // Light Sage Gradient
      align: 'left'
    },
    {
      id: "body",
      title: "Body",
      subtitle: "Love your silhouette. Own your confidence.",
      description: "Tailored contouring and restoration—designed to refine shape, improve tone, and bring back a firmer, more youthful silhouette.",
      items: ["Tummy Tuck (腹壁整形)", "Liposuction (吸脂塑形)", "Mommy Makeover (产后修复)", "Body Contouring (身体塑形)"],
      image: "https://images.unsplash.com/photo-1609121855913-9a3d4f40f3c5?q=80&w=1974&auto=format&fit=crop", 
      theme: 'warm', // Light Sage Gradient
      align: 'right'
    },
    {
      id: "nonsurgical",
      title: "Nonsurgical",
      subtitle: "A refined look—no surgery required",
      description: "Clinically guided, individually tailored rejuvenation for balanced features, smoother lines, and healthier-looking skin.",
      items: ["BOTOX® Cosmetic (肉毒素)", "Dermal Fillers (玻尿酸填充)", "Lip Injections (丰唇)", "Skin Rejuvenation (皮肤管理)"],
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1964&auto=format&fit=crop", 
      theme: 'dark', // Dark Forest Gradient
      align: 'right'
    }
  ];

  return (
    <section className="flex flex-col">
      {categories.map((cat, index) => (
        <CategorySection key={index} {...cat} />
      ))}
    </section>
  );
};

export default Categories;