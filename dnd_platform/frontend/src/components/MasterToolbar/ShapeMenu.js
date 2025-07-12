import React from 'react';
import './styles/ShapeMenu.css';

const ShapeMenu = ({ shape, onClose, onEdit, onDelete }) => {
  return (
    <div className="shape-menu">
      <div className="shape-menu-header">{shape.name || 'Без имени'}</div>
      <div className="shape-menu-buttons">
        <button onClick={() => onEdit(shape)}>✏ Редактировать</button>
        <button onClick={() => onDelete(shape.id)}>🗑 Удалить</button>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
};

export default ShapeMenu;
