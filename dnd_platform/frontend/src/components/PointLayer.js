// PointLayer.jsx
import React from 'react';
import { Layer, Circle } from 'react-konva';

const PointLayer = ({ points, onSelectRoom, onPointClick }) => {
  return (
    <Layer>
      {points.map((point) => (
        <Circle
          key={point.id}
          x={point.x}
          y={point.y}
          radius={point.radius || 30}
          fill="blue"
          opacity={0.4}
          onClick={() => {
            if (onPointClick) onPointClick(point);
          }}
        />
      ))}
    </Layer>
  );
};

export default PointLayer;
