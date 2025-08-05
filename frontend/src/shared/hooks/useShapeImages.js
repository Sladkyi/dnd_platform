import { useEffect, useState } from 'react';

export const useShapeImages = (shapes) => {
  const [images, setImages] = useState({});

  useEffect(() => {
    shapes.forEach((shape) => {
      if (!shape.image || images[shape.id]) return;

      const img = new window.Image();
      img.src = shape.image;
      img.onload = () => {
        setImages((prev) => ({ ...prev, [shape.id]: img }));
      };
      img.onerror = () => {
        console.warn(
          `❌ Не удалось загрузить изображение для shape ${shape.id}`
        );
      };
    });
  }, [shapes, images]);

  return images;
};
