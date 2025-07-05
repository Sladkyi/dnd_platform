import React, { useEffect, useRef, useState } from 'react';
import { Layer, Image as KonvaImage } from 'react-konva';

const RoomLayer = ({ backgroundUrl }) => {
  const imageRef = useRef(new window.Image());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!backgroundUrl) return;

    const img = imageRef.current;

    const isFullUrl = backgroundUrl.startsWith('http');
    img.crossOrigin = 'anonymous';
    img.src = isFullUrl
      ? backgroundUrl
      : `http://localhost:8000${backgroundUrl}`;

    const handleLoad = () => setIsLoaded(true);
    img.onload = handleLoad;

    return () => {
      img.onload = null; // Чистим обработчик при размонтировании
      setIsLoaded(false);
    };
  }, [backgroundUrl]);

  if (!isLoaded) return null;

  return (
    <Layer>
      <KonvaImage
        image={imageRef.current}
        x={0}
        y={0}
        width={imageRef.current.width}
        height={imageRef.current.height}
      />
    </Layer>
  );
};

export default RoomLayer;
