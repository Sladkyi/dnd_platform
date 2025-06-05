// MasterToolbar.jsx
import React from 'react';
import { createShape } from '../services/MapService';

const MasterToolbar = ({
  mapTitle,
  shapes,
  setShapes,
  mapId,
  userId,
  onManualEdit,
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

  return (
    <div className="master-toolbar">
      <div className="toolbar-section">
        <h4 className="toolbar-title">
          <span className="japanese-icon">🗻</span> Объекты
        </h4>
        <div className="toolbar-buttons">
          <button className="toolbar-button" onClick={handleAddDummyShape}>
            <span className="japanese-icon">➕</span> Добавить форму
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h4 className="toolbar-title">
          <span className="japanese-icon">🛠️</span> Инструменты
        </h4>
        <div className="toolbar-buttons">
          <button className="toolbar-button">
            <span className="japanese-icon">🔲</span> Скрыть сетку
          </button>
          <button className="toolbar-button">
            <span className="japanese-icon">👁️</span> Режим игрока
          </button>
          <button className="toolbar-button" onClick={onManualEdit}>
            <span className="japanese-icon">✍️</span> Редактировать
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h4 className="toolbar-title">
          <span className="japanese-icon">⚡</span> Действия
        </h4>
        <div className="toolbar-buttons">
          <button className="toolbar-button">
            <span className="japanese-icon">📜</span> Сообщение
          </button>
          <button className="toolbar-button">
            <span className="japanese-icon">🔄</span> Сбросить карту
          </button>
          <button className="toolbar-button danger">
            <span className="japanese-icon">⛩️</span> Завершить сессию
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterToolbar;
