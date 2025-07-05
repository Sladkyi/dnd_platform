import React, { useEffect, useState } from 'react';
import { Layer, Image as KonvaImage } from 'react-konva';

/**
 * ShapeLayer — слой с фигурами на карте (игроки, NPC и т.п.)
 * Поддерживает:
 * - Drag & Drop
 * - Выделение
 * - Двойной клик
 * - Подсветку выбранной фигуры
 */
const ShapeLayer = ({
  shapes,
  onDragMove,
  onDragStart,
  onDragEnd,
  onDoubleClickShape,
  onSelectShape,
  selectedShape,
  canDragShape,
  handleShapeDrag,
}) => {
  const [images, setImages] = useState([]);

  /**
   * Загружаем изображения для каждой фигуры (один раз при обновлении списка).
   */
  useEffect(() => {
    const loadImages = async () => {
      const loaded = await Promise.all(
        shapes.map((shape) => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.src = shape.image || '/fallback-avatar.jpg';
            img.onload = () => resolve(img);
          });
        })
      );
      setImages(loaded);
    };

    if (shapes.length) loadImages();
  }, [shapes]);

  return (
    <Layer>
      {shapes.map((shape, index) => (
        <KonvaImage
          key={shape.id} // 🔥
          id={String(shape.id)}
          image={images[index]}
          x={shape.x}
          y={shape.y}
          width={(shape.radius || 30) * 2}
          height={(shape.radius || 30) * 2}
          draggable={canDragShape ? canDragShape(shape) : true}
          shadowColor="#f1c40f"
          shadowBlur={15}
          stroke={selectedShape?.id === shape.id ? 'yellow' : null}
          strokeWidth={selectedShape?.id === shape.id ? 4 : 0}
          onClick={() => onSelectShape?.(shape)}
          onDblClick={() => onDoubleClickShape?.(shape)}
          onDragStart={() => onDragStart?.(shape)}
          onDragMove={(e) => {
            const updated = {
              ...shape,
              x: e.target.x(),
              y: e.target.y(),
            };
            onDragMove?.(updated);
          }}
          onDragEnd={(e) => {
            const node = e.target;
            const updated = {
              id: node.id(),
              x: node.x(),
              y: node.y(),
              type: node.attrs.type || 'circle', // или shape.type, если есть
              fill: node.attrs.fill || '#fff', // если используешь fill
              // добавь другие поля, если они нужны для корректного обновления
            };
            onDragEnd?.(updated);
          }}
        />
      ))}
    </Layer>
  );
};

// По умолчанию фигуры можно таскать
ShapeLayer.defaultProps = {
  canDragShape: null,
  onDragMove: null,
  onDragStart: null,
  onDragEnd: null,
  onDoubleClickShape: null,
  onSelectShape: null,
  selectedShape: null,
};

export default ShapeLayer;
