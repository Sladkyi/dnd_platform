import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PlayerView from './PlayerView';
import {
  fetchMap,
  fetchRoom,
  updateShapePosition,
} from '../services/MapService';
import { useMapSocket } from '../hooks/useMapSocket';
import throttle from 'lodash/throttle';

const PlayerAgent = ({ shapeId, mapId, scale }) => {
  const [mapData, setMapData] = useState(null);
  const [shape, setShape] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [room, setRoom] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  // Загрузка карты и фигуры
  useEffect(() => {
    const load = async () => {
      const { data } = await fetchMap(mapId);
      setMapData(data);
      setShapes(data.shapes || []);

      const playerShape = data.shapes.find(
        (s) => String(s.id) === String(shapeId)
      );
      setShape(playerShape);

      if (data.last_opened_room_id) {
        const roomRes = await fetchRoom(data.last_opened_room_id);
        setRoom(roomRes.data);
      }
    };

    if (mapId && shapeId) load();
  }, [mapId, shapeId]);

  // WebSocket: обновление фигур
  useMapSocket(mapId, (data) => {
    setShapes((prev) =>
      prev.map((s) => (s.id === data.id ? { ...s, ...data } : s))
    );
    if (String(data.id) === String(shapeId)) {
      setShape((prev) => ({ ...prev, ...data }));
    }
  });

  // Отправка координат на сервер
  const sendPosition = useCallback(
    (coords) => {
      if (shape?.id) {
        updateShapePosition(shape.id, {
          shapes: [{ id: shape.id, x: coords.x, y: coords.y }],
        });
      }
    },
    [shape?.id]
  );

  const throttledSendPosition = useMemo(
    () => (shape?.id ? throttle(sendPosition, 500) : () => {}),
    [shape?.id, sendPosition]
  );

  useEffect(
    () => () => throttledSendPosition.cancel?.(),
    [throttledSendPosition]
  );

  // Локальное обновление
  const updateLocalShape = useCallback(
    (coords) => {
      if (!shape) return;
      setShape((prev) => ({ ...prev, ...coords }));
      setShapes((prev) =>
        prev.map((s) => (s.id === shape.id ? { ...s, ...coords } : s))
      );
    },
    [shape]
  );

  // Обновление + отправка (движение)
  const handleShapeMoveAndSend = useCallback(
    (coords) => {
      updateLocalShape(coords);
      throttledSendPosition(coords);
    },
    [updateLocalShape, throttledSendPosition]
  );

  // Финальная отправка при окончании drag'n'drop
  const handleDragEnd = useCallback(
    (coords) => {
      throttledSendPosition.cancel();
      sendPosition(coords);
      setIsMoving(false);
    },
    [sendPosition, throttledSendPosition]
  );

  if (!mapData || !shape) return <div>Загрузка...</div>;

  const roomData = room || {
    id: 0,
    background_image: mapData.full_card_map_image,
  };

  return (
    <PlayerView
      shape={shape}
      shapes={shapes}
      room={roomData}
      scale={scale}
      onShapeMove={handleShapeMoveAndSend}
      onDragMove={handleShapeMoveAndSend}
      onDragStart={() => setIsMoving(true)}
      onDragEnd={handleDragEnd}
      isMoving={isMoving}
    />
  );
};

export default PlayerAgent;
