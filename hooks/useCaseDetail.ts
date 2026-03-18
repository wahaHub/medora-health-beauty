import { useQuery } from '@tanstack/react-query';
import { crmApi } from '../services/crmApiClient';

export function useCaseDetail(caseId: string) {
  return useQuery({
    queryKey: ['patient', 'cases', caseId],
    queryFn: () => crmApi.getCaseDetail(caseId),
    enabled: !!caseId,
  });
}
