import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { crmApi } from '../services/crmApiClient';
import { useWebSocket } from './useWebSocket';

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['patient', 'messages', conversationId];

  const { subscribe, isConnected } = useWebSocket(
    `/ws/conversations/${conversationId}`,
    !!conversationId,
  );

  const query = useQuery({
    queryKey,
    queryFn: () => crmApi.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: isConnected ? false : 5000, // Poll only when WS disconnected
  });

  useEffect(() => {
    const unsub = subscribe('new_message', (message: any) => {
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return { ...old, messages: [...(old.messages ?? []), message] };
      });
    });
    return unsub;
  }, [subscribe, queryClient, conversationId]);

  return query;
}
