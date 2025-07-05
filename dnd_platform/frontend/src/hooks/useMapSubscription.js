import React, { useEffect, useState, useRef, useCallback } from 'react';

const useMapSubscription = (
  socket,
  mapId,
  handleIncomingMessageRef,
  isHandlerReady
) => {
  useEffect(() => {
    if (!socket || !mapId || !isHandlerReady) return;

    let isSubscribed = false;

    const subscribe = () => {
      if (!isSubscribed && socket.readyState === WebSocket.OPEN) {
        console.log('📡 Подписка на карту', mapId);
        socket.send(
          JSON.stringify({
            action: 'subscribe',
            payload: { map_id: mapId },
          })
        );
        isSubscribed = true;
      }
    };

    const handleOpen = () => {
      console.log('🟢 Сокет открыт');
      subscribe();
    };

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof handleIncomingMessageRef.current === 'function') {
          handleIncomingMessageRef.current(data);
        } else {
          console.warn('Handler ещё не установлен, сообщение пропущено', data);
        }
      } catch (err) {
        console.error('Ошибка обработки сообщения:', err);
      }
    };

    if (socket.readyState === WebSocket.OPEN) {
      subscribe();
    } else {
      socket.addEventListener('open', handleOpen);
    }

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('message', handleMessage);

      if (socket.readyState === WebSocket.OPEN && isSubscribed) {
        console.log('📴 Отписка от карты', mapId);
        socket.send(
          JSON.stringify({
            action: 'unsubscribe',
            payload: { map_id: mapId },
          })
        );
      }
    };
  }, [socket, mapId, isHandlerReady]);
};

export default useMapSubscription;
