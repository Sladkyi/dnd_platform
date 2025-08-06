import React from 'react';

const NotePOI = ({ data, onChange }) => {
  return (
    <div className="poi-content">
      <label>
        Текст заметки:
        <textarea
          value={data.text || ''}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={5}
        />
      </label>
      <label>
        Цвет текста:
        <input
          type="color"
          value={data.color || '#000000'}
          onChange={(e) => onChange({ color: e.target.value })}
        />
      </label>
    </div>
  );
};

export default NotePOI;