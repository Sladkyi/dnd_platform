import React from 'react';

const ItemsTab = ({ mapId }) => {
  return (
    <div className="tab-panel">
      <button onClick={() => console.log('Открыть библиотеку предметов')}>
        📚
      </button>
      <button onClick={() => console.log('Клонировать фигуру', mapId)}>
        ⎘
      </button>
    </div>
  );
};

export default ItemsTab;
