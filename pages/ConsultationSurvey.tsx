import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, X, Heart, Sparkles,
  Smile, Scissors, Syringe, Clock, DollarSign,
  ShieldCheck, User, Mail, Phone, Globe, MessageSquare
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import procedureNamesData from '../i18n/procedureNames.json';

// ─── Types ──────────────────────────────────────────────────────────────────────

type ProcedureNameTranslations = {
  [key: string]: { [lang: string]: string };
};

const typedProcedureNames = procedureNamesData as ProcedureNameTranslations;

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface SurveyStep {
  id: string;
  question: string;
  subtitle?: string;
  type: 'single' | 'multi' | 'form';
  options?: Option[];
}

interface Answers {
  [key: string]: string | string[];
}

// ─── Procedure Data (English keys — labels translated at render) ─────────────

const PROCEDURE_KEYS: Record<string, string[]> = {
  face: [
    'Rhinoplasty', 'Facelift', 'Eyelid Surgery', 'Brow Lift',
    'Neck Lift', 'Chin Augmentation', 'Mini Facelift', 'Lip Lift',
    'Otoplasty', 'Fat Transfer',
  ],
  body: [
    'Liposuction', 'Tummy Tuck', 'Brazilian Butt Lift',
    'Mommy Makeover', 'Arm Lift', 'Thigh Lift', 'Labiaplasty',
  ],
  breast: [
    'Breast Augmentation', 'Breast Lift', 'Breast Reduction',
    'Gynecomastia Surgery',
  ],
  'non-surgical': [
    'BOTOX® Cosmetic', 'Dermal Fillers', 'Lip Filler',
    'Chemical Peels', 'Laser Skin Resurfacing', 'Microneedling',
    'Hair Restoration',
  ],
};

// ─── Component ──────────────────────────────────────────────────────────────────

