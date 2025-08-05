import axiosInstance from '../app/axiosInstance';

export const fetchMap = (id) => axiosInstance.get(`/maps/${id}/`);
export const fetchRoom = (id) => axiosInstance.get(`/maps/rooms/${id}/`);
export const updateRoomId = (mapId, roomId) =>
  axiosInstance.patch(`/maps/${mapId}/`, { last_opened_room_id: roomId });

export const updateShapePosition = (shapeId, shapeData) =>
  axiosInstance.patch(`/maps/changePosition/${shapeId}/`, {
    shapes: [shapeData],
  });

// export const createShape = (mapId, mapTitle, userId, shapeData) =>
//   axiosInstance.put(`/maps/change/${mapId}/`, {
//     title: mapTitle,
//     user: userId,
//     shapes: [shapeData],
//   });
export const fetchShapeById = (shapeId) => {
  return axiosInstance.get(`/shapes/${shapeId}/`);
};
export const fetchRooms = (mapId) =>
  axiosInstance.get(`/maps/GetRooms/${mapId}/`);

export const fetchMainRoom = (mapId) =>
  axiosInstance.get(`/maps/getMainRoom/${mapId}/`);

// --- Дополнительные функции API ---
export const createShape = (shapeData) => {
  return axiosInstance.post('/shapes/create/', shapeData);
};

export const deleteRoom = (roomId) =>
  axiosInstance.delete(`/maps/rooms/${roomId}/delete/`);

export const fetchShapes = (mapId) => {
  return axiosInstance.get(`/maps/${mapId}/shapes/`);
};

// Создать новую комнату
export const createRoom = (mapId, formData) =>
  axiosInstance.post(`/maps/CreateNewRoom/${mapId}/`, formData);
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

// Получить все заклинания доступные для игрока

export const GetPlayerSpells = (playerId) =>
  axiosInstance.get(`/spells/getByCreator/${playerId}/`);

export const createSpell = (spellData) =>
  axiosInstance.post('/spells/create/', spellData);

// Обновить заклинание
export const updateSpell = (id, spellData) =>
  axiosInstance.put(`/spells/update/${id}/`, spellData);

export const deleteSpellFromServer = (id) => {
  return axiosInstance.delete(`/spells/${id}/delete/`);
};

// Получить все классы, созданные пользователем
export const GetPlayerClasses = (playerId) =>
  axiosInstance.get(`/classes/getByCreator/${playerId}/`);

export const createClass = (classData) =>
  axiosInstance.post('/classes/create/', classData);

export const updateClass = (id, classData) =>
  axiosInstance.put(`/classes/update/${id}/`, classData);

// Получить все расы, созданные пользователем
export const GetPlayerRaces = (playerId) =>
  axiosInstance.get(`/races/getByCreator/${playerId}/`);

export const createRace = (raceData) =>
  axiosInstance.post('/races/create/', raceData);

export const updateRace = (id, raceData) =>
  axiosInstance.put(`/races/update/${id}/`, raceData);

export const createMap = (id, formData) =>
  axiosInstance.post(`/maps/change/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// Получить все предметы, созданные пользователем
export const GetPlayerItems = (playerId) =>
  axiosInstance.get(`/items/getByCreator/${playerId}/`);

export const createItem = (itemData) =>
  axiosInstance.post('/items/create/', itemData);

export const updateItem = (id, itemData) =>
  axiosInstance.put(`/items/update/${id}/`, itemData);

export const deleteClass = (id) =>
  axiosInstance.delete(`/classes/${id}/delete/`);

export const deleteRace = (id) => axiosInstance.delete(`/races/${id}/delete/`);

export const deleteItem = (id) => axiosInstance.delete(`/items/${id}/delete/`);
export const updateItemPosition = (itemId, x, y) => {
  return axiosInstance.patch(`/items/update/${itemId}/`, { x, y });
};
export const GetPlayerAttacks = (ownerId) =>
  axiosInstance.get(`/attacks/getByOwner/${ownerId}/`);

// Создать новую атаку
export const createAttack = (attackData) =>
  axiosInstance.post('/attacks/create/', attackData);

// Обновить атаку по id
export const updateAttack = (id, attackData) =>
  axiosInstance.put(`/attacks/update/${id}/`, attackData);

// Удалить атаку по id
export const deleteAttack = (id) =>
  axiosInstance.delete(`/attacks/${id}/delete/`);

export const fetchSessionPlayers = (sessionId) => {
  return axiosInstance.get(`/sessions/${sessionId}/players/`);
};

export const fetchItems = (mapId) => {
  return axiosInstance.get(`/items/by-map/${mapId}/`);
};

export const createItemInstance = (data) => {
  return axiosInstance.post('/item-instances/', data);
};

// Обновить позицию экземпляра предмета
export const updateItemInstance = (id, data) => {
  return axiosInstance.patch(`/item-instances/${id}/`, data);
};

// Получить все экземпляры предметов для карты
export const getItemInstancesByMap = (mapId) => {
  return axiosInstance.get(`/item-instances/?map=${mapId}`);
};

// Удалить экземпляр предмета
export const deleteItemInstance = (id) => {
  return axiosInstance.delete(`/item-instances/${id}/`);
};
export const fetchItemInstances = (mapId) => {
  return axiosInstance.get(`/item-instances/by-map/${mapId}/`);
};

export const fetchItemInstancesByRoom = (mapId, roomId) => {
  return axiosInstance.get(`/item-instances/by-map/${mapId}/room/${roomId}/`);
};
// Получить все точки интереса для конкретной карты

// Создать точку интереса
export const createPointOfInterest = (data) => {
  return axiosInstance.post('/poi/', data);
};

// Обновить точку интереса
export const updatePointOfInterest = (poiId, formData) =>
  axiosInstance.patch(`/poi/${poiId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Удалить точку интереса
export const deletePointOfInterest = (id) => {
  return axiosInstance.delete(`/poi/${id}/`);
};

export const fetchPointsOfInterest = (mapId, roomId = null) => {
  let url = `/poi/?map=${mapId}`;
  if (roomId) {
    url += `&room=${roomId}`;
  }
  return axiosInstance.get(url);
};

export const getPlayerEntities = (id) => {
  return axiosInstance.get(`/profile/getEntities/${id}/`);
};

export const cloneShape = (shapeId, mapId, x, y, roomId = null) => {
  return axiosInstance.post('/shapes/clone/', {
    shape_id: shapeId,
    map_id: mapId,
    x,
    y,
    room: roomId,
  });
};

export const createShapeFromImage = (file, x, y, mapId, profileId, roomId) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('x', x);
  formData.append('y', y);
  formData.append('map', mapId);
  formData.append('creator', profileId);
  formData.append('room', roomId); // 👈 обязательно
  return axiosInstance.post('/shapes/create/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
