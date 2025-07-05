import { useEffect, useRef, useState, useCallback } from 'react';

export const useGlobalSocket = () => {
  const socketRef = useRef(null);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const reconnectDelay = useRef(1000); // стартовая задержка переподключения

  const connectSocket = useCallback(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      console.error('❌ Токен не найден. Сокет не будет подключен.');
      return;
    }

    const socket = new WebSocket(
      `ws://localhost:8000/ws/global/?token=${token}`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('🟢 WebSocket открыт');
      setIsSocketReady(true);
      reconnectDelay.current = 1000; // сброс задержки при успешном подключении
    };

    socket.onclose = () => {
      console.warn('🔴 WebSocket закрыт');
      setIsSocketReady(false);

      // Автопереподключение с прогрессивной задержкой
      setTimeout(() => {
        console.log('🔁 Попытка переподключения...');
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000); // максимум 30 секунд
        connectSocket();
      }, reconnectDelay.current);
    };

    socket.onerror = (err) => {
      console.error('❌ WebSocket ошибка:', err);
    };
  }, []);

  useEffect(() => {
    connectSocket();

    return () => {
      console.warn('🔌 WebSocket отключён');
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectSocket]);

  return { socket: isSocketReady ? socketRef.current : null, isSocketReady };
};
