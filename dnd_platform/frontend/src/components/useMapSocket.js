import { useEffect } from 'react';

export const useMapSocket = (mapId, onMessage) => {
  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/ws/map/${mapId}/`);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    return () => socket.close();
  }, [mapId, onMessage]);
};
