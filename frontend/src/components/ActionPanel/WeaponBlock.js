import React from 'react';
import WeaponSlot from '../Slots/WeaponSlot';

const WeaponBlock = ({ weapons, activeWeapon, setActiveWeapon }) => (
  <div className="weapons-block">
    <div className="weapons-row">
      {weapons.length > 0 ? (
        weapons.map((weapon, index) => (
          <WeaponSlot
            key={index}
            weapon={weapon}
            index={index}
            active={index === activeWeapon}
            onSelect={() => setActiveWeapon(index)}
          />
        ))
      ) : (
        <div className="weapon-slot empty" title="Нет оружия">
          {/* <div className="weapon-icon">нет</div> */}
        </div>
      )}
    </div>
  </div>
);

export default WeaponBlock;
