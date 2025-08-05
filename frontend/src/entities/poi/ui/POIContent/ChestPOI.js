import React from 'react';

const ChestPOI = ({ data, onChange }) => {
  return (
    <div className="poi-content">
      <label>
        Тип сундука:
        <select
          value={data.chest_type || 'common'}
          onChange={(e) => onChange({ chest_type: e.target.value })}
        >
          <option value="common">Обычный</option>
          <option value="rare">Редкий</option>
          <option value="epic">Эпический</option>
          <option value="legendary">Легендарный</option>
        </select>
      </label>
      <label>
        ID предмета:
        <input
          type="number"
          value={data.item_id || ''}
          onChange={(e) => onChange({ item_id: parseInt(e.target.value) || '' })}
        />
      </label>
      <label>
        Количество:
        <input
          type="number"
          value={data.quantity || 1}
          onChange={(e) => onChange({ quantity: parseInt(e.target.value) || 1 })}
          min={1}
        />
      </label>
    </div>
  );
};

export default ChestPOI;