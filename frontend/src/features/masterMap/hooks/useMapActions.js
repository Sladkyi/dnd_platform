import { useCallback } from 'react';
import {
  updateRoomId,
  createRoom,
  fetchRooms,
  createSessionURL,
} from '../../../services/MapService';
import { useSocket } from '../../../shared/context/SocketContext';

const useMapActions = ({
  mapId,
  currentRoom,
  allShapes,
  allItems,
  allPOIs,
  setCurrentRoom,
  setShapes,
  setItems,
  setPointsOfInterest,
  setRooms,
  setSessionId,
  setPlayers,
  setIsPOIModalOpen,
  setEditingPOI,
  setRoomModalSource,
  setIsRoomModalOpen,
}) => {
  const { socket } = useSocket();

  const handleRoomChange = useCallback(
    async (room) => {
      if (typeof room === 'number') {
        const found = (await fetchRooms(mapId)).data.find((r) => r.id === room);
        if (!found) return;
        room = found;
      }
      if (!room || typeof room.id !== 'number') return;

      try {
        if (room.id === 0) {
          setCurrentRoom(null);
          return;
        }

        setCurrentRoom(room);
        setShapes(allShapes.filter((s) => s.room === room.id || (!s.room && room.id === 0)));
        setItems(allItems.filter((i) => i.room === room.id || (!i.room && room.id === 0)));
        setPointsOfInterest(allPOIs.filter((p) => p.room === room.id || (!p.room && room.id === 0)));

        await updateRoomId(mapId, room.id);

        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              action: 'switch_room',
              payload: {
                map_id: mapId,
                room_id: room.id,
                background_image: room.background_image || null,
              },
            })
          );
        }
      } catch (err) {
        console.error('Ошибка переключения комнаты:', err);
      }
    },
    [mapId, allShapes, allItems, allPOIs, socket]
  );

  const handleAddRoom = useCallback(
    async (formData) => {
      try {
        const { data } = await createRoom(mapId, formData);
        if (data?.id) {
          const updatedRooms = await fetchRooms(mapId);
          setRooms(updatedRooms.data);

          if (setRoomModalSource && setRoomModalSource() === 'portal-poi') {
            setEditingPOI((prev) => ({ ...prev, target_room: data.id }));
            setTimeout(() => setIsPOIModalOpen(true), 0);
          }
        }
      } catch (err) {
        console.error('Ошибка создания комнаты:', err);
      } finally {
        setRoomModalSource(null);
        setIsRoomModalOpen(false);
      }
    },
    [mapId]
  );

  const handleInvitePlayers = useCallback(async () => {
    try {
      const { data } = await createSessionURL(mapId, {
        last_opened_room_id: currentRoom?.id || null,
      });

      if (!data?.session_id || !data?.join_url) {
        throw new Error('Сервер вернул неверные данные');
      }

      setSessionId(data.session_id);
      localStorage.setItem('sessionId', data.session_id);
      window.prompt('Ссылка для приглашения:', data.join_url);
    } catch (err) {
      console.error('Ошибка создания сессии:', err);
    }
  }, [mapId, currentRoom]);

  return {
    handleRoomChange,
    handleAddRoom,
    handleInvitePlayers,
  };
};

export default useMapActions;