import React from 'react';
import { Stage, Layer } from 'react-konva';
import RoomLayer from './RoomLayer';
import ShapeLayer from './ShapeLayer';
import ItemInstanceLayer from './ItemInstanceLayer'; // 👈 подключи слой предметов
import ActionPanel from '../components/ActionPanel/PlayerPanel';

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
  mapData,
  itemInstances, // 👈 получили от родителя
}) => {
  const backgroundUrl =
    room?.background_image || mapData?.full_card_map_image || '';

  const handleWheel = (e) => {
    const scaleBy = 1.1;
    let newScale = scale;
    if (e.evt.deltaY < 0) newScale *= scaleBy;
    else newScale /= scaleBy;
    setScale(Math.min(Math.max(newScale, 0.1), 3));
  };

  const handleMapClick = (e) => {
    if (e.evt.button !== 0) return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(pointer);

    if (pos) {
      onShapeMoveAndSend(pos);
    }
  };

  return (
    <div className="edit-map-container player-view-container">
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
        onWheel={handleWheel}
      >
        <RoomLayer backgroundUrl={backgroundUrl} />
        <Layer>
          <ItemInstanceLayer
            itemInstances={itemInstances}
            onItemClick={() => {}} // у игрока можно оставить пустым
          />
        </Layer>

        <ShapeLayer
          shapes={shapes}
          onDragMove={() => {}}
          onDragEnd={(pos) => onShapeMoveAndSend(pos)}
          canDragShape={(s) => s.id === shape.id}
        />
      </Stage>

      {/* 👇 Панель игрока, прибитая к низу */}
      <ActionPanel shape={shape} isMoving={isMoving} />
    </div>
  );
};

export default PlayerView;
