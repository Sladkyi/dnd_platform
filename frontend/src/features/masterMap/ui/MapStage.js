import React, { useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import RoomLayer from './RoomLayer';
import ShapeLayer from './ShapeLayer';
import PointLayer from "../../../entities/shape/PointLayer";
import { updateItemPosition} from "../../../services/MapService";
import ItemInstanceLayer from "../../../entities/shape/ItemInstanceLayer";

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
  backgroundUrl,
  itemInstances,
  onItemClick,
  onPointClick,
  setActiveTab,
    setCurrentRoom
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

  const handleDragOver = (e) => {
    console.log('Объект над картой');
    e.evt.preventDefault();
  };

  const handleDrop = (e) => {
    e.evt.preventDefault();

    console.log('Событие drop сработало');

    const droppedData = e.evt.dataTransfer.getData('application/json');
    if (!droppedData) {
      console.warn('Нет данных в dataTransfer');
      return;
    }

    const item = JSON.parse(droppedData);
    console.log('Получен предмет из dataTransfer:', item);

    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();

    console.log('Позиция мыши в canvas:', pointerPosition);

    const stageX = (pointerPosition.x - position.x) / scale;
    const stageY = (pointerPosition.y - position.y) / scale;

    console.log(`Координаты на карте: x=${stageX}, y=${stageY}`);

    if (item && item.id) {
      saveItemPosition(item.id, stageX, stageY);
    }
  };

  const saveItemPosition = async (itemId, x, y) => {
    console.log(
      `Отправка PATCH запроса для itemId: ${itemId} с координатами x=${x}, y=${y}`
    );
    try {
      await updateItemPosition(itemId, x, y);
      console.log(`Позиция предмета ${itemId} успешно сохранена`);
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
      onDragOver={(e) => handleDragOver(e)}
      onDrop={(e) => handleDrop(e)}
    >
      <RoomLayer backgroundUrl={backgroundUrl} />

      {/* Обернуть в Layer */}
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
            setActiveTab('shape'); // 👈 ключевой момент
          }
        }}
        onDragEnd={onDragShape}
      />

      <PointLayer
        points={points}
        onSelectRoom={onSelectRoom}
        onPointClick={onPointClick}
        setCurrentRoom = {setCurrentRoom}
      />
    </Stage>
  );
};

export default MapStage;
