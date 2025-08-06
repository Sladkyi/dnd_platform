import React from 'react';

const CombatPOI = ({ data, onChange }) => {
  return (
    <div className="poi-content">
      <label>
        ID противника:
        <input
          type="number"
          value={data.enemy_id || ''}
          onChange={(e) => onChange({ enemy_id: parseInt(e.target.value) || '' })}
        />
      </label>
      <label>
        Количество:
        <input
          type="number"
          value={data.count || 1}
          onChange={(e) => onChange({ count: parseInt(e.target.value) || 1 })}
          min={1}
          max={10}
        />
      </label>
      <label>
        Сложность:
        <select
          value={data.difficulty || 'medium'}
          onChange={(e) => onChange({ difficulty: e.target.value })}
        >
          <option value="easy">Лёгкая</option>
          <option value="medium">Средняя</option>
          <option value="hard">Тяжёлая</option>
        </select>
      </label>
    </div>
  );
};

export default CombatPOI;