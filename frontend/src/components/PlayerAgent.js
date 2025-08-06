import React, { useState, useEffect, useCallback, useRef } from 'react';
import PlayerView from './PlayerView';
import { fetchMap, fetchRoom, fetchShapeById } from '../services/MapService';
import { useSocket } from '../context/SocketContext';
import useMovementEngine from '../hooks/useMovementEngine';
import useShapeAnimations from '../hooks/useShapeAnimations';
import useMapSubscription from '../hooks/useMapSubscription';
import { createIncomingMessageHandler } from '../websocket/handleIncomingMessage';
import './styles/PlayerAgent.css';
import { fetchItemInstances } from '../services/MapService'; // не забудь подключить
// Валидационные функции
const validateNumber = (value) =>
  typeof value === 'number' && !isNaN(value) && isFinite(value);

const validateObject = (obj) =>
  obj && typeof obj === 'object' && !Array.isArray(obj);

const validateString = (str) => typeof str === 'string' && str.trim() !== '';

const PlayerAgent = ({ shapeId, mapId, scale: initialScale }) => {
  if (!validateNumber(parseInt(shapeId, 10))) {
    console.error('❌ Неверный shapeId:', shapeId);
    throw new Error('Некорректный идентификатор фигуры');
  }

  if (!validateNumber(parseInt(mapId, 10))) {
    console.error('❌ Неверный mapId:', mapId);
    throw new Error('Некорректный идентификатор карты');
  }

  const [mapData, setMapData] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [playerShape, setPlayerShape] = useState(null);
  const [room, setRoom] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(initialScale || 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isHandlerReady, setIsHandlerReady] = useState(false);
  const [currentTurnShapeId, setCurrentTurnShapeId] = useState(null);
  const [turnOrder, setTurnOrder] = useState([]);
  const movementLocks = useRef({});
  const { socket, isSocketReady } = useSocket();
  const FIXED_DURATION = 400;
  const positionRef = useRef({ x: 0, y: 0 });
  const [items, setItems] = useState([]);
  // Отслеживаем состояние подписки с помощью ref
  const isSubscribedRef = useRef(false);
  const cleanupRef = useRef(() => {});
  const [rooms, setRooms] = useState([]); // 👈 обязательно для списка комнат
  const animateShape = useShapeAnimations(setShapes);
  const visibleItems = items.filter(
    (item) => !item.is_hidden && !item.is_taken
  );
  const { setTarget, isMoving } = useMovementEngine({
    speed: 5,
    onUpdate: (newPos) => {
      positionRef.current = newPos; // 🔧 Обновляем позицию

      setShapes((prev) =>
        prev.map((s) =>
          s.id === playerShape?.id ? { ...s, x: newPos.x, y: newPos.y } : s
        )
      );
    },
    onFinish: (coords) => {
      setPlayerShape((prev) => ({ ...prev, ...coords }));
    },
  });

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [mapRes, shapeRes, itemInstancesRes] = await Promise.all([
          fetchMap(mapId),
          fetchShapeById(shapeId),
          fetchItemInstances(mapId), // 👈 загружаем предметы
        ]);

        if (!mapRes?.data || !shapeRes?.data) {
          throw new Error('Неполные данные с сервера');
        }

        if (
          !validateObject(shapeRes.data) ||
          !validateNumber(shapeRes.data.x) ||
          !validateNumber(shapeRes.data.y)
        ) {
          throw new Error('Некорректные данные фигуры');
        }

        if (isActive) {
          setMapData(mapRes.data);
          setPlayerShape(shapeRes.data);
          positionRef.current = { x: shapeRes.data.x, y: shapeRes.data.y };
          setShapes([shapeRes.data]);
          setItems(itemInstancesRes.data); // 👈 загрузка предметов
          if (mapRes.data.last_opened_room_id) {
            const roomRes = await fetchRoom(mapRes.data.last_opened_room_id);
            if (roomRes?.data) {
              setRoom(roomRes.data);
            }
          }
        }
      } catch (err) {
        if (isActive) {
          const errorMsg =
            err.response?.data?.message ||
            err.message ||
            'Ошибка загрузки данных';
          setError(errorMsg);
          console.error('Ошибка загрузки данных:', err);
        }
      } finally {
        if (isActive) {
          setLoading(false);
          setIsDataLoaded(true);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
      setShapes([]);
      setPlayerShape(null);
      cleanupRef.current();
    };
  }, [mapId, shapeId]);
  const lockShape = (shapeId) => {
    movementLocks.current[shapeId] = true;
    setTimeout(() => {
      delete movementLocks.current[shapeId];
    }, 200);
  };
  const handleIncomingMessageRef = useRef();

  useEffect(() => {
    if (!isDataLoaded || !playerShape || handleIncomingMessageRef.current)
      return;

    handleIncomingMessageRef.current = createIncomingMessageHandler({
      myShapeId: shapeId,
      role: 'player',
      animateShape,
      setShapes,
      setPlayerShape,
      fetchSessionPlayers: () => {},
      setPlayers: () => {},
      positionRef,
      movementLocks,
      sessionId: null,
      mapId: parseInt(mapId, 10),
      setTurnOrder,
      setCurrentTurnShapeId,
      setRooms,
      setCurrentRoom: setRoom,
      setItems,
    });

    setIsHandlerReady(true);

    return () => {
      handleIncomingMessageRef.current = null;
      setIsHandlerReady(false);
    };
  }, [isDataLoaded, playerShape, shapeId, mapId, animateShape]);

  // Единый useEffect для управления подпиской/отпиской
  useEffect(() => {
    if (!socket || !isHandlerReady || !isSocketReady) return;

    let isActive = true;
    let onOpenHandler = null;

    const subscribe = () => {
      if (!isActive || isSubscribedRef.current) return;

      try {
        socket.send(
          JSON.stringify({ action: 'subscribe', payload: { map_id: mapId } })
        );
        console.log('✅ Подписка на карту отправлена');
        isSubscribedRef.current = true;
      } catch (err) {
        console.error('Ошибка подписки на карту:', err);
      }
    };

    const unsubscribe = () => {
      if (!isActive || !isSubscribedRef.current) return;

      try {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              action: 'unsubscribe',
              payload: { map_id: mapId },
            })
          );
          console.log('✅ Отписка от карты отправлена');
        }
        isSubscribedRef.current = false;
      } catch (err) {
        console.error('Ошибка отписки от карты:', err);
      }
    };

    // Подписываемся если сокет уже открыт
    if (socket.readyState === WebSocket.OPEN) {
      subscribe();
    }
    // Или добавляем обработчик на открытие
    else {
      onOpenHandler = () => subscribe();
      socket.addEventListener('open', onOpenHandler);
    }

    // Функция очистки
    cleanupRef.current = () => {
      isActive = false;
      unsubscribe();

      if (onOpenHandler) {
        socket.removeEventListener('open', onOpenHandler);
      }
    };

    return cleanupRef.current;
  }, [socket, isHandlerReady, isSocketReady, mapId]);

  useMapSubscription(socket, mapId, handleIncomingMessageRef, isHandlerReady);

  const handleShapeMoveAndSend = useCallback(
    (coords) => {
      if (shapeId !== currentTurnShapeId) {
        console.warn('🚫 Не ваш ход!');
        return;
      }

      if (!playerShape || !socket || !mapId) return;
      if (!validateNumber(coords.x) || !validateNumber(coords.y)) {
        console.warn('Некорректные координаты перемещения:', coords);
        return;
      }
      lockShape(playerShape.id);
      setTarget(coords);

      if (isSocketReady && socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(
            JSON.stringify({
              action: 'move',
              payload: {
                id: playerShape.id,
                ...coords,
                map_id: mapId,
                duration: FIXED_DURATION,
              },
            })
          );
        } catch (err) {
          console.error('Ошибка отправки перемещения:', err);
        }
      }
    },
    [playerShape, socket, mapId, setTarget, isSocketReady]
  );

  if (loading) {
    return (
      <div className="player-agent-loading">
        <div className="loader"></div>
        <p>Загрузка карты...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player-agent-error">
        <h3>Ошибка!</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!playerShape) {
    return (
      <div className="player-agent-error">
        <h3>Фигура не найдена</h3>
        <p>Пожалуйста, вернитесь назад и выберите другую фигуру</p>
      </div>
    );
  }

  const roomData = room || {
    id: 0,
    background_image: mapData?.full_card_map_image || '',
    name: 'Главная карта',
  };

  const currentPlayer = {
    ...playerShape,
    x: positionRef.current.x,
    y: positionRef.current.y,
  };

  const displayShapes = shapes.map((s) =>
    s.id === playerShape.id ? currentPlayer : s
  );

  return (
    <PlayerView
      shape={currentPlayer}
      shapes={displayShapes}
      room={roomData}
      scale={scale}
      position={position}
      setPosition={setPosition}
      setScale={setScale}
      onShapeMoveAndSend={handleShapeMoveAndSend}
      isMoving={isMoving}
      mapData={mapData}
      itemInstances={visibleItems} // ✅ вот это добавь
    />
  );
};

export default PlayerAgent;
