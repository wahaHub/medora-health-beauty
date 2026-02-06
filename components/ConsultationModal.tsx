import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronDown, Phone, Mail, Check } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { useConsultation } from '../contexts/ConsultationContext';
import { useSurgeonsList } from '../hooks/useData';
import procedureNames from '../i18n/procedureNames.json';

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
}

const ConsultationModal: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isOpen, closeConsultation, preselectedProcedure, preselectedSurgeon } = useConsultation();

  // Fetch surgeons using React Query hook
  const { data: surgeonsData, isLoading: loadingSurgeons } = useSurgeonsList({ enabled: isOpen });

  // Use the already-unique, already-sorted surgeons list from the query.
  // Also, avoid any work when modal is closed.
  const surgeons = useMemo(() => {
    if (!isOpen) return [];
    return (surgeonsData?.surgeons || []) as Surgeon[];
  }, [isOpen, surgeonsData]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zipCode: '',
    procedure: '',
    provider: '',
    message: ''
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        procedure: preselectedProcedure,
        provider: preselectedSurgeon
      }));
      setIsSubmitted(false);
    }
  }, [isOpen, preselectedProcedure, preselectedSurgeon]);

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
    'Brow Lift', 'Eyelid Surgery', 'Facelift', 'Midface Lift', 'Mini Facelift',
    'Neck Lift', 'Deep Neck Contouring', 'Otoplasty', 'Rhinoplasty',
    'Revision Rhinoplasty', 'Cheek Augmentation', 'Chin Augmentation',
    'Jawline Contouring', 'Facial Implants', 'Buccal Fat Removal',
    'Fat Transfer', 'Lip Augmentation', 'Lip Lift'
  ];

  const bodyProcedures = [
    'Liposuction', 'Tummy Tuck', 'Mommy Makeover', 'Arm Lift', 'Thigh Lift',
    'Brazilian Butt Lift', 'Buttock Lift', 'Labiaplasty'
  ];

  const breastProcedures = [
    'Breast Augmentation', 'Breast Lift', 'Breast Reduction',
    'Gynecomastia Surgery'
  ];

  const nonSurgicalProcedures = [
    'BOTOX® Cosmetic', 'Dermal Fillers', 'Lip Filler',
    'Chemical Peels', 'Laser Skin Resurfacing', 'Microneedling',
    'Hair Restoration'
  ];

  const allProcedureCategories = [
    { label: t('categoryFace'), procedures: faceProcedures },
    { label: t('categoryBody'), procedures: bodyProcedures },
    { label: t('categoryBreast') || 'Breast', procedures: breastProcedures },
    { label: t('categoryNonSurgical'), procedures: nonSurgicalProcedures },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Close modal after showing success message
    setTimeout(() => {
      closeConsultation();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        zipCode: '',
        procedure: '',
        provider: '',
        message: ''
      });
    }, 2000);
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
                  <span>contact@medicaltourismchina.health</span>
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

              {/* Zip & Procedure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder={t('contactZipCode')}
                  className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white/10 transition-all placeholder-sage-300"
                />

                {/* Procedure Dropdown */}
                <div className="relative">
                  <select
                    required
                    name="procedure"
                    value={formData.procedure}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white/10 appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-navy-900">{t('contactProcedureInterest')}</option>
                    {allProcedureCategories.map((category) => (
                      <optgroup key={category.label} label={category.label} className="text-navy-900 font-semibold">
                        {category.procedures
                          .filter(name => typedProcedureNames[name])
                          .map((procedureName) => (
                            <option key={procedureName} value={procedureName} className="text-navy-900">
                              {getTranslatedProcedure(procedureName)}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 pointer-events-none" size={20} />
                </div>
              </div>

              {/* Provider Dropdown */}
              <div className="relative">
                <select
                  name="provider"
                  value={formData.provider}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 backdrop-blur-sm text-white border border-white/10 p-4 rounded-lg outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white/10 appearance-none cursor-pointer"
                >
                  <option value="" disabled className="text-navy-900">{t('contactPreferredProvider')}</option>
                  <option value="any" className="text-navy-900">{t('contactFirstAvailable')}</option>
                  {!loadingSurgeons && surgeons.map((surgeon) => (
                    <option key={surgeon.surgeon_id} value={surgeon.surgeon_id} className="text-navy-900">
                      {surgeon.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 pointer-events-none" size={20} />
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
