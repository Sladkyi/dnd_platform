import React, { useEffect, useState } from 'react';
import { Layer, Image as KonvaImage } from 'react-konva';

const ShapeLayer = ({
  shapes,
  onDrag,
  onDoubleClickShape,
  selectedShape,
  onSelectShape,
}) => {
  const [images, setImages] = useState([]);

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
          key={shape.id}
          id={String(shape.id)}
          image={images[index]}
          x={shape.x}
          y={shape.y}
          width={(shape.radius || 30) * 2}
          height={(shape.radius || 30) * 2}
          draggable
          shadowColor="#f1c40f"
          shadowBlur={15}
          onClick={() => onSelectShape(shape)}
          onDblClick={() => onDoubleClickShape?.(shape)}
          stroke={selectedShape?.id === shape.id ? 'yellow' : null}
          strokeWidth={selectedShape?.id === shape.id ? 4 : 0}
          onDragEnd={(e) => {
            const updated = {
              ...shape,
              x: e.target.x(),
              y: e.target.y(),
            };
            onDrag(updated);
          }}
        />
      ))}
    </Layer>
  );
};

export default ShapeLayer;
