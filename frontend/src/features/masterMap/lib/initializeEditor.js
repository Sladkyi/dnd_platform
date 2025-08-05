// src/features/masterMap/lib/initializeEditor.js

import {
  fetchMap,
  fetchRooms,
  fetchShapes,
  fetchItemInstances,
  fetchPointsOfInterest,
  getPlayerEntities,

} from "../../../services/MapService";

import useMapStore from "../store/useMapStore";
import * as res from "framer-motion/m";

export const initializeEditor = async (mapId, profileId) => {
  const {
    setMapData,
    setRooms,
    setCurrentRoom,
    setShapes,
    setItems,
    setPointsOfInterest,
    setPlayerShapes,
    setLoading,
      setItemInstances,
    setError,
  } = useMapStore.getState();

  try {
    setLoading(true);

    const [
      mapRes,
      roomsRes,
      shapesRes,
      itemsRes,
      poiRes,
      playerShapesRes,
    ] = await Promise.all([
      fetchMap(mapId),
      fetchRooms(mapId),
      fetchShapes(mapId),
      fetchItemInstances(mapId),
      fetchPointsOfInterest(mapId),
      profileId ? getPlayerEntities(profileId) : Promise.resolve({ data: [] }),
    ]);
    const itemInstancesRes = await GetItemInstances(mapId);
    setItemInstances(itemInstancesRes.data);
    setMapData(mapRes.data);
    setRooms(roomsRes.data);
    setCurrentRoom(roomsRes.data?.[0] || null); // 👈 первый room — как fallback
    setShapes(shapesRes.data);
    console.log('[init] itemsRes.data:', itemsRes.data);
    setItems(itemsRes.data);
    setPointsOfInterest(poiRes.data);
    setPlayerShapes(playerShapesRes.data);
    setItemInstances(res.data);
  } catch (err) {
    console.error('Ошибка при инициализации редактора:', err);
    setError('Ошибка при инициализации редактора');
  } finally {
    setLoading(false);
  }

};
