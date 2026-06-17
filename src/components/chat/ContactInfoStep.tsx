import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { crmApi } from '@/services/crmApiClient';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getPublicDestinationLabel,
  getPublicProcedureGroupLabel,
  getPublicProcedureLabel,
  publicDestinationOptions,
  publicProcedureGroups,
} from '@/data/publicDiscoveryFilters';

interface ContactInfoStepProps {
  onComplete?: (result: { patientId: string; caseId: string }) => void;
}

export function ContactInfoStep({ onComplete }: ContactInfoStepProps = {}) {
  const { dt } = useDashboardTranslation();
  const { currentLanguage } = useLanguage();
  const { bootstrapSession } = usePatientAuth();
  const { profileDraft, patchProfileDraft, applyOnboardingResult } = usePatientEntry();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const procedureGroups = publicProcedureGroups;
  const destinations = publicDestinationOptions;

  const procedureMetadata = useMemo(() => {
    const byId = new Map<string, { name: string; category: string }>();
    for (const group of procedureGroups) {
      for (const procedure of group.procedures) {
        byId.set(procedure.id, { name: procedure.name, category: group.category });
      }
    }
    return byId;
  }, [procedureGroups]);

  const canSubmit = profileDraft.name.trim() !== ''
    && profileDraft.email.trim() !== ''
    && profileDraft.disease.trim() !== ''
    && profileDraft.destination.trim() !== '';

  const handleProcedureChange = (procedureId: string) => {
    const next = procedureMetadata.get(procedureId);
    patchProfileDraft({
      procedureId,
      category: next?.category ?? '',
      disease: next?.name ?? '',
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await crmApi.initOnboarding({
        name: profileDraft.name,
        email: profileDraft.email,
        ...(profileDraft.phone.trim() ? { phone: profileDraft.phone.trim() } : {}),
        disease: profileDraft.disease,
        category: profileDraft.category || undefined,
        destination: profileDraft.destination,
        preferredLanguage: currentLanguage,
      });

      const widgetConversation = result.widgetChatTarget?.kind === 'CHATBOT_SESSION'
        ? [{
            id: result.widgetChatTarget.sessionId,
            type: 'patient-admin' as const,
            category: 'ADMIN_PATIENT',
          }]
        : [];
      const conversations = result.conversations?.length
        ? result.conversations
        : widgetConversation;
      const nextStep: 'select-hospitals' | 'messages-ready' =
        widgetConversation.length > 0
          ? 'messages-ready'
          : ((result.nextStep as 'select-hospitals' | 'messages-ready') ?? 'messages-ready');

      bootstrapSession({
        patientId: result.patientId,
        caseId: result.caseId,
        name: profileDraft.name,
        email: profileDraft.email,
        restoreToken: result.restoreToken ?? '',
        nextStep,
      });

      const applied = applyOnboardingResult({
        patientId: result.patientId,
        caseId: result.caseId,
        nextStep,
        conversations,
      });

      if (applied) {
        onComplete?.({
          patientId: result.patientId,
          caseId: result.caseId,
        });
      }
    } catch (err: any) {
      setError(err.message ?? dt('chatSomethingWentWrong'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-3 my-2 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
      <h4 className="text-stone-800 font-serif text-base mb-0.5">{dt('chatYourInfo')}</h4>
      <p className="text-stone-500 text-xs mb-3">{dt('chatMatchHospitals')}</p>

      <div className="space-y-2.5">
        <div>
          <label htmlFor="patient-name" className="text-stone-600 text-xs font-medium mb-1 block">{dt('chatName')}</label>
          <input
            id="patient-name"
            type="text"
            value={profileDraft.name}
            onChange={(e) => patchProfileDraft({ name: e.target.value })}
            placeholder={dt('chatNamePlaceholder')}
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label htmlFor="patient-email" className="text-stone-600 text-xs font-medium mb-1 block">{dt('chatEmail')}</label>
          <input
            id="patient-email"
            type="email"
            value={profileDraft.email}
            onChange={(e) => patchProfileDraft({ email: e.target.value })}
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label htmlFor="patient-phone" className="text-stone-600 text-xs font-medium mb-1 block">{dt('chatPhone')}</label>
          <input
            id="patient-phone"
            type="tel"
            value={profileDraft.phone}
            onChange={(e) => patchProfileDraft({ phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label htmlFor="patient-procedure" className="text-stone-600 text-xs font-medium mb-1 block">{dt('chatConditionProcedure')}</label>
          <div className="relative">
            <select
              id="patient-procedure"
              aria-label={dt('chatConditionProcedure')}
              value={profileDraft.procedureId}
              onChange={(e) => handleProcedureChange(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
            >
              <option value="">{dt('chatSelectProcedure')}</option>
              {procedureGroups.map((group) => (
                <optgroup key={group.category} label={getPublicProcedureGroupLabel(group, currentLanguage)}>
                  {group.procedures.map((procedure) => (
                    <option key={procedure.id} value={procedure.id}>
                      {getPublicProcedureLabel(procedure, currentLanguage)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="patient-destination" className="text-stone-600 text-xs font-medium mb-1 block">{dt('chatDestination')}</label>
          <div className="relative">
            <select
              id="patient-destination"
              aria-label={dt('chatDestination')}
              value={profileDraft.destination}
              onChange={(e) => patchProfileDraft({ destination: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
            >
              <option value="">{dt('chatSelectDestination')}</option>
              {destinations.map((destination) => (
                <option key={destination.value} value={destination.value}>
                  {getPublicDestinationLabel(destination, currentLanguage)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="mt-3 w-full bg-gold-600 hover:bg-gold-700 disabled:bg-stone-300 text-white py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {dt('chatSubmitDetails')}
      </button>
    </div>
  );
}
