// ContextMenu.jsx
import React from 'react';

const ContextMenu = ({ visible, position, onDelete, onClose }) => {
  if (!visible) return null;

  return (
    <div
      className="context-menu"
      style={{ top: position.y, left: position.x }}
    >
      <button onClick={onDelete}>Удалить</button>
      <button onClick={onClose}>Отмена</button>
    </div>
  );
};

export default ContextMenu;
