import { useQuery } from '@tanstack/react-query';
import { crmApi, type Conversation } from '../services/crmApiClient';

export const patientConversationKeys = {
  all: ['patient', 'conversations'] as const,
};

export function usePatientConversations() {
  return useQuery<Conversation[]>({
    queryKey: patientConversationKeys.all,
    queryFn: () => crmApi.getConversations(),
    staleTime: 10_000,
  });
}