const ConsultationSurvey: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hospitalSlug = searchParams.get('hospital');
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [animKey, setAnimKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Contact form
  const [contact, setContact] = useState({
    name: '', email: '', phone: '', country: '', message: ''
  });

  // ─── Procedure name translation helper ──────────────────────────────────────

  const tp = useCallback((englishName: string): string => {
    const entry = typedProcedureNames[englishName];
    if (entry && entry[currentLanguage]) {
      return entry[currentLanguage];
    }
    return englishName;
  }, [currentLanguage]);

  // ─── Dynamic Steps ──────────────────────────────────────────────────────────

  const steps: SurveyStep[] = useMemo(() => {
    const selectedArea = answers.area as string;
    const procedureKeys = selectedArea ? (PROCEDURE_KEYS[selectedArea] || []) : [];
    const procedureOptions: Option[] = procedureKeys.map(key => ({
      value: key,
      label: tp(key),
    }));

    return [
      {
        id: 'area',
        question: t('surveyAreaQuestion'),
        subtitle: t('surveyAreaSubtitle'),
        type: 'single',
        options: [
          { value: 'face', label: t('surveyAreaFace'), description: t('surveyAreaFaceDesc') },
          { value: 'body', label: t('surveyAreaBody'), description: t('surveyAreaBodyDesc') },
          { value: 'breast', label: t('surveyAreaBreast'), description: t('surveyAreaBreastDesc') },
          { value: 'non-surgical', label: t('surveyAreaNonSurgical'), description: t('surveyAreaNonSurgicalDesc') },
        ],
      },
      {
        id: 'procedure',
        question: t('surveyProcedureQuestion'),
        subtitle: t('surveyProcedureSubtitle'),
        type: 'single',
        options: procedureOptions,
      },
      {
        id: 'experience',
        question: t('surveyExperienceQuestion'),
        subtitle: t('surveyExperienceSubtitle'),
        type: 'single',
        options: [
          { value: 'first-time', label: t('surveyExpFirstTime'), description: t('surveyExpFirstTimeDesc') },
          { value: 'revision', label: t('surveyExpRevision'), description: t('surveyExpRevisionDesc') },
          { value: 'exploring', label: t('surveyExpExploring'), description: t('surveyExpExploringDesc') },
        ],
      },
      {
        id: 'timeline',
        question: t('surveyTimelineQuestion'),
        subtitle: t('surveyTimelineSubtitle'),
        type: 'single',
        options: [
          { value: 'asap', label: t('surveyTimeAsap'), description: t('surveyTimeAsapDesc') },
          { value: '1-3months', label: t('surveyTime1to3'), description: t('surveyTime1to3Desc') },
          { value: '3-6months', label: t('surveyTime3to6'), description: t('surveyTime3to6Desc') },
          { value: 'exploring', label: t('surveyTimeExploring'), description: t('surveyTimeExploringDesc') },
        ],
      },
      {
        id: 'budget',
        question: t('surveyBudgetQuestion'),
        subtitle: t('surveyBudgetSubtitle'),
        type: 'single',
        options: [
          { value: 'under-3k', label: t('surveyBudgetUnder3k') },
          { value: '3k-6k', label: t('surveyBudget3to6k') },
          { value: '6k-10k', label: t('surveyBudget6to10k') },
          { value: 'over-10k', label: t('surveyBudgetOver10k') },
        ],
      },
      {
        id: 'conditions',
        question: t('surveyConditionsQuestion'),
        subtitle: t('surveyConditionsSubtitle'),
        type: 'multi',
        options: [
          { value: 'none', label: t('surveyCondNone') },
          { value: 'heart', label: t('surveyCondHeart') },
          { value: 'diabetes', label: t('surveyCondDiabetes') },
          { value: 'blood', label: t('surveyCondBlood') },
          { value: 'allergies', label: t('surveyCondAllergies') },
          { value: 'other', label: t('surveyCondOther') },
        ],
      },
      {
        id: 'contact',
        question: t('surveyContactQuestion'),
        subtitle: t('surveyContactSubtitle'),
        type: 'form',
      },
    ];
  }, [answers.area, t, tp]);

  const totalSteps = steps.length;
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const selectSingle = useCallback((stepId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [stepId]: value }));
  }, []);

  const toggleMulti = useCallback((stepId: string, value: string) => {
    setAnswers(prev => {
      const current = (prev[stepId] as string[]) || [];
      if (value === 'none') {
        return { ...prev, [stepId]: ['none'] };
      }
      const withoutNone = current.filter(v => v !== 'none');
      if (withoutNone.includes(value)) {
        return { ...prev, [stepId]: withoutNone.filter(v => v !== value) };
      }
      return { ...prev, [stepId]: [...withoutNone, value] };
    });
  }, []);

  const canProceed = useMemo(() => {
    if (!step) return false;
    if (step.type === 'form') {
      return contact.name.trim() !== '' && contact.email.trim() !== '' && contact.phone.trim() !== '';
    }
    if (step.type === 'multi') {
      const val = answers[step.id] as string[] | undefined;
      return val && val.length > 0;
    }
    return !!answers[step.id];
  }, [step, answers, contact]);

  const goForward = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setDirection('forward');
      setAnimKey(k => k + 1);
      setCurrentStep(s => s + 1);
    }
  }, [currentStep, totalSteps]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection('backward');
      setAnimKey(k => k + 1);
      setCurrentStep(s => s - 1);
    }
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (!canProceed) return;
    if (step.type === 'form') {
      handleSubmit();
      return;
    }
    goForward();
  }, [canProceed, step, goForward]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    setIsSubmitting(false);
    setIsComplete(true);
  };

  const handleSingleSelect = useCallback((stepId: string, value: string) => {
    selectSingle(stepId, value);
    setTimeout(() => {
      setDirection('forward');
      setAnimKey(k => k + 1);
      setCurrentStep(s => Math.min(s + 1, totalSteps - 1));
    }, 350);
  }, [selectSingle, totalSteps]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate]);

  // ─── Icons ──────────────────────────────────────────────────────────────────

  const areaIcons: Record<string, React.ReactNode> = {
    face: <Smile size={28} />,
    body: <Sparkles size={28} />,
    breast: <Heart size={28} />,
    'non-surgical': <Syringe size={28} />,
  };

  const stepIcons: Record<string, React.ReactNode> = {
    area: <Scissors size={20} />,
    procedure: <Sparkles size={20} />,
    experience: <User size={20} />,
    timeline: <Clock size={20} />,
    budget: <DollarSign size={20} />,
    conditions: <ShieldCheck size={20} />,
    contact: <Mail size={20} />,
  };

  // ─── Completion screen ──────────────────────────────────────────────────────

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-sage-50 flex items-center justify-center px-6">
        <style>{`
          @keyframes scaleIn {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes fadeInUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
        <div className="text-center max-w-lg">
          <div
            className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30"
            style={{ animation: 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            <Check size={56} className="text-white" strokeWidth={3} />
          </div>

          <h2
            className="font-serif text-4xl md:text-5xl text-navy-900 mb-4"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
          >
            {t('surveyThankYou')}
          </h2>
          <p
            className="text-stone-500 text-lg mb-3 font-light"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.45s both' }}
          >
            {t('surveyThankYouDesc')}
          </p>
          <p
            className="text-stone-400 text-sm mb-10"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.55s both' }}
          >
            {t('surveyThankYouNote')}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.65s both' }}
          >
            {hospitalSlug && (
              <button
                onClick={() => navigate(`/hospital/${hospitalSlug}`)}
                className="px-8 py-3.5 bg-navy-900 text-white uppercase tracking-[0.15em] text-sm font-bold hover:bg-navy-800 transition-colors"
              >
                {t('surveyReturnHospital')}
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3.5 border-2 border-navy-900 text-navy-900 uppercase tracking-[0.15em] text-sm font-bold hover:bg-navy-900 hover:text-white transition-colors"
            >
              {t('surveyGoHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main survey ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-[#faf8f5] flex flex-col">
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(80px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-80px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes cardFadeUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(194, 150, 98, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(194, 150, 98, 0); }
        }
        .survey-card {
          animation: cardFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .survey-card:nth-child(1) { animation-delay: 0.05s; }
        .survey-card:nth-child(2) { animation-delay: 0.1s; }
        .survey-card:nth-child(3) { animation-delay: 0.15s; }
        .survey-card:nth-child(4) { animation-delay: 0.2s; }
        .survey-card:nth-child(5) { animation-delay: 0.25s; }
        .survey-card:nth-child(6) { animation-delay: 0.3s; }
        .survey-card:nth-child(7) { animation-delay: 0.35s; }
        .survey-card:nth-child(8) { animation-delay: 0.4s; }
        .survey-card:nth-child(9) { animation-delay: 0.45s; }
        .survey-card:nth-child(10) { animation-delay: 0.5s; }
        .selected-pulse {
          animation: pulseGlow 0.6s ease-out;
        }
      `}</style>

      {/* ═══ TOP BAR ═══ */}
      <div className="shrink-0 px-6 md:px-10 pt-6 pb-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="font-serif text-2xl italic tracking-wide text-navy-900">Medora</div>
            <div className="hidden sm:block text-[10px] uppercase tracking-[0.15em] text-stone-400 border-l border-stone-200 pl-3">
              {t('surveyHealthSurvey')}
            </div>
          </div>

          <div className="text-stone-400 text-sm font-light">
            <span className="text-navy-900 font-semibold">{currentStep + 1}</span>
            <span className="mx-1">{t('of')}</span>
            <span>{totalSteps}</span>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="p-2 text-stone-400 hover:text-navy-900 transition-colors rounded-full hover:bg-stone-100"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* ═══ PROGRESS BAR ═══ */}
      <div className="shrink-0 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #c29662, #a6794b)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 md:py-16 overflow-y-auto">
        <div
          key={animKey}
          className="w-full max-w-3xl"
          style={{
            animation: `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
          }}
        >
          {/* Step icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-gold-600/10 flex items-center justify-center text-gold-600">
              {stepIcons[step.id] || <Sparkles size={20} />}
            </div>
          </div>

          {/* Question */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-navy-900 text-center mb-3 leading-tight">
            {step.question}
          </h1>

          {step.subtitle && (
            <p className="text-stone-400 text-center text-base md:text-lg font-light mb-10 max-w-xl mx-auto">
              {step.subtitle}
            </p>
          )}

          {/* ─── Single Select Options ─── */}
          {step.type === 'single' && step.options && (
            <div className={`grid gap-4 ${
              step.id === 'area'
                ? 'grid-cols-1 sm:grid-cols-2'
                : step.options.length <= 4
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            } max-w-2xl mx-auto`}>
              {step.options.map((option) => {
                const isSelected = answers[step.id] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSingleSelect(step.id, option.value)}
                    className={`survey-card group relative text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-gold-600 bg-gold-600/5 shadow-lg shadow-gold-600/10 selected-pulse'
                        : 'border-stone-200 bg-white hover:border-gold-500/50 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {step.id === 'area' && areaIcons[option.value] && (
                        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-gold-600 text-white'
                            : 'bg-sage-50 text-stone-500 group-hover:bg-gold-600/10 group-hover:text-gold-600'
                        }`}>
                          {areaIcons[option.value]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-semibold text-base transition-colors ${
                            isSelected ? 'text-navy-900' : 'text-stone-700'
                          }`}>
                            {option.label}
                          </span>
                          <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-gold-600 bg-gold-600'
                              : 'border-stone-300 group-hover:border-gold-500'
                          }`}>
                            {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                        </div>
                        {option.description && (
                          <p className="text-stone-400 text-sm mt-1 font-light">{option.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── Multi Select Options ─── */}
          {step.type === 'multi' && step.options && (
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {step.options.map((option) => {
                  const selected = ((answers[step.id] as string[]) || []).includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleMulti(step.id, option.value)}
                      className={`survey-card group text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                        selected
                          ? 'border-gold-600 bg-gold-600/5 shadow-md shadow-gold-600/10'
                          : 'border-stone-200 bg-white hover:border-gold-500/50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          selected
                            ? 'border-gold-600 bg-gold-600'
                            : 'border-stone-300 group-hover:border-gold-500'
                        }`}>
                          {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={`font-medium text-sm transition-colors ${
                          selected ? 'text-navy-900' : 'text-stone-600'
                        }`}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Contact Form ─── */}
          {step.type === 'form' && (
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 md:p-8 space-y-5 survey-card">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-navy-900 mb-2">
                    <User size={15} className="text-gold-600" />
                    {t('surveyFormName')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={e => setContact(c => ({ ...c, name: e.target.value }))}
                    placeholder={t('surveyFormNamePlaceholder')}
                    className="w-full bg-sage-50/50 text-navy-900 border border-stone-200 px-4 py-3.5 rounded-lg outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all placeholder-stone-400"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-navy-900 mb-2">
                    <Mail size={15} className="text-gold-600" />
                    {t('surveyFormEmail')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                    placeholder={t('surveyFormEmailPlaceholder')}
                    className="w-full bg-sage-50/50 text-navy-900 border border-stone-200 px-4 py-3.5 rounded-lg outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all placeholder-stone-400"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-navy-900 mb-2">
                    <Phone size={15} className="text-gold-600" />
                    {t('surveyFormPhone')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                    placeholder={t('surveyFormPhonePlaceholder')}
                    className="w-full bg-sage-50/50 text-navy-900 border border-stone-200 px-4 py-3.5 rounded-lg outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all placeholder-stone-400"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-navy-900 mb-2">
                    <Globe size={15} className="text-gold-600" />
                    {t('surveyFormCountry')}
                  </label>
                  <input
                    type="text"
                    value={contact.country}
                    onChange={e => setContact(c => ({ ...c, country: e.target.value }))}
                    placeholder={t('surveyFormCountryPlaceholder')}
                    className="w-full bg-sage-50/50 text-navy-900 border border-stone-200 px-4 py-3.5 rounded-lg outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all placeholder-stone-400"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-navy-900 mb-2">
                    <MessageSquare size={15} className="text-gold-600" />
                    {t('surveyFormNotes')}
                  </label>
                  <textarea
                    value={contact.message}
                    onChange={e => setContact(c => ({ ...c, message: e.target.value }))}
                    rows={3}
                    placeholder={t('surveyFormNotesPlaceholder')}
                    className="w-full bg-sage-50/50 text-navy-900 border border-stone-200 px-4 py-3.5 rounded-lg outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all resize-none placeholder-stone-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ BOTTOM NAVIGATION ═══ */}
      <div className="shrink-0 px-6 md:px-10 pb-8 pt-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={currentStep > 0 ? goBack : () => navigate(-1)}
            className="flex items-center gap-2 text-stone-500 hover:text-navy-900 transition-colors text-sm font-medium py-3 px-4 rounded-lg hover:bg-stone-100"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">
              {currentStep > 0 ? t('surveyBack') : t('surveyExit')}
            </span>
          </button>

          {step.type !== 'single' && (
            <button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-lg uppercase tracking-[0.12em] text-sm font-bold transition-all duration-300 ${
                canProceed && !isSubmitting
                  ? 'bg-gold-600 text-white hover:bg-gold-500 shadow-lg shadow-gold-600/20 hover:shadow-xl hover:shadow-gold-600/30 hover:-translate-y-0.5'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('surveySubmitting')}
                </>
              ) : step.type === 'form' ? (
                <>
                  {t('surveyGetQuote')}
                  <Check size={18} />
                </>
              ) : (
                <>
                  {t('surveyNext')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationSurvey;
