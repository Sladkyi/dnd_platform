import React from 'react';
import MapStage from './MapStage';
import useMapStore from '../store/useMapStore';

const MapCanvas = ({
  shapes,
  items,
  points,
  room,
  mainRoom,
  backgroundUrl,
  onDrop,
  onDragOver,
  onDragShape,
  onDoubleClickShape,
  selectedShape,
  setSelectedShape,
  onItemClick,
  onPointClick,
  onSelectShape,
  setActiveTab,
  handleRoomChange,
}) => {
  const scale = useMapStore((s) => s.scale);
  const setScale = useMapStore((s) => s.setScale);
  const position = useMapStore((s) => s.position);
  const setPosition = useMapStore((s) => s.setPosition);

  return (
    <div
      className="map-stage-wrapper"
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{ width: '100%', height: '100%' }}
    >
      <MapStage

        itemInstances={items}
        shapes={shapes}
        points={points}
        room={room}
        mainRoom={mainRoom}
        backgroundUrl={backgroundUrl}
        onDragShape={onDragShape}
        onDoubleClickShape={onDoubleClickShape}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        onItemClick={onItemClick}
        onPointClick={onPointClick}
        onSelectShape={onSelectShape}
        setActiveTab={setActiveTab}
        setCurrentRoom={handleRoomChange}
      />
    </div>
  );
};

export default MapCanvas;
