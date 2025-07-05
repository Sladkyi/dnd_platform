import React from 'react';
import SpellSlot from '../Slots/SpellSlot';
import ItemSlot from '../Slots/ItemSlot';

const ActionsBlock = ({ currentPage, spells, items }) => (
  <div className="actions-block">
    <div className="actions-header">
      {currentPage === 1 ? 'Заклинания' : 'Предметы'}
    </div>
    <div className="actions-row">
      {currentPage === 1
        ? spells.map((spell, index) => <SpellSlot key={index} spell={spell} />)
        : items.map((item, index) => <ItemSlot key={index} item={item} />)}
    </div>
  </div>
);

export default ActionsBlock;
