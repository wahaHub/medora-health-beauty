import { useQuery } from '@tanstack/react-query';
import { crmApi } from '../services/crmApiClient';
import { usePatientAuth } from '../contexts/PatientAuthContext';

export function usePatientCases() {
  const { patient } = usePatientAuth();
  const patientId = patient?.id;
  return useQuery({
    queryKey: ['patient', 'cases', patientId],
    queryFn: () => crmApi.getCases(),
    enabled: !!patientId,
    staleTime: 30_000,
  });
}
