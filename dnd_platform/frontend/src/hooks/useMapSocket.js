import { useEffect, useRef } from 'react';

export const useMapSocket = (mapId, onMessage) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!mapId) return;

    const socket = new WebSocket(`ws://localhost:8000/ws/map/${mapId}/`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log(`🟢 WebSocket открыт: ws://localhost:8000/ws/map/${mapId}/`);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Получено сообщение:', data);
        onMessage(data);
      } catch (err) {
        console.error('Ошибка при разборе сообщения:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('❌ WebSocket ошибка:', err);
    };

    socket.onclose = (event) => {
      console.warn('🔌 WebSocket закрыт:', event.code, event.reason);
    };

    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [mapId, onMessage]);
};
