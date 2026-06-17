import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Phone, Mail, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useConsultation } from '@/contexts/ConsultationContext';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import {
  getPublicProcedureOptionByLookup,
  getPublicProcedureGroupLabel,
  getPublicProcedureLabel,
  publicProcedureGroups,
} from '@/data/publicDiscoveryFilters';
import { submitPublicConsultationForm } from '@/services/publicConsultationOnboarding';

const resolvePreselectedProcedureId = (preselectedProcedure: string) => {
  return getPublicProcedureOptionByLookup(preselectedProcedure)?.procedure.id ?? '';
};

const ConsultationModal: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isOpen, closeConsultation, preselectedProcedure } = useConsultation();
  const { bootstrapSession } = usePatientAuth();
  const { applyOnboardingResult } = usePatientEntry();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryOfOrigin: '',
    procedureId: '',
    message: ''
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        procedureId: resolvePreselectedProcedureId(preselectedProcedure),
      }));
      setIsSubmitted(false);
      setSubmitError(null);
    }
  }, [isOpen, preselectedProcedure]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitPublicConsultationForm({
        formData,
        preferredLanguage: currentLanguage || 'en',
        source: 'consultation_modal',
        bootstrapSession,
        applyOnboardingResult,
      });

      setIsSubmitted(true);

      // Close modal after showing success message
      setTimeout(() => {
        closeConsultation();
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          countryOfOrigin: '',
          procedureId: '',
          message: ''
        });
      }, 2000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeConsultation();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeConsultation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeConsultation}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 bg-gradient-to-br from-[#1a2f28] to-[#0f201b] rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={closeConsultation}
          className="absolute top-4 right-4 z-10 p-2 text-white/60 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Success State */}
        {isSubmitted ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check size={40} className="text-green-400" />
            </div>
            <h3 className="font-serif text-3xl text-white mb-4">{t('consultationThankYou') || 'Thank You!'}</h3>
            <p className="text-sage-200">{t('consultationSuccess') || 'We have received your consultation request and will contact you shortly.'}</p>
          </div>
        ) : (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
                {t('scheduleConsultation') || 'Schedule Your Consultation'}
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sage-200 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gold-500" />
                  <span>(201) 406-6514</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gold-500" />
                  <span>contact@medorabeauty.com</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-sage-300 mb-2">{t('contactRequired')}</p>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder={t('contactFirstName')}
                  className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300"
                />
                <input
                  required
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder={t('contactLastName')}
                  className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300"
                />
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('contactEmail')}
                  className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300"
                />
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('contactPhoneField')}
                  className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300"
                />
              </div>

              {/* Country & Procedure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  name="countryOfOrigin"
                  value={formData.countryOfOrigin}
                  onChange={handleInputChange}
                  placeholder={t('contactCountryOfOrigin') || 'Country of Origin*'}
                  className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300"
                />

                {/* Procedure Dropdown */}
                <div className="relative">
                  <select
                    required
                    name="procedureId"
                    value={formData.procedureId}
                    onChange={handleInputChange}
                    aria-label={t('contactProcedureInterest')}
                    className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white/10 appearance-none cursor-pointer"
                  >
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

              {/* Message */}
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                placeholder={t('contactHowCanWeHelp')}
                className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white/10 transition-all resize-none placeholder-sage-300"
              />

              {submitError && (
                <p className="text-center text-sm text-red-300">{submitError}</p>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold-500 text-white py-4 uppercase tracking-[0.2em] text-sm font-bold hover:bg-gold-600 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-gold-500/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('submitting') || 'Submitting...'}
                    </>
                  ) : (
                    t('contactSubmit')
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationModal;
