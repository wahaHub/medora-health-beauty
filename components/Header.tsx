import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import procedureNames from '../i18n/procedureNames.json';

interface SubMenuItem {
  label: string;
  isHeader?: boolean;
  isSub?: boolean;
  href?: string;
}

interface NavItem {
  name: string;
  href: string;
  columns?: SubMenuItem[][]; // Array of columns, each column is an array of items
}

// Type for procedure names translation
type ProcedureNameTranslations = {
  [key: string]: {
    en: string;
    zh: string;
    es: string;
    fr: string;
    de: string;
    ru: string;
    ar: string;
    vi: string;
    id: string;
  };
};

const typedProcedureNames = procedureNames as ProcedureNameTranslations;

interface Surgeon {
  surgeon_id: string;
  name: string;
  title: string;
  specialties: string[];
  experience_years: number;
  image_url: string | null;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [surgeons, setSurgeons] = useState<Surgeon[]>([]);
  const [surgeonsLoading, setSurgeonsLoading] = useState(true);

  // Helper function to translate procedure/menu item names
  const translateLabel = (englishLabel: string): string => {
    const translation = typedProcedureNames[englishLabel];
    if (translation && translation[currentLanguage as keyof typeof translation]) {
      return translation[currentLanguage as keyof typeof translation];
    }
    return englishLabel; // Fallback to English if no translation found
  };

  // Fetch surgeons data
  useEffect(() => {
    const fetchSurgeons = async () => {
      try {
        setSurgeonsLoading(true);
        const response = await fetch('https://www.medorabeauty.com/api/surgeons');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Get unique surgeons from all specialties
            const allSurgeons = Object.values(result.data.surgeonsBySpecialty).flat() as Surgeon[];
            const uniqueSurgeons = allSurgeons.filter((surgeon: Surgeon, index: number, self: Surgeon[]) =>
              index === self.findIndex((s: Surgeon) => s.surgeon_id === surgeon.surgeon_id)
            );
            // Sort by name and show all surgeons
            const sortedSurgeons = uniqueSurgeons
              .sort((a, b) => a.name.localeCompare(b.name));
            setSurgeons(sortedSurgeons);
          }
        }
      } catch (error) {
        console.error('Failed to fetch surgeons:', error);
      } finally {
        setSurgeonsLoading(false);
      }
    };

