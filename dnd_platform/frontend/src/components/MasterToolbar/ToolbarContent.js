import React from 'react';
import RoomsTab from './RoomsTab';
import ItemsTab from './ItemsTab';
import POITab from './POITab';
import WeatherTab from './WeatherTab';
import PlayersTab from './PlayersTab';
import SessionTab from './SessionTab';
import ItemRedTab from './ItemRedTab';
import PointMenu from './PointMenu'; // 👈 меню для управления POI
import ShapesTab from './ShapesTab';
import ShapeMenu from './ShapeMenu';
const ToolbarContent = ({
  activeTab,
  mapId,
  profileId,
  currentRoom,
  handleRoomChange,
  onAddRoomClick,
  onInvitePlayers,
  onResetMap,
  onNextTurn,
  onEndSession,
  selectedItemInstance,
  clearSelectedItemInstance,
  rooms,
  selectedPOI,
  setSelectedPOI,
  onDeletePOI,
  onEditPOI,
  playerShapes,
  selectedShape,
  setSelectedShape,
  onEditShape,
  onDeleteShape,
  mainRoom,
}) => {
  if (!activeTab) return null;

  return (
    <div className="toolbar-content">
      {activeTab === 'session' && (
        <SessionTab
          onInvitePlayers={onInvitePlayers}
          onResetMap={onResetMap}
          onNextTurn={onNextTurn}
          onEndSession={onEndSession}
        />
      )}

      {activeTab === 'rooms' && (
        <RoomsTab
          mapId={mapId}
          currentRoom={currentRoom}
          onRoomChange={handleRoomChange}
          onAddRoomClick={onAddRoomClick}
          rooms={rooms}
          mainRoom={mainRoom}
        />
      )}

      {activeTab === 'items' && (
        <ItemsTab mapId={mapId} profileId={profileId} />
      )}

      {activeTab === 'poi' && <POITab mapId={mapId} />}

      {activeTab === 'weather' && <WeatherTab />}

      {activeTab === 'players' && <PlayersTab />}
      {activeTab === 'shape' && selectedShape && (
        <ShapeMenu
          shape={selectedShape}
          onEdit={onEditShape}
          onDelete={onDeleteShape}
          onClose={() => setSelectedShape(null)}
          setShape={setSelectedShape}
        />
      )}
      {activeTab === 'shapes' && <ShapesTab masterShapes={playerShapes} />}
      {activeTab === 'item' && selectedItemInstance && (
        <ItemRedTab
          item={selectedItemInstance}
          clearSelectedItemInstance={clearSelectedItemInstance}
        />
      )}

      {activeTab === 'poi_manage' && selectedPOI && (
        <PointMenu
          point={selectedPOI}
          onEditPOI={onEditPOI} // 👈 Новый пропс
          onDelete={onDeletePOI}
          onGoToRoom={(roomId) => {
            handleRoomChange({ id: roomId });
          }}
          onClose={() => setSelectedPOI(null)}
        />
      )}
    </div>
  );
};

export default ToolbarContent;
