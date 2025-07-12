import React from 'react';

const POITab = ({ mapId }) => {
  const handleDragStart = (e) => {
    const poiTemplate = {
      type: 'poi',
      map: mapId,
      title: 'Новая точка',
      description: '',
      icon_type: 'default',
    };

    e.dataTransfer.setData('application/json', JSON.stringify(poiTemplate));
    console.log('Начали перетаскивание POI', poiTemplate);
  };

  return (
    <div className="tab-panel">
      <button onClick={() => console.log('Открыть панель POI')}>📋</button>
      <div
        className="poi-drag-item"
        draggable
        onDragStart={handleDragStart}
        title="Перетащи, чтобы создать точку"
      >
        ✦
      </div>
    </div>
  );
};

export default POITab;
