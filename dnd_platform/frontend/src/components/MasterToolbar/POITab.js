import React from 'react';

const POITab = ({ mapId }) => {
  return (
    <div className="tab-panel">
      <button onClick={() => console.log('Открыть панель POI')}>📋</button>
      <button onClick={() => console.log('Добавить POI', mapId)}>➕</button>
    </div>
  );
};

export default POITab;
