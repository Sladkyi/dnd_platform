import React from 'react';

const SpellSlot = ({ spell }) => {
  const getSchoolIcon = () => {
    switch (spell.school.toLowerCase()) {
      case 'evocation':
        return '🔥';
      case 'abjuration':
        return '🛡️';
      case 'illusion':
        return '🌀';
      case 'conjuration':
        return '💫';
      case 'divination':
        return '👁️';
      case 'enchantment':
        return '✨';
      case 'necromancy':
        return '💀';
      case 'transmutation':
        return '🔄';
      default:
        return '🔮';
    }
  };

  return (
    <div
      className={`spell-slot ${spell.prepared ? 'prepared' : ''} ${spell.school.toLowerCase()} ${spell.uses === 0 ? 'disabled' : ''}`}
      onClick={() => spell.uses > 0 && console.log(`Заклинание: ${spell.name}`)}
    >
      <div className="spell-icon">{getSchoolIcon()}</div>
      {spell.level > 0 && <div className="spell-level">{spell.level}</div>}
      {spell.uses > 0 && <div className="spell-uses">{spell.uses}</div>}
      <div className="spell-tooltip">
        <div className="tooltip">
          <h4>{spell.name}</h4>
          <p>Уровень: {spell.level > 0 ? spell.level : 'Заговор'}</p>
          <p>Школа: {spell.school}</p>
          {spell.uses > 0 && (
            <p>
              Заряды: {spell.uses}/{spell.max_uses}
            </p>
          )}
          {spell.description && <p>{spell.description}</p>}
        </div>
      </div>
    </div>
  );
};

export default SpellSlot;
