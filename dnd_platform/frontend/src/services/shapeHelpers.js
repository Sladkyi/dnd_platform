// 📁 services/shapeHelpers.js
import { updateShapePosition } from './MapService';

export const handleShapeDrag = async (updatedShape, setShapes) => {
  const shapeDataToSend = {
    id: updatedShape.id,
    x: updatedShape.x,
    y: updatedShape.y,
    fill: updatedShape.fill || '#FFFFFF',
    type: updatedShape.type || 'circle',
    // добавь другие поля при необходимости
  };
  console.log(shapeDataToSend);

  setShapes((prev) =>
    prev.map((s) =>
      s.id === updatedShape.id ? { ...s, ...shapeDataToSend } : s
    )
  );

  await updateShapePosition(updatedShape.id, shapeDataToSend);
};
