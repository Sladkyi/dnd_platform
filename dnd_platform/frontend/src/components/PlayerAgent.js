// PlayerAgent.jsx — игровой агент игрока
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Circle, Line, Rect } from 'react-konva';
import PlayerPanel from './PlayerPanel';

const PlayerAgent = ({ shape, shapes, room, scale = 1, onShapeMove }) => {
  const [position, setPosition] = useState({
    x: shape?.x || 200,
    y: shape?.y || 200,
  });
  const [target, setTarget] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const animationRef = useRef(null);
  const stageRef = useRef(null);

  // Клик по карте — задать цель перемещения
  const handleClick = (e) => {
    const stage = stageRef.current.getStage();
    const pointer = stage.getPointerPosition();
    const targetPos = {
      x: pointer.x / scale,
      y: pointer.y / scale,
    };
    setTarget(targetPos);
    setIsMoving(true);
  };

  // Движение к цели
  useEffect(() => {
    if (!isMoving || !target) return;

    const move = () => {
      const dx = target.x - position.x;
      const dy = target.y - position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 3;

      if (dist < speed) {
        setPosition(target);
        setTarget(null);
        setIsMoving(false);
        onShapeMove(target);
        return;
      }

      const newPos = {
        x: position.x + (dx / dist) * speed,
        y: position.y + (dy / dist) * speed,
      };
      setPosition(newPos);
      animationRef.current = requestAnimationFrame(move);
    };

    animationRef.current = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animationRef.current);
  }, [target, isMoving, position, onShapeMove]);

  return (
    <div className="player-agent">
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={scale}
        scaleY={scale}
        onClick={handleClick}
        onTap={handleClick}
      >
        <Layer>
          {/* Фон комнаты */}
          <Rect
            x={0}
            y={0}
            width={room?.width || 800}
            height={room?.height || 600}
            fill="#111822"
          />
        </Layer>

        <Layer>
          {/* Все фигуры */}
          {shapes.map((s) => (
            <Circle
              key={s.id}
              x={s.x}
              y={s.y}
              radius={12}
              fill={s.id === shape.id ? '#FF6B6B' : '#7DAFFF'}
              stroke="#ffffff"
              strokeWidth={2}
            />
          ))}

          {/* Путь и цель */}
          {target && (
            <>
              <Line
                points={[position.x, position.y, target.x, target.y]}
                stroke="#FFD166"
                strokeWidth={2}
                dash={[4, 4]}
              />
              <Circle x={target.x} y={target.y} radius={6} fill="#FFD166AA" />
            </>
          )}
        </Layer>
      </Stage>

      <PlayerPanel
        shape={shape}
        position={position}
        isMoving={isMoving}
        targetPosition={target}
      />
    </div>
  );
};

export default PlayerAgent;
