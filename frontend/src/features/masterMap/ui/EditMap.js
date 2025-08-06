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

  const {
    mapData,
    shapes,
    items,
    rooms,
    mainRoom,
    currentRoom,
    pointsOfInterest,
    players,
    sessionId,
    loading,
    error,
    playerShapes,
    scale,
    position,
    activeTab,
    selectedShape,
    selectedItemInstance,
    selectedPOI,
    editingPOI,
    isPOIModalOpen,
    isItemModalOpen,
    isRoomModalOpen,
    showEditor,
    currentTurnShapeId,
    roomModalSource,
    setShapes,
    setCurrentRoom,
    setPlayers,
    setSessionId,
    setRooms,
    setItems,
    setPointsOfInterest,
    setMapData,
    setScale,
    setPosition,
    setActiveTab,
    setSelectedShape,
    setSelectedItemInstance,
    setSelectedPOI,
    setEditingPOI,
    setIsPOIModalOpen,
    setIsItemModalOpen,
    setIsRoomModalOpen,
    setShowEditor,
    setCurrentTurnShapeId,
    setRoomModalSource,
    setMapId,
  } = useMapStore();

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