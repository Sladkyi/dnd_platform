import React from 'react';
import './styles/RoomsTab.css';

const RoomsTab = ({
  mapId,
  rooms,
  currentRoom,
  mainRoom, // 👈 добавим как проп
  onRoomChange,
  onAddRoomClick,
}) => {
  console.log('главная комната---------', mainRoom);
  return (
    <div className="tab-panel">
      <div className="rooms-grid">
        {/* Главная карта */}
        {mainRoom && (
          <div
            key="main-map"
            className={`room-card ${!currentRoom ? 'selected' : ''}`}
            onClick={() => onRoomChange({ id: 0, ...mainRoom })}
          >
            <div className="room-thumbnail">
              <img
                src={
                  mainRoom.background_image
                    ? `${process.env.REACT_APP_API_URL}${mainRoom.background_image}`
                    : '/default-room-thumbnail.webp'
                }
                alt="Главная карта"
              />
            </div>
            <div className="room-name">Главная карта</div>
          </div>
        )}

        {/* Список комнат */}
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`room-card ${
              currentRoom?.id === room.id ? 'selected' : ''
            }`}
            onClick={() => onRoomChange(room)}
          >
            <div className="room-thumbnail">
              <img
                src={
                  room.background_image
                    ? `${process.env.REACT_APP_API_URL}${room.background_image}`
                    : '/default-room-thumbnail.webp'
                }
                alt={room.name}
              />
            </div>
            <div className="room-name">{room.name}</div>
          </div>
        ))}

        {/* Карточка добавления комнаты */}
        <div className="room-card add-room" onClick={onAddRoomClick}>
          <div className="room-thumbnail">➕</div>
          <div className="room-name">Добавить</div>
        </div>
      </div>
    </div>
  );
};

export default RoomsTab;
