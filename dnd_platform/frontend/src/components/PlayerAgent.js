import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PlayerView from './PlayerView';
import { fetchMap, fetchRoom } from '../services/MapService';
import { useMapSocket } from '../hooks/useMapSocket';
import useMovementEngine from '../hooks/useMovementEngine';
import { handleShapeDrag } from '../services/shapeHelpers';

const PlayerAgent = ({ shapeId, mapId, scale: initialScale }) => {
  const [mapData, setMapData] = useState(null);
  const [shape, setShape] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [room, setRoom] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(initialScale || 1);
  const [tick, setTick] = useState(0);

  const forceRerender = useCallback(() => setTick((t) => t + 1), []);

  const handleSocketMessage = useCallback(
    (data) => {
      if (String(data.id) === String(shapeId)) {
        setShape((prev) => ({ ...prev, ...data }));
        positionRef.current = { x: data.x, y: data.y };
        forceRerender();
      }
      setShapes((prev) =>
        prev.map((s) => (s.id === data.id ? { ...s, ...data } : s))
      );
    },
    [shapeId]
  );

  const socket = useMapSocket(mapId, handleSocketMessage);

  const sendPosition = useCallback(
    (coords) => {
      if (shape?.id && socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            action: 'move',
            payload: { id: shape.id, ...coords },
          })
        );
      }
      handleShapeDrag({ ...shape, ...coords }, setShapes);
    },
    [shape, socket, setShapes]
  );

  const { positionRef, setTarget, isMoving } = useMovementEngine({
    speed: 5,
    onUpdate: forceRerender,
    onFinish: sendPosition,
  });

  useEffect(() => {
    if (!mapId || !shapeId) return;

    const load = async () => {
      const { data } = await fetchMap(mapId);
      setMapData(data);
      setShapes(data.shapes || []);
      const playerShape = data.shapes.find(
        (s) => String(s.id) === String(shapeId)
      );
      setShape(playerShape);
      if (playerShape) {
        positionRef.current = { x: playerShape.x, y: playerShape.y };
      }

      if (data.last_opened_room_id) {
        const roomRes = await fetchRoom(data.last_opened_room_id);
        setRoom(roomRes.data);
      }
    };

    load();
  }, [mapId, shapeId]);

  const handleShapeMoveAndSend = useCallback(
    (coords) => {
      setTarget(coords);
    },
    [setTarget]
  );

  if (!mapData || !shape) return <div>Загрузка...</div>;

  const roomData = room || {
    id: 0,
    background_image: mapData.full_card_map_image,
  };

  return (
    <PlayerView
      shape={{ ...shape, ...positionRef.current }}
      shapes={shapes.map((s) =>
        s.id === shape.id ? { ...s, ...positionRef.current } : s
      )}
      room={roomData}
      scale={scale}
      position={position}
      setPosition={setPosition}
      setScale={setScale}
      onShapeMoveAndSend={handleShapeMoveAndSend}
      isMoving={isMoving}
    />
  );
};

export default PlayerAgent;
