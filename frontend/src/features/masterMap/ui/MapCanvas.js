import React from 'react';
import MapStage from './MapStage';
import useMapStore from '../store/useMapStore';
import useMapHandlers from '../hooks/useMapHandlers';

const MapCanvas = () => {
  const scale = useMapStore((s) => s.scale);
  const position = useMapStore((s) => s.position);
  const { handleDrop } = useMapHandlers();

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div
      className="map-stage-wrapper"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, position, scale)}
      style={{ width: '100%', height: '100%' }}
    >
      <MapStage />
    </div>
  );
};

export default MapCanvas;
