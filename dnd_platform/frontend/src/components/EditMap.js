import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { handleShapeDrag } from '../services/shapeHelpers';
import {
  fetchMap,
  fetchRoom,
  fetchRooms,
  createRoom,
  updateRoomId,
  createSessionURL,
  fetchSessionPlayers,
  fetchShapes,
} from '../services/MapService';
import { useSocket } from '../context/SocketContext';
import MapStage from './MapStage';
import RoomList from './RoomList';
import MasterToolbar from '../components/MasterToolbar/MasterToolbar';
import ContextMenu from './ContextMenu';
import PlayerAgent from './PlayerAgent';
import EditingEntity from './EditingEntity/EditingEntity';
import './styles/EditMap.css';
import useMapSubscription from '../hooks/useMapSubscription';
import { createIncomingMessageHandler } from '../websocket/handleIncomingMessage';
import SessionInfo from './SessionInfo';
import ToolbarContent from './MasterToolbar/ToolbarContent';
const safeSocketSend = (socket, message) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('⚠️ Сокет не готов');
    return;
  }

  if (!message?.payload?.map_id || isNaN(Number(message.payload.map_id))) {
    console.warn('🚫 Некорректный map_id, не отправляю сообщение', message);
    return;
  }

  console.log('📤 Отправляю сообщение:', message);
  socket.send(JSON.stringify(message));
};

// Валидационные функции
const validateNumber = (value) =>
  typeof value === 'number' && !isNaN(value) && isFinite(value);

const validateObject = (obj) =>
  obj && typeof obj === 'object' && !Array.isArray(obj);

const validateString = (str) => typeof str === 'string' && str.trim() !== '';

const validateArray = (arr) => Array.isArray(arr);

// Вынесена логика анимации в отдельный хук
const useShapeAnimations = (setShapes) => {
  const animationsRef = useRef({});

  useEffect(() => {
    return () => {
      // Отмена всех анимаций при размонтировании
      Object.values(animationsRef.current).forEach(cancelAnimationFrame);
    };
  }, []);

  const animateShape = useCallback(
    (shapeId, targetX, targetY, duration = 1000) => {
      if (
        !shapeId ||
        typeof targetX !== 'number' ||
        typeof targetY !== 'number'
      ) {
        console.error('Invalid animation parameters', {
          shapeId,
          targetX,
          targetY,
        });
        return;
      }

      // Отмена предыдущей анимации для этой фигуры
      if (animationsRef.current[shapeId]) {
        cancelAnimationFrame(animationsRef.current[shapeId]);
      }

      setShapes((prevShapes) => {
        const shape = prevShapes.find((s) => s.id === shapeId);
        if (!shape) return prevShapes;

        // Если цель уже достигнута
        if (shape.x === targetX && shape.y === targetY) {
          return prevShapes;
        }

        const startX = shape.x;
        const startY = shape.y;
        const deltaX = targetX - startX;
        const deltaY = targetY - startY;
        let startTime = null;

        const animate = (time) => {
          if (!startTime) startTime = time;
          const progress = Math.min((time - startTime) / duration, 1);

          const currentX = startX + deltaX * progress;
          const currentY = startY + deltaY * progress;

          setShapes((prev) =>
            prev.map((s) =>
              s.id === shapeId ? { ...s, x: currentX, y: currentY } : s
            )
          );

          if (progress < 1) {
            animationsRef.current[shapeId] = requestAnimationFrame(animate);
          } else {
            delete animationsRef.current[shapeId];
          }
        };

        animationsRef.current[shapeId] = requestAnimationFrame(animate);
        return prevShapes;
      });
    },
    [setShapes]
  );

  return animateShape;
};

