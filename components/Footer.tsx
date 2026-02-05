import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, Mail } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-stone-100 pt-16 pb-8 border-t border-stone-200">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div>
            <div className="mb-6 flex items-baseline gap-2 leading-none">
              <span className="font-serif text-2xl tracking-widest font-bold text-navy-900">
                MEDORA HEALTH
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-gold-500 font-medium">
                : BEAUTY
              </span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-6">
              {t('footerDescription')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-navy-900 hover:text-gold-500 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-navy-900 hover:text-gold-500 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-navy-900 hover:text-gold-500 transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif text-navy-900 text-lg mb-6">{t('footerQuickLinks')}</h4>
            <ul className="space-y-3 text-sm text-stone-500">
              <li><button onClick={() => handleNavigate('/team')} className="hover:text-gold-600 transition-colors">{t('footerAboutUs')}</button></li>
              <li><button onClick={() => handleNavigate('/surgeons')} className="hover:text-gold-600 transition-colors">{t('footerOurTeam')}</button></li>
              <li><button onClick={() => handleNavigate('/gallery')} className="hover:text-gold-600 transition-colors">{t('footerProcedures')}</button></li>
              <li><button onClick={() => handleNavigate('/reviews')} className="hover:text-gold-600 transition-colors">{t('footerReviews')}</button></li>
              <li><button onClick={() => handleNavigate('/travel')} className="hover:text-gold-600 transition-colors">{t('footerTravel')}</button></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-navy-900 text-lg mb-6">{t('footerPopularProcedures')}</h4>
            <ul className="space-y-3 text-sm text-stone-500">
              <li><button onClick={() => handleNavigate('/procedure/Rhinoplasty')} className="hover:text-gold-600 transition-colors">{t('footerRhinoplasty')}</button></li>
              <li><button onClick={() => handleNavigate('/procedure/Facelift')} className="hover:text-gold-600 transition-colors">{t('footerFacelift')}</button></li>
              <li><button onClick={() => handleNavigate('/procedure/Eyelid%20Surgery')} className="hover:text-gold-600 transition-colors">{t('footerEyelidSurgery')}</button></li>
              <li><button onClick={() => handleNavigate('/procedure/Liposuction')} className="hover:text-gold-600 transition-colors">{t('footerLiposuction')}</button></li>
              <li><button onClick={() => handleNavigate('/procedure/Brazilian%20Butt%20Lift')} className="hover:text-gold-600 transition-colors">{t('footerBBL')}</button></li>
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
                <span>contact@medicaltourismchina.health</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-8 text-center text-xs text-stone-400">
          <p>&copy; {new Date().getFullYear()} Medora Health : Beauty. {t('footerAllRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
