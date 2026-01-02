import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, type LanguageCode } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  isTransparent?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isTransparent = false }) => {
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLanguageChange = (langCode: LanguageCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  const textColor = isTransparent ? 'text-white' : 'text-stone-600';
  const hoverBgColor = isTransparent ? 'hover:bg-white/10' : 'hover:bg-stone-100';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${textColor} ${hoverBgColor}`}
        aria-label="Select Language"
      >
        <Globe size={18} />
        <span className="text-lg">{languages[currentLanguage].flag}</span>
        <span className="text-sm font-medium uppercase tracking-wider">
          {languages[currentLanguage].code}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-stone-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-stone-200">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Select Language
            </p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {Object.values(languages).map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as LanguageCode)}
                className={`w-full text-left px-4 py-2.5 hover:bg-gold-50 transition-colors flex items-center justify-between ${
                  currentLanguage === lang.code
                    ? 'bg-gold-50 text-gold-700 font-semibold'
                    : 'text-stone-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </div>
                {currentLanguage === lang.code && (
                  <svg
                    className="w-4 h-4 text-gold-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

