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

// --- Дополнительные функции API ---

// Создать новую комнату
export const createRoom = (mapId, roomData) =>
  axiosInstance.post(`/maps/CreateNewRoom/${mapId}/`, roomData);

// Создать игровой URL / сессию
export const createSessionURL = (mapId, payload) =>
  axiosInstance.post(`/maps/createURL/${mapId}/`, payload);

// Загрузить изображение для фигуры
export const uploadShapeImage = (shapeId, formData) =>
  axiosInstance.post(`/maps/uploadImage/${shapeId}/`, formData);

// Добавить точку интереса
export const addPointOfInterest = (mapId, poiData) =>
  axiosInstance.post(`/maps/PontOfInterest/${mapId}/`, poiData);

// Обновить данные сущности (персонажа)
export const editEntity = (shapeId, data) =>
  axiosInstance.patch(`/maps/entityEditing/${shapeId}/`, data);

// Получить данные сущности (персонажа)
export const fetchEntity = (shapeId) =>
  axiosInstance.get(`/maps/entityEditing/${shapeId}/`);

// Удалить фигуру
export const deleteShape = (shapeId) =>
  axiosInstance.delete(`/maps/changePosition/delete/${shapeId}/`);

// Частичное обновление фигуры
export const updateShapeData = (shapeId, data) =>
  axiosInstance.patch(`/maps/shape/update/${shapeId}/`, data);

// Подключиться к сессии с выбором персонажа
export const joinSessionWithShape = (sessionId, data) =>
  axiosInstance.post(`/maps/joinSessionWithShape/${sessionId}/`, data);

// Получить информацию о сессии или присоединиться
export const joinGame = (sessionId) =>
  axiosInstance.get(`/maps/join/${sessionId}/`);
