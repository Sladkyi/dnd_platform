import React from 'react';

const WeaponSlot = ({ weapon, active, onSelect }) => (
  <div className={`weapon-slot ${active ? 'active' : ''}`} onClick={onSelect}>
    <div className="weapon-icon">{weapon.type === 'staff' ? '🦯' : '🗡️'}</div>
    <div className="weapon-tooltip">
      <div className="tooltip">
        <h4>{weapon.name}</h4>
        <p>Урон: {weapon.damage}</p>
        <p>Тип: {weapon.hand === 'one-handed' ? 'Одноручное' : 'Двуручное'}</p>
      </div>
    </div>
  </div>
);

export default WeaponSlot;