    fetchSurgeons();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setIsAtTop(window.scrollY <= 20);
    };
    // Check initial state
    setIsAtTop(window.scrollY <= 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent, pageName: string, isMenuLink: boolean, href?: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setHoveredNav(null);

    // Handle different navigation cases
    // If href is a direct path (starts with /), navigate directly
    if (href && href.startsWith('/')) {
      navigate(href);
      window.scrollTo(0, 0);
      return;
    }

    // Check href first (language-independent), then fallback to pageName for backwards compatibility
    if (href === '#gallery' || pageName === 'GALLERY' || pageName === 'gallery') {
      navigate('/gallery');
      window.scrollTo(0, 0);
    } else if (pageName === 'Our Team') {
      navigate('/team');
      window.scrollTo(0, 0);
    } else if (href === '#travel' || pageName === 'TRAVEL' || pageName === 'travel') {
      navigate('/travel');
      window.scrollTo(0, 0);
    } else if (pageName === 'Patient Reviews' || pageName === 'reviews') {
      navigate('/reviews');
      window.scrollTo(0, 0);
    } else if (pageName.startsWith('Dr.')) {
      const surgeonName = encodeURIComponent(pageName);
      navigate(`/surgeon/${surgeonName}`);
      window.scrollTo(0, 0);
    } else if (isMenuLink) {
      // It's a procedure from the dropdown menu
      const procedureName = encodeURIComponent(pageName);
      navigate(`/procedure/${procedureName}`);
      window.scrollTo(0, 0);
    } else {
      // Basic anchor scrolling for home page sections (ABOUT, CONTACT, etc.)
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(pageName.toLowerCase().replace('#', ''));
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById(pageName.toLowerCase().replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  // Dynamic surgeon menu items - split into multiple columns
  const surgeonItems = surgeons.map((surgeon: Surgeon) => ({
    label: surgeon.name,
    isSub: true,
    href: `/surgeon/${surgeon.surgeon_id}`
  }));

  // Split surgeons into 3 columns (roughly equal distribution)
  const itemsPerColumn = Math.ceil(surgeonItems.length / 3);
  const surgeonColumn1: SubMenuItem[] = surgeonsLoading
    ? [{ label: 'Our Doctors', isHeader: true }, { label: 'Loading...', isSub: true }]
    : [
        { label: 'Our Doctors', isHeader: true },
        ...surgeonItems.slice(0, itemsPerColumn)
      ];
  const surgeonColumn2: SubMenuItem[] = surgeonsLoading
    ? []
    : surgeonItems.slice(itemsPerColumn, itemsPerColumn * 2);
  const surgeonColumn3: SubMenuItem[] = surgeonsLoading
    ? []
    : [
        ...surgeonItems.slice(itemsPerColumn * 2),
        { label: 'View All Doctors →', isSub: false, href: '/surgeons' },
        { label: 'Patient Reviews', isSub: false, href: '/reviews' }
      ];

  const navItems: NavItem[] = [
    {
      name: t('navAbout'),
      href: '#about',
      columns: [
        surgeonColumn1,
        surgeonColumn2,
        surgeonColumn3
      ]
    },
    {
      name: t('navFace'),
      href: '#face',
      columns: [
        [
          // 1. 面部整形手术 (Facial Surgery)
          { label: 'Eye Surgery', isHeader: true },
          { label: 'Eyelid Surgery', isSub: true },
          { label: 'Nose Surgery', isHeader: true },
          { label: 'Rhinoplasty', isSub: true },
          { label: 'Revision Rhinoplasty', isSub: true },
          { label: 'Nose Tip Refinement', isSub: true },
          { label: 'Facelift Surgery', isHeader: true },
          { label: 'Facelift', isSub: true },
          { label: 'Mini Facelift', isSub: true },
          { label: 'Midface Lift (Mid Facelift)', isSub: true },
          { label: 'Neck Lift', isSub: true },
          { label: 'Deep Neck Contouring', isSub: true },
          { label: 'Brow Lift', isSub: true },
          { label: 'Temples Lift / Temporofrontal Lift', isSub: true },
          { label: 'Forehead Reduction Surgery', isSub: true },
          { label: 'Facial Contouring', isHeader: true },
          { label: 'Cheek Augmentation', isSub: true },
          { label: 'Chin Augmentation', isSub: true },
          { label: 'Jawline Contouring', isSub: true },
          { label: 'Zygomatic Arch Contouring', isSub: true },
          { label: 'Other Facial Surgery', isHeader: true },
          { label: 'Otoplasty (Ear Pinning)', isSub: true },
          { label: 'Buccal Fat Removal', isSub: true }
        ],
        [
          // 2. 皮肤和注射类 (Skin & Injectables)
          { label: 'Skin Tightening & Resurfacing', isHeader: true },
          { label: 'Renuvion® Skin Tightening Treatment', isSub: true },
          { label: 'Laser Liposuction', isSub: true },
          { label: 'Skin Resurfacing', isSub: true },
          { label: 'Microdermabrasion', isSub: true },
          { label: 'Injectables & Regenerative', isHeader: true },
          { label: 'Facial Injectables', isSub: true },
          { label: 'BOTOX® & Neurotoxins', isSub: true },
          { label: 'Dermal Fillers', isSub: true },
          { label: 'Fat Dissolving Injections', isSub: true },
          { label: 'Fat Transfer (Facial Fat Grafting)', isSub: true },
          { label: 'Facial Rejuvenation with PRP', isSub: true },
          { label: 'Lip Filler', isSub: true },
          { label: 'Lip Injections', isSub: true },
          { label: 'Lip Augmentation', isSub: true },
          { label: 'Lip Lift', isSub: true }
        ],
        [
          // 3. 颈部整形 (Neck Surgery)
          { label: 'Neck Surgery', isHeader: true },
          { label: 'Neck Liposuction', isSub: true },
          { label: 'Neck Tightening', isSub: true },
          { label: 'Platysmaplasty', isSub: true },
          { label: 'Cervicoplasty', isSub: true },
          // 4. 头发恢复 (Hair Restoration)
          { label: 'Hair Restoration', isHeader: true },
          { label: 'Hair Restoration', isSub: true },
          // 5. 其他整形 (Other Procedures)
          { label: 'Other Procedures', isHeader: true },
          { label: 'Mohs Skin Cancer Reconstruction', isSub: true },
          { label: 'Facial Implants', isSub: true },
          { label: 'Submalar Implants', isSub: true }
        ]
      ]
    },
    { 
      name: t('navBody'), 
      href: '#body',
      columns: [
        [
          { label: 'Core Body Contouring', isHeader: true },
          { label: 'Liposuction', isSub: true },
          { label: 'Tummy Tuck', isSub: true },
          { label: 'Mommy Makeover', isSub: true },
          { label: 'Scar Reduction & Revision', isSub: true },
          { label: 'Renuvion® Skin Tightening Treatment', isSub: true },
          { label: 'Weight Loss Injections', isSub: true },
          { label: 'Arms / Legs / Back', isHeader: true },
          { label: 'Arm Lift', isSub: true },
          { label: 'Thigh Lift', isSub: true },
          { label: 'Bra Line Back Lift', isSub: true },
          { label: 'After Weight Loss / Body Lifts', isHeader: true },
          { label: 'Body Contouring After Weight Loss', isSub: true },
          { label: 'Lower Body Lift / 360 Body Lift', isSub: true },
          { label: 'Upper Body Lift', isSub: true },
          { label: 'Panniculectomy', isSub: true },
          { label: 'Mons Pubis Reduction / Lift', isSub: true }
        ],
        [
          { label: 'Breast / Chest', isHeader: true },
          { label: 'Breast Augmentation', isSub: true },
          { label: 'Breast Lift', isSub: true },
          { label: 'Breast Reduction', isSub: true },
          { label: 'Breast Implant Removal / Exchange & Revision', isSub: true },
          { label: 'Gynecomastia Surgery', isSub: true },
          { label: 'Buttocks', isHeader: true },
          { label: 'Brazilian Butt Lift (BBL)', isSub: true },
          { label: 'Buttock Lift', isSub: true }
        ],
        [
          { label: 'Intimate', isHeader: true },
          { label: 'Labiaplasty', isSub: true },
          { label: 'Cellulite', isHeader: true },
          { label: 'Avéli® Cellulite Treatment', isSub: true }
        ]
      ]
    },
    { 
      name: t('navNonSurgical'), 
      href: '#nonsurgical',
      columns: [
        [
          { label: 'Injectables', isHeader: true },
          { label: 'BOTOX® Cosmetic', isSub: true },
          { label: 'BOTOX® & Neurotoxins', isSub: true },
          { label: 'Dermal Fillers', isSub: true },
          { label: 'Lip Injections', isSub: true },
          { label: 'Lip Filler', isSub: true },
          { label: 'Cellulite', isHeader: true },
          { label: 'Avéli® Cellulite Treatment', isSub: true },
          { label: 'Skin Tightening', isHeader: true },
          { label: 'Non-surgical Skin Tightening', isSub: true }
        ],
        [
          { label: 'Resurfacing / Skin Renewal', isHeader: true },
          { label: 'Chemical Peels', isSub: true },
          { label: 'Skin Resurfacing', isSub: true },
          { label: 'Laser Skin Resurfacing', isSub: true },
          { label: 'Microdermabrasion', isSub: true },
          { label: 'Light / Laser-Based Skin Treatments', isHeader: true },
          { label: 'IPL / Photofacial', isSub: true }
        ],
        [
          { label: 'Hair Removal', isHeader: true },
          { label: 'Laser Hair Removal', isSub: true },
          { label: 'Collagen / Regenerative', isHeader: true },
          { label: 'Collagen Stimulators / Non-HA Fillers', isSub: true },
          { label: 'Microneedling', isSub: true },
          { label: 'PRP / PRF', isSub: true }
        ]
      ]
    },
    { name: t('navGallery'), href: '#gallery' },
    { name: t('navTravel'), href: '#travel' },
    { 
      name: t('navResources'), 
      href: '#resources',
      columns: [
        [
          { label: 'Gift Cards' },
          { label: 'Neurotoxin Subscription' },
          { label: 'Blog' },
          { label: 'Podcast' }
        ],
        [
          { label: 'New Patient Forms' },
          { label: 'Costs & Payment Options' },
          { label: 'Patient Safety' },
          { label: 'Pre- & Post-op Instructions' }
        ],
        [
          { label: 'Video Gallery' },
          { label: 'Protections Against Surprise Medical Bills' },
          { label: 'Right to Receive a Good Faith Estimate' },
          { label: 'Meaningful Access for Individuals with Limited English Proficiency' }
        ]
      ]
    },
    { name: t('navContact'), href: '#contact' },
  ];

  // Check if on a case detail page or procedure page (which have dark header sections)
  const isCaseDetailPage = location.pathname.includes('/case/');
  const isProcedurePage = location.pathname.includes('/procedure/');
  const hasDarkHero = isCaseDetailPage || isProcedurePage;

  // On pages with dark hero sections, header should be transparent at top
  // On home page and other pages, header is white at top
  const hasWhiteBg = isScrolled || Boolean(hoveredNav) || (!hasDarkHero && isAtTop);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        hasWhiteBg ? 'bg-white shadow-md py-0' : 'bg-transparent py-4'
      }`}
      onMouseLeave={() => setHoveredNav(null)}
    >
      <div className={`container mx-auto px-6 flex justify-between items-center relative z-50 ${isScrolled || hoveredNav ? 'h-20' : 'h-24'}`}>
        {/* Logo - Single Line */}
        <div 
          className={`z-50 transition-colors duration-300 cursor-pointer flex items-baseline gap-3 group shrink-0`}
          onClick={(e) => handleLinkClick(e, 'intro', false)}
        >
          <span className={`font-serif text-lg lg:text-xl tracking-widest font-bold transition-colors ${
            hasWhiteBg ? 'text-navy-900 group-hover:text-gold-600' : 'text-white group-hover:text-gold-300'
          }`}>
            MEDORA HEALTH
          </span>
          <span className="text-[10px] lg:text-xs uppercase tracking-[0.2em] text-gold-500 group-hover:text-navy-900 transition-colors font-medium">
            : BEAUTY
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex h-full items-center">
          {navItems.map((link) => (
            <div 
              key={link.name} 
              className="h-full flex items-center group px-4 cursor-pointer"
              onMouseEnter={() => link.columns ? setHoveredNav(link.name) : setHoveredNav(null)}
            >
              <a
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.name, false, link.href)}
                className={`text-sm tracking-[0.1em] font-medium uppercase transition-colors relative
                  ${hasWhiteBg ? 'text-stone-600 hover:text-gold-600' : 'text-white hover:text-gold-300'}
                  ${hoveredNav === link.name ? 'text-gold-600' : ''}`}
              >
                {link.name}
                {/* Underline effect */}
                <span className={`absolute bottom-[-4px] left-0 w-full h-[2px] bg-gold-600 transform scale-x-0 transition-transform duration-300 ${hoveredNav === link.name ? 'scale-x-100' : 'group-hover:scale-x-100'}`}></span>
              </a>
            </div>
          ))}
        </nav>

        {/* Language Selector */}
        <div className="hidden lg:block">
          <LanguageSelector isTransparent={!hasWhiteBg} />
        </div>

        {/* CTA Button */}
        <div className="hidden lg:flex shrink-0">
          <button className={`px-4 xl:px-6 py-2 rounded-sm text-xs xl:text-sm tracking-wider xl:tracking-widest uppercase transition-colors flex items-center gap-2 border whitespace-nowrap ${
            hasWhiteBg
              ? 'border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white'
              : 'border-white text-white hover:bg-white hover:text-navy-900'
          }`}>
            <Phone size={14} /> {t('requestConsultation')}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden z-50">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`transition-colors ${hasWhiteBg ? 'text-navy-900' : 'text-white'}`}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mega Menu Dropdowns */}
      {navItems.map((link) => (
        link.columns && (
          <div 
            key={`${link.name}-dropdown`}
            className={`absolute top-full left-0 w-full bg-forest-gradient text-white overflow-y-auto transition-all duration-300 ease-in-out z-40 border-t border-white/10 ${
              hoveredNav === link.name ? 'max-h-[800px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
            }`}
            onMouseEnter={() => setHoveredNav(link.name)}
            onMouseLeave={() => setHoveredNav(null)}
          >
            <div className="container mx-auto px-6 py-12">
              <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Decoration / Image */}
                <div className="lg:w-1/4 border-r border-white/10 pr-8 hidden lg:block">
                   <div className="font-serif text-8xl text-sage-300 italic opacity-30">
                     {link.name.charAt(0)}
                   </div>
                   <h3 className="text-gold-500 tracking-[0.2em] uppercase mt-4 text-xl">
                     {link.name === 'ABOUT' ? 'Our Practice' : link.name}
                   </h3>
                </div>

                {/* Columns */}
                <div className="lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {link.columns.map((col, colIdx) => (
                    <div key={colIdx} className="space-y-4">
                      {col.map((item, itemIdx) => (
                        <div key={itemIdx} className="group/item">
                          {item.isHeader ? (
                            <span className="block text-white text-sm font-medium tracking-wide mb-3 mt-4 first:mt-0">
                              {translateLabel(item.label)}
                            </span>
                          ) : (
                            <a
                              href={item.href || "#"}
                              onClick={(e) => handleLinkClick(e, item.label, true, item.href)}
                              className={`block transition-colors hover:text-gold-500 ${
                                item.isSub
                                  ? 'pl-4 text-sage-300 text-sm flex items-center'
                                  : 'text-sage-200 text-sm tracking-wide font-light'
                              }`}
                            >
                              {item.isSub && <span className="inline-block w-1 h-1 rounded-full bg-gold-600 mr-2 opacity-60 group-hover/item:opacity-100 transition-opacity"></span>}
                              {translateLabel(item.label)}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      ))}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 pt-24 px-6 overflow-y-auto">
          <div className="flex flex-col space-y-6">
            {navItems.map((link) => (
              <div key={link.name}>
                <a
                  href={link.href}
                  className="text-navy-900 text-xl font-serif font-bold"
                  onClick={(e) => handleLinkClick(e, link.name, false, link.href)}
                >
                  {link.name}
                </a>
                {/* Mobile sub-items - show limited items for better UX */}
                {link.columns && (
                  <div className="mt-4 pl-4 border-l-2 border-gold-200 space-y-3">
                    {(() => {
                      const allItems = link.columns.flat().filter(item => !item.isHeader);
                      // For ABOUT section - show only "View All Doctors" link
                      if (link.name === t('navAbout')) {
                        return allItems.filter(item => item.href === '/surgeons' || item.href === '/reviews').map((item, idx) => (
                          <div
                            key={idx}
                            className="text-stone-600 text-sm font-medium"
                            onClick={(e) => handleLinkClick(e, item.label, true, item.href)}
                          >
                            {translateLabel(item.label)}
                          </div>
                        ));
                      }
                      // For procedure sections (FACE, BODY, NON-SURGICAL) - show first 6 items + "View More"
                      if (link.name === t('navFace') || link.name === t('navBody') || link.name === t('navNonSurgical')) {
                        const limitedItems = allItems.slice(0, 6);
                        // Determine the category route
                        let categoryRoute = 'face';
                        if (link.name === t('navBody')) categoryRoute = 'body';
                        if (link.name === t('navNonSurgical')) categoryRoute = 'nonsurgical';

                        return (
                          <>
                            {limitedItems.map((item, idx) => (
                              <div
                                key={idx}
                                className={`text-stone-600 text-sm ${item.isSub ? 'pl-4' : ''}`}
                                onClick={(e) => handleLinkClick(e, item.label, true, item.href)}
                              >
                                {translateLabel(item.label)}
                              </div>
                            ))}
                            {allItems.length > 6 && (
                              <div
                                className="text-gold-600 text-sm font-medium italic cursor-pointer hover:text-gold-700"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setMobileMenuOpen(false);
                                  navigate(`/procedures/${categoryRoute}`);
                                }}
                              >
                                + {allItems.length - 6} more procedures
                              </div>
                            )}
                          </>
                        );
                      }
                      // For other sections - show all items
                      return allItems.map((item, idx) => (
                        <div
                          key={idx}
                          className={`text-stone-600 text-sm ${item.isSub ? 'pl-4' : ''}`}
                          onClick={(e) => handleLinkClick(e, item.label, true, item.href)}
                        >
                          {translateLabel(item.label)}
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;