import React, { useRef, useEffect, useState } from 'react';
import { Stage } from 'react-konva';
import RoomLayer from './RoomLayer';
import ShapeLayer from './ShapeLayer';
import PlayerPanel from './PlayerPanel';

/**
 * PlayerView — основной визуальный компонент отображения карты и фигуры игрока.
 * Поддерживает:
 * - Click-to-move перемещение
 * - Drag and drop
 * - Актуализацию позиции фигуры
 */
const PlayerView = ({
  shape,
  shapes,
  room,
  scale,
  onShapeMoveLocal,
  onShapeMoveAndSend,
  isMoving = false,
  setIsMoving = () => {},
}) => {
  const [target, setTarget] = useState(null); // Целевая точка движения
  const animationRef = useRef(null); // Ref для cancelAnimationFrame
  const displayShapes = shapes.length ? shapes : [shape]; // Если shapes пуст — отображаем только текущего игрока

  /**
   * Эффект: плавное движение к целевой точке (используется при клике).
   */
  useEffect(() => {
    if (!target || !shape) return;

    const speed = 5; // скорость движения в пикселях за кадр

    const move = () => {
      const dx = target.x - shape.x;
      const dy = target.y - shape.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < speed) {
        // Достигли цели
        onShapeMoveAndSend(target); // Последняя отправка на сервер
        setTarget(null);
        setIsMoving(false);
        return;
      }

      const ratio = speed / dist;
      const newX = shape.x + dx * ratio;
      const newY = shape.y + dy * ratio;

      onShapeMoveLocal({ x: newX, y: newY }); // Отрисовываем локально
      animationRef.current = requestAnimationFrame(move);
    };

    setIsMoving(true);
    animationRef.current = requestAnimationFrame(move);

    return () => cancelAnimationFrame(animationRef.current);
  }, [target, shape, onShapeMoveLocal, onShapeMoveAndSend, setIsMoving]);

  /**
   * Клик по карте — установка цели для движения.
   */
  const handleMapClick = (e) => {
    if (isMoving) return; // если уже двигается — ничего не делаем
    const pos = e.target.getStage().getPointerPosition();
    if (pos) {
      setTarget(pos);
    }
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
        {/* Слой с изображением карты / комнаты */}
        <RoomLayer room={room} />

        {/* Слой с фигурами */}
        <ShapeLayer
          shapes={displayShapes}
          onDragMove={onShapeMoveLocal}
          onDragEnd={onShapeMoveAndSend}
          canDragShape={(s) => s.id === shape.id} // Только свою фигуру можно двигать
        />
      </Stage>

      {/* Нижняя панель игрока */}
      <PlayerPanel shape={shape} isMoving={isMoving} />
    </div>
  );
};

export default PlayerView;
