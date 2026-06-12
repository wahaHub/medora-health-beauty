import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, Sparkles, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSurgeonsList } from '@/hooks/useData';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { proceduresByCategory } from '@/data/procedureTaxonomy';
import procedureNames from '@/i18n/procedureNames.json';
import { getProcedureAreaQueryValue, getProcedureVideoGalleryUrl } from '@/data/procedureTaxonomy';

interface SubMenuItem {
  label: string;
  isHeader?: boolean;
  isSub?: boolean;
  href?: string;
}

interface ProcedureMenuSection {
  title: string;
  route: 'face' | 'body' | 'nonsurgical' | 'hair' | 'dental';
  iconSrc: string;
  items: SubMenuItem[];
  viewAllLabel: string;
}

interface NavItem {
  name: string;
  href: string;
  columns?: SubMenuItem[][]; // Array of columns, each column is an array of items
  procedureSections?: ProcedureMenuSection[];
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
  title: string | null;
  specialties: string[];
  experience_years: number | null;
  image_url: string | null;
  images?: {
    hero?: string;
    [key: string]: string | undefined;
  } | null;
}

const doctorFallbackImages = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1594824476967-48c8b964ac31?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1589992896844-9b720813d1cb?q=80&w=1200&auto=format&fit=crop',
];

const headerDropdownCopy = {
  en: {
    meetOurExperts: 'Meet Our\nExperts',
    featuredDoctors: 'Featured Doctors',
    viewAllDoctors: 'View All Doctors',
    viewProfile: 'View Profile',
    procedures: 'Cases',
    proceduresIntro: 'Advanced aesthetic care. Personalised for you. Performed by trusted experts.',
  },
  zh: {
    meetOurExperts: '认识我们的\n专家',
    featuredDoctors: '精选医生',
    viewAllDoctors: '查看全部医生',
    viewProfile: '查看资料',
    procedures: '案例',
    proceduresIntro: '先进医美护理，为你个性化定制，由值得信赖的专家完成。',
  },
  es: {
    meetOurExperts: 'Conozca a\nNuestros Expertos',
    featuredDoctors: 'Doctores Destacados',
    viewAllDoctors: 'Ver Todos los Doctores',
    viewProfile: 'Ver Perfil',
    procedures: 'Casos',
    proceduresIntro: 'Atención estética avanzada. Personalizada para usted. Realizada por expertos de confianza.',
  },
  fr: {
    meetOurExperts: 'Rencontrez Nos\nExperts',
    featuredDoctors: 'Médecins à la Une',
    viewAllDoctors: 'Voir Tous les Médecins',
    viewProfile: 'Voir le Profil',
    procedures: 'Cas',
    proceduresIntro: 'Soins esthétiques avancés. Personnalisés pour vous. Réalisés par des experts de confiance.',
  },
  de: {
    meetOurExperts: 'Lernen Sie Unsere\nExperten Kennen',
    featuredDoctors: 'Ausgewählte Ärzte',
    viewAllDoctors: 'Alle Ärzte Ansehen',
    viewProfile: 'Profil Ansehen',
    procedures: 'Fälle',
    proceduresIntro: 'Fortschrittliche ästhetische Pflege. Persönlich auf Sie abgestimmt. Von vertrauenswürdigen Experten durchgeführt.',
  },
  ru: {
    meetOurExperts: 'Познакомьтесь с\nНашими Экспертами',
    featuredDoctors: 'Избранные врачи',
    viewAllDoctors: 'Смотреть всех врачей',
    viewProfile: 'Смотреть профиль',
    procedures: 'Кейсы',
    proceduresIntro: 'Передовая эстетическая помощь. Индивидуально для вас. Выполняется проверенными экспертами.',
  },
  ar: {
    meetOurExperts: 'تعرف على\nخبرائنا',
    featuredDoctors: 'الأطباء المميزون',
    viewAllDoctors: 'عرض جميع الأطباء',
    viewProfile: 'عرض الملف',
    procedures: 'الحالات',
    proceduresIntro: 'رعاية تجميلية متقدمة. مخصصة لك. يقدمها خبراء موثوقون.',
  },
  vi: {
    meetOurExperts: 'Gặp Gỡ\nChuyên Gia',
    featuredDoctors: 'Bác Sĩ Nổi Bật',
    viewAllDoctors: 'Xem Tất Cả Bác Sĩ',
    viewProfile: 'Xem Hồ Sơ',
    procedures: 'Ca Thực Tế',
    proceduresIntro: 'Chăm sóc thẩm mỹ tiên tiến. Cá nhân hóa cho bạn. Được thực hiện bởi các chuyên gia đáng tin cậy.',
  },
  id: {
    meetOurExperts: 'Temui\nPara Ahli Kami',
    featuredDoctors: 'Dokter Unggulan',
    viewAllDoctors: 'Lihat Semua Dokter',
    viewProfile: 'Lihat Profil',
    procedures: 'Kasus',
    proceduresIntro: 'Perawatan estetika modern. Dipersonalisasi untuk Anda. Dilakukan oleh ahli tepercaya.',
  },
} as const;

