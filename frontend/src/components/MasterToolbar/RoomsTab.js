import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import './styles/RoomsTab.css';

const RoomsTab = ({
  mapId,
  rooms,
  currentRoom,
  mainRoom,
  onRoomChange,
  onAddRoomClick,
  isManagingRooms = false,
  onDeleteRoom = () => {}
}) => {
  const handleRoomClick = useCallback((room) => {
    if (!isManagingRooms) {
      onRoomChange(room);
    }
  }, [isManagingRooms, onRoomChange]);

  const handleDeleteClick = useCallback((e, roomId) => {
    e.stopPropagation();
    onDeleteRoom(roomId);
  }, [onDeleteRoom]);

  const getImageUrl = (imagePath) => {
    return imagePath
      ? `${process.env.REACT_APP_API_URL}${imagePath}`
      : '/default-room-thumbnail.webp';
  };

  return (
    <div className="tab-panel">
      <div className="rooms-grid">
        {/* Главная карта */}
        {mainRoom && (
          <div
            key="main-map"
            className={`room-card ${!currentRoom ? 'selected' : ''}`}
            onClick={() => handleRoomClick({ id: 0, ...mainRoom })}
          >
            <div className="room-thumbnail">
              <img
                src={getImageUrl(mainRoom.background_image)}
                alt="Главная карта"
                loading="lazy"
              />
            </div>
            <div className="room-name">Главная карта</div>
          </div>
        )}

        {/* Комнаты */}
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`room-card ${currentRoom?.id === room.id ? 'selected' : ''} ${isManagingRooms ? 'wiggle' : ''}`}
            onClick={() => handleRoomClick(room)}
          >
            <div className="room-thumbnail">
              <img
                src={getImageUrl(room.background_image)}
                alt={room.name}
                loading="lazy"
              />
              {isManagingRooms && (
                <button
                  className="delete-room-btn"
                  onClick={(e) => handleDeleteClick(e, room.id)}
                  aria-label={`Удалить комнату ${room.name}`}
                >
                  🗑
                </button>
              )}
            </div>
            <div className="room-name">{room.name}</div>
          </div>
        ))}

        {/* Добавить комнату */}
        {!isManagingRooms && (
          <div
            className="room-card add-room"
            onClick={onAddRoomClick}
            role="button"
            aria-label="Добавить комнату"
          >
            <div className="room-thumbnail">➕</div>
            <div className="room-name">Добавить</div>
          </div>
        )}
      </div>
    </div>
  );
};

RoomsTab.propTypes = {
  mapId: PropTypes.number,
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      background_image: PropTypes.string,
    })
  ).isRequired,
  currentRoom: PropTypes.shape({
    id: PropTypes.number,
  }),
  mainRoom: PropTypes.shape({
    background_image: PropTypes.string,
  }),
  onRoomChange: PropTypes.func.isRequired,
  onAddRoomClick: PropTypes.func.isRequired,
  isManagingRooms: PropTypes.bool,
  onDeleteRoom: PropTypes.func,
};

RoomsTab.defaultProps = {
  mapId: null,
  currentRoom: null,
  mainRoom: null,
  isManagingRooms: false,
  onDeleteRoom: () => {},
};

export default React.memo(RoomsTab);