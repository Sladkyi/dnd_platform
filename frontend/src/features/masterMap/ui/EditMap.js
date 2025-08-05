import React, {useEffect} from 'react';
import { useParams, useLocation } from 'react-router-dom';
import useMapHandlers from "../hooks/useMapHandlers";
import useMapActions from "../hooks/useMapActions";
import MapCanvas from "./MapCanvas";
import ToolPanel from "./ToolPanel";
import ModalLayer from "./ModalLayer";
import PlayerSessionInfo from "./PlayerSessionInfo";
import PlayerAgent from "../../playerMap/ui/PlayerAgent";
import useMapStore from '../store/useMapStore';
import '../../../shared/styles/EditMap.css';
import {initializeEditor} from "../lib/initializeEditor";

const EditMap = () => {
  const { id: mapId } = useParams();
  const location = useLocation();
  const profileId = location.state?.profileId;
  const role = location.state?.role;
  const shapeId = location.state?.shapeId;

  const mapData = useMapStore((s) => s.mapData);
  const shapes = useMapStore((s) => s.shapes);
  const items = useMapStore((s) => s.items);
  const rooms = useMapStore((s) => s.rooms);
  const mainRoom = useMapStore((s) => s.mainRoom);
  const currentRoom = useMapStore((s) => s.currentRoom);
  const pointsOfInterest = useMapStore((s) => s.pointsOfInterest);
  const players = useMapStore((s) => s.players);
  const sessionId = useMapStore((s) => s.sessionId);
  const loading = useMapStore((s) => s.loading);
  const error = useMapStore((s) => s.error);
  const playerShapes = useMapStore((s) => s.playerShapes);

  const scale = useMapStore((s) => s.scale);
  const position = useMapStore((s) => s.position);
  const activeTab = useMapStore((s) => s.activeTab);
  const selectedShape = useMapStore((s) => s.selectedShape);
  const selectedItemInstance = useMapStore((s) => s.selectedItemInstance);
  const selectedPOI = useMapStore((s) => s.selectedPOI);
  const editingPOI = useMapStore((s) => s.editingPOI);
  const isPOIModalOpen = useMapStore((s) => s.isPOIModalOpen);
  const isItemModalOpen = useMapStore((s) => s.isItemModalOpen);
  const isRoomModalOpen = useMapStore((s) => s.isRoomModalOpen);
  const showEditor = useMapStore((s) => s.showEditor);
  const currentTurnShapeId = useMapStore((s) => s.currentTurnShapeId);
  const roomModalSource = useMapStore((s) => s.roomModalSource);

  const setShapes = useMapStore((s) => s.setShapes);
  const setCurrentRoom = useMapStore((s) => s.setCurrentRoom);
  const setPlayers = useMapStore((s) => s.setPlayers);
  const setSessionId = useMapStore((s) => s.setSessionId);
  const setRooms = useMapStore((s) => s.setRooms);
  const setItems = useMapStore((s) => s.setItems);
  const setPointsOfInterest = useMapStore((s) => s.setPointsOfInterest);
  const setMapData = useMapStore((s) => s.setMapData);
  const setScale = useMapStore((s) => s.setScale);
  const setPosition = useMapStore((s) => s.setPosition);
  const setActiveTab = useMapStore((s) => s.setActiveTab);
  const setSelectedShape = useMapStore((s) => s.setSelectedShape);
  const setSelectedItemInstance = useMapStore((s) => s.setSelectedItemInstance);
  const setSelectedPOI = useMapStore((s) => s.setSelectedPOI);
  const setEditingPOI = useMapStore((s) => s.setEditingPOI);
  const setIsPOIModalOpen = useMapStore((s) => s.setIsPOIModalOpen);
  const setIsItemModalOpen = useMapStore((s) => s.setIsItemModalOpen);
  const setIsRoomModalOpen = useMapStore((s) => s.setIsRoomModalOpen);
  const setShowEditor = useMapStore((s) => s.setShowEditor);
  const setCurrentTurnShapeId = useMapStore((s) => s.setCurrentTurnShapeId);
  const setRoomModalSource = useMapStore((s) => s.setRoomModalSource);
  const setMapId = useMapStore((s) => s.setMapId);
  const backgroundUrl = currentRoom?.background_image || mainRoom?.background_image || '';

  const { handleDrop } = useMapHandlers({
    mapId,
    currentRoom,
    profileId,
    setShapes,
    setPointsOfInterest,
    setEditingPOI,
    setIsPOIModalOpen,
  });



  useEffect(() => {
    if (mapId) {
      setMapId(parseInt(mapId, 10));
    }


}, [mapId]);
  useEffect(() => {
    initializeEditor(mapId, profileId).then(() => {
      console.log('Редактор инициализирован');
    });
  }, [mapId, profileId]);


  const { handleRoomChange, handleAddRoom, handleInvitePlayers } = useMapActions({
    mapId,
    currentRoom,
    allShapes: shapes,
    allItems: items,
    allPOIs: pointsOfInterest,
    socket: null,
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
  });

  const handleDragOver = (e) => e.preventDefault();

  if (loading) return <div className="loading">Загрузка карты...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!mapData) return <div className="error">Нет данных карты</div>;

  if (role === 'player') {
    return <PlayerAgent shapeId={shapeId} mapId={mapId} scale={scale} />;
  }

  return (
    <div className="edit-map-container">
      <PlayerSessionInfo
        sessionId={sessionId}
        players={players}
        currentTurnShapeId={currentTurnShapeId}
      />

      <MapCanvas

        shapes={shapes}
        items={items}
        points={pointsOfInterest}
        room={currentRoom}
        mainRoom={mainRoom}
        backgroundUrl={backgroundUrl}
        onDrop={(e) => handleDrop(e, position, scale)}
        onDragOver={handleDragOver}
        onDragShape={() => {}}
        onDoubleClickShape={() => setShowEditor(true)}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
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
          setActiveTab('shape');
        }}
        setActiveTab={setActiveTab}
        handleRoomChange={handleRoomChange}
      />

      <ToolPanel
        mapId={mapId}
        mapTitle={mapData.title || 'Без названия'}
        handleInvitePlayers={handleInvitePlayers}
        handleRoomChange={handleRoomChange}
      />


      <ModalLayer
        isRoomModalOpen={isRoomModalOpen}
        closeRoomModal={() => setIsRoomModalOpen(false)}
        handleAddRoom={handleAddRoom}
        isPOIModalOpen={isPOIModalOpen}
        editingPOI={editingPOI}
        closePOIModal={() => {
          setIsPOIModalOpen(false);
          setEditingPOI(null);
        }}
        savePOI={(updatedPOI) => {
          setPointsOfInterest((prev) =>
            prev.map((p) => (p.id === updatedPOI.id ? updatedPOI : p))
          );
          setIsPOIModalOpen(false);
          setEditingPOI(null);
        }}
        createNewRoomFromPOI={() => {
          setIsPOIModalOpen(false);
          setEditingPOI((prev) => prev);
          setRoomModalSource('portal-poi');
          setIsRoomModalOpen(true);
        }}
        rooms={rooms}
        isItemModalOpen={isItemModalOpen}
        closeItemModal={() => setIsItemModalOpen(false)}
        showEditor={showEditor}
        selectedShape={selectedShape}
        closeEditor={() => {
          setShowEditor(false);
          setSelectedShape(null);
        }}
        profileId={profileId}
      />
    </div>
  );
};

export default EditMap;