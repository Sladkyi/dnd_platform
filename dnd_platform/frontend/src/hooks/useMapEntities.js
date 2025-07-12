import { useEffect, useState, useCallback } from 'react';
import {
  fetchShapes,
  fetchItemInstances,
  fetchPointsOfInterest,
  fetchMap,
  fetchRooms,
  fetchRoom,
} from '../services/MapService';

const useMapEntities = (
  mapId,
  currentRoom,
  rooms,
  mainRoom,
  setRooms,
  setMainRoom,
  setCurrentRoom
) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [allShapes, setAllShapes] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [allPOIs, setAllPOIs] = useState([]);

  const [shapes, setShapes] = useState([]);
  const [items, setItems] = useState([]);
  const [pointsOfInterest, setPointsOfInterest] = useState([]);

  const roomId = currentRoom?.id ?? 0;

  const filterByRoom = useCallback(
    (arr) =>
      arr.filter((el) => el.room === roomId || (!el.room && roomId === 0)),
    [roomId]
  );

  const reloadAll = useCallback(async () => {
    if (!mapId) return;

    try {
      setLoading(true);
      setError(null);

      console.log(`🗺 Загрузка карты и комнат (mapId=${mapId})...`);

      const [mapRes, roomsRes] = await Promise.all([
        fetchMap(mapId),
        fetchRooms(mapId),
      ]);

      const mapInfo = mapRes.data;
      const roomList = Array.isArray(roomsRes.data) ? roomsRes.data : [];

      setRooms(roomList);

      if (mapInfo.full_card_map_image) {
        setMainRoom({
          id: 0,
          name: 'Главная карта',
          background_image: mapInfo.full_card_map_image,
        });
      }

      if (mapInfo.last_opened_room_id) {
        const roomRes = await fetchRoom(mapInfo.last_opened_room_id);
        if (roomRes?.data) {
          setCurrentRoom((prev) =>
            prev?.id === roomRes.data.id ? prev : roomRes.data
          );
        }
      }

      console.log(`🔄 Загрузка всех сущностей для карты ${mapId}...`);

      const [shapesRes, itemsRes, poiRes] = await Promise.all([
        fetchShapes(mapId),
        fetchItemInstances(mapId),
        fetchPointsOfInterest(mapId),
      ]);

      const newShapes = shapesRes.data || [];
      const newItems = itemsRes.data || [];
      const newPOIs = poiRes.data || [];

      setAllShapes(newShapes);
      setAllItems(newItems);
      setAllPOIs(newPOIs);

      setShapes(filterByRoom(newShapes));
      setItems(filterByRoom(newItems));
      setPointsOfInterest(filterByRoom(newPOIs));
    } catch (err) {
      console.error('❌ Ошибка при загрузке данных карты:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [mapId, filterByRoom, setRooms, setMainRoom, setCurrentRoom]);

  useEffect(() => {
    if (!hasLoadedOnce && mapId) {
      reloadAll().then(() => setHasLoadedOnce(true));
    }
  }, [reloadAll, hasLoadedOnce, mapId]);

  useEffect(() => {
    if (!allItems.length && !allPOIs.length && !allShapes.length) return;
    console.log('🔁 Перефильтровка при смене комнаты');

    setShapes(filterByRoom(allShapes));
    setItems(filterByRoom(allItems));
    setPointsOfInterest(filterByRoom(allPOIs));
  }, [currentRoom?.id, allShapes, allItems, allPOIs, filterByRoom]);

  return {
    loading,
    error,
    shapes,
    items,
    pointsOfInterest,
    allShapes,
    allItems,
    allPOIs,
    setAllShapes,
    setAllItems,
    setAllPOIs,
    setShapes,
    setItems,
    setPointsOfInterest,
    reloadAll,
  };
};

export default useMapEntities;
