// components/ItemInstanceLayer.js
import React, { useEffect } from 'react';
import { Circle } from 'react-konva';

const ItemInstanceLayer = ({ itemInstances, onItemClick }) => {
  // Логируем предметы один раз при получении
  useEffect(() => {
    console.log('Полученные экземпляры предметов:', itemInstances);
  }, [itemInstances]);

  return (
    <>
      {itemInstances
        .filter((item) => !item.is_taken && !item.is_hidden)
        .map((item) => (
          <Circle
            key={item.id}
            x={item.x}
            y={item.y}
            radius={12}
            fill="red"
            stroke="black"
            strokeWidth={2}
            perfectDrawEnabled={false}
            onClick={() => onItemClick(item)} // ⬅️ Новый обработчик
          />
        ))}
    </>
  );
};

export default ItemInstanceLayer;
