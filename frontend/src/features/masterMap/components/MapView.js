// components/MapView.jsx
import React from 'react';
import MapStage from './MapStage';

const MapView = ({
  scale,
  position,
  setPosition,
  items,
  setScale,
  shapes,
  points,
  currentRoom,
  mainRoom,
  backgroundUrl,
  selectedShape,
  onDragShape,
  onDoubleClickShape,
  onItemClick,
  onPointClick,
  onSelectShape,
  setActiveTab,
  setCurrentRoom,
  handleDragOver,
  handleDrop
}) => (
  <div
    className="map-stage-wrapper"
    onDragOver={handleDragOver}
    onDrop={handleDrop}
    style={{ width: '100%', height: '100%' }}
  >
    <MapStage
      scale={scale}
      position={position}
      setPosition={setPosition}
      itemInstances={items}
      setScale={setScale}
      shapes={shapes}
      points={points}
      room={currentRoom}
      mainRoom={mainRoom}
      backgroundUrl={backgroundUrl}
      selectedShape={selectedShape}
      onDragShape={onDragShape}
      onDoubleClickShape={onDoubleClickShape}
      onItemClick={onItemClick}
      onPointClick={onPointClick}
      onSelectShape={onSelectShape}
      setActiveTab={setActiveTab}
      setCurrentRoom={setCurrentRoom}
    />
  </div>
);

export default MapView;