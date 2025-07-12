// src/hooks/useMapEntities.js
import { useEffect, useState, useCallback } from 'react';
import {
  fetchShapes,
  fetchItemInstances,
  fetchPointsOfInterest,
} from '../services/MapService';

const useMapEntities = (mapId, currentRoom) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allShapes, setAllShapes] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [allPOIs, setAllPOIs] = useState([]);

  const [shapes, setShapes] = useState([]);
  const [items, setItems] = useState([]);
  const [pointsOfInterest, setPointsOfInterest] = useState([]);

  const roomId = currentRoom?.id ?? 0;

  const filterByRoom = useCallback(
    (arr) => {
      return arr.filter(
        (el) => el.room === roomId || (!el.room && roomId === 0)
      );
    },
    [roomId]
  );

  const reloadAll = useCallback(async () => {
    if (!mapId) return;

    try {
      setLoading(true);
      setError(null);

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
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [mapId, filterByRoom]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  useEffect(() => {
    setShapes(filterByRoom(allShapes));
    setItems(filterByRoom(allItems));
    setPointsOfInterest(filterByRoom(allPOIs));
  }, [currentRoom, allShapes, allItems, allPOIs, filterByRoom]);

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
