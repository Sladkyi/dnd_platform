// components/Tabs/ItemsTab.js
import React, { useEffect, useState } from 'react';
import { GetPlayerItems } from '../../services/MapService';
import './styles/ItemsTab.css';
import CreateItemModal from "./CreateItemModal";

const ItemsTab = ({ mapId, profileId , onAddItemClick }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Функция для перевода редкости
  const rarityTranslate = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'Обычный';
      case 'uncommon':
        return 'Необычный';
      case 'rare':
        return 'Редкий';
      case 'very_rare':
        return 'Очень редкий';
      case 'legendary':
        return 'Легендарный';
      default:
        return rarity;
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await GetPlayerItems(profileId);
      setItems(response.data || []);
    } catch (err) {
      console.error('Ошибка загрузки предметов:', err);
      setError('Не удалось загрузить предметы');
    } finally {
      setLoading(false);
    }
  };
  const handleDragStart = (e, item) => {
    console.log('началось перетаскивание  предмета');
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'item',
        id: item.id,
      })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  useEffect(() => {
    if (profileId) {
      loadItems();
    }
  }, [profileId]);

  if (loading)
    return (
      <div className="tab-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка инвентаря...</p>
      </div>
    );

  if (error) return <div className="tab-error">{error}</div>;

  return (
    <div className="tab-panel items-tab">
      <div className="tab-header">
        <h2>Инвентарь персонажа</h2>
        <div className="header-decoration"></div>
      </div>

      <div className="items-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className={`item-card ${hoveredItem === item.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            onDragStart={(e) => handleDragStart(e, item)}
          >
            <div className="item-thumbnail">
              <img
                src={
                  item.image
                    ? item.image.startsWith('http')
                      ? item.image
                      : `${process.env.REACT_APP_API_URL}${item.image}`
                    : '/default-item-thumbnail.webp'
                }
                alt={item.name}
                className="glowing-image"
              />
            </div>
            <div className="item-name">{item.name}</div>

            {hoveredItem === item.id && (
              <div className="item-tooltip">
                <div className="tooltip-header">
                  <h4>{item.name}</h4>
                  <span className={`item-rarity ${item.rarity}`}>
                    {rarityTranslate(item.rarity)}
                  </span>
                </div>
                <div className="tooltip-content">
                  <p>
                    <strong>Тип:</strong> {item.type}
                  </p>
                  <p>
                    <strong>Вес:</strong> {item.weight} кг
                  </p>
                  <p>
                    <strong>Цена:</strong> {item.value} з.
                  </p>
                  {item.properties && (
                    <p>
                      <strong>Свойства:</strong> {item.properties}
                    </p>
                  )}
                  {item.description && (
                    <p className="tooltip-description">{item.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Кнопка добавления нового предмета */}
        <div
          className="item-card add-item"
          onClick={() => onAddItemClick(true)}
        >
          <div className="add-icon">+</div>
          <div className="item-name">Добавить</div>
        </div>
      </div>

      {/* Модалка для создания/выбора предметов (если нужно) */}
      {/* {isModalOpen && (
        <ItemModal
          mapId={mapId}
          onClose={() => setIsModalOpen(false)}
          onItemCreated={loadItems}
        />
      )} */}
    </div>
  );
};

export default ItemsTab;
