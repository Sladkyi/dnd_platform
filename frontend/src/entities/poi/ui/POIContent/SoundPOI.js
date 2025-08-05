import React from 'react';

const SoundPOI = ({ data, onChange }) => {
  return (
    <div className="poi-content">
      <label>
        ID звука:
        <input
          type="number"
          value={data.sound_id || ''}
          onChange={(e) => onChange({ sound_id: parseInt(e.target.value) })}
        />
      </label>
      <label>
        Громкость:
        <input
          type="range"
          min="0"
          max="100"
          value={data.volume || 50}
          onChange={(e) => onChange({ volume: parseInt(e.target.value) })}
        />
        {data.volume || 50}%
      </label>
      <label>
        Радиус:
        <input
          type="number"
          value={data.radius || 5}
          onChange={(e) => onChange({ radius: parseInt(e.target.value) || 5 })}
          min={1}
          max={20}
        />
      </label>
    </div>
  );
};

export default SoundPOI;