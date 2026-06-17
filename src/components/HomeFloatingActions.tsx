import { CalendarDays } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useConsultation } from '@/contexts/ConsultationContext';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { useBeautyConsultationUploadStatus } from '@/hooks/useBeautyConsultationUploadStatus';
import { useTranslation } from '@/hooks/useTranslation';
import { shouldShowFloatingPatientEntry } from '@/utils/floatingPatientEntryVisibility';

export default function HomeFloatingActions() {
  const location = useLocation();
  const { openConsultation } = useConsultation();
  const { isAuthenticated } = usePatientAuth();
  const { hasCompletedFiveViewUpload, isLoading } = useBeautyConsultationUploadStatus();
  const { t } = useTranslation();

  if (
    !shouldShowFloatingPatientEntry(location.pathname, isAuthenticated) ||
    isLoading ||
    hasCompletedFiveViewUpload
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-[9998] sm:bottom-28 sm:right-6">
      <button
        type="button"
        onClick={() => openConsultation()}
        className="inline-flex h-16 w-[calc(100vw-2rem)] items-center justify-center gap-3 rounded-full bg-gradient-to-r from-gold-600 to-gold-500 px-8 text-base font-bold text-white shadow-2xl shadow-gold-950/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-gold-500 hover:to-gold-600 sm:w-72"
      >
        <CalendarDays className="h-6 w-6" />
        {t('consultationNow')}
      </button>
    </div>
  );
}