const EditMap = () => {
  const navigate = useNavigate();
  const { id: mapId } = useParams();
  const location = useLocation();
  const profileId = location.state?.profileId;
  const role = location.state?.role;
  const shapeId = location.state?.shapeId;
  const { socket, isSocketReady } = useSocket();
  const positionRef = useRef({ x: 0, y: 0 });
  const movementLocks = useRef({});
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentTurnShapeId, setCurrentTurnShapeId] = useState(null);
  // Состояния
  const [mapData, setMapData] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [pointsOfInterest, setPointsOfInterest] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [mainRoom, setMainRoom] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomsVisible, setRoomsVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedShape, setSelectedShape] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [players, setPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [sessionId, setSessionId] = useState(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    return storedSessionId && typeof storedSessionId === 'string'
      ? storedSessionId
      : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backgroundUrl =
    currentRoom?.background_image || mainRoom?.background_image || '';
  // Валидация параметров URL
  useEffect(() => {
    if (!mapId || isNaN(Number(mapId))) {
      console.warn('❌ Некорректный mapId, не отправляю движение');
      return;
    }

    if (!profileId || !validateNumber(parseInt(profileId, 10))) {
      setError('Неверный идентификатор профиля');
    }
  }, [mapId, profileId, navigate]);

  const animateShape = useShapeAnimations(setShapes);

  // Загрузка данных карты
  useEffect(() => {
    if (!mapId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [mapRes, roomsRes, shapesRes] = await Promise.all([
          fetchMap(mapId),
          fetchRooms(mapId),
          fetchShapes(mapId),
        ]);

        // Проверка ответов сервера
        if (!mapRes.data || !roomsRes.data || !shapesRes.data) {
          throw new Error('Неполные данные с сервера');
        }

        setMapData(mapRes.data);
        setPointsOfInterest(
          Array.isArray(mapRes.data.pointsOfInterest)
            ? mapRes.data.pointsOfInterest
            : []
        );

        setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
        setShapes(Array.isArray(shapesRes.data) ? shapesRes.data : []);

        if (mapRes.data.full_card_map_image) {
          setMainRoom({
            id: 0,
            name: 'Главная карта',
            background_image: mapRes.data.full_card_map_image,
          });
        }

        if (mapRes.data.last_opened_room_id) {
          const roomRes = await fetchRoom(mapRes.data.last_opened_room_id);
          if (roomRes.data) {
            setCurrentRoom(roomRes.data);
          }
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          'Ошибка загрузки данных карты';
        setError(errorMsg);
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mapId]);
  useEffect(() => {
    if (!socket || !isSocketReady || !mapId || !shapes.length) return;

    // Отправляем очередь ходов после загрузки фигур
    const turnOrder = shapes.map((shape) => shape.id);

    socket.send(
      JSON.stringify({
        action: 'turn_order_init',
        payload: {
          map_id: mapId,
          turn_order: turnOrder,
        },
      })
    );

    console.log('✅ Очередь инициализирована:', turnOrder);
  }, [socket, isSocketReady, mapId, shapes]);
  // Загрузка игроков сессии
  useEffect(() => {
    if (!sessionId || !validateString(sessionId)) return;

    const loadPlayers = async () => {
      try {
        const response = await fetchSessionPlayers(sessionId);
        if (response.data && Array.isArray(response.data)) {
          setPlayers(response.data);
        }
      } catch (err) {
        console.error('Не удалось загрузить игроков сессии', err);
      }
    };

    loadPlayers();
  }, [sessionId]);

  // Обработчик входящих сообщений WebSocket
  const [isHandlerReady, setIsHandlerReady] = useState(false);
  const handleIncomingMessageRef = useRef();

  useEffect(() => {
    if (!mapId) return;

    handleIncomingMessageRef.current = createIncomingMessageHandler({
      myShapeId: null,
      role: 'master',
      animateShape,
      setShapes,
      setPlayerShape: () => {},
      fetchSessionPlayers,
      setPlayers,
      positionRef,
      sessionId,
      mapId: parseInt(mapId, 10),
      movementLocks, // Передаёшь сюда
      setTurnOrder,
      setCurrentTurnShapeId,
    });

    setIsHandlerReady(true);
    return () => setIsHandlerReady(false);
  }, [animateShape, setShapes, sessionId, mapId]);

  useMapSubscription(socket, mapId, handleIncomingMessageRef, isHandlerReady);

  // Обработчик перемещения фигуры

  const lockShape = (shapeId) => {
    movementLocks.current[shapeId] = true;
    setTimeout(() => {
      delete movementLocks.current[shapeId];
    }, 200); // Время блокировки на момент анимации/отправки
  };

  const handleShapeDragWrapper = useCallback(
    (updatedShape) => {
      if (
        !validateObject(updatedShape) ||
        (typeof updatedShape.id !== 'string' &&
          typeof updatedShape.id !== 'number') ||
        typeof updatedShape.x !== 'number' ||
        typeof updatedShape.y !== 'number'
      ) {
        console.warn('Invalid shape data in drag handler', updatedShape);
        return;
      }

      // Блокируем обновление по сокету на 200ms для этой фигуры
      lockShape(updatedShape.id);

      // Оптимизированное обновление локального состояния
      setShapes((prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((shape) =>
          shape.id === updatedShape.id
            ? { ...shape, x: updatedShape.x, y: updatedShape.y }
            : shape
        );
      });

      // Отправка через WebSocket
      if (isSocketReady && socket && socket.readyState === WebSocket.OPEN) {
        const payload = {
          action: 'move',
          payload: {
            id: Number(updatedShape.id),
            x: updatedShape.x,
            y: updatedShape.y,
            map_id: Number(mapId),
          },
        };

        try {
          safeSocketSend(socket, payload);
        } catch (err) {
          console.error('Ошибка отправки через WebSocket:', err);
        }
      }
    },
    [isSocketReady, socket, mapId, setShapes]
  );
  // Обработчики комнат
  const handleRoomChange = useCallback(
    async (room) => {
      if (!room || !validateNumber(room.id)) {
        console.error('Invalid room selection', room);
        return;
      }

      try {
        if (room.id === 0) {
          setCurrentRoom(null);
          return;
        }

        // Проверка существования комнаты
        const roomExists = rooms.some((r) => r.id === room.id);
        if (!roomExists) {
          throw new Error(`Комната ${room.id} не найдена`);
        }

        setCurrentRoom(room);
        await updateRoomId(mapId, room.id);
      } catch (err) {
        console.error('Ошибка обновления комнаты:', err);
        alert(`Ошибка: ${err.message}`);
      }
    },
    [mapId, rooms]
  );
  const handleNextTurn = useCallback(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        action: 'next_turn',
        payload: { map_id: mapId },
      })
    );

    console.log('🔄 Запрос на следующий ход отправлен');
  }, [socket, mapId]);
  const handleAddRoom = useCallback(async () => {
    const name = prompt('Название новой комнаты:');
    if (!name || name.trim() === '') {
      alert('Название комнаты не может быть пустым');
      return;
    }

    try {
      const { data } = await createRoom(mapId, { name: name.trim() });
      if (data && data.id) {
        setRooms((prev) => [...prev, data]);
      } else {
        throw new Error('Неверный ответ сервера при создании комнаты');
      }
    } catch (err) {
      console.error('Ошибка создания комнаты:', err);
      alert(`Ошибка: ${err.message}`);
    }
  }, [mapId]);

  // Обработчики сессии
  const handleInvitePlayers = useCallback(async () => {
    try {
      const { data } = await createSessionURL(mapId, {
        last_opened_room_id: currentRoom?.id || null,
      });

      if (!data || !data.session_id || !data.join_url) {
        throw new Error('Неверный ответ сервера при создании сессии');
      }

      setSessionId(data.session_id);
      localStorage.setItem('sessionId', data.session_id);
      window.prompt('Ссылка для приглашения игроков', data.join_url);
    } catch (err) {
      console.error('Ошибка создания сессии:', err);
      alert(`Ошибка: ${err.message}`);
    }
  }, [mapId, currentRoom]);

  const handleEndSession = useCallback(() => {
    if (window.confirm('Завершить сессию?')) {
      localStorage.removeItem('sessionId');
      setSessionId(null);
      setPlayers([]);
    }
  }, []);

  // const renderPlayers = () => (
  //   <div className="session-players">
  //     <h4>Игроки в сессии:</h4>
  //     {!players.length ? (
  //       <p>Нет подключенных игроков</p>
  //     ) : (
  //       players.map((player) => (
  //         <div key={player.username || player.id}>
  //           {player.username} — {player.character?.name || 'Без персонажа'}
  //         </div>
  //       ))
  //     )}
  //   </div>
  // );

  // Обработчик открытия редактора
  const handleOpenEditor = useCallback((shape) => {
    if (!validateObject(shape) || !validateNumber(shape.id)) {
      console.warn('Попытка открыть редактор для невалидной фигуры', shape);
      return;
    }
    setSelectedShape(shape);
    setShowEditor(true);
  }, []);

  // Состояния загрузки и ошибки
  if (loading) return <div className="loading">Загрузка карты...</div>;
  if (error) return <div className="error">{error}</div>;

  if (!mapData) {
    return <div className="error">Данные карты не загружены</div>;
  }

  if (role === 'player') {
    if (!validateNumber(shapeId)) {
      return <div className="error">Неверный идентификатор фигуры игрока</div>;
    }

    return (
      <PlayerAgent
        shapeId={shapeId}
        mapId={mapId}
        scale={scale}
        mapData={mapData}
      />
    );
  }

  return (
    <div className="edit-map-container">
      {sessionId && (
        <SessionInfo
          players={players}
          currentTurnShapeId={currentTurnShapeId}
        />
      )}
      <MapStage
        scale={scale}
        position={position}
        setPosition={setPosition}
        setScale={setScale}
        shapes={shapes}
        points={pointsOfInterest}
        room={currentRoom}
        mainRoom={mainRoom}
        onDragShape={handleShapeDragWrapper}
        onDoubleClickShape={handleOpenEditor}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        backgroundUrl={backgroundUrl} // 👈 Добавь
      />

      {roomsVisible && (
        <RoomList
          rooms={rooms}
          mainRoom={mainRoom}
          currentRoom={currentRoom}
          onSelect={handleRoomChange}
        />
      )}

      <MasterToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mapId={mapId}
        mapTitle={mapData.title || 'Без названия'}
        onManualEdit={() => selectedShape && setShowEditor(true)}
        onToggleRooms={() => setRoomsVisible((v) => !v)}
        onAddRoom={handleAddRoom}
        onInvitePlayers={handleInvitePlayers}
        onResetMap={() => {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }}
        onEndSession={handleEndSession}
        onNextTurn={handleNextTurn}
      />

      <ContextMenu />
      <ToolbarContent activeTab={activeTab} mapId={mapId} />
      {showEditor && selectedShape && (
        <EditingEntity
          isOpen={showEditor}
          closeModal={() => {
            setShowEditor(false);
            setSelectedShape(null);
          }}
          selectedShape={selectedShape}
          profileId={profileId}
        />
      )}
    </div>
  );
};

export default EditMap;
