import React from 'react';

// HUD-панель, которая управляет активной вкладкой
const MasterToolbar = ({ activeTab, setActiveTab, profileId }) => {
  const handleTabClick = (tab) => {
    // Если клик по активной вкладке — закрываем панель
    if (activeTab === tab) {
      setActiveTab(null);
    } else {
      // Если клик по другой вкладке — переключаем
      setActiveTab(tab);
    }
  };

  return (
    <div className="master-toolbar">
      <div className="toolbar-header">
        <div className="tabs">
          {[
            'rooms',
            'items',
            'poi',
            'weather',
            'players',
            'session',
            'shapes',
          ].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTabClick(tab)}
              title={getTabTitle(tab)}
            >
              {getTabIcon(tab)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Иконки для вкладок
const getTabIcon = (tab) => {
  const icons = {
    rooms: '🏘️',
    items: '🎒',
    poi: '📍',
    weather: '🌦️',
    players: '🎮',
    session: '⚙️',
    shapes: '🧙',
  };
  return icons[tab] || '?';
};

// Названия вкладок
const getTabTitle = (tab) => {
  const titles = {
    rooms: 'Комнаты',
    items: 'Предметы',
    poi: 'Точки интереса',
    weather: 'Атмосфера',
    players: 'Игроки',
    session: 'Сессия',
    shapes: 'фигуры',
  };
  return titles[tab] || 'Неизвестно';
};

export default MasterToolbar;
