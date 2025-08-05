// hooks/useDropHandlers.js
import { useCallback } from 'react';
import {
  cloneShape,
  createItemInstance,
  createPointOfInterest,
  createShapeFromImage,
} from '../../services/MapService';

const useDropHandlers = ({
  mapId,
  currentRoom,
  profileId,
  setShapes,
  setPointsOfInterest,
  setEditingPOI,
  setIsPOIModalOpen,
}) => {
  const handleDropShape = useCallback(
    async (shape, x, y) => {
      try {
        const res = await cloneShape(
          shape.id,
          mapId,
          x,
          y,
          currentRoom?.id || null
        );
        const created = res.data;
        if (!created?.id) throw new Error('Фигура без ID');

        setShapes((prev) => [
          ...prev.filter((s) => s.id !== created.id),
          created,
        ]);
      } catch (err) {
        console.error('❌ Ошибка клонирования фигуры:', err);
      }
    },
    [mapId, currentRoom, setShapes]
  );

  const handleDropItem = useCallback(
    async (item, x, y) => {
      try {
        await createItemInstance({
          item: item.id,
          map: mapId,
          room: currentRoom?.id ?? 0,
          x,
          y,
          quantity: 1,
          is_hidden: false,
        });
      } catch (err) {
        console.error('❌ Ошибка создания предмета:', err);
      }
    },
    [mapId, currentRoom]
  );

  const handleDropPOI = useCallback(
    async (template, x, y) => {
      try {
        const res = await createPointOfInterest({
          ...template,
          x,
          y,
          room: currentRoom?.id || null,
        });
        const poi = res.data;
        setPointsOfInterest((prev) => [...prev, poi]);
        setEditingPOI(poi);
        setIsPOIModalOpen(true);
      } catch (err) {
        console.error('❌ Ошибка создания POI:', err);
      }
    },
    [currentRoom, setPointsOfInterest, setEditingPOI, setIsPOIModalOpen]
  );

  const handleCreateShapeFromImage = useCallback(
    async (file, x, y) => {
      try {
        await createShapeFromImage(file, x, y, mapId, profileId);
      } catch (err) {
        console.error('❌ Ошибка создания фигуры из изображения:', err);
      }
    },
    [mapId, profileId]
  );

  return {
    handleDropShape,
    handleDropItem,
    handleDropPOI,
    handleCreateShapeFromImage,
  };
};

export default useDropHandlers;
