import React from 'react';
import StatusIndicator from './StatusIndicator';

const CharacterPortrait = ({ shape, characterData, setShowEditor }) => {
  const hpPercentage = (characterData.hp.current / characterData.hp.max) * 100;
  const hpColor =
    hpPercentage > 70 ? 'green' : hpPercentage > 30 ? 'yellow' : 'red';

  return (
    <div className="character-block">
      <div className="character-portrait">
        <div className="portrait-frame">
          <div
            className="portrait-image"
            onClick={() => setShowEditor(true)}
            title="Редактировать персонажа"
          >
            {shape.image ? <img src={shape.image} alt="Портрет" /> : '🧙'}
          </div>
          <div className="status-indicators">
            {characterData.statuses.map((status, index) => (
              <StatusIndicator key={index} status={status} />
            ))}
          </div>
        </div>
        <div className="character-info">
          <div className={`hp-display ${hpColor}`}>
            {characterData.hp.current}/{characterData.hp.max}
            {characterData.hp.temp > 0 && (
              <span className="temp-hp">+{characterData.hp.temp}</span>
            )}
          </div>
          <div className="secondary-stats">
            КБ: {characterData.armorClass} | Иниц: {characterData.initiative} |
            Скр: {characterData.speed}ft
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterPortrait;
