import { useQuery } from '@tanstack/react-query';
import { crmApi } from '../services/crmApiClient';

export function useQuote(caseId: string) {
  return useQuery({
    queryKey: ['patient', 'quote', caseId],
    queryFn: () => crmApi.getQuote(caseId),
    enabled: !!caseId,
  });
}
