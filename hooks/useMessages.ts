import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { crmApi, normalizePatientMessage } from '../services/crmApiClient';
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
        const normalized = normalizePatientMessage(message);
        if (!old) return { messages: [normalized] };
        const list = old.messages ?? old.data ?? (Array.isArray(old) ? old : []);
        const next = Array.isArray(list) ? [...list, normalized] : [normalized];
        if (Array.isArray(old)) return next;
        return { ...old, messages: next, data: next };
      });
    });
    return unsub;
  }, [subscribe, queryClient, conversationId]);

  return query;
}
