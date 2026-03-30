import { useQuery } from '@tanstack/react-query';
import { crmApi, type Conversation } from '../services/crmApiClient';
import { usePatientAuth } from '../contexts/PatientAuthContext';

export const patientConversationKeys = {
  all: (patientId: string) => ['patient', patientId, 'conversations'] as const,
};

export function usePatientConversations() {
  const { patient } = usePatientAuth();
  const patientId = patient?.id ?? '';

  return useQuery<Conversation[]>({
    queryKey: patientConversationKeys.all(patientId),
    queryFn: () => crmApi.getConversations(),
    enabled: !!patientId,
    staleTime: 10_000,
  });
}
