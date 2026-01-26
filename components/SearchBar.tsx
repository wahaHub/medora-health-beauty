import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import procedureNames from '../i18n/procedureNames.json';

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
      category: 'all',
      label: t('allProcedures'),
      items: [{ value: '', label: t('allProcedures') }]
    },
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
    { value: 'korea', label: t('countryKorea') },
    { value: 'thailand', label: t('countryThailand') },
    { value: 'turkey', label: t('countryTurkey') },
    { value: 'brazil', label: t('countryBrazil') },
    { value: 'mexico', label: t('countryMexico') },
    { value: 'colombia', label: t('countryColombia') },
    { value: 'usa', label: t('countryUSA') },
    { value: 'germany', label: t('countryGermany') },
    { value: 'spain', label: t('countrySpain') },
    { value: 'italy', label: t('countryItaly') },
    { value: 'poland', label: t('countryPoland') },
    { value: 'uk', label: t('countryUK') },
    { value: 'uae', label: t('countryUAE') },
    { value: 'india', label: t('countryIndia') },
    { value: 'japan', label: t('countryJapan') },
    { value: 'china', label: t('countryChina') },
  ];

  const priceRanges = [
    { value: '', label: t('allPrices') },
    { value: 'under5k', label: t('priceUnder5k') },
    { value: '5k-10k', label: t('price5kTo10k') },
    { value: '10k-20k', label: t('price10kTo20k') },
    { value: 'over20k', label: t('priceOver20k') },
  ];

  const handleSearch = () => {
    if (onSearch) {
      onSearch(procedure, country, priceRange);
    }
    // Navigate to search results page with procedure query
    const searchParams = new URLSearchParams();
    if (procedure) {
      searchParams.set('procedure', procedure);
    }
    navigate(`/search?${searchParams.toString()}`);
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

  return (
    <div className="w-full max-w-4xl mx-auto relative z-50">
      {/* Main Search Container - Glass morphism effect */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/20">
        <div className="flex flex-col lg:flex-row gap-2">

          {/* Procedure Dropdown */}
          <div className="flex-1 relative" ref={procedureRef}>
            <button
              onClick={() => {
                setShowProcedureDropdown(!showProcedureDropdown);
                setShowCountryDropdown(false);
                setShowPriceDropdown(false);
              }}
              className="w-full bg-white/10 text-white rounded-xl py-4 px-4
                         border border-white/10 hover:border-white/30 focus:outline-none
                         transition-all flex items-center justify-between gap-2 text-sm"
            >
              <div className="flex items-center gap-3">
                <Search size={20} className="text-white/60" />
                <span className={procedure ? 'text-white' : 'text-white/60'}>
                  {getProcedureLabel()}
                </span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${showProcedureDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showProcedureDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a2f28]/95 backdrop-blur-lg rounded-xl
                             border border-white/20 shadow-2xl z-[100] overflow-hidden max-h-80 overflow-y-auto">
                {categorizedProcedures.map((category, categoryIndex) => (
                  <div key={category.category}>
                    {/* Category Header (skip for 'all') */}
                    {category.category !== 'all' && (
                      <div className="sticky top-0 bg-[#0f201b] px-4 py-2 border-b border-white/10">
                        <span className="text-gold-400 text-xs font-bold uppercase tracking-wider">
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
                        className={`w-full text-left px-4 py-3 text-sm transition-colors
                                  ${procedure === p.value
                                    ? 'bg-gold-500/20 text-gold-400'
                                    : 'text-white/80 hover:bg-white/10'}
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
          <div className="flex flex-col sm:flex-row gap-2 lg:flex-row">

            {/* Country Dropdown */}
            <div className="relative min-w-[160px]" ref={countryRef}>
              <button
                onClick={() => {
                  setShowCountryDropdown(!showCountryDropdown);
                  setShowProcedureDropdown(false);
                  setShowPriceDropdown(false);
                }}
                className="w-full bg-white/10 text-white rounded-xl py-4 px-4
                           border border-white/10 hover:border-white/30 focus:outline-none
                           transition-all flex items-center justify-between gap-2 text-sm"
              >
                <span className={country ? 'text-white' : 'text-white/60'}>
                  {getCountryLabel()}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCountryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a2f28]/95 backdrop-blur-lg rounded-xl
                               border border-white/20 shadow-2xl z-[100] overflow-hidden max-h-60 overflow-y-auto">
                  {countries.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        setCountry(c.value);
                        setShowCountryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors
                                ${country === c.value
                                  ? 'bg-gold-500/20 text-gold-400'
                                  : 'text-white/80 hover:bg-white/10'}`}
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
                className="w-full bg-white/10 text-white rounded-xl py-4 px-4
                           border border-white/10 hover:border-white/30 focus:outline-none
                           transition-all flex items-center justify-between gap-2 text-sm"
              >
                <span className={priceRange ? 'text-white' : 'text-white/60'}>
                  {getPriceLabel()}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showPriceDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showPriceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a2f28]/95 backdrop-blur-lg rounded-xl
                               border border-white/20 shadow-2xl z-[100] overflow-hidden">
                  {priceRanges.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setPriceRange(p.value);
                        setShowPriceDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors
                                ${priceRange === p.value
                                  ? 'bg-gold-500/20 text-gold-400'
                                  : 'text-white/80 hover:bg-white/10'}`}
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
              className="bg-[#8b5e3c] hover:bg-[#6d4a2f] text-white px-8 py-4 rounded-xl
                         uppercase tracking-[0.15em] text-xs font-bold transition-all hover:scale-105
                         shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Search size={16} />
              {t('searchButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
