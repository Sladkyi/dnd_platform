import React, { useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import RoomLayer from './RoomLayer';
import ShapeLayer from './ShapeLayer';
import PointLayer from '../../../entities/shape/PointLayer';
import { updateItemPosition } from '../../../services/MapService';
import ItemInstanceLayer from '../../../entities/shape/ItemInstanceLayer';
import useMapStore from '../store/useMapStore';

const MapStage = ({
  shapes,
  points,
  onDragShape,
  onDoubleClickShape,
  selectedShape,
  setSelectedShape,
  onSelectRoom,
  backgroundUrl,
  itemInstances,
  onItemClick,
  onPointClick,
  setActiveTab,
  setCurrentRoom
}) => {
  const scale = useMapStore((s) => s.scale);
  const setScale = useMapStore((s) => s.setScale);
  const position = useMapStore((s) => s.position);

  const setPosition = useMapStore((s) => s.setPosition);
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

  setPosition({
    x: position.x + dx,
    y: position.y + dy,
  });

  setLastMousePos({ x: e.evt.clientX, y: e.evt.clientY });
};

  const handleDrop = (e) => {
    e.evt.preventDefault();

    const droppedData = e.evt.dataTransfer.getData('application/json');
    if (!droppedData) return;

    const item = JSON.parse(droppedData);
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();

    const stageX = (pointerPosition.x - position.x) / scale;
    const stageY = (pointerPosition.y - position.y) / scale;

    if (item && item.id) {
      saveItemPosition(item.id, stageX, stageY);
    }
  };

  const saveItemPosition = async (itemId, x, y) => {
    try {
      await updateItemPosition(itemId, x, y);
    } catch (err) {
      console.error('Ошибка при сохранении позиции предмета:', err);
    }
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
      onDragOver={(e) => e.evt.preventDefault()}
      onDrop={(e) => handleDrop(e)}
    >
      <RoomLayer backgroundUrl={backgroundUrl} />

      <Layer>
        <ItemInstanceLayer
          itemInstances={itemInstances}
          onItemClick={onItemClick}
        />
      </Layer>

      <ShapeLayer
        shapes={shapes}
        onDrag={onDragShape}
        onDoubleClickShape={onDoubleClickShape}
        selectedShape={selectedShape}
        onSelectShape={(shape) => {
          if (selectedShape?.id === shape.id) {
            setSelectedShape(null);
            setActiveTab(null);
          } else {
            setSelectedShape(shape);
            setActiveTab('shape');
          }
        }}
        onDragEnd={onDragShape}
      />

      <PointLayer
        points={points}
        onSelectRoom={onSelectRoom}
        onPointClick={onPointClick}
        setCurrentRoom={setCurrentRoom}
      />
    </Stage>
  );
};

export default MapStage;
