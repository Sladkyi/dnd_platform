import React, { useEffect, useState } from 'react';
import RoomModal from "../MasterToolbar/RoomModal";

const PortalPOI = ({ data, onChange, rooms, onCreateNewRoom }) => {
  const [roomModalSource, setRoomModalSource] = useState(null);

  useEffect(() => {
    console.log('🌀 PortalPOI получен data:', data);
  }, [data]);

  return (
    <>
      <label>
        Целевая комната:
        <select
          value={data.target_room || ''}
          onChange={(e) => onChange({ target_room: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">Нет</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={onCreateNewRoom}>
          ➕ Создать комнату
        </button>
      </label>
    </>
  );
};

export default PortalPOI;