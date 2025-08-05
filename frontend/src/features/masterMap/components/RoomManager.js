// components/RoomManager.jsx
import React from 'react';
import RoomList from './RoomList';
import RoomModal from './MasterToolbar/RoomModal';

const RoomManager = ({
  roomsVisible,
  rooms,
  mainRoom,
  currentRoom,
  isModalOpen,
  onSelectRoom,
  onToggleVisibility,
  onAddRoom,
  onDeleteRoom,
  onCloseModal
}) => (
  <>
    {roomsVisible && (
      <RoomList
        rooms={rooms}
        mainRoom={mainRoom}
        currentRoom={currentRoom}
        onSelect={onSelectRoom}
        onDelete={onDeleteRoom}
        onClose={onToggleVisibility}
      />
    )}

    <RoomModal
      isOpen={isModalOpen}
      onClose={onCloseModal}
      onCreate={onAddRoom}
    />
  </>
);

export default RoomManager;