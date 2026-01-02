import { useLanguage } from '../contexts/LanguageContext';
import { translations, type TranslationKey } from '../i18n/translations';

export function useTranslation() {
  const { currentLanguage } = useLanguage();

  const t = (key: TranslationKey): string => {
    return translations[currentLanguage][key] || translations.en[key] || key;
  };

  return { t };
}

