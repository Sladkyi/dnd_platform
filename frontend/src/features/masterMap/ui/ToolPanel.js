import React from 'react';
import MasterToolbar from './MasterToolbar/MasterToolbar';
import ToolbarContent from './MasterToolbar/ToolbarContent';
import useMapStore from '../store/useMapStore';
import useMapActions from '../hooks/useMapActions';

const ToolPanel = () => {
  const mapId = useMapStore((s) => s.mapId);
  const mapTitle = useMapStore((s) => s.mapData?.title || 'Без названия');
  const activeTab = useMapStore((s) => s.activeTab);
  const setActiveTab = useMapStore((s) => s.setActiveTab);
  const selectedShape = useMapStore((s) => s.selectedShape);
  const setSelectedShape = useMapStore((s) => s.setSelectedShape);
  const mainRoom = useMapStore((s) => s.mainRoom);
  const currentRoom = useMapStore((s) => s.currentRoom);
  const rooms = useMapStore((s) => s.rooms);
  const playerShapes = useMapStore((s) => s.playerShapes);
  const selectedPOI = useMapStore((s) => s.selectedPOI);
  const setSelectedPOI = useMapStore((s) => s.setSelectedPOI);
  const setRooms = useMapStore((s) => s.setRooms);
  const setIsRoomModalOpen = useMapStore((s) => s.setIsRoomModalOpen);
  const setShowEditor = useMapStore((s) => s.setShowEditor);
  const setScale = useMapStore((s) => s.setScale);
  const setPosition = useMapStore((s) => s.setPosition);
  const setSessionId = useMapStore((s) => s.setSessionId);
  const setPlayers = useMapStore((s) => s.setPlayers);
  const setPointsOfInterest = useMapStore((s) => s.setPointsOfInterest);
  const setEditingPOI = useMapStore((s) => s.setEditingPOI);
  const setIsPOIModalOpen = useMapStore((s) => s.setIsPOIModalOpen);
  const selectedItemInstance = useMapStore((s) => s.selectedItemInstance);
  const clearSelectedItemInstance = () => useMapStore.setState({ selectedItemInstance: null });
  const setIsItemModalOpen = useMapStore((s) => s.setIsItemModalOpen);
  const setShapes = useMapStore((s) => s.setShapes);

  const { handleRoomChange, handleInvitePlayers } = useMapActions();

  return (
    <div className="toolBarBox">
      <MasterToolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mapId={mapId}
        mapTitle={mapTitle}
        onManualEdit={() => setShowEditor(true)}
        onToggleRooms={() => {}}
        onAddRoom={() => setIsRoomModalOpen(true)}
        onInvitePlayers={handleInvitePlayers}
        onResetMap={() => {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }}
        onEndSession={() => {
          localStorage.removeItem('sessionId');
          setSessionId(null);
          setPlayers([]);
        }}
        onNextTurn={() => {}}
        mainRoom={mainRoom}
      />
      <ToolbarContent
        activeTab={activeTab}
        mapId={mapId}
        profileId={null}
        currentRoom={currentRoom}
        handleRoomChange={handleRoomChange}
        onAddRoomClick={() => setIsRoomModalOpen(true)}
        onAddItemClick={() => setIsItemModalOpen(true)}
        onInvitePlayers={handleInvitePlayers}
        onResetMap={() => {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }}
        onNextTurn={() => {}}
        onEndSession={() => {
          localStorage.removeItem('sessionId');
          setSessionId(null);
          setPlayers([]);
        }}
        selectedItemInstance={selectedItemInstance}
        isManagingRooms={false}
        clearSelectedItemInstance={clearSelectedItemInstance}
        rooms={rooms}
        mainRoom={mainRoom}
        playerShapes={playerShapes}
        selectedPOI={selectedPOI}
        setSelectedPOI={setSelectedPOI}
        onDeletePOI={(poiId) => setPointsOfInterest((prev) => prev.filter((p) => p.id !== poiId))}
        onEditPOI={(poi) => {
          setEditingPOI(poi);
          setIsPOIModalOpen(true);
        }}
        handleDeleteRoom={(id) => {}}
        reloadRooms={() => {}}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        onEditShape={() => setShowEditor(true)}
        onDeleteShape={(id) => setShapes((prev) => prev.filter((s) => s.id !== id))}
        setRooms={setRooms}
      />
    </div>
  );
};

export default ToolPanel;

