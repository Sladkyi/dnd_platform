import React from 'react';

const WeatherTab = () => {
  return (
    <div className="tab-panel">
      <button onClick={() => console.log('Сменить погоду')}>🌤️</button>
      <button onClick={() => console.log('Сменить время суток')}>🌙</button>
    </div>
  );
};

export default WeatherTab;
