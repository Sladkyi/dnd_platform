import React from 'react';
import { Stage } from 'react-konva';
import RoomLayer from './RoomLayer';
import ShapeLayer from './ShapeLayer';
import PlayerPanel from './PlayerPanel';

const PlayerView = ({
  shape,
  shapes,
  room,
  scale,
  position,
  setPosition,
  setScale,
  onShapeMoveAndSend,
  isMoving,
}) => {
  const handleMapClick = (e) => {
    if (isMoving) return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(pointer);

    if (pos) {
      onShapeMoveAndSend(pos);
    }
  };

  return (
    <div className="edit-map-container">
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
        onMouseDown={handleMapClick}
      >
        <RoomLayer room={room} />
        <ShapeLayer
          shapes={shapes}
          onDragMove={() => {}}
          onDragEnd={(pos) => onShapeMoveAndSend(pos)}
          canDragShape={(s) => s.id === shape.id}
        />
      </Stage>
      <PlayerPanel shape={shape} isMoving={isMoving} />
    </div>
  );
};

export default PlayerView;
