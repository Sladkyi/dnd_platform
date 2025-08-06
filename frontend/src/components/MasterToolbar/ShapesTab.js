import React from 'react';
import './styles/ShapesTab.css';
import placeholderImage from '../assets/fallback-avatar.jpg';

const ShapesTab = ({ masterShapes = [] }) => {
  const handleDragStart = (e, shape) => {
    if (!shape.id || typeof shape.id !== 'number') {
      console.warn('🚫 Нельзя перетаскивать фигуру без валидного ID:', shape);
      e.preventDefault();
      return;
    }

    const payload = {
      type: 'shape',
      id: shape.id,
      name: shape.name,
    };

    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const validShapes = masterShapes.filter(
    (shape) => typeof shape.id === 'number' && !isNaN(shape.id)
  );

  return (
    <div className="shapes-tab">
      {validShapes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎨</div>
          <p>Пока нет созданных фигур</p>
        </div>
      ) : (
        <div className="shapes-grid">
          {validShapes.map((shape) => (
            <div
              key={shape.id}
              className="shape-card"
              draggable
              onDragStart={(e) => handleDragStart(e, shape)}
            >
              <div className="shape-preview">
                <img
                  src={placeholderImage}
                  alt={shape.name || 'Фигура'}
                  className="shape-img"
                />
              </div>
              <div className="shape-name">{shape.name || 'Без имени'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShapesTab;
