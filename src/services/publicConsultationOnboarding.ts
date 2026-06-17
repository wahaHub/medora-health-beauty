import { getPublicProcedureOptionById } from '@/data/publicDiscoveryFilters';
import { crmApi, type PatientSessionBootstrap } from '@/services/crmApiClient';

type PublicConsultationNextStep = 'select-hospitals' | 'messages-ready';

type PublicConsultationConversation = {
  id: string;
  type: 'patient-admin' | 'patient-hospital';
  category?: string;
};

type PublicConsultationResult = {
  patientId: string;
  caseId: string;
  restoreToken?: string;
  nextStep?: string;
  widgetChatTarget?: {
    kind: 'CHATBOT_SESSION';
    sessionId: string;
  } | null;
  conversations?: Array<{ id: string; type: string; category?: string }>;
};

export type PublicConsultationFormSubmission = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryOfOrigin: string;
  procedureId: string;
  message: string;
};

export type PublicConsultationSubmitInput = {
  formData: PublicConsultationFormSubmission;
  preferredLanguage: string;
  source: string;
  bootstrapSession: (session: PatientSessionBootstrap) => void;
  applyOnboardingResult: (input: {
    patientId: string;
    caseId: string;
    nextStep: PublicConsultationNextStep;
    conversations?: PublicConsultationConversation[];
  }) => boolean;
};

const normalizeConversations = (result: PublicConsultationResult): PublicConsultationConversation[] => {
  if (result.conversations?.length) {
    return result.conversations.map((conversation) => ({
      id: conversation.id,
      type: conversation.type === 'patient-hospital' ? 'patient-hospital' : 'patient-admin',
      category: conversation.category,
    }));
  }

  if (result.widgetChatTarget?.kind === 'CHATBOT_SESSION') {
    return [{
      id: result.widgetChatTarget.sessionId,
      type: 'patient-admin',
      category: 'ADMIN_PATIENT',
    }];
  }

  return [];
};

const resolveNextStep = (
  result: PublicConsultationResult,
): PublicConsultationNextStep => {
  if (result.widgetChatTarget?.kind === 'CHATBOT_SESSION') {
    return 'messages-ready';
  }

  return result.nextStep === 'select-hospitals' ? 'select-hospitals' : 'messages-ready';
};

export async function submitPublicConsultationForm({
  formData,
  preferredLanguage,
  source,
  bootstrapSession,
  applyOnboardingResult,
}: PublicConsultationSubmitInput) {
  const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
  const selectedProcedure = getPublicProcedureOptionById(formData.procedureId);
  const procedure = selectedProcedure?.procedure;
  const category = selectedProcedure?.group.category;
  const result = await crmApi.initOnboarding({
    name,
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    disease: procedure?.name ?? formData.procedureId,
    procedureId: procedure?.id ?? formData.procedureId,
    category,
    preferredLanguage,
    source,
    countryOfOrigin: formData.countryOfOrigin.trim(),
    message: formData.message.trim() || undefined,
  });
  const conversations = normalizeConversations(result);
  const nextStep = resolveNextStep(result);

  bootstrapSession({
    patientId: result.patientId,
    caseId: result.caseId,
    name,
    email: formData.email.trim(),
    restoreToken: result.restoreToken ?? '',
    nextStep,
  });

  const applied = applyOnboardingResult({
    patientId: result.patientId,
    caseId: result.caseId,
    nextStep,
    conversations,
  });

  return {
    applied,
    patientId: result.patientId,
    caseId: result.caseId,
  };
}
