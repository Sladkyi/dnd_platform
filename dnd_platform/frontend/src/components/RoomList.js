import React from 'react';

const RoomList = ({ rooms, currentRoom, mainRoom, onSelect }) => {
  return (
    <div className="side-panel">
      <div className="panel-section rooms-section">
        <div className="section-header">
          <h5>Комнаты</h5>
        </div>
        <div className="rooms-grid">
          {/* Главная карта — первая */}
          {mainRoom && (
            <div
              key="main"
              className={`room-card ${!currentRoom ? 'active' : ''}`}
              onClick={() => onSelect(mainRoom)}
            >
              <img
                src={mainRoom.background_image}
                alt="Главная карта"
                className="room-thumbnail"
              />
              <div className="room-info">
                <h6>Главная карта</h6>
              </div>
            </div>
          )}

          {/* Остальные комнаты */}
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`room-card ${room.id === currentRoom?.id ? 'active' : ''}`}
              onClick={() => onSelect(room)}
            >
              <img
                src={`http://localhost:8000${room.background_image}`}
                alt={room.name}
                className="room-thumbnail"
              />
              <div className="room-info">
                <h6>{room.name}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomList;
