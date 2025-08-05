import React, { useEffect, useState, useRef } from 'react';
import { Layer, Image as KonvaImage, Group, Rect } from 'react-konva';

const ShapeLayer = ({
  shapes,
  onDragMove,
  onDragStart,
  onDragEnd,
  onDoubleClickShape,
  onSelectShape,
  selectedShape,
  canDragShape,
}) => {
  const [images, setImages] = useState({});
  const getFullImageUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http')) return path;
    return `${process.env.REACT_APP_API_URL}${path}`;
  };
  useEffect(() => {
    const loadImages = async () => {
      const newImages = {};

      await Promise.all(
        shapes.map((shape) => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.src = getFullImageUrl(shape.image) || '/fallback-avatar.jpg';

            img.onload = () => {
              newImages[shape.id] = img;
              resolve();
            };

            img.onerror = () => {
              console.warn(
                `❌ Ошибка загрузки изображения для shape ${shape.id}`
              );
              newImages[shape.id] = null;
              resolve();
            };
          });
        })
      );

      setImages(newImages);
    };

    if (shapes.length) loadImages();
  }, [shapes]);

  return (
    <Layer>
      {shapes.map((shape) => {
        const isSelected = selectedShape?.id === shape.id;
        const image = images[shape.id];
        const size = (shape.radius || 30) * 2;

        return (
          <Group
            key={shape.id}
            id={String(shape.id)} // 👈 ключ
            attrs={{ type: 'shape' }} // 👈 чтобы было доступно в e.target.attrs.type
            x={shape.x}
            y={shape.y}
            draggable={canDragShape ? canDragShape(shape) : true}
            onClick={() => onSelectShape?.(shape)}
            onTap={() => onSelectShape?.(shape)}
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
                id: Number(node.id()), // 🔥 теперь будет валидный
                x: node.x(),
                y: node.y(),
                type: node.attrs.type || 'shape',
              };
              onDragEnd?.(updated);
            }}
          >
            {image ? (
              <KonvaImage
                image={image}
                width={size}
                height={size}
                offsetX={size / 2}
                offsetY={size / 2}
                opacity={0}
                ref={(ref) => {
                  if (ref) {
                    ref.to({ opacity: 1, duration: 0.3 });
                  }
                }}
                shadowBlur={10}
                shadowColor={isSelected ? 'yellow' : 'black'}
                stroke={isSelected ? 'yellow' : null}
                strokeWidth={isSelected ? 4 : 0}
              />
            ) : (
              <Rect
                width={size}
                height={size}
                offsetX={size / 2}
                offsetY={size / 2}
                fill="#ccc"
                shadowBlur={5}
                cornerRadius={8}
                stroke={isSelected ? 'yellow' : null}
                strokeWidth={isSelected ? 3 : 0}
              />
            )}
          </Group>
        );
      })}
    </Layer>
  );
};

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
