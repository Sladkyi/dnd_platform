import React from 'react';

const CombatAction = ({ action }) => (
  <div
    className={`combat-action ${action.available ? '' : 'disabled'} ${action.cost}`}
    onClick={() =>
      action.available && console.log(`Использовано действие: ${action.name}`)
    }
  >
    <div className="action-icon">
      {action.type === 'movement'
        ? '👟'
        : action.type === 'utility'
          ? '🔄'
          : '⚔️'}
    </div>
    <div className="action-tooltip">
      <div className="tooltip">
        <h4>{action.name}</h4>
        <p>
          Тип:{' '}
          {action.type === 'movement'
            ? 'Перемещение'
            : action.type === 'utility'
              ? 'Утилита'
              : 'Атака'}
        </p>
        <p>
          Стоимость:{' '}
          {action.cost === 'bonus' ? 'Бонусное действие' : 'Основное действие'}
        </p>
      </div>
    </div>
  </div>
);

export default CombatAction;
