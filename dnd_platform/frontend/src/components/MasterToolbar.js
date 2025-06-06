// MasterToolbar.jsx
import React, { useState } from 'react';
import { createShape } from '../services/MapService';

const MasterToolbar = ({
  mapTitle,
  shapes,
  setShapes,
  mapId,
  userId,
  onManualEdit,
  onToggleRooms,
  onAddRoom,
  onSendMessage,
  onResetMap,
  onEndSession,
  onInvitePlayers,
}) => {
  const handleAddDummyShape = async () => {
    const shape = {
      type: 'circle',
      x: 200,
      y: 200,
      radius: 30,
      user: userId,
      owner: userId,
      is_clone: false,
    };

    const { data } = await createShape(mapId, mapTitle, userId, shape);
    setShapes(data.shapes);
  };

  const [hideGrid, setHideGrid] = useState(false);
  const [playerMode, setPlayerMode] = useState(false);

  const toggleGrid = () => setHideGrid((prev) => !prev);
  const toggleMode = () => setPlayerMode((prev) => !prev);

  const handleAddRoom = () => {
    if (onAddRoom) onAddRoom();
  };

  const handleSendMessage = () => {
    if (onSendMessage) onSendMessage();
  };

  const handleResetMap = () => {
    if (onResetMap) onResetMap();
  };

  const handleEndSession = () => {
    if (onEndSession) onEndSession();
  };

  const handleInvitePlayers = () => {
    if (onInvitePlayers) onInvitePlayers();
  };

  return (
    <div className="master-toolbar">
      <div className="toolbar-section">
        <h4 className="toolbar-title">
          <span className="japanese-icon">📦</span> Навигация
        </h4>
        <div className="toolbar-buttons">
          <button
            className="toolbar-button"
            onClick={onToggleRooms}
            title="Комнаты"
          >
            <span className="japanese-icon">🏘️</span>
          </button>
          <button
            className="toolbar-button"
            onClick={handleAddRoom}
            title="Добавить комнату"
          >
            <span className="japanese-icon">➕</span>
          </button>
          <button
            className="toolbar-button"
            onClick={toggleGrid}
            title="Скрыть сетку"
          >
            <span className="japanese-icon">{hideGrid ? '🔳' : '🔲'}</span>
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h4 className="toolbar-title">
          <span className="japanese-icon">⚙️</span> Инструменты
        </h4>
        <div className="toolbar-buttons">
          <button
            className="toolbar-button"
            onClick={toggleMode}
            title="Режим мастера/игрока"
          >
            <span className="japanese-icon">{playerMode ? '🎭' : '🛡️'}</span>
          </button>
          <button
            className="toolbar-button"
            onClick={onManualEdit}
            title="Редактировать"
          >
            <span className="japanese-icon">✏️</span>
          </button>
          <button
            className="toolbar-button"
            onClick={handleAddDummyShape}
            title="Добавить объект"
          >
            <span className="japanese-icon">✨</span>
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h4 className="toolbar-title">
          <span className="japanese-icon">⚡</span> Действия
        </h4>
        <div className="toolbar-buttons">
          <button
            className="toolbar-button"
            onClick={handleSendMessage}
            title="Сообщение"
          >
            <span className="japanese-icon">📨</span>
          </button>
          <button
            className="toolbar-button"
            onClick={handleInvitePlayers}
            title="Пригласить игроков"
          >
            <span className="japanese-icon">🔗</span>
          </button>
          <button
            className="toolbar-button"
            onClick={handleResetMap}
            title="Сбросить карту"
          >
            <span className="japanese-icon">🔄</span>
          </button>
          <button
            className="toolbar-button danger"
            onClick={handleEndSession}
            title="Завершить сессию"
          >
            <span className="japanese-icon">⛩️</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterToolbar;
