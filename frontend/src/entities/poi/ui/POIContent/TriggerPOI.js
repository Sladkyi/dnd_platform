import React from 'react';

const TriggerPOI = ({ data, onChange }) => {
  return (
    <div className="poi-content">
      <label>
        Тип триггера:
        <select
          value={data.trigger_type || 'event'}
          onChange={(e) => onChange({ trigger_type: e.target.value })}
        >
          <option value="event">Событие</option>
          <option value="quest">Квест</option>
          <option value="dialogue">Диалог</option>
        </select>
      </label>
      <label>
        ID цели:
        <input
          type="number"
          value={data.target_id || ''}
          onChange={(e) => onChange({ target_id: parseInt(e.target.value) })}
        />
      </label>
    </div>
  );
};

export default TriggerPOI;