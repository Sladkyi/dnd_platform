import React from 'react';

const ItemSlot = ({ item }) => (
  <div
    className={`item-slot ${item.type}`}
    onClick={() => item.uses > 0 && console.log(`Предмет: ${item.name}`)}
  >
    <div className="item-icon">
      {item.type === 'potion'
        ? '🧪'
        : item.type === 'scroll'
          ? '📜'
          : item.type === 'ring'
            ? '💍'
            : '🎒'}
    </div>
    {item.uses > 0 && (
      <div className="item-uses">
        {item.uses}/{item.max_uses}
      </div>
    )}
    <div className="item-tooltip">
      <div className="tooltip">
        <h4>{item.name}</h4>
        <p>
          Тип:{' '}
          {item.type === 'potion'
            ? 'Зелье'
            : item.type === 'scroll'
              ? 'Свиток'
              : item.type === 'ring'
                ? 'Кольцо'
                : 'Предмет'}
        </p>
        {item.uses > 0 && (
          <p>
            Осталось: {item.uses}{' '}
            {item.is_consumable ? 'использований' : 'зарядов'}
          </p>
        )}
      </div>
    </div>
  </div>
);

export default ItemSlot;
