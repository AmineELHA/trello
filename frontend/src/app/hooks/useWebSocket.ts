import { useEffect, useRef } from 'react';
import { createConsumer } from '@rails/actioncable';

type ActionCableConsumer = ReturnType<typeof createConsumer>;
type ActionCableSubscription = {
  unsubscribe: () => void;
};

type WebSocketData = {
  [key: string]: any;
};

const useWebSocket = (channel: string, onMessage: (data: WebSocketData) => void, params?: Record<string, any>) => {
  const wsRef = useRef<ActionCableSubscription | null>(null);
  const cableRef = useRef<ActionCableConsumer | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
    
    // Create the ActionCable consumer
    const cable = createConsumer(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL || 
      (typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss://' : 'ws://') + 
      (typeof window !== 'undefined' ? window.location.host : 'localhost:3000')}/cable?token=${token}`);
      
    cableRef.current = cable;

    // Subscribe to the channel
    const subscription = cable.subscriptions.create(
      { 
        channel: channel,
        ...params
      },
      {
        connected: () => {
          console.log('Connected to WebSocket');
        },
        disconnected: () => {
          console.log('Disconnected from WebSocket');
        },
        received: (data: WebSocketData) => {
          onMessage(data);
        }
      }
    );

    wsRef.current = subscription;

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.unsubscribe();
      }
      if (cableRef.current) {
        cableRef.current.disconnect();
      }
    };
  }, [channel, params]);

  return wsRef.current;
};

export default useWebSocket;