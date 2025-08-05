import React from 'react';
import './styles/PointMenu.css';

const PointMenu = ({ point, onEditPOI, onDelete, onGoToRoom, onClose }) => {
  return (
    <div className="point-menu">
      <div className="point-menu-header">{point.title || 'Без названия'}</div>
      <div className="point-menu-buttons">
        {point.room && (
          <button onClick={() => onGoToRoom(point.room)}>↪ Перейти</button>
        )}
        <button onClick={() => onEditPOI(point)}>✏ Редактировать</button>
        <button onClick={() => onDelete(point.id)}>🗑 Удалить</button>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
};

export default PointMenu;
