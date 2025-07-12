import React, { useState, useEffect } from 'react';
import {
  GetPlayerItems,
  createItem,
  updateItem,
  deleteItem,
} from '../services/MapService';
import './styles/createItem.css';
import { useParams } from 'react-router-dom';

const initialState = {
  name: '',
  type: '',
  rarity: '',
  description: '',
  weight: '',
  value: '',
  properties: '',
};

const CreateItem = () => {
  const [itemData, setItemData] = useState(initialState);
  const [savedItems, setSavedItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [itemImage, setItemImage] = useState(null);
  const { id: profileId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        const res = await GetPlayerItems(profileId);
        setSavedItems(res.data);
      } catch (err) {
        console.error('Ошибка при загрузке предметов:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, [profileId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', itemData.name);
      formData.append('type', itemData.type);
      formData.append('rarity', itemData.rarity);
      formData.append('description', itemData.description);
      formData.append(
        'weight',
        itemData.weight ? parseFloat(itemData.weight) : 0
      );
      formData.append(
        'value',
        itemData.value ? parseInt(itemData.value, 10) : 0
      );
      formData.append('properties', itemData.properties);

      if (itemImage) {
        formData.append('image', itemImage);
      }

      let res;
      if (editingId) {
        res = await updateItem(editingId, formData);
        setSavedItems((prev) =>
          prev.map((i) => (i.id === editingId ? res.data : i))
        );
      } else {
        res = await createItem(formData);
        setSavedItems((prev) => [...prev, res.data]);
      }

      setItemData(initialState);
      setItemImage(null);
      setEditingId(null);
    } catch (err) {
      console.error('Ошибка при сохранении предмета:', err);
    }
  };

  const handleEdit = (item) => {
    setItemData({
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      description: item.description,
      weight: item.weight,
      value: item.value,
      properties: item.properties,
    });
    setEditingId(item.id);
    setItemImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setSavedItems((prev) => prev.filter((i) => i.id !== id));
      if (editingId === id) {
        setItemData(initialState);
        setEditingId(null);
        setItemImage(null);
      }
    } catch (err) {
      console.error('Ошибка при удалении:', err);
    }
  };

  // Эффект для анимации появления элементов
  useEffect(() => {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
    });

    setTimeout(() => {
      elements.forEach((el) => {
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }, 100);
  }, [savedItems]);

  return (
    <div className="item-editor-container">
      <div className="item-editor-grid">
        <div className="item-form-section fade-in">
          <div className="section-header">
            <h2>
              {editingId
                ? 'Редактирование предмета'
                : 'Создание нового предмета'}
            </h2>
            <div className="header-decoration"></div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Название</label>
              <input
                type="text"
                name="name"
                value={itemData.name}
                onChange={handleChange}
                placeholder="Меч, зелье, артефакт..."
                className="glowing-input"
              />
            </div>

            <div className="form-group">
              <label>Тип</label>
              <input
                type="text"
                name="type"
                value={itemData.type}
                onChange={handleChange}
                placeholder="Оружие, броня, зелье..."
                className="glowing-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Картинка предмета</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setItemImage(e.target.files[0])}
                id="file-upload"
                className="file-upload"
              />
              <label htmlFor="file-upload" className="file-upload-label">
                <span className="file-icon">📁</span>
                <span>{itemImage ? itemImage.name : 'Выберите файл'}</span>
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Редкость</label>
              <div className="select-wrapper">
                <select
                  name="rarity"
                  value={itemData.rarity}
                  onChange={handleChange}
                  className="glowing-input"
                >
                  <option value="">Выберите редкость</option>
                  <option value="common">Обычный</option>
                  <option value="uncommon">Необычный</option>
                  <option value="rare">Редкий</option>
                  <option value="very_rare">Очень редкий</option>
                  <option value="legendary">Легендарный</option>
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </div>

            <div className="form-group">
              <label>Свойства</label>
              <input
                type="text"
                name="properties"
                value={itemData.properties}
                onChange={handleChange}
                placeholder="Огненное, метательное..."
                className="glowing-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Вес</label>
              <input
                type="number"
                name="weight"
                value={itemData.weight}
                onChange={handleChange}
                className="glowing-input"
              />
            </div>

            <div className="form-group">
              <label>Стоимость (в золотых)</label>
              <input
                type="number"
                name="value"
                value={itemData.value}
                onChange={handleChange}
                className="glowing-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              name="description"
              value={itemData.description}
              onChange={handleChange}
              placeholder="Описание предмета, особенности использования и т.д."
              className="glowing-input"
            />
          </div>

          <div className="form-actions">
            <button
              className="submit-button neon-button"
              onClick={handleSubmit}
            >
              <span className="neon-text">
                {editingId ? 'Обновить предмет' : 'Создать предмет'}
              </span>
            </button>
            {editingId && (
              <button
                className="cancel-button"
                onClick={() => {
                  setItemData(initialState);
                  setItemImage(null);
                  setEditingId(null);
                }}
              >
                Отмена
              </button>
            )}
          </div>
        </div>

        <div className="item-preview-section fade-in">
          <div className="section-header">
            <h2>Предпросмотр</h2>
            <div className="header-decoration"></div>
          </div>
          <div className="item-card hologram">
            <div className="item-header">
              <h3>{itemData.name || 'Новый предмет'}</h3>
              {itemData.rarity && (
                <span className={`item-rarity ${itemData.rarity}`}>
                  {rarityTranslate(itemData.rarity)}
                </span>
              )}
            </div>

            {itemImage && (
              <div className="item-image">
                <img
                  src={URL.createObjectURL(itemImage)}
                  alt="Предпросмотр"
                  className="item-preview-image"
                />
              </div>
            )}

            <div className="item-details">
              <div className="detail-row">
                <span className="detail-label">Тип:</span>
                <span className="detail-value">{itemData.type || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Вес:</span>
                <span className="detail-value">
                  {itemData.weight || '0'} кг
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Стоимость:</span>
                <span className="detail-value">{itemData.value || '0'} з.</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Свойства:</span>
                <span className="detail-value">
                  {itemData.properties || '-'}
                </span>
              </div>
            </div>

            <div className="item-description">
              {itemData.description || 'Описание появится здесь...'}
            </div>
          </div>
        </div>
      </div>

      <div className="saved-items-section fade-in">
        <div className="section-header">
          <h3>Сохранённые предметы</h3>
          <div className="header-decoration"></div>
        </div>

        {isLoading ? (
          <div className="loading-items">
            <div className="loading-spinner"></div>
            <p>Загрузка предметов...</p>
          </div>
        ) : savedItems.length === 0 ? (
          <div className="no-items">
            <div className="empty-icon">📦</div>
            <p>Пока нет сохранённых предметов</p>
          </div>
        ) : (
          <div className="items-grid">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className={`item-card ${hoveredItem === item.id ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item.image && (
                  <div className="item-thumbnail">
                    <img
                      src={
                        item.image.startsWith('http')
                          ? item.image
                          : `${process.env.REACT_APP_API_URL}${item.image}`
                      }
                      alt={item.name}
                    />
                  </div>
                )}
                <div className="item-header">
                  <h4>{item.name}</h4>
                  <div className="item-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(item)}
                      title="Редактировать"
                    >
                      <span className="icon-edit">✏️</span>
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(item.id)}
                      title="Удалить"
                    >
                      <span className="icon-delete">🗑️</span>
                    </button>
                  </div>
                </div>
                <div className="item-meta">
                  <span className="item-type">{item.type}</span>
                  <span className={`item-rarity ${item.rarity}`}>
                    {rarityTranslate(item.rarity)}
                  </span>
                </div>
                <div className="item-stats">
                  <span>{item.value} з.</span>
                  <span>{item.weight} кг</span>
                </div>
                {hoveredItem === item.id && (
                  <div className="item-hover-content">
                    <p className="item-description-preview">
                      {item.description || 'Нет описания'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateItem;
