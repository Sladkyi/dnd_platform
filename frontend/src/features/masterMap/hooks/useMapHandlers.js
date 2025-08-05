import { useCallback } from 'react';
import {
  createItemInstance,
  createPointOfInterest,
  cloneShape,
  createShapeFromImage,
} from '../../../services/MapService';
import useMapStore from '../store/useMapStore';

const useMapHandlers = () => {
  const {
    mapId,
    currentRoom,
    profileId,
    setShapes,
    setPointsOfInterest,
    setEditingPOI,
    setIsPOIModalOpen,
  } = useMapStore();

  const handleDrop = useCallback(
    async (e, position, scale) => {
      e.preventDefault();

      const wrapperRect = e.currentTarget.getBoundingClientRect();
      const relativeX = e.clientX - wrapperRect.left;
      const relativeY = e.clientY - wrapperRect.top;
      const stageX = (relativeX - position.x) / scale;
      const stageY = (relativeY - position.y) / scale;

      const droppedData = e.dataTransfer.getData('application/json');
      if (droppedData) {
        let droppedObject;
        try {
          droppedObject = JSON.parse(droppedData);
        } catch {
          return;
        }

        const type = droppedObject.type;

if (type === 'item') {
  const payload = {
    item: droppedObject.id,
    map: mapId,
    room: currentRoom?.id ?? null,  // 👈 лучше null, чем 0
    x: stageX,
    y: stageY,
    quantity: 1,
    is_hidden: false,
  };

  console.log('📦 createItemInstance payload:', payload);

  try {
    const res = await createItemInstance(payload);
    console.log('✅ Ответ от сервера:', res.data);
  } catch (err) {
    console.error('❌ Ошибка создания itemInstance:', err.response?.data || err);
  }
} else if (type === 'poi') {
          const res = await createPointOfInterest({
            ...droppedObject,
            x: stageX,
            y: stageY,
            room: currentRoom?.id || null,
          });

          const created = res.data;
          setPointsOfInterest((prev) => [...prev, created]);
          setEditingPOI(created);
          setIsPOIModalOpen(true);

        } else if (type === 'shape') {
          const res = await cloneShape(
            droppedObject.id,
            mapId,
            stageX,
            stageY,
            currentRoom?.id || null
          );

          const created = res.data;
          setShapes((prev) => [...prev.filter((s) => s.id !== created.id), created]);
        }

        return;
      }

      // Drop image file
      const files = e.dataTransfer.files;
      if (files && files.length > 0 && files[0].type.startsWith('image/')) {
        const file = files[0];
        await createShapeFromImage(file, stageX, stageY, mapId, profileId, currentRoom?.id ?? 0);
        return;
      }

      // Drop image from URL
      const uri = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
      if (uri && uri.startsWith('http')) {
        try {
          const blob = await fetch(uri).then((res) => res.blob());
          const name = uri.split('/').pop().split('?')[0] || 'image.png';
          const file = new File([blob], name, { type: blob.type });
          await createShapeFromImage(file, stageX, stageY, mapId, profileId, currentRoom?.id ?? 0);
        } catch (err) {
          console.warn('Не удалось загрузить картинку по URL:', err);
        }
      }
    },
    [
      mapId,
      currentRoom,
      profileId,
      setShapes,
      setPointsOfInterest,
      setEditingPOI,
      setIsPOIModalOpen,
    ]
  );

  return {
    handleDrop,
  };
};

export default useMapHandlers;
