// EditMap.jsx (с поддержкой главной карты и вызовом EditingEntity)
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Stage } from 'react-konva';
import { useMapSocket } from '../hooks/useMapSocket';
import {
  fetchMap,
  fetchRoom,
  fetchRooms,
  updateRoomId,
  updateShapePosition,
} from '../services/MapService';

import MapStage from './MapStage';
import ShapeLayer from './ShapeLayer';
import RoomLayer from './RoomLayer';
import PointLayer from './PointLayer';
import RoomList from './RoomList';
import MasterToolbar from './MasterToolbar';
import ContextMenu from './ContextMenu';
import PlayerPanel from './PlayerPanel';
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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedShape, setSelectedShape] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // --- Load map data
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

  // --- WebSocket: обновление фигур
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

  const handleShapeDrag = async (updatedShape) => {
    setShapes((prev) =>
      prev.map((s) => (s.id === updatedShape.id ? updatedShape : s))
    );
    await updateShapePosition(updatedShape.id, {
      shapes: [updatedShape],
    });
  };

  const handleManualEditShape = () => {
    if (selectedShape) {
      setShowEditor(true);
    }
  };
  const handleShapeDoubleClick = (shape) => {
    console.log('Double clicked:', shape);
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
    return (
      <div className="edit-map-container">
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          scaleX={scale}
          scaleY={scale}
        >
          <RoomLayer room={currentRoom || mainRoom} />
          <ShapeLayer shapes={[shape]} onDrag={handleShapeDrag} />
        </Stage>
        <PlayerPanel shape={shape} />
      </div>
    );
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
        setSelectedShape={setSelectedShape} // ← вот эта строка важна
      />
      <RoomList
        rooms={rooms}
        mainRoom={mainRoom}
        currentRoom={currentRoom}
        onSelect={handleRoomChange}
      />

      <MasterToolbar
        mapTitle={mapData.title}
        shapes={shapes}
        setShapes={setShapes}
        mapId={id}
        userId={mapData.user}
        onManualEdit={handleManualEditShape}
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
