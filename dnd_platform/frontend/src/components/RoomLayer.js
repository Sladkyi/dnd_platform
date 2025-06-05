import React, { useEffect, useState } from 'react';
import { Layer, Image as KonvaImage } from 'react-konva';

const RoomLayer = ({ room }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!room || !room.background_image) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    const isFullUrl = room.background_image.startsWith('http');
    img.src = isFullUrl
      ? room.background_image
      : `http://localhost:8000${room.background_image}`;

    img.onload = () => setImage(img);
  }, [room]);

  if (!image) return null;

  return (
    <Layer>
      <KonvaImage
        image={image}
        x={0}
        y={0}
        width={image.width}
        height={image.height}
      />
    </Layer>
  );
};

export default RoomLayer;
