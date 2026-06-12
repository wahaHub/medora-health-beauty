import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, Mail } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import procedureNames from '@/i18n/procedureNames.json';
import { getSupportedProcedureOptions } from '@/data/procedureTaxonomy';

type ProcedureNameTranslations = Record<string, Partial<Record<string, string>>>;

const translatedProcedureNames = procedureNames as ProcedureNameTranslations;

const supportedProcedures = getSupportedProcedureOptions().map((procedure) => procedure.label);

const supportedProceduresTitle: Record<string, string> = {
  en: 'Supported Procedures',
  zh: '支持项目',
  es: 'Procedimientos Disponibles',
  fr: 'Procédures Prises en Charge',
  de: 'Unterstützte Eingriffe',
  ru: 'Доступные процедуры',
  ar: 'الإجراءات المدعومة',
  vi: 'Thủ Thuật Hỗ Trợ',
  id: 'Prosedur yang Didukung',
};

const supportedProceduresCountLabel: Record<string, string> = {
  en: 'available',
  zh: '个项目',
  es: 'disponibles',
  fr: 'disponibles',
  de: 'verfügbar',
  ru: 'доступно',
  ar: 'متاحة',
  vi: 'có sẵn',
  id: 'tersedia',
};

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const translateProcedureLabel = (label: string) =>
    translatedProcedureNames[label]?.[currentLanguage] || translatedProcedureNames[label]?.en || label;
  const supportedTitle = supportedProceduresTitle[currentLanguage] || supportedProceduresTitle.en;
  const supportedCountLabel = supportedProceduresCountLabel[currentLanguage] || supportedProceduresCountLabel.en;

  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-stone-100 pt-16 pb-8 border-t border-stone-200">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] mb-12">

          {/* Brand */}
          <div>
            <div className="mb-6">
              <img
                src="/brand/medora-beauty-wordmark.png"
                alt="Medora Beauty"
                className="h-auto w-64 max-w-full object-contain mix-blend-multiply"
              />
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              {t('footerDescription')}
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/china_hair_transplant_guide/" target="_blank" rel="noopener noreferrer" className="text-navy-900 hover:text-gold-500 transition-colors"><Instagram size={20} /></a>
              <a href="https://www.facebook.com/profile.php?id=61590498216426&locale=zh_CN" target="_blank" rel="noopener noreferrer" className="text-navy-900 hover:text-gold-500 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-navy-900 hover:text-gold-500 transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif text-navy-900 text-lg mb-6">{t('footerQuickLinks')}</h4>
            <ul className="space-y-3 text-sm text-stone-500">
              <li><Link to="/team" onClick={handleLinkClick} className="hover:text-gold-600 transition-colors">{t('footerAboutUs')}</Link></li>
              <li><Link to="/surgeons" onClick={handleLinkClick} className="hover:text-gold-600 transition-colors">{t('footerOurTeam')}</Link></li>
              <li><Link to="/gallery" onClick={handleLinkClick} className="hover:text-gold-600 transition-colors">{t('footerProcedures')}</Link></li>
              <li><Link to="/reviews" onClick={handleLinkClick} className="hover:text-gold-600 transition-colors">{t('footerReviews')}</Link></li>
              <li><Link to="/travel" onClick={handleLinkClick} className="hover:text-gold-600 transition-colors">{t('footerTravel')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-navy-900 text-lg mb-6">{t('footerContactInfo')}</h4>
            <ul className="space-y-4 text-sm text-stone-500">
              <li className="flex items-center gap-3">
                <Phone className="text-gold-500 shrink-0" size={18} />
                <span>(201) 406-6514</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-gold-500 shrink-0" size={18} />
                <span>contact@medorabeauty.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Supported Procedures */}
        <div className="mb-12 border-t border-stone-200 pt-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h4 className="font-serif text-navy-900 text-lg">{supportedTitle}</h4>
            <span className="text-xs uppercase tracking-[0.18em] text-stone-400">
              {supportedProcedures.length} {supportedCountLabel}
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-2 text-[13px] leading-snug text-stone-500 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {supportedProcedures.map((procedure) => (
              <li key={procedure} className="min-w-0">
                <Link
                  to={`/procedure/${encodeURIComponent(procedure)}`}
                  onClick={handleLinkClick}
                  className="text-left transition-colors hover:text-gold-600"
                  title={translateProcedureLabel(procedure)}
                >
                  {translateProcedureLabel(procedure)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-stone-200 pt-8 text-center text-xs text-stone-400">
          <p>&copy; {new Date().getFullYear()} Medora Beauty. {t('footerAllRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