const casesNavLabels = {
  en: 'CASES',
  zh: '案例',
  es: 'CASOS',
  fr: 'CAS',
  de: 'FÄLLE',
  ru: 'КЕЙСЫ',
  ar: 'الحالات',
  vi: 'CA THỰC TẾ',
  id: 'KASUS',
} as const;

const doctorMetaTranslations = {
  'Plastic Surgery': {
    zh: '整形外科',
    es: 'Cirugía Plástica',
    fr: 'Chirurgie Plastique',
    de: 'Plastische Chirurgie',
    ru: 'Пластическая хирургия',
    ar: 'جراحة التجميل',
    vi: 'Phẫu Thuật Thẩm Mỹ',
    id: 'Bedah Plastik',
  },
  'Aesthetic Plastic Surgeon': {
    zh: '医美整形外科医生',
    es: 'Cirujano Plástico Estético',
    fr: 'Chirurgien Plasticien Esthétique',
    de: 'Ästhetischer Plastischer Chirurg',
    ru: 'Эстетический пластический хирург',
    ar: 'جراح تجميل تجميلي',
    vi: 'Bác Sĩ Phẫu Thuật Thẩm Mỹ',
    id: 'Dokter Bedah Plastik Estetik',
  },
  'Board-Certified Plastic Surgeon': {
    zh: '认证整形外科医生',
    es: 'Cirujano Plástico Certificado',
    fr: 'Chirurgien Plasticien Certifié',
    de: 'Facharzt für Plastische Chirurgie',
    ru: 'Сертифицированный пластический хирург',
    ar: 'جراح تجميل معتمد',
    vi: 'Bác Sĩ Phẫu Thuật Thẩm Mỹ Được Chứng Nhận',
    id: 'Dokter Bedah Plastik Bersertifikat',
  },
  'Consultant Plastic Surgeon': {
    zh: '顾问整形外科医生',
    es: 'Cirujano Plástico Consultor',
    fr: 'Chirurgien Plasticien Consultant',
    de: 'Leitender Plastischer Chirurg',
    ru: 'Консультирующий пластический хирург',
    ar: 'استشاري جراحة تجميل',
    vi: 'Bác Sĩ Tư Vấn Phẫu Thuật Thẩm Mỹ',
    id: 'Konsultan Bedah Plastik',
  },
  'Medora Beauty': {
    zh: 'Medora Beauty',
    es: 'Medora Beauty',
    fr: 'Medora Beauty',
    de: 'Medora Beauty',
    ru: 'Medora Beauty',
    ar: 'Medora Beauty',
    vi: 'Medora Beauty',
    id: 'Medora Beauty',
  },
} as const;

