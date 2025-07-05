import React from 'react';

const SessionTab = () => {
  return (
    <div className="tab-panel">
      <button onClick={() => console.log('Отправить сообщение')}>✉️</button>
      <button onClick={() => console.log('Сбросить карту')}>♻️</button>
      <button onClick={() => console.log('Следующий ход')}>⏭️</button>
      <button
        onClick={() => console.log('Завершить сессию')}
        className="danger"
      >
        ⏹️
      </button>
    </div>
  );
};

export default SessionTab;
