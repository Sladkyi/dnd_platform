// MapStage.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import RoomLayer from './RoomLayer';
import ShapeLayer from './ShapeLayer';
import PointLayer from './PointLayer';

const MapStage = ({
  scale,
  position,
  setPosition,
  setScale,
  shapes,
  points,
  room,
  mainRoom,
  onDragShape,
  onDoubleClickShape,
  selectedShape,
  setSelectedShape,
  onSelectRoom,
  backgroundUrl, // 👈 добавь сюда
}) => {
  const stageRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState(null);

  const handleWheel = (e) => {
    const scaleBy = 1.1;
    let newScale = scale;
    if (e.evt.deltaY < 0) newScale *= scaleBy;
    else newScale /= scaleBy;
    setScale(Math.min(Math.max(newScale, 0.1), 3));
  };

  const handleMouseDown = (e) => {
    if (e.evt.button !== 0) return;
    setIsDragging(true);
    setLastMousePos({ x: e.evt.clientX, y: e.evt.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !lastMousePos) return;
    const dx = e.evt.clientX - lastMousePos.x;
    const dy = e.evt.clientY - lastMousePos.y;
    requestAnimationFrame(() => {
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    });
    setLastMousePos({ x: e.evt.clientX, y: e.evt.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastMousePos(null);
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth - 320}
      height={window.innerHeight - 120}
      scaleX={scale}
      scaleY={scale}
      x={position.x}
      y={position.y}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <RoomLayer backgroundUrl={backgroundUrl} />
      <ShapeLayer
        shapes={shapes}
        onDrag={onDragShape}
        onDoubleClickShape={onDoubleClickShape}
        selectedShape={selectedShape}
        onSelectShape={setSelectedShape}
        onDragEnd={onDragShape}
      />

      <PointLayer points={points} onSelectRoom={onSelectRoom} />
    </Stage>
  );
};

export default MapStage;
