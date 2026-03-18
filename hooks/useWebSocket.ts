import { useEffect, useRef, useCallback, useState } from 'react';
import { WsClient } from '../services/wsClient';
import { usePatientAuth } from '../contexts/PatientAuthContext';

export function useWebSocket(path: string, enabled = true) {
  const clientRef = useRef<WsClient | null>(null);
  const { isAuthenticated } = usePatientAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}${path}`;

    const client = new WsClient();
    client.connect(url);
    clientRef.current = client;

    // Track connection state
    const interval = setInterval(() => {
      setIsConnected(client.isConnected);
    }, 1000);

    return () => {
      clearInterval(interval);
      client.disconnect();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [path, enabled, isAuthenticated]);

  const subscribe = useCallback((type: string, handler: (data: any) => void) => {
    return clientRef.current?.subscribe(type, handler) ?? (() => {});
  }, []);

  return { subscribe, isConnected };
}
