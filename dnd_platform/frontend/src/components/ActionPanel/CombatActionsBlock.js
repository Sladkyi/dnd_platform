import React from 'react';
import CombatAction from '../Slots/CombatAction';

const CombatActionsBlock = ({ actions }) => (
  <div className="combat-actions-block">
    <div className="combat-actions-row">
      {actions.map((action, index) => (
        <CombatAction key={index} action={action} />
      ))}
    </div>
  </div>
);

export default CombatActionsBlock;
