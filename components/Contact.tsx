import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Contact: React.FC = () => {
  const { t } = useTranslation();

  // Enable scroll reveal animations
  useScrollReveal(true);

  return (
    <section id="contact" className="relative py-24 bg-forest-gradient text-white">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
           }}>
      </div>
      
      {/* Gradient overlay to ensure text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f201b]/90 to-[#1e3a34]/90 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-7xl mb-6 tracking-wide text-white scroll-reveal">{t('contactTitle')}</h2>
          <div className="text-lg md:text-xl font-light text-sage-100 space-y-2 font-sans">
            <p>{t('contactAddress1')}</p>
            <p>{t('contactAddress2')}</p>
            <p className="pt-2 font-semibold text-white">{t('contactPhone')}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto scroll-reveal">
          <p className="text-xs text-sage-300 mb-2 font-sans">{t('contactRequired')}</p>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder={t('contactFirstName')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
              <input required type="text" placeholder={t('contactLastName')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="email" placeholder={t('contactEmail')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
              <input required type="tel" placeholder={t('contactPhoneField')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder={t('contactZipCode')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
              <div className="relative">
                <select required className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 appearance-none rounded-none cursor-pointer placeholder-sage-300">
                  <option value="" disabled selected className="text-navy-900">{t('contactProcedureInterest')}</option>
                  <option value="face" className="text-navy-900">{t('contactFacialContouring')}</option>
                  <option value="breast" className="text-navy-900">{t('contactBreastSurgery')}</option>
                  <option value="body" className="text-navy-900">{t('contactBodyContouring')}</option>
                  <option value="nonsurgical" className="text-navy-900">{t('contactNonSurgical')}</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 pointer-events-none" size={20} />
              </div>
            </div>

            <div className="relative">
                <select className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 appearance-none rounded-none cursor-pointer">
                  <option value="" disabled selected className="text-navy-900">{t('contactPreferredProvider')}</option>
                  <option value="dr-zhang" className="text-navy-900">Dr. Zhang Yimei</option>
                  <option value="dr-chen" className="text-navy-900">Dr. Michael Chen</option>
                  <option value="any" className="text-navy-900">{t('contactFirstAvailable')}</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 pointer-events-none" size={20} />
            </div>

            <textarea
              rows={6}
              placeholder={t('contactHowCanWeHelp')}
              className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all resize-none placeholder-sage-300"
            ></textarea>

            <div className="pt-8 text-center">
              <button type="submit" className="bg-gold-500 text-white px-12 py-4 uppercase tracking-[0.2em] text-sm font-bold hover:bg-gold-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-gold-500/20">
                {t('contactSubmit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;