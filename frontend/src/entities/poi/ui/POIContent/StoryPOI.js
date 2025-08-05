import React from 'react';

const StoryPOI = ({ data = {}, onChange }) => {
  const handleChange = (e) => {
    onChange({ ...data, text: e.target.value });
  };

  return (
    <div>
      <label>
        Текст сцены:
        <textarea
          value={data.text || ''}
          onChange={handleChange}
          placeholder="Введите текст, который будет показан игрокам"
        />
      </label>
    </div>
  );
};

export default StoryPOI;
