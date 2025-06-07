// useMapSocket.js
import { useEffect, useRef } from 'react';

export const useMapSocket = (mapId, onMessage) => {
  const socketRef = useRef(null);
  const messageHandlerRef = useRef(onMessage);

  // Обновляем колбэк без пересоздания сокета
  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!mapId) return;

    const socket = new WebSocket(`ws://localhost:8000/ws/map/${mapId}/`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('🟢 WebSocket открыт:', socket.url);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        messageHandlerRef.current?.(data);
      } catch (err) {
        console.error('Ошибка обработки сообщения:', err);
      }
    };

    socket.onerror = (err) => console.error('WebSocket ошибка:', err);
    socket.onclose = () => console.warn('WebSocket закрыт');

    return () => {
      socket.close();
    };
  }, [mapId]); // ВАЖНО: зависит только от mapId

  return socketRef.current;
};
