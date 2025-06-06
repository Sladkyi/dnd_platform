// EditMap.jsx (с поддержкой главной карты, игроков и мастера)
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useMapSocket } from '../hooks/useMapSocket';
import {
  fetchMap,
  fetchRoom,
  fetchRooms,
  createRoom,
  updateRoomId,
  updateShapePosition,
  createSessionURL,
} from '../services/MapService';

import MapStage from './MapStage';
import RoomList from './RoomList';
import MasterToolbar from './MasterToolbar';
import ContextMenu from './ContextMenu';
import PlayerAgent from './PlayerAgent';
import EditingEntity from './EditingEntity/EditingEntity';
import './styles/EditMap.css';

const EditMap = () => {
  const { id } = useParams();
  const location = useLocation();
  const role = location.state?.role;
  const shapeId = location.state?.shapeId;

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

  useEffect(() => {
    const loadData = async () => {
      const response = await fetchMap(id);
      const data = response.data;
      setMapData(data);
      setShapes(data.shapes || []);
      setPointsOfInterest(data.pointsOfInterest || []);

      if (data.full_card_map_image) {
        const syntheticMainRoom = {
          id: 0,
          name: 'Главная карта',
          background_image: data.full_card_map_image,
        };
        setMainRoom(syntheticMainRoom);
      }

      if (data.last_opened_room_id) {
        const roomRes = await fetchRoom(data.last_opened_room_id);
        setCurrentRoom(roomRes.data);
      }

      const roomRes = await fetchRooms(id);
      setRooms(roomRes.data);
    };
    loadData();
  }, [id]);

  useMapSocket(id, (data) => {
    setShapes((prev) =>
      prev.map((s) => (s.id === data.id ? { ...s, ...data } : s))
    );
  });

  const handleRoomChange = async (room) => {
    if (room.id === 0) {
      setCurrentRoom(null);
      return;
    }
    setCurrentRoom(room);
    await updateRoomId(id, room.id);
  };

  const toggleRooms = () => {
    setRoomsVisible((prev) => !prev);
  };

  const handleCreateRoom = async () => {
    const name = prompt('Название новой комнаты:');
    if (!name) return;
    try {
      const { data } = await createRoom(id, { name });
      setRooms((prev) => [...prev, data]);
    } catch (err) {
      console.error('Failed to create room', err);
    }
  };

  const handleSendMessage = () => {
    const message = prompt('Введите сообщение');
    if (message) {
      console.log('Send message:', message);
    }
  };

  const handleResetMap = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleEndSession = () => {
    if (window.confirm('Завершить сессию?')) {
      console.log('Session ended');
    }
  };

  const handleInvitePlayers = async () => {
    try {
      const { data } = await createSessionURL(id, {
        last_opened_room_id: currentRoom ? currentRoom.id : null,
      });
      window.prompt('Ссылка для приглашения игроков', data.join_url);
    } catch (err) {
      console.error('Failed to create session URL', err);
    }
  };

  const handleShapeDrag = async (updatedShape) => {
    console.log('shapeData отправляется:', updatedShape);

    setShapes((prev) =>
      prev.map((s) => (s.id === updatedShape.id ? updatedShape : s))
    );

    // Собираем полный объект, чтобы сервер не ругался
    const shapeDataToSend = {
      id: updatedShape.id,
      x: updatedShape.x,
      y: updatedShape.y,
      fill: updatedShape.fill || '#FFFFFF',
      type: updatedShape.type || 'circle',
      // добавь другие поля, если нужно
    };

    await updateShapePosition(updatedShape.id, shapeDataToSend);
  };

  const handleManualEditShape = () => {
    if (selectedShape) {
      setShowEditor(true);
    }
  };
  const handleShapeDoubleClick = (shape) => {
    setSelectedShape(shape);
    setShowEditor(true);
  };
  const handleEditorClose = () => {
    setShowEditor(false);
    setSelectedShape(null);
  };

  if (!mapData) return <div>Загрузка...</div>;

  if (role === 'player') {
    const shape = shapes.find((s) => String(s.id) === String(shapeId));
    const room = currentRoom || mainRoom;

    return <PlayerAgent shapeId={shapeId} mapId={id} scale={scale} />;
  }

  return (
    <div className="edit-map-container">
      <MapStage
        scale={scale}
        position={position}
        setPosition={setPosition}
        setScale={setScale}
        shapes={shapes}
        points={pointsOfInterest}
        room={currentRoom}
        mainRoom={mainRoom}
        onDragShape={handleShapeDrag}
        onDoubleClickShape={handleShapeDoubleClick}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
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
        mapTitle={mapData.title}
        shapes={shapes}
        setShapes={setShapes}
        mapId={id}
        userId={mapData.user}
        onManualEdit={handleManualEditShape}
        onToggleRooms={toggleRooms}
        onAddRoom={handleCreateRoom}
        onSendMessage={handleSendMessage}
        onInvitePlayers={handleInvitePlayers}
        onResetMap={handleResetMap}
        onEndSession={handleEndSession}
      />

      <ContextMenu />

      <EditingEntity
        isOpen={showEditor}
        closeModal={handleEditorClose}
        selectedShape={selectedShape}
      />
    </div>
  );
};

export default EditMap;
