import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, ChevronDown, LockKeyhole, Search, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import procedureNames from '@/i18n/procedureNames.json';
import { getProcedureVideoGalleryUrl } from '@/data/procedureTaxonomy';

interface SearchBarProps {
  onSearch?: (procedure: string, country: string, priceRange: string) => void;
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

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [procedure, setProcedure] = useState('');
  const [country, setCountry] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [showProcedureDropdown, setShowProcedureDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  const procedureRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (procedureRef.current && !procedureRef.current.contains(event.target as Node)) {
        setShowProcedureDropdown(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (priceRef.current && !priceRef.current.contains(event.target as Node)) {
        setShowPriceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get translated procedure name
  const getTranslatedProcedure = (englishName: string): string => {
    const translation = typedProcedureNames[englishName];
    if (translation && translation[currentLanguage as keyof typeof translation]) {
      return translation[currentLanguage as keyof typeof translation];
    }
    return englishName;
  };

  // Define procedure categories
  const faceProcedures = [
    'Brow Lift', 'Temples Lift / Temporofrontal Lift', 'Forehead Reduction Surgery',
    'Eyelid Surgery', 'Facelift', 'Midface Lift', 'Mini Facelift', 'Neck Lift',
    'Deep Neck Contouring', 'Neck Liposuction', 'Platysmaplasty', 'Cervicoplasty',
    'Otoplasty', 'Rhinoplasty', 'Revision Rhinoplasty', 'Nose Tip Refinement',
    'Mohs Skin Cancer Reconstruction', 'Cheek Augmentation', 'Chin Augmentation',
    'Jawline Contouring', 'Zygomatic Arch Contouring', 'Facial Implants',
    'Submalar Implants', 'Buccal Fat Removal', 'Fat Transfer', 'Lip Augmentation',
    'Lip Lift', 'Eye Surgery', 'Nose Surgery', 'Facelift Surgery', 'Facial Contouring',
    'Other Facial Surgery', 'Neck Surgery'
  ];

  const bodyProcedures = [
    'Liposuction', 'Laser Liposuction', 'Tummy Tuck', 'Mommy Makeover',
    'Arm Lift', 'Thigh Lift', 'Bra Line Back Lift', 'Body Contouring After Weight Loss',
    'Lower Body Lift / 360 Body Lift', 'Upper Body Lift', 'Panniculectomy',
    'Mons Pubis Reduction / Lift', 'Brazilian Butt Lift', 'Buttock Lift',
    'Labiaplasty', 'Scar Reduction & Revision', 'Core Body Contouring',
    'Arms / Legs / Back', 'After Weight Loss / Body Lifts', 'Buttocks', 'Intimate'
  ];

  const breastProcedures = [
    'Breast Augmentation', 'Breast Lift', 'Breast Reduction',
    'Breast Implant Removal / Exchange & Revision', 'Gynecomastia Surgery',
    'Breast / Chest'
  ];

  const nonSurgicalProcedures = [
    'Facial Injectables', 'BOTOX® & Neurotoxins', 'Dermal Fillers', 'Lip Filler',
    'Lip Injections', 'Fat Dissolving Injections', 'Facial Rejuvenation with PRP',
    'Neck Tightening', 'Renuvion® Skin Tightening Treatment', 'Skin Resurfacing',
    'Microdermabrasion', 'Hair Restoration', 'Medical Weight Loss Injections',
    'Avéli® Cellulite Treatment', 'BOTOX® Cosmetic', 'Non-surgical Skin Tightening',
    'Chemical Peels', 'Laser Skin Resurfacing', 'IPL / Photofacial',
    'Laser Hair Removal', 'Collagen Stimulators / Non-HA Fillers', 'Microneedling',
    'PRP / PRF', 'Skin Tightening & Resurfacing', 'Injectables & Regenerative',
    'Injectables', 'Skin Tightening', 'Resurfacing / Skin Renewal',
    'Light / Laser-Based Skin Treatments', 'Hair Removal', 'Collagen / Regenerative',
    'Cellulite', 'Weight Loss Injections'
  ];

  // Build categorized procedures
  const categorizedProcedures = [
    {
      category: 'face',
      label: t('categoryFace'),
      items: faceProcedures
        .filter(name => typedProcedureNames[name])
        .map(name => ({ value: name, label: getTranslatedProcedure(name) }))
    },
    {
      category: 'body',
      label: t('categoryBody'),
      items: bodyProcedures
        .filter(name => typedProcedureNames[name])
        .map(name => ({ value: name, label: getTranslatedProcedure(name) }))
    },
    {
      category: 'breast',
      label: t('categoryBreast'),
      items: breastProcedures
        .filter(name => typedProcedureNames[name])
        .map(name => ({ value: name, label: getTranslatedProcedure(name) }))
    },
    {
      category: 'nonSurgical',
      label: t('categoryNonSurgical'),
      items: nonSurgicalProcedures
        .filter(name => typedProcedureNames[name])
        .map(name => ({ value: name, label: getTranslatedProcedure(name) }))
    }
  ];

  const countries = [
    { value: '', label: t('allCountries') },
    { value: 'china', label: t('countryChina') },
  ];

  const priceRanges = [
    { value: '', label: t('allPrices') },
    { value: 'under5k', label: t('priceUnder5k') },
    { value: '5k-10k', label: t('price5kTo10k') },
    { value: '10k-20k', label: t('price10kTo20k') },
    { value: 'over20k', label: t('priceOver20k') },
  ];

  const countryDropdownOptions = countries.filter((option) => option.value);
  const priceDropdownOptions = priceRanges.filter((option) => option.value);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(procedure, country, priceRange);
    }
    if (procedure) {
      navigate(getProcedureVideoGalleryUrl(procedure));
    } else {
      navigate('/procedure/videos');
    }
    window.scrollTo(0, 0);
  };

  const getProcedureLabel = () => {
    if (!procedure) return t('allProcedures');
    return getTranslatedProcedure(procedure);
  };

  const getCountryLabel = () => {
    const selected = countries.find(c => c.value === country);
    return selected ? selected.label : t('searchCountry');
  };

  const getPriceLabel = () => {
    const selected = priceRanges.find(p => p.value === priceRange);
    return selected ? selected.label : t('searchPriceRange');
  };

  const closeAllDropdowns = () => {
    setShowProcedureDropdown(false);
    setShowCountryDropdown(false);
    setShowPriceDropdown(false);
  };

  const filterButtonClass = `w-full bg-white/[0.07] text-white py-4 px-4
                         border border-transparent hover:bg-white/[0.095] focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-[#d0a36b]/70
                         transition-all duration-300 flex items-center justify-between gap-2 text-sm
                         shadow-[inset_0_1px_0_rgba(255,255,255,0.045),inset_0_-1px_0_rgba(208,163,107,0.025)] backdrop-blur-md`;
  const dropdownPanelClass = `absolute top-full left-0 right-0 mt-2 bg-[#143d30] rounded-xl
                             border border-[#e1c28e]/30 shadow-[0_24px_64px_rgba(0,0,0,0.58),0_0_34px_rgba(208,163,107,0.22)] z-[9999] overflow-hidden`;
  const dropdownItemClass = 'w-full text-left px-4 py-3 text-sm text-white transition-colors';
  const dropdownItemStateClass = (isSelected: boolean) =>
    isSelected
      ? 'bg-[#d0a36b]/22 text-[#f5d49b]'
      : 'text-white hover:bg-[#1d5140]';

  return (
    <div className="relative z-[9990] mx-auto w-full max-w-5xl">
      <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-[#d0a36b]/26 blur-2xl" />
      <div className="pointer-events-none absolute -inset-1 rounded-[1.8rem] shadow-[0_0_34px_rgba(208,163,107,0.38),0_0_92px_rgba(208,163,107,0.24)]" />

      <div className="relative overflow-visible rounded-[1.55rem] border border-transparent bg-[#07120f]/[0.24] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.045),inset_0_-1px_0_rgba(244,216,164,0.035)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 rounded-[1.55rem] bg-gradient-to-b from-white/[0.045] via-white/[0.012] to-[#07120f]/[0.10]" />
        <div className="pointer-events-none absolute inset-x-14 top-0 h-px bg-gradient-to-r from-transparent via-[#ffe5b5]/10 to-transparent" />
        <div className="relative z-[10000] flex flex-col gap-3 lg:flex-row lg:items-stretch">
          <div className="hidden shrink-0 items-center justify-center lg:flex">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-transparent bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.045),0_0_24px_rgba(208,163,107,0.18)] backdrop-blur-md">
              <Search size={27} className="text-[#f3dcc0]" strokeWidth={1.65} />
            </div>
          </div>

          {/* Procedure Dropdown */}
          <div className="flex-1 relative" ref={procedureRef}>
            <button
              onClick={() => {
                setShowProcedureDropdown(!showProcedureDropdown);
                setShowCountryDropdown(false);
                setShowPriceDropdown(false);
              }}
                className={`${filterButtonClass} rounded-xl lg:rounded-l-xl lg:rounded-r-none`}
            >
              <div className="flex items-center gap-3">
                <Search size={20} className="text-[#f3dcc0] lg:hidden" strokeWidth={1.65} />
                <span className={procedure ? 'text-white' : 'text-[#e7e1d7]/78'}>
                  {getProcedureLabel()}
                </span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${showProcedureDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showProcedureDropdown && (
              <div className={`${dropdownPanelClass} max-h-80 overflow-y-auto`}>
                {categorizedProcedures.map((category) => (
                  <div key={category.category}>
                    {/* Category Header (skip for 'all') */}
                    {category.category !== 'all' && (
                      <div className="sticky top-0 z-10 bg-[#143d30] px-4 py-2 border-b border-[#e1c28e]/16">
                        <span className="text-[#d0a36b] text-xs font-bold uppercase tracking-wider">
                          {category.label}
                        </span>
                      </div>
                    )}
                    {/* Category Items */}
                    {category.items.map((p) => (
                      <button
                        key={p.value || 'all'}
                        onClick={() => {
                          setProcedure(p.value);
                          setShowProcedureDropdown(false);
                        }}
                        className={`${dropdownItemClass}
                                  ${dropdownItemStateClass(procedure === p.value)}
                                  ${category.category !== 'all' ? 'pl-6' : ''}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-row lg:gap-0">

            {/* Country Dropdown */}
            <div className="relative min-w-[160px]" ref={countryRef}>
              <button
                onClick={() => {
                  setShowCountryDropdown(!showCountryDropdown);
                  setShowProcedureDropdown(false);
                  setShowPriceDropdown(false);
                }}
                className={`${filterButtonClass} rounded-xl lg:rounded-none`}
              >
                <span className={country ? 'text-white' : 'text-[#e7e1d7]/78'}>
                  {getCountryLabel()}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCountryDropdown && (
                <div className={`${dropdownPanelClass} max-h-60 overflow-y-auto`}>
                  {countryDropdownOptions.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        setCountry(c.value);
                        setShowCountryDropdown(false);
                      }}
                      className={`${dropdownItemClass} ${dropdownItemStateClass(country === c.value)}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range Dropdown */}
            <div className="relative min-w-[160px]" ref={priceRef}>
              <button
                onClick={() => {
                  setShowPriceDropdown(!showPriceDropdown);
                  setShowProcedureDropdown(false);
                  setShowCountryDropdown(false);
                }}
                className={`${filterButtonClass} rounded-xl lg:rounded-l-none lg:rounded-r-xl`}
              >
                <span className={priceRange ? 'text-white' : 'text-[#e7e1d7]/78'}>
                  {getPriceLabel()}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showPriceDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showPriceDropdown && (
                <div className={dropdownPanelClass}>
                  {priceDropdownOptions.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setPriceRange(p.value);
                        setShowPriceDropdown(false);
                      }}
                      className={`${dropdownItemClass} ${dropdownItemStateClass(priceRange === p.value)}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="group relative overflow-hidden rounded-xl border border-[#f4d8a4]/45 bg-gradient-to-b from-[#c79a62] to-[#8b5e3c] px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_28px_rgba(208,163,107,0.52),inset_0_1px_0_rgba(255,255,255,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_46px_rgba(208,163,107,0.72),inset_0_1px_0_rgba(255,255,255,0.30)] active:translate-y-0 lg:ml-3 lg:px-9"
            >
              <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
              <span className="relative flex items-center justify-center gap-3 whitespace-nowrap">
                <Search size={16} />
                {t('searchCasesButton')}
              </span>
            </button>
          </div>
        </div>

        <div className="relative z-0 mt-5 hidden border-t border-[#d0a36b]/6 pt-4 text-[#f0ebe2]/90 md:grid md:grid-cols-3">
          <div className="flex items-center justify-center gap-3 text-xs">
            <ShieldCheck size={17} className="text-[#d0a36b]" strokeWidth={1.5} />
            <span>{t('trustVerifiedDoctors')}</span>
          </div>
          <div className="flex items-center justify-center gap-3 border-x border-[#d0a36b]/8 text-xs">
            <BadgeCheck size={17} className="text-[#d0a36b]" strokeWidth={1.5} />
            <span>{t('trustRealResults')}</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-xs">
            <LockKeyhole size={16} className="text-[#d0a36b]" strokeWidth={1.5} />
            <span>{t('trustPrivateSecure')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