function getSurgeonImage(surgeon: Surgeon, index: number) {
  return surgeon.images?.hero || surgeon.image_url || doctorFallbackImages[index % doctorFallbackImages.length];
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isAuthenticated: isPatientAuthenticated, isLoading: isPatientAuthLoading } = usePatientAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [doctorCarouselPage, setDoctorCarouselPage] = useState(0);
  const [isDoctorCarouselPaused, setIsDoctorCarouselPaused] = useState(false);
  const [pausedProcedureSection, setPausedProcedureSection] = useState<string | null>(null);
  const procedureScrollerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const doctorsHospitalsLabel = currentLanguage === 'zh' ? '医生' : 'DOCTORS';
  const proceduresLabel = casesNavLabels[currentLanguage] || casesNavLabels.en;
  const dropdownCopy = headerDropdownCopy[currentLanguage] || headerDropdownCopy.en;

  // Fetch surgeons using React Query hook
  const shouldLoadSurgeons = hoveredNav === doctorsHospitalsLabel;
  const { data: surgeonsData, isLoading: surgeonsLoading } = useSurgeonsList({ enabled: shouldLoadSurgeons });

  // Use the already-unique, already-sorted surgeons list from the query.
  // (Avoids O(n^2) dedupe on large datasets.)
  const surgeons = useMemo(() => {
    return (surgeonsData?.surgeons || []) as Surgeon[];
  }, [surgeonsData]);
  const featuredDropdownDoctors = useMemo(() => {
    const drPrefixedSurgeons = surgeons.filter((surgeon) =>
      surgeon.name.trim().toLowerCase().startsWith('dr.')
    );

    return drPrefixedSurgeons.length > 0 ? drPrefixedSurgeons : surgeons;
  }, [surgeons]);
  const featuredDoctorPages = useMemo(() => {
    const pages: Surgeon[][] = [];
    for (let index = 0; index < featuredDropdownDoctors.length; index += 10) {
      pages.push(featuredDropdownDoctors.slice(index, index + 10));
    }
    return pages;
  }, [featuredDropdownDoctors]);

  // Helper function to translate procedure/menu item names
  const translateLabel = (englishLabel: string): string => {
    const translation = typedProcedureNames[englishLabel];
    if (translation && translation[currentLanguage as keyof typeof translation]) {
      return translation[currentLanguage as keyof typeof translation];
    }
    return englishLabel; // Fallback to English if no translation found
  };

  const translateDoctorMeta = (label: string) => {
    const direct = doctorMetaTranslations[label as keyof typeof doctorMetaTranslations];
    if (direct?.[currentLanguage as keyof typeof direct]) {
      return direct[currentLanguage as keyof typeof direct];
    }

    const matchedPrefix = Object.keys(doctorMetaTranslations).find((prefix) => label.startsWith(prefix));
    if (matchedPrefix) {
      const translatedPrefix =
        doctorMetaTranslations[matchedPrefix as keyof typeof doctorMetaTranslations][
          currentLanguage as keyof (typeof doctorMetaTranslations)[keyof typeof doctorMetaTranslations]
        ];
      if (translatedPrefix) return label.replace(matchedPrefix, translatedPrefix);
    }

    return translateLabel(label);
  };

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

  useEffect(() => {
    setDoctorCarouselPage(0);
    setIsDoctorCarouselPaused(false);
  }, [hoveredNav, featuredDoctorPages.length]);

  useEffect(() => {
    if (
      hoveredNav !== doctorsHospitalsLabel ||
      isDoctorCarouselPaused ||
      featuredDoctorPages.length <= 1
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setDoctorCarouselPage((currentPage) => (currentPage + 1) % featuredDoctorPages.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [doctorsHospitalsLabel, featuredDoctorPages.length, hoveredNav, isDoctorCarouselPaused]);

  useEffect(() => {
    if (hoveredNav !== proceduresLabel) return;

    const timer = window.setInterval(() => {
      Object.entries(procedureScrollerRefs.current).forEach(([sectionTitle, scroller]) => {
        if (!scroller || pausedProcedureSection === sectionTitle) return;
        if (scroller.scrollHeight <= scroller.clientHeight + 1) return;

        const isAtBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
        scroller.scrollTop = isAtBottom ? 0 : scroller.scrollTop + 0.5;
      });
    }, 80);

    return () => window.clearInterval(timer);
  }, [hoveredNav, pausedProcedureSection, proceduresLabel]);

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
      const procedureArea = getProcedureAreaQueryValue(pageName);
      const menuPath =
        procedureArea === 'all'
          ? `/procedure/${encodeURIComponent(pageName)}`
          : getProcedureVideoGalleryUrl(pageName);
      navigate(menuPath);
      window.scrollTo(0, 0);
    } else {
      // Basic anchor scrolling for home page sections (ABOUT, CONTACT, etc.)
      const targetId = href?.startsWith('#')
        ? href.slice(1)
        : pageName.toLowerCase().replace('#', '');
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById(targetId);
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

  const procedureSections: ProcedureMenuSection[] = [
    {
      title: 'Face',
      route: 'face',
      iconSrc: '/brand/procedure-icons/face.png',
      viewAllLabel: 'View all Face Procedures',
      items: proceduresByCategory.face.map((procedure) => ({
        label: procedure.label,
        isSub: true,
        href: getProcedureVideoGalleryUrl(procedure.label),
      }))
    },
    {
      title: 'Body',
      route: 'body',
      iconSrc: '/brand/procedure-icons/body.png',
      viewAllLabel: 'View all Body Procedures',
      items: proceduresByCategory.body.map((procedure) => ({
        label: procedure.label,
        isSub: true,
        href: getProcedureVideoGalleryUrl(procedure.label),
      }))
    },
    {
      title: 'Skin & Injectables',
      route: 'nonsurgical',
      iconSrc: '/brand/procedure-icons/nonsurgical.png',
      viewAllLabel: 'View all Non-Surgical Procedures',
      items: proceduresByCategory.nonsurgical.map((procedure) => ({
        label: procedure.label,
        isSub: true,
        href: getProcedureVideoGalleryUrl(procedure.label),
      }))
    },
    {
      title: 'Hair Restoration',
      route: 'hair',
      iconSrc: '/brand/procedure-icons/hair.png',
      viewAllLabel: 'View all Hair Procedures',
      items: proceduresByCategory.hair.map((procedure) => ({
        label: procedure.label,
        isSub: true,
        href: getProcedureVideoGalleryUrl(procedure.label),
      }))
    },
    {
      title: 'Dental',
      route: 'dental',
      iconSrc: '/brand/procedure-icons/dental.png',
      viewAllLabel: 'View all Dental Procedures',
      items: proceduresByCategory.dental.map((procedure) => ({
        label: procedure.label,
        isSub: true,
        href: getProcedureVideoGalleryUrl(procedure.label),
      }))
    }
  ];

  const navItems: NavItem[] = [
    {
      name: doctorsHospitalsLabel,
      href: '#about',
      columns: [
        surgeonColumn1,
        surgeonColumn2,
        surgeonColumn3
      ]
    },
    {
      name: proceduresLabel,
      href: '/procedures/face',
      procedureSections,
      columns: procedureSections.map((section) => [
        { label: section.title, isHeader: true, href: `/procedures/${section.route}` },
        ...section.items,
        { label: section.viewAllLabel, href: `/procedures/${section.route}` }
      ])
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
  const isProcedureVideoGalleryPage =
    location.pathname === '/procedure/videos' || /^\/procedure\/[^/]+\/videos$/.test(location.pathname);
  const hasDarkHero = isCaseDetailPage || (isProcedurePage && !isProcedureVideoGalleryPage);

  // On pages with dark hero sections, header should be transparent at top
  // On home page and other pages, header is white at top
  const hasWhiteBg = isScrolled || Boolean(hoveredNav) || (!hasDarkHero && isAtTop);
  const navLinkClass = `whitespace-nowrap font-sans text-sm font-medium uppercase leading-none tracking-[0.1em] transition-colors relative ${
    hasWhiteBg ? 'text-stone-600 hover:text-[#a77749]' : 'text-white hover:text-[#c99963]'
  }`;
  const authHref = isPatientAuthenticated ? '/dashboard' : '/login';
  const authLabel = isPatientAuthLoading ? 'Account' : isPatientAuthenticated ? 'Dashboard' : 'Login';
  const authButtonClass = `px-4 xl:px-6 py-2.5 rounded-none text-xs xl:text-sm tracking-[0.14em] uppercase transition-colors flex items-center justify-center border whitespace-nowrap ${
    hasWhiteBg
      ? 'border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white'
      : 'border-white text-white hover:bg-white hover:text-navy-900'
  }`;

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        hasWhiteBg ? 'bg-white shadow-md py-0' : 'bg-transparent py-4'
      }`}
      onMouseLeave={() => setHoveredNav(null)}
    >
      <div className={`w-full px-6 flex justify-between items-center relative z-50 ${isScrolled || hoveredNav ? 'h-20' : 'h-24'}`}>
        {/* Logo */}
        <div 
          className="z-50 flex shrink-0 cursor-pointer items-center gap-2 transition-colors duration-300 group sm:gap-3"
          onClick={(e) => handleLinkClick(e, 'intro', false)}
        >
          <span className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border transition-colors lg:h-10 lg:w-10 ${
            hasWhiteBg ? 'border-[#d6b25f]/45 bg-white' : 'border-white/35 bg-white/95'
          }`}>
            <img src="/brand/medora-beauty-mark.png" alt="" className="h-full w-full object-cover" />
          </span>
          <span className={`font-serif text-base font-semibold uppercase tracking-[0.12em] transition-colors sm:tracking-[0.16em] lg:text-xl ${
            hasWhiteBg ? 'text-navy-900 group-hover:text-gold-600' : 'text-white group-hover:text-gold-300'
          }`}>
            Medora Beauty
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex h-full min-w-0 flex-1 items-center justify-center">
          {navItems.map((link) => (
            <div 
              key={link.name} 
              className="h-full flex items-center group px-4 cursor-pointer"
              onMouseEnter={() => (link.columns || link.procedureSections) ? setHoveredNav(link.name) : setHoveredNav(null)}
            >
              <a
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.name, false, link.href)}
                className={`${navLinkClass} ${hoveredNav === link.name ? 'text-[#a77749]' : ''}`}
              >
                {link.name}
                {/* Underline effect */}
                <span className={`absolute bottom-[-6px] left-0 w-full h-[2px] bg-[#a77749] transform scale-x-0 transition-transform duration-300 ${hoveredNav === link.name ? 'scale-x-100' : 'group-hover:scale-x-100'}`}></span>
              </a>
            </div>
          ))}
        </nav>

        {/* Utility Controls */}
        <div className="hidden lg:flex shrink-0 items-center gap-3">
          <LanguageSelector isTransparent={!hasWhiteBg} compact />
          {isPatientAuthLoading ? (
            <span
              className={`${authButtonClass} cursor-default opacity-80`}
              aria-disabled="true"
            >
              {authLabel}
            </span>
          ) : (
            <Link
              to={authHref}
              className={authButtonClass}
            >
              {authLabel}
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`transition-colors ${hasWhiteBg ? 'text-navy-900' : 'text-white'}`}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mega Menu Dropdowns */}
      {navItems.map((link) => (
        (link.columns || link.procedureSections) && (
          <div 
            key={`${link.name}-dropdown`}
            className={`absolute top-full left-0 w-full bg-[#073a31] text-white overflow-y-auto transition-all duration-300 ease-in-out z-40 border-t border-[#d8d2c7]/25 ${
              hoveredNav === link.name ? 'max-h-[800px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
            }`}
            onMouseEnter={() => setHoveredNav(link.name)}
            onMouseLeave={() => setHoveredNav(null)}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_18%,rgba(176,126,76,0.18),transparent_30%),radial-gradient(circle_at_70%_50%,rgba(16,91,78,0.34),transparent_38%),linear-gradient(90deg,rgba(2,34,29,0.20),transparent_30%,rgba(2,30,27,0.24))] pointer-events-none" />
            <div className="absolute inset-y-8 left-6 hidden w-px bg-[#d0b083]/20 xl:block" />
            <div className="absolute inset-y-8 right-6 hidden w-px bg-[#d0b083]/20 xl:block" />
            <div className="container relative mx-auto px-6 py-8 lg:py-10">
              {link.name === doctorsHospitalsLabel ? (
                <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[16.5rem_minmax(0,1fr)]">
                  <aside className="hidden border-r border-[#d0b083]/20 pr-10 lg:block">
                    <div className="mb-8 flex items-center gap-3">
                      <span className="font-serif text-[6.9rem] leading-none text-[#f3f0e8] drop-shadow-[0_2px_2px_rgba(0,0,0,0.32)]">M</span>
                      <Sparkles className="mt-10 text-[#c4935b]" size={22} strokeWidth={1.35} />
                    </div>
                    <div className="font-sans text-sm font-medium uppercase leading-[1.55] tracking-wide text-[#c4935b]">
                      {dropdownCopy.meetOurExperts.split('\n').map((line, index) => (
                        <React.Fragment key={line}>
                          {index > 0 && <br />}
                          {line}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="mt-4 h-[2px] w-14 bg-[#c4935b]" />
                  </aside>

                  <div className="min-w-0 pt-1">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <h3 className="font-sans text-sm font-medium uppercase tracking-[0.1em] text-[#c4935b]">
                        {dropdownCopy.featuredDoctors}
                      </h3>
                      <a
                        href="/surgeons"
                        onClick={(event) => handleLinkClick(event, 'View All Doctors →', true, '/surgeons')}
                        className="font-sans text-sm font-medium uppercase tracking-[0.1em] text-[#c4935b] transition-colors hover:text-[#f0d3a9]"
                      >
                        {dropdownCopy.viewAllDoctors} <span aria-hidden>→</span>
                      </a>
                    </div>

                    {surgeonsLoading ? (
                      <div className="rounded-[5px] border border-[#73958c]/45 bg-[#0b443a]/55 p-8 text-center text-[#c9d5d1]">
                        Loading doctors...
                      </div>
                    ) : featuredDoctorPages.length === 0 ? (
                      <div className="rounded-[5px] border border-[#73958c]/45 bg-[#0b443a]/55 p-8 text-center text-[#c9d5d1]">
                        No doctors found.
                      </div>
                    ) : (
                      <div
                        className="relative overflow-hidden"
                        onMouseEnter={() => setIsDoctorCarouselPaused(true)}
                        onMouseLeave={() => setIsDoctorCarouselPaused(false)}
                      >
                        {featuredDoctorPages.map((doctorPage, pageIndex) => (
                          <div
                            key={pageIndex}
                            className={`grid w-full grid-cols-1 gap-4 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:grid-cols-2 lg:grid-cols-5 ${
                              pageIndex === doctorCarouselPage ? 'relative' : 'absolute inset-x-0 top-0'
                            }`}
                            style={{ transform: `translateX(${(pageIndex - doctorCarouselPage) * 100}%)` }}
                            aria-hidden={pageIndex !== doctorCarouselPage}
                          >
                            {doctorPage.map((surgeon, index) => {
                              const imageIndex = pageIndex * 10 + index;

                              return (
                                <a
                                  key={surgeon.surgeon_id}
                                  href={`/surgeon/${surgeon.surgeon_id}`}
                                  onClick={(event) => handleLinkClick(event, surgeon.name, true, `/surgeon/${surgeon.surgeon_id}`)}
                                  className="group flex h-full flex-col rounded-[5px] border border-[#66897f]/50 bg-[#0b443a]/62 p-2 text-left shadow-[0_18px_46px_rgba(2,37,32,0.22),inset_0_0_0_1px_rgba(255,255,255,0.025)] transition-colors hover:border-[#c4935b]/70 hover:bg-[#0d4a40]/72"
                                >
                                  <div className="aspect-[1.55] overflow-hidden rounded-[3px] bg-[#d8d3ca]">
                                    <img
                                      src={getSurgeonImage(surgeon, imageIndex)}
                                      alt={surgeon.name}
                                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                      loading="lazy"
                                      onError={(event) => {
                                        event.currentTarget.src = doctorFallbackImages[imageIndex % doctorFallbackImages.length];
                                      }}
                                    />
                                  </div>
                                  <div className="flex flex-1 flex-col px-1.5 pb-2 pt-2.5">
                                    <h4 className="font-sans line-clamp-2 min-h-[2.15rem] text-sm font-medium leading-[1.2] text-[#f5f4ee]">
                                      {surgeon.name}
                                    </h4>
                                    <p className="mt-1 font-sans line-clamp-1 text-[13px] font-normal leading-[1.35] text-[#c6d3cf]">
                                      {translateDoctorMeta(surgeon.specialties?.[0] || 'Plastic Surgery')}
                                    </p>
                                    <p className="mt-0.5 font-sans line-clamp-1 text-xs font-normal leading-[1.35] text-[#aebdb8]">
                                      {translateDoctorMeta(surgeon.title || 'Medora Beauty')}
                                    </p>
                                    <span className="mt-auto pt-3 font-sans text-[13px] font-medium text-[#c4935b]">
                                      {dropdownCopy.viewProfile} <span aria-hidden>→</span>
                                    </span>
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : link.procedureSections ? (
                <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[16.5rem_minmax(0,1fr)]">
                  <aside className="hidden min-h-[31rem] border-r border-[#d0b083]/20 pr-10 lg:flex lg:flex-col">
                    <div className="mb-8">
                      <span className="block font-serif text-[7.1rem] italic leading-none text-[#d0a36b] drop-shadow-[0_2px_3px_rgba(0,0,0,0.36)]">
                        M
                      </span>
                      <div className="mt-6 h-[2px] w-20 bg-[#c4935b]" />
                    </div>
                    <h3 className="font-sans text-sm font-medium uppercase tracking-wide text-[#c4935b]">
                      {dropdownCopy.procedures}
                    </h3>
                    <p className="mt-9 max-w-[12rem] font-sans text-sm font-light leading-[1.8] text-[#d5ded9]">
                      {dropdownCopy.proceduresIntro}
                    </p>
                    <div className="mt-auto h-32 opacity-[0.14]">
                      <div className="h-full w-full rounded-full border border-[#d0b083]/50 blur-[1px]" />
                    </div>
                  </aside>

                  <div className="grid min-w-0 gap-6 lg:grid-cols-5 lg:gap-0">
                    {link.procedureSections.map((section, sectionIdx) => {
                      return (
                        <section
                          key={section.title}
                          className={`flex min-h-[31rem] flex-col lg:px-4 xl:px-5 2xl:px-6 ${
                            sectionIdx > 0 ? 'lg:border-l lg:border-[#d0b083]/18' : ''
                          }`}
                        >
                          <div className="mb-2 flex h-16 items-start gap-3">
                            <span className="flex h-16 w-16 shrink-0 items-center justify-center">
                              <img
                                src={section.iconSrc}
                                alt=""
                                className="h-full w-full object-contain"
                                loading="lazy"
                              />
                            </span>
                            <div className="pt-2">
                              <h3 className="whitespace-nowrap font-sans text-sm font-medium leading-[1.35] tracking-wide text-[#f1f0eb]">
                                {translateLabel(section.title)}
                              </h3>
                              <div className="mt-3 h-[2px] w-14 bg-[#c4935b]" />
                            </div>
                          </div>

                          <div
                            ref={(node) => {
                              procedureScrollerRefs.current[section.title] = node;
                            }}
                            className="procedure-menu-scroller h-[18.25rem] min-h-0 overflow-y-auto pr-2"
                            onMouseEnter={() => setPausedProcedureSection(section.title)}
                            onMouseLeave={() => setPausedProcedureSection(null)}
                            onFocus={() => setPausedProcedureSection(section.title)}
                            onBlur={() => setPausedProcedureSection(null)}
                          >
                            {section.items.map((item) => (
                              <a
                                key={item.label}
                                href={item.href}
                                onClick={(event) => handleLinkClick(event, item.label, true, item.href)}
                                className="group/item flex min-h-12 items-center border-b border-[#d0b083]/15 py-3 text-sm font-medium leading-tight text-[#d8e0dc] transition-colors hover:text-[#e4bd83]"
                              >
                                <span className="mr-4 h-1.5 w-1.5 rounded-full bg-[#c4935b] transition-transform group-hover/item:scale-125" />
                                {translateLabel(item.label)}
                              </a>
                            ))}
                          </div>

                          <a
                            href={`/procedures/${section.route}`}
                            onClick={(event) => handleLinkClick(event, section.viewAllLabel, true, `/procedures/${section.route}`)}
                            className="mt-auto flex items-center gap-4 pt-8 text-sm font-medium text-[#d7ddd9] transition-colors hover:text-[#e4bd83]"
                          >
                            <ArrowRight className="h-5 w-5 text-[#c4935b]" strokeWidth={1.7} />
                            {translateLabel(section.viewAllLabel)}
                          </a>
                        </section>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-12">
                  {/* Left Decoration / Image */}
                  <div className="lg:w-1/4 border-r border-white/10 pr-8 hidden lg:block">
                    <div className="font-serif text-8xl text-sage-300 italic opacity-30">
                      {link.name.charAt(0)}
                    </div>
                    <h3 className="text-gold-500 tracking-[0.2em] uppercase mt-4 text-xl">
                      {link.name}
                    </h3>
                  </div>

                  {/* Columns */}
                  <div className="lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {link.columns?.map((col, colIdx) => (
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
              )}
            </div>
          </div>
        )
      ))}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 pt-24 px-6 overflow-y-auto">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-5">
              <LanguageSelector compact />
              {isPatientAuthLoading ? (
                <span
                  className="min-w-[8.5rem] rounded-sm border border-navy-900 px-4 py-2 text-center text-xs uppercase tracking-[0.2em] text-navy-900 opacity-80"
                  aria-disabled="true"
                >
                  {authLabel}
                </span>
              ) : (
                <Link
                  to={authHref}
                  className="min-w-[8.5rem] rounded-sm border border-navy-900 px-4 py-2 text-center text-xs uppercase tracking-[0.2em] text-navy-900 transition-colors hover:bg-navy-900 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {authLabel}
                </Link>
              )}
            </div>
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
                {(link.columns || link.procedureSections) && (
                  <div className="mt-4 pl-4 border-l-2 border-gold-200 space-y-3">
                    {(() => {
                      const allItems = link.procedureSections
                        ? link.procedureSections.flatMap((section) => section.items)
                        : (link.columns?.flat().filter(item => !item.isHeader) || []);
                      // For Doctors & Hospitals section - show key directory links.
                      if (link.name === doctorsHospitalsLabel) {
                        return allItems.filter(item => item.href === '/surgeons' || item.href === '/search?type=hospitals' || item.href === '/reviews').map((item, idx) => (
                          <div
                            key={idx}
                            className="text-stone-600 text-sm font-medium"
                            onClick={(e) => handleLinkClick(e, item.label, true, item.href)}
                          >
                            {translateLabel(item.label)}
                          </div>
                        ));
                      }
                      if (link.procedureSections) {
                        const limitedItems = link.procedureSections.flatMap((section) => section.items.slice(0, 2));
                        return (
                          <>
                            {limitedItems.map((item, idx) => (
                              <a
                                key={idx}
                                href={item.href}
                                className={`text-stone-600 text-sm ${item.isSub ? 'pl-4' : ''}`}
                                onClick={(e) => handleLinkClick(e, item.label, true, item.href)}
                              >
                                {translateLabel(item.label)}
                              </a>
                            ))}
                            {allItems.length > limitedItems.length && (
                              <a
                                href="/procedures/face"
                                className="text-gold-600 text-sm font-medium italic cursor-pointer hover:text-gold-700"
                                onClick={(e) => handleLinkClick(e, 'View all Face Procedures', true, '/procedures/face')}
                              >
                                + {allItems.length - limitedItems.length} more procedures
                              </a>
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
