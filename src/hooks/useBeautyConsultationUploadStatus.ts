import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { usePatientConversations } from '@/hooks/usePatientConversations';
import { crmApi } from '@/services/crmApiClient';
import { isCompletedBeautyUploadMessage } from '@/services/beautyUploadStatus';

export function useBeautyConsultationUploadStatus() {
  const { patient } = usePatientAuth();
  const { caseId: entryCaseId } = usePatientEntry();
  const conversationsQuery = usePatientConversations();
  const caseId = entryCaseId ?? patient?.caseId ?? '';
  const shouldCheckUploadStatus = Boolean(patient?.id && caseId);

  const candidateConversations = useMemo(
    () =>
      shouldCheckUploadStatus
        ? (conversationsQuery.data ?? []).filter((conversation) =>
            !conversation.caseId || conversation.caseId === caseId,
          )
        : [],
    [caseId, conversationsQuery.data, shouldCheckUploadStatus],
  );

  const messageQueries = useQueries({
    queries: candidateConversations.map((conversation) => ({
      queryKey: ['patient', 'messages', conversation.id],
      queryFn: () => crmApi.getMessages(conversation.id),
      enabled: shouldCheckUploadStatus,
      staleTime: 10_000,
    })),
  });

  const hasCompletedFiveViewUpload = messageQueries.some((query) =>
    (query.data?.messages ?? []).some(isCompletedBeautyUploadMessage),
  );
  const isLoading = shouldCheckUploadStatus && (
    conversationsQuery.isLoading ||
    messageQueries.some((query) => query.isLoading || query.isFetching)
  );

  return {
    hasCompletedFiveViewUpload,
    isLoading,
  };
}
