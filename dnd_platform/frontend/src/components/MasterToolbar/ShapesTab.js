import React from 'react';
import './styles/ShapesTab.css';

const ShapesTab = ({ playerShapes = [] }) => {
  console.log('фигуры мастера все', playerShapes);
  return (
    <div className="shapes-tab">
      <h3 className="shapes-title">Фигуры мастера</h3>
      <div className="shapes-list">
        {playerShapes.map((shape) => (
          <div key={shape.id} className="shape-card">
            <div className="shape-name">{shape.name || 'Без имени'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShapesTab;
