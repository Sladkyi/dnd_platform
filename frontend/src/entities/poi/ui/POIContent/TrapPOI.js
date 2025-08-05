import React from 'react';

const TrapPOI = ({ data = {}, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div>
      <label>
        Урон:
        <input
          type="number"
          value={data.damage || ''}
          onChange={(e) => handleChange('damage', parseInt(e.target.value, 10))}
        />
      </label>

      <label>
        Тип урона:
        <select
          value={data.damage_type || ''}
          onChange={(e) => handleChange('damage_type', e.target.value)}
        >
          <option value="">Выбери тип</option>
          <option value="piercing">Колючий</option>
          <option value="fire">Огненный</option>
          <option value="poison">Яд</option>
          <option value="acid">Кислота</option>
        </select>
      </label>
    </div>
  );
};

export default TrapPOI;
