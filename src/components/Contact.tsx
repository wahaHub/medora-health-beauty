import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import {
  getPublicProcedureGroupLabel,
  getPublicProcedureLabel,
  publicProcedureGroups,
} from '@/data/publicDiscoveryFilters';
import { submitPublicConsultationForm } from '@/services/publicConsultationOnboarding';

type ContactFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryOfOrigin: string;
  procedureId: string;
  message: string;
};

const emptyContactForm: ContactFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  countryOfOrigin: '',
  procedureId: '',
  message: '',
};

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { bootstrapSession } = usePatientAuth();
  const { applyOnboardingResult } = usePatientEntry();
  const [formData, setFormData] = useState<ContactFormData>(emptyContactForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Enable scroll reveal animations
  useScrollReveal(true);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitPublicConsultationForm({
        formData,
        preferredLanguage: currentLanguage || 'en',
        source: 'homepage_contact',
        bootstrapSession,
        applyOnboardingResult,
      });

      setIsSubmitted(true);
      setFormData(emptyContactForm);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <p className="font-semibold text-white">{t('contactPhone')}</p>
            <p>{t('contactEmailDisplay')}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto scroll-reveal">
          <p className="text-xs text-sage-300 mb-2 font-sans">{t('contactRequired')}</p>
          {isSubmitted && (
            <div className="mb-6 border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-center text-sage-50">
              <p className="font-serif text-2xl text-white">{t('consultationThankYou') || 'Thank you!'}</p>
              <p className="mt-1 text-sm text-sage-100">
                {t('consultationSuccess') || 'We have received your consultation request and will contact you shortly.'}
              </p>
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={t('contactFirstName')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
              <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder={t('contactLastName')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('contactEmail')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
              <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder={t('contactPhoneField')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleInputChange} placeholder={t('contactCountryOfOrigin') || 'Country of Origin*'} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300" />

              <div className="relative">
                <select required name="procedureId" value={formData.procedureId} onChange={handleInputChange} aria-label={t('contactProcedureInterest')} className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 appearance-none rounded-none cursor-pointer">
                  <option value="" disabled className="text-navy-900">{t('contactProcedureInterest')}</option>
                  {publicProcedureGroups.map((group) => (
                    <optgroup key={group.category} label={getPublicProcedureGroupLabel(group, currentLanguage)} className="text-navy-900 font-semibold">
                      {group.procedures.map((procedure) => (
                        <option key={procedure.id} value={procedure.id} className="text-navy-900">
                          {getPublicProcedureLabel(procedure, currentLanguage)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 pointer-events-none" size={20} />
              </div>
            </div>

            <textarea
              rows={6}
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder={t('contactHowCanWeHelp')}
              className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white/10 transition-all resize-none placeholder-sage-300"
            ></textarea>

            {submitError && (
              <p className="text-center text-sm text-red-300">{submitError}</p>
            )}

            <div className="pt-8 text-center">
              <button type="submit" disabled={isSubmitting} className="bg-gold-500 text-white px-12 py-4 uppercase tracking-[0.2em] text-sm font-bold hover:bg-gold-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-gold-500/20 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? (t('submitting') || 'Submitting...') : t('contactSubmit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
