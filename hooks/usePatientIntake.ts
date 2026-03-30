import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi, type IntakeTemplate, type IntakeResponse } from '../services/crmApiClient';
import { usePatientAuth } from '../contexts/PatientAuthContext';

export const intakeKeys = {
  template: (patientId: string | undefined, caseId: string | undefined) =>
    ['patient', patientId, 'intake', 'template', caseId] as const,
  response: (patientId: string | undefined, caseId: string | undefined) =>
    ['patient', patientId, 'intake', 'response', caseId] as const,
};

export function useIntakeTemplate(caseId: string | undefined) {
  const { patient } = usePatientAuth();
  const patientId = patient?.id;
  return useQuery<IntakeTemplate>({
    queryKey: intakeKeys.template(patientId, caseId),
    queryFn: () => crmApi.getIntakeTemplate(caseId!),
    enabled: !!patientId && !!caseId,
    staleTime: 60_000,
  });
}

export function useIntakeResponse(caseId: string | undefined) {
  const { patient } = usePatientAuth();
  const patientId = patient?.id;
  return useQuery<IntakeResponse>({
    queryKey: intakeKeys.response(patientId, caseId),
    queryFn: () => crmApi.getIntakeResponse(caseId!),
    enabled: !!patientId && !!caseId,
    staleTime: 30_000,
  });
}

export function useSaveIntakeResponse(caseId: string | undefined) {
  const { patient } = usePatientAuth();
  const patientId = patient?.id;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { answers: Record<string, unknown>; status: 'draft' | 'submitted' }) =>
      crmApi.saveIntakeResponse(caseId!, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(intakeKeys.response(patientId, caseId), updated);
      queryClient.invalidateQueries({ queryKey: ['patient', patientId, 'cases'] });
    },
  });
}
