import React, { useState, useEffect } from 'react';
import './styles/PlayerPanel.css';

const PlayerPanel = ({ shape }) => {
  const [activeTab, setActiveTab] = useState('desc');
  const [particles, setParticles] = useState([]);
  const [isLowHP, setIsLowHP] = useState(false);
  const [isFullHP, setIsFullHP] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  // Эмоциональные состояния
  useEffect(() => {
    if (!shape) return;

    const hpPercent = (shape.current_hp / shape.max_hp) * 100;
    setIsLowHP(hpPercent <= 0);
    setIsCritical(hpPercent <= 0);
    setIsFullHP(hpPercent >= 0);
  }, [shape]);

  // Генератор частиц
  const createParticles = (count, color = '#ffffff') => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random().toString(36).substr(2, 9),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        color,
        duration: Math.random() * 1000 + 500,
      });
    }
    setParticles(newParticles);

    // Автоочистка частиц
    setTimeout(() => setParticles([]), 1500);
  };

  // Эффект при нажатии на кнопку
  const handleButtonClick = (type) => {
    createParticles(8, '#ffd700');
    // Дополнительная логика по типам кнопок
  };

  if (!shape) return null;

  // Компонент для статусов
  const StatusIcons = ({ statuses }) => {
    if (!statuses || statuses.length === 0) return null;
    return (
      <div className="status-icons-container">
        {statuses.map((status, i) => (
          <div
            key={i}
            className={`status-icon ${status.type || 'default'}`}
            title={status.description || ''}
          >
            {status.icon || '✨'}
          </div>
        ))}
      </div>
    );
  };

  // Кнопки вкладок
  const tabs = [
    { id: 'desc', icon: '🧬', title: 'Описание' },
    { id: 'story', icon: '📜', title: 'История' },
    { id: 'personality', icon: '🧠', title: 'Характер' },
    { id: 'magic', icon: '🪄', title: 'Магия' },
    { id: 'items', icon: '🎒', title: 'Инвентарь' },
  ];

  // Пиллы для предметов/заклинаний
  const Pill = ({ children }) => (
    <span className="pill" onClick={() => createParticles(3, '#4d9de0')}>
      {children}
    </span>
  );

  // Контент вкладок
  const renderTabContent = () => {
    // Реализация остаётся без изменений
    // ...
  };

  return (
    <div
      className={`player-main-panel 
      ${isCritical ? 'critical-state' : ''} 
      ${isLowHP ? 'low-hp' : ''} 
      ${isFullHP ? 'full-hp' : ''}`}
    >
      {/* Эффекты частиц */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDuration: `${particle.duration}ms`,
          }}
        />
      ))}

      {/* Левая часть */}
      <div className="player-hud">
        {/* <div
          className="avatar-container"
          onClick={() => createParticles(15, '#ffffff')}
        >
          <img
            src={shape.image || '/token.jpg'}
            alt="avatar"
            className="avatar"
          />
          <StatusIcons statuses={shape.statuses} />
        </div> */}

        <div className="vitals-container">
          <div className="vital-bar hp-bar">
            <label>💖 HP</label>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{ width: `${(shape.current_hp / shape.max_hp) * 100}%` }}
              />
              <div className="crack-overlay" />
            </div>
            <span>
              {shape.current_hp} / {shape.max_hp}
            </span>
          </div>
          <div className="vital-bar ap-bar">
            <label>⚡ AP</label>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{ width: `${(shape.current_ap / shape.max_ap) * 100}%` }}
              />
            </div>
            <span>
              {shape.current_ap} / {shape.max_ap}
            </span>
          </div>
        </div>

        <div className="quick-stats">
          <div className="stat-item">
            <label>🛡 AC</label>
            <span>{shape.armor_class}</span>
          </div>
          <div className="stat-item">
            <label>⚡ Инициатива</label>
            <span>{shape.initiative}</span>
          </div>
          <div className="stat-item">
            <label>🎚 Уровень</label>
            <span>{shape.level}</span>
          </div>
        </div>

        <div className="hud-actions">
          <button
            onClick={() => handleButtonClick('dice')}
            className={`action-button ${isCritical ? 'shake' : ''}`}
            title="Бросить кубик"
          >
            🎲
          </button>
          <button
            onClick={() => handleButtonClick('skill')}
            className="action-button"
            title="Использовать умение"
          >
            ✨
          </button>
          <button
            onClick={() => handleButtonClick('item')}
            className="action-button"
            title="Использовать предмет"
          >
            🧪
          </button>
        </div>
      </div>

      {/* Правая часть */}
      <div className="player-tab-buttons">
        {tabs.map(({ id, icon, title }) => (
          <button
            key={id}
            className={`tab-button ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
            title={title}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Контент выбранной вкладки */}
      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default PlayerPanel;
