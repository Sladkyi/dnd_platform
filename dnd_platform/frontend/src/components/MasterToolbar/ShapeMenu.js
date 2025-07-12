import React from 'react';
import './styles/ShapeMenu.css'; // создай стиль при желании

const ShapeMenu = ({ shape, onEdit, onDelete, onClose, setShape }) => {
  if (!shape) return null;

  return (
    <div className="shape-menu">
      {/* <div className="shape-header">
        <h3>{shape.name || 'Без имени'}</h3>
        <button onClick={onClose}>✕</button>
      </div> */}

      <div className="shape-actions">
        <button onClick={() => onEdit?.(shape)}>✏️ Редактировать</button>
        <button onClick={() => onDelete?.(shape.id)}>🗑️ Удалить</button>
      </div>
    </div>
  );
};

export default ShapeMenu;
