import React from 'react';

const HiddenPOI = ({ data, onChange }) => {
  return (
    <div className="poi-content">
      <label>
        Условие обнаружения:
        <select
          value={data.requirement || 'none'}
          onChange={(e) => onChange({ requirement: e.target.value })}
        >
          <option value="none">Нет</option>
          <option value="perception">Восприятие</option>
          <option value="skill">Навык</option>
          <option value="item">Предмет</option>
        </select>
      </label>
      {data.requirement === 'skill' && (
        <label>
          ID навыка:
          <input
            type="number"
            value={data.skill_id || ''}
            onChange={(e) => onChange({ skill_id: parseInt(e.target.value) })}
          />
        </label>
      )}
      {data.requirement === 'item' && (
        <label>
          ID предмета:
          <input
            type="number"
            value={data.item_id || ''}
            onChange={(e) => onChange({ item_id: parseInt(e.target.value) })}
          />
        </label>
      )}
    </div>
  );
};

export default HiddenPOI;