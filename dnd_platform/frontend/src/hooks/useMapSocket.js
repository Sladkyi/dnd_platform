import { useEffect, useRef } from 'react';

export const useMapSocket = (mapId, onMessage, enabled = true) => {
  const socketRef = useRef(null);
  const messageHandlerRef = useRef(onMessage);

  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!mapId || !enabled) return;

    let socket;
    let isActive = true;

    const token = localStorage.getItem('access');
    socket = new WebSocket(
      `ws://localhost:8000/ws/map/${mapId}/?token=${token}`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      if (!isActive) return;
      console.log('🟢 WebSocket открыт:', socket.url);
    };

    socket.onmessage = (event) => {
      if (!isActive) return;
      try {
        console.log('Сообщение по сокету:', event.data);
        const data = JSON.parse(event.data);
        messageHandlerRef.current?.(data);
      } catch (err) {
        console.error('Ошибка обработки сообщения:', err);
      }
    };

    socket.onerror = (err) => {
      if (!isActive) return;
      console.error('WebSocket ошибка:', err);
    };

    socket.onclose = () => {
      if (!isActive) return;
      console.warn('WebSocket закрыт');
    };

    return () => {
      console.warn('🔌 WebSocket отключён');
      isActive = false;
      socket.close();
    };
  }, [mapId, enabled]);

  return enabled ? socketRef.current : null;
};
