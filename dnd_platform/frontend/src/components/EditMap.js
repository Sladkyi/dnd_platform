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
  updateItemPosition,
  fetchItems,
  createItemInstance,
  fetchItemInstances,
  fetchPointsOfInterest,
  createPointOfInterest,
  deletePointOfInterest,
  getPlayerEntities,
  cloneShape,
  createShapeFromImage,
  fetchItemInstancesByRoom,
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
import RoomModal from './MasterToolbar/RoomModal';
import PointOfInterestModal from './PointOfInterestModal';
import { useShapeImages } from '../hooks/useShapeImages';

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
      setShapes((prev) => {
        const invalids = prev.filter((s) => !validateNumber(s.id));
        if (invalids.length) {
          console.warn('⚠️ Невалидные фигуры после загрузки:', invalids);
        }
        return prev;
      });
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
  const [images, setImages] = useState({});
  // Состояния
  const [items, setItems] = useState([]);
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
  const [playerShapes, setPlayerShapes] = useState([]);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [editingPOI, setEditingPOI] = useState(null);
  const [isPOIModalOpen, setIsPOIModalOpen] = useState(false);
  const [selectedItemInstance, setSelectedItemInstance] = useState(null);
  const [itemInstances, setItemInstances] = useState([]);
  const [isItemLibraryOpen, setIsItemLibraryOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allShapes, setAllShapes] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [allPOIs, setAllPOIs] = useState([]);
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
  useEffect(() => {
    if (activeTab === 'shapes' && profileId) {
      console.log(profileId);
      getMasterShapes(profileId);
    }
  }, [activeTab, profileId]);
  // Загрузка данных карты
  const filterByRoom = (arr, roomId) =>
    arr.filter((el) => el.room === roomId || (roomId === 0 && !el.room));

  const loadMapData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Загрузка данных карты, комнат и фигур...');

      const [mapRes, roomsRes, shapesRes] = await Promise.all([
        fetchMap(mapId),
        fetchRooms(mapId),
        fetchShapes(mapId),
      ]);

      if (!mapRes.data || !roomsRes.data || !shapesRes.data) {
        throw new Error('Неполные данные с сервера');
      }

      const rooms = Array.isArray(roomsRes.data) ? roomsRes.data : [];
      const mapInfo = mapRes.data;
      const allShapesRaw = shapesRes.data || [];

      setMapData(mapInfo);
      setRooms(rooms);
      setAllShapes(allShapesRaw);

      if (mapInfo.full_card_map_image) {
        setMainRoom({
          id: 0,
          name: 'Главная карта',
          background_image: mapInfo.full_card_map_image,
        });
      }

      let activeRoom = null;
      if (mapInfo.last_opened_room_id) {
        const roomRes = await fetchRoom(mapInfo.last_opened_room_id);
        if (roomRes?.data) {
          activeRoom = roomRes.data;
          setCurrentRoom(activeRoom);
        }
      }

      const roomId = activeRoom?.id ?? 0;

      console.log('Загрузка предметов и POI для всей карты...');

      const [itemInstancesRes, poiRes] = await Promise.all([
        fetchItemInstances(mapId),
        fetchPointsOfInterest(mapId),
      ]);

      const allItemsRaw = itemInstancesRes.data || [];
      const allPOIsRaw = poiRes.data || [];

      setAllItems(allItemsRaw);
      setAllPOIs(allPOIsRaw);

      setShapes(filterByRoom(allShapesRaw, roomId));
      setItems(filterByRoom(allItemsRaw, roomId));
      setPointsOfInterest(filterByRoom(allPOIsRaw, roomId));

      console.log('✅ Данные карты загружены полностью');
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
  }, [
    mapId,
    setLoading,
    setError,
    setMapData,
    setRooms,
    setMainRoom,
    setCurrentRoom,
    setAllShapes,
    setShapes,
    setAllItems,
    setItems,
    setAllPOIs,
    setPointsOfInterest,
  ]);
  useEffect(() => {
    if (mapId) {
      loadMapData();
    }
  }, [mapId, loadMapData]);
  useEffect(() => {
    const invalids = shapes.filter((s) => !validateNumber(s.id));
    if (invalids.length) {
      console.warn(
        '❌ В списке shapes есть фигуры без валидного ID:',
        invalids
      );
    }
  }, [shapes]);
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
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);
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
      movementLocks,
      setTurnOrder,
      setCurrentTurnShapeId,
      setRooms,
      setCurrentRoom,
      setItems,
      setAllItems,
      setAllShapes,
      currentRoomRef,
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
      // 🔍 Валидация входных данных
      if (
        !validateObject(updatedShape) ||
        typeof updatedShape.id !== 'number' ||
        !validateNumber(updatedShape.x) ||
        !validateNumber(updatedShape.y)
      ) {
        console.warn(
          '🚫 Невалидные данные для перетаскивания фигуры:',
          updatedShape
        );
        return;
      }

      const shapeId = updatedShape.id;

      // 🔐 Блокировка обновления фигуры
      lockShape(shapeId);

      // ⚡ Обновление локального состояния
      setShapes((prev) =>
        Array.isArray(prev)
          ? prev.map((shape) =>
              shape.id === shapeId
                ? { ...shape, x: updatedShape.x, y: updatedShape.y }
                : shape
            )
          : prev
      );

      // 📡 Отправка обновления по WebSocket
      if (isSocketReady && socket?.readyState === WebSocket.OPEN) {
        const payload = {
          action: 'move',
          payload: {
            id: shapeId,
            x: updatedShape.x,
            y: updatedShape.y,
            map_id: Number(mapId),
          },
        };

        try {
          safeSocketSend(socket, payload);
        } catch (err) {
          console.error('❌ Ошибка отправки движения через WebSocket:', err);
        }
      } else {
        console.warn('⚠️ Сокет не готов для отправки движения');
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

        // 👉 Обновляем локально
        setCurrentRoom(room);
        setShapes(filterByRoom(allShapes, room.id));
        console.log(
          '🔄 currentRoomRef.current.id =',
          currentRoomRef.current?.id
        );
        console.log('🆕 newShape.room =', newShape.room);
        setItems(
          allItems.filter(
            (i) => i.room === room.id || (room.id === 0 && !i.room)
          )
        );
        setPointsOfInterest(
          allPOIs.filter(
            (p) => p.room === room.id || (room.id === 0 && !p.room)
          )
        );

        // 👉 Сохраняем на сервере
        await updateRoomId(mapId, room.id);

        // 👉 Отправляем через WebSocket
        if (socket && socket.readyState === WebSocket.OPEN) {
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

          console.log('📤 Отправлено переключение комнаты:', room);
        }
      } catch (err) {
        console.error('Ошибка обновления комнаты:', err);
        alert(`Ошибка: ${err.message}`);
      }
    },
    [mapId, rooms, socket]
  );
  useEffect(() => {
    if (!currentRoom) return;
    const roomId = currentRoom.id;

    const filtered = allItems.filter(
      (i) => i.room === roomId || (roomId === 0 && !i.room)
    );
    setItems(filtered);
  }, [currentRoom, allItems]);
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

  const getMasterShapes = async (profileId) => {
    try {
      const { data } = await getPlayerEntities(profileId);
      console.log('👤 Мастерские фигуры:', data);
      return setPlayerShapes(data);
    } catch (error) {
      console.error('❌ Ошибка при получении фигур мастера:', error);
      return [];
    }
  };

  const handleAddRoom = async (formData) => {
    console.log('formData instanceof FormData:', formData instanceof FormData); // ✅ Проверка

    try {
      const { data } = await createRoom(mapId, formData);
      if (data && data.id) {
        setRooms((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error('Ошибка создания комнаты:', err);
      alert(`Ошибка: ${err.message}`);
    }
  };
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
  const handleDragOver = (e) => {
    e.preventDefault();
    console.log('Объект над DOM-обёрткой карты');
  };
  const saveItemPosition = async (itemId, x, y) => {
    try {
      await updateItemPosition(itemId, x, y);
      console.log(`Позиция предмета ${itemId} сохранена: x=${x}, y=${y}`);
      // здесь можешь перезагрузить предметы или сразу добавить item на карту
    } catch (err) {
      console.error('Ошибка при сохранении позиции предмета:', err);
    }
  };
  const handleDeletePOI = async (poiId) => {
    try {
      await deletePointOfInterest(poiId);
      setPointsOfInterest((prev) => prev.filter((p) => p.id !== poiId));
      setSelectedPOI(null);
      console.log(`✅ POI ${poiId} успешно удалён`);
    } catch (err) {
      console.error('❌ Ошибка при удалении POI:', err);
      alert('Не удалось удалить точку интереса');
    }
  };
  const handleDrop = async (e) => {
    e.preventDefault();

    console.log('Drop сработал на DOM-обёртке карты');

    const wrapperRect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - wrapperRect.left;
    const relativeY = e.clientY - wrapperRect.top;
    const stageX = (relativeX - position.x) / scale;
    const stageY = (relativeY - position.y) / scale;

    // === 🔥 Проверка: если файл (изображение) ===
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFile = files[0];
      if (imageFile.type.startsWith('image/')) {
        await handleCreateShapeFromImage(imageFile, stageX, stageY);
        return;
      }
    }

    // === 🧩 Иначе — обычные json-данные ===
    const droppedData = e.dataTransfer.getData('application/json');
    if (!droppedData) {
      console.warn('Нет данных в dataTransfer');
      return;
    }

    let droppedObject;
    try {
      droppedObject = JSON.parse(droppedData);
    } catch (err) {
      console.warn('Ошибка парсинга JSON в droppedData', droppedData);
      return;
    }

    if (!droppedObject.type) {
      console.warn('Тип объекта не указан в droppedData', droppedObject);
      return;
    }

    console.log(
      `Drop объект типа ${droppedObject.type} на x=${stageX}, y=${stageY}`
    );

    if (droppedObject.type === 'item') {
      await handleDropItem(droppedObject, stageX, stageY);
    } else if (droppedObject.type === 'poi') {
      await handleDropPOI(droppedObject, stageX, stageY);
    } else if (droppedObject.type === 'shape') {
      if (!droppedObject?.id || isNaN(droppedObject.id)) {
        console.warn(
          '🚫 Попытка переместить фигуру без корректного ID:',
          droppedObject
        );
        return;
      }

      await handleDropShape(droppedObject, stageX, stageY);
    } else {
      console.warn('Неизвестный тип объекта:', droppedObject.type);
    }
  };
  const handleDropShape = async (shape, x, y) => {
    try {
      const res = await cloneShape(
        shape.id,
        mapId,
        x,
        y,
        currentRoom?.id || null
      );

      const createdClone = res.data;

      if (!createdClone?.id || typeof createdClone.id !== 'number') {
        console.warn('❌ Сервер вернул фигуру без валидного ID:', createdClone);
        return;
      }

      setShapes((prev) => {
        const filtered = prev.filter(
          (s) => validateNumber(s.id) && s.id !== createdClone.id
        );
        return [...filtered, createdClone];
      });

      console.log('✅ Клон фигуры создан и добавлен:', createdClone);
    } catch (err) {
      console.error('❌ Ошибка при создании клона фигуры:', err);
    }
  };
  const currentRoomRef = useRef(null);

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);
  const handleDropItem = async (item, x, y) => {
    try {
      const res = await createItemInstance({
        item: item.id,
        map: mapId,
        room: currentRoom?.id ?? 0, // 👈 безопасно
        x,
        y,
        quantity: 1,
        is_hidden: false,
      });

      console.log('Экземпляр предмета успешно создан:', res.data);
    } catch (err) {
      console.error('Ошибка при создании экземпляра предмета:', err);
    }
  };
  const handleDropPOI = async (poiTemplate, x, y) => {
    try {
      const res = await createPointOfInterest({
        ...poiTemplate,
        x,
        y,
        room: currentRoom?.id || null,
      });

      const createdPOI = res.data;

      setPointsOfInterest((prev) => [...prev, createdPOI]);
      setEditingPOI(createdPOI); // 👈 открываем редактор
      setIsPOIModalOpen(true); // 👈 открываем модалку
    } catch (err) {
      console.error('Ошибка создания POI:', err.response?.data || err.message);
    }
  };
  const handleCreateShapeFromImage = async (file, x, y) => {
    try {
      const response = await createShapeFromImage(
        file,
        x,
        y,
        mapId,
        profileId,
        currentRoom?.id ?? 0 // 👈 добавлено
      );
      console.log('✅ Фигура создана:', response.data);
    } catch (err) {
      console.error('❌ Ошибка при создании фигуры:', err);
      alert('Не удалось создать фигуру из изображения');
    }
  };

  const handleEditPOI = (poi) => {
    setEditingPOI(poi);
    setIsPOIModalOpen(true);
  };
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
      <div
        className="map-stage-wrapper"
        onDragOver={(e) => handleDragOver(e)}
        onDrop={(e) => handleDrop(e)}
        style={{ width: '100%', height: '100%' }}
      >
        <MapStage
          scale={scale}
          position={position}
          setPosition={setPosition}
          itemInstances={items}
          setScale={setScale}
          shapes={shapes}
          points={pointsOfInterest}
          room={currentRoom}
          mainRoom={mainRoom}
          onDragShape={handleShapeDragWrapper}
          onDoubleClickShape={handleOpenEditor}
          selectedShape={selectedShape}
          setSelectedShape={setSelectedShape}
          backgroundUrl={backgroundUrl}
          onItemClick={(item) => {
            setSelectedItemInstance(item);
            setActiveTab('item');
          }}
          onPointClick={(poi) => {
            setSelectedPOI(poi);
            setActiveTab('poi_manage');
          }}
          onSelectShape={(shape) => {
            setSelectedShape(shape);
            setActiveTab('shape'); // 👈 это нужно!
          }}
          setActiveTab={setActiveTab} // ← ОБЯЗАТЕЛЬНО!
        />
      </div>
      {roomsVisible && (
        <RoomList
          rooms={rooms}
          mainRoom={mainRoom}
          currentRoom={currentRoom}
          onSelect={handleRoomChange}
        />
      )}
      <div className="toolBarBox">
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
          mainRoom={mainRoom}
        />
        <ToolbarContent
          activeTab={activeTab}
          mapId={mapId}
          profileId={profileId}
          currentRoom={currentRoom}
          handleRoomChange={handleRoomChange}
          onAddRoomClick={() => setIsModalOpen(true)}
          onInvitePlayers={handleInvitePlayers}
          onResetMap={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          onNextTurn={handleNextTurn}
          onEndSession={handleEndSession}
          selectedItemInstance={selectedItemInstance}
          clearSelectedItemInstance={() => setSelectedItemInstance(null)}
          rooms={rooms}
          mainRoom={mainRoom}
          playerShapes={playerShapes}
          selectedPOI={selectedPOI}
          setSelectedPOI={setSelectedPOI}
          onDeletePOI={handleDeletePOI}
          onEditPOI={handleEditPOI}
          selectedShape={selectedShape} // ✅
          setSelectedShape={setSelectedShape} // ✅
          onEditShape={() => setShowEditor(true)} // ✅
          onDeleteShape={(id) => {
            // Примитивный вариант удаления фигуры
            setShapes((prev) => prev.filter((s) => s.id !== id));
            setSelectedShape(null);
            // TODO: Добавь fetch-запрос DELETE /api/shapes/:id/ если нужно
          }}
        />
      </div>
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleAddRoom} // ✅ КРАСИВО И ЧИСТО
      />
      {isPOIModalOpen && editingPOI && (
        <PointOfInterestModal
          poi={editingPOI}
          onClose={() => {
            setIsPOIModalOpen(false);
            setEditingPOI(null);
          }}
          onSave={(updatedPOI) => {
            setPointsOfInterest((prev) =>
              prev.map((p) => (p.id === updatedPOI.id ? updatedPOI : p))
            );
            setIsPOIModalOpen(false);
            setEditingPOI(null);
          }}
        />
      )}
      <ContextMenu />

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
