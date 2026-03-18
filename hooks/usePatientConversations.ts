import { useQuery } from '@tanstack/react-query';
import { crmApi } from '../services/crmApiClient';

export function usePatientConversations() {
  return useQuery({
    queryKey: ['patient', 'conversations'],
    queryFn: () => crmApi.getConversations(),
    staleTime: 10_000,
  });
}
