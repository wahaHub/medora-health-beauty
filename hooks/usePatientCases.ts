import { useQuery } from '@tanstack/react-query';
import { crmApi } from '../services/crmApiClient';

export function usePatientCases() {
  return useQuery({
    queryKey: ['patient', 'cases'],
    queryFn: () => crmApi.getCases(),
    staleTime: 30_000,
  });
}
