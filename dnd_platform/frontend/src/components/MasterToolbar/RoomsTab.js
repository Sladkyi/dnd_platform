import React, { useEffect, useState } from 'react';

import { fetchRooms, createRoom } from '../../services/MapService';
import './styles/RoomsTab.css';

const RoomsTab = ({ mapId, currentRoom, onRoomChange }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchRooms(mapId);
      setRooms(response.data || []);
    } catch (err) {
      console.error('Ошибка загрузки комнат:', err);
      setError('Не удалось загрузить комнаты');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mapId) {
      loadRooms();
    }
  }, [mapId]);

  const handleAddRoom = async () => {
    const name = prompt('Введите название новой комнаты:');
    if (!name || name.trim() === '') {
      alert('Название комнаты не может быть пустым');
      return;
    }

    try {
      const response = await createRoom(mapId, { name: name.trim() });
      if (response.data && response.data.id) {
        setRooms((prev) => [...prev, response.data]);
      } else {
        throw new Error('Неверный ответ сервера при создании комнаты');
      }
    } catch (err) {
      console.error('Ошибка создания комнаты:', err);
      alert(`Ошибка: ${err.message}`);
    }
  };

  if (loading) return <div>Загрузка комнат...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="tab-panel">
      <h3>Комнаты</h3>
      <div className="rooms-grid">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`room-card ${currentRoom?.id === room.id ? 'selected' : ''}`}
            onClick={() => onRoomChange(room)}
          >
            <div className="room-thumbnail">
              <img
                src={room.background_image || '/default-room-thumbnail.webp'}
                alt={room.name}
              />
            </div>
            <div className="room-name">{room.name || 'Без названия'}</div>
          </div>
        ))}
        <div className="room-card add-room" onClick={handleAddRoom}>
          <div className="room-thumbnail">➕</div>
          <div className="room-name">Добавить</div>
        </div>
      </div>
    </div>
  );
};

export default RoomsTab;
