import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import RoomLayer from './RoomLayer';
import ShapeLayer from './ShapeLayer';
import PlayerPanel from './PlayerPanel';

const PlayerView = ({ shape, room, scale, onShapeMove, handleShapeDrag }) => {
  const [target, setTarget] = useState(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!target || !shape) return;

    const speed = 2;
    const move = () => {
      const dx = target.x - shape.x;
      const dy = target.y - shape.y;
      const dist = Math.hypot(dx, dy);

      if (dist < speed) {
        onShapeMove({ x: target.x, y: target.y });
        setTarget(null);
        return;
      }

      const newX = shape.x + (dx / dist) * speed;
      const newY = shape.y + (dy / dist) * speed;
      onShapeMove({ x: newX, y: newY });

      animationRef.current = requestAnimationFrame(move);
    };

    animationRef.current = requestAnimationFrame(move);

    return () => cancelAnimationFrame(animationRef.current);
  }, [target, shape, onShapeMove]);

  const handleMapClick = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    if (pos) setTarget(pos);
  };

  return (
    <div className="edit-map-container">
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleMapClick}
      >
        <RoomLayer room={room} />
        <Layer>
          <ShapeLayer shapes={[shape]} onDrag={handleShapeDrag} />
        </Layer>
      </Stage>

      <PlayerPanel shape={shape} />
    </div>
  );
};

export default PlayerView;
