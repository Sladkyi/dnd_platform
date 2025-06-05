import axiosInstance from '../axiosInstance';

export const fetchMap = (id) => axiosInstance.get(`/maps/${id}/`);
export const fetchRoom = (id) => axiosInstance.get(`/maps/rooms/${id}/`);
export const updateRoomId = (mapId, roomId) =>
  axiosInstance.patch(`/maps/${mapId}/`, { last_opened_room_id: roomId });

export const updateShapePosition = (shapeId, data) =>
  axiosInstance.put(`/maps/changePosition/${shapeId}/`, data);

export const createShape = (mapId, mapTitle, userId, shapeData) =>
  axiosInstance.put(`/maps/change/${mapId}/`, {
    title: mapTitle,
    user: userId,
    shapes: [shapeData],
  });

export const fetchRooms = (mapId) =>
  axiosInstance.get(`/maps/GetRooms/${mapId}/`);

export const fetchMainRoom = (mapId) =>
  axiosInstance.get(`/maps/getMainRoom/${mapId}/`);
