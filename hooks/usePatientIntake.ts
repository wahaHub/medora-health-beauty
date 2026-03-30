import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi, type IntakeTemplate, type IntakeResponse } from '../services/crmApiClient';

export const intakeKeys = {
  template: (caseId: string | undefined) => ['patient', 'intake', 'template', caseId] as const,
  response: (caseId: string | undefined) => ['patient', 'intake', 'response', caseId] as const,
};

export function useIntakeTemplate(caseId: string | undefined) {
  return useQuery<IntakeTemplate>({
    queryKey: intakeKeys.template(caseId),
    queryFn: () => crmApi.getIntakeTemplate(caseId!),
    enabled: !!caseId,
    staleTime: 60_000,
  });
}

export function useIntakeResponse(caseId: string | undefined) {
  return useQuery<IntakeResponse>({
    queryKey: intakeKeys.response(caseId),
    queryFn: () => crmApi.getIntakeResponse(caseId!),
    enabled: !!caseId,
    staleTime: 30_000,
  });
}

export function useSaveIntakeResponse(caseId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { answers: Record<string, unknown>; status: 'draft' | 'submitted' }) =>
      crmApi.saveIntakeResponse(caseId!, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(intakeKeys.response(caseId), updated);
      queryClient.invalidateQueries({ queryKey: ['patient', 'cases'] });
    },
  });
}
