import React from 'react';
import { Layer, Circle } from 'react-konva';

const PointLayer = ({ points, onSelectRoom, onPointClick, setCurrentRoom }) => {
  return (
    <Layer>
      {points.map((point) => (
        <Circle
          key={point.id}
          x={point.x}
          y={point.y}
          radius={point.radius || 30}
          fill={point.icon_type === 'portal' ? 'purple' : 'blue'} // Цвет по типу
          opacity={0.4}
onClick={() => {
  if (onPointClick) onPointClick(point);

  if (point.icon_type === 'portal') {
    console.log(`🔮 Портал в комнату ${point.target_room}`);

    if (point.target_room) {
      const confirmed = window.confirm('Перейти в целевую комнату?');
      if (confirmed) {
        setCurrentRoom(point.target_room);

        if (onSelectRoom) {
          const targetRoomObj =
            typeof point.target_room === 'object'
              ? point.target_room
              : points.find(p => p.id === point.target_room);

          if (targetRoomObj) {
            onSelectRoom(targetRoomObj);
          }
        }
      }
    } else {
      alert('⚠️ У портала не указана целевая комната');
    }
  }
}}
        />
      ))}
    </Layer>
  );
};

export default PointLayer;
