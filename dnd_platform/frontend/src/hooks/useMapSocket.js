import { useEffect, useRef } from 'react';

/**
 * Хук для подключения к WebSocket и получения обновлений по карте.
 * mapId — ID карты.
 * onMessage — колбэк, обрабатывающий входящие данные (должен быть мемоизирован).
 */
export const useMapSocket = (mapId, onMessage) => {
  const socketRef = useRef(null);
  const reconnectTimer = useRef(null);
  const attempts = useRef(0);

  useEffect(() => {
    if (!mapId || typeof onMessage !== 'function') return;

    const WS_BASE = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

    const connect = () => {
      const socket = new WebSocket(`${WS_BASE}/ws/map/${mapId}/`);
      socketRef.current = socket;

      socket.onopen = () => {
        attempts.current = 0;
        console.log(`🟢 WebSocket открыт: ${WS_BASE}/ws/map/${mapId}/`);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Получено сообщение:', data);
          onMessage(data);
        } catch (err) {
          console.error('❌ Ошибка при разборе сообщения:', err);
        }
      };

      socket.onerror = (err) => {
        console.error('❌ WebSocket ошибка:', err);
      };

      socket.onclose = (event) => {
        console.warn(
          `🔌 WebSocket закрыт: [${event.code}] ${event.reason || ''}`
        );
        const delay = Math.min(10000, 1000 * 2 ** attempts.current);
        reconnectTimer.current = setTimeout(connect, delay);
        attempts.current += 1;
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer.current);
      socketRef.current?.close();
      console.log('🔒 WebSocket закрыт вручную');
    };
  }, [mapId]);
  return socketRef.current;
};
