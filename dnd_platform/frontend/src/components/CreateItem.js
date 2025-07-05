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
  const { id: profileId } = useParams();

  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await GetPlayerItems(profileId);
        setSavedItems(res.data);
      } catch (err) {
        console.error('Ошибка при загрузке предметов:', err);
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
      const payload = {
        ...itemData,
        weight: itemData.weight ? parseFloat(itemData.weight) : 0,
        value: itemData.value ? parseInt(itemData.value, 10) : 0,
      };

      let res;
      if (editingId) {
        res = await updateItem(editingId, payload);
        setSavedItems((prev) =>
          prev.map((i) => (i.id === editingId ? res.data : i))
        );
      } else {
        res = await createItem(payload);
        setSavedItems((prev) => [...prev, res.data]);
      }

      setItemData(initialState);
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
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setSavedItems((prev) => prev.filter((i) => i.id !== id));
      if (editingId === id) {
        setItemData(initialState);
        setEditingId(null);
      }
    } catch (err) {
      console.error('Ошибка при удалении:', err);
    }
  };

  return (
    <div className="item-editor-container">
      <div className="item-editor-grid">
        <div className="item-form-section">
          <h2>
            {editingId ? 'Редактирование предмета' : 'Создание нового предмета'}
          </h2>

          <div className="form-group">
            <label>Название</label>
            <input
              type="text"
              name="name"
              value={itemData.name}
              onChange={handleChange}
              placeholder="Меч, зелье, артефакт..."
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
            />
          </div>

          <div className="form-group">
            <label>Редкость</label>
            <select
              name="rarity"
              value={itemData.rarity}
              onChange={handleChange}
            >
              <option value="">Выберите редкость</option>
              <option value="common">Обычный</option>
              <option value="uncommon">Необычный</option>
              <option value="rare">Редкий</option>
              <option value="very_rare">Очень редкий</option>
              <option value="legendary">Легендарный</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Вес</label>
              <input
                type="number"
                name="weight"
                value={itemData.weight}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Стоимость (в золотых)</label>
              <input
                type="number"
                name="value"
                value={itemData.value}
                onChange={handleChange}
              />
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
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              name="description"
              value={itemData.description}
              onChange={handleChange}
              placeholder="Описание предмета, особенности использования и т.д."
            />
          </div>

          <div className="form-actions">
            <button className="submit-button" onClick={handleSubmit}>
              {editingId ? 'Обновить предмет' : 'Создать предмет'}
            </button>
            {editingId && (
              <button
                className="cancel-button"
                onClick={() => {
                  setItemData(initialState);
                  setEditingId(null);
                }}
              >
                Отмена
              </button>
            )}
          </div>
        </div>

        <div className="item-preview-section">
          <h2>Предпросмотр</h2>
          <div className="item-card">
            <h3>{itemData.name || 'Новый предмет'}</h3>
            <p>
              <strong>Тип:</strong> {itemData.type}
            </p>
            <p>
              <strong>Редкость:</strong> {itemData.rarity}
            </p>
            <p>
              <strong>Вес:</strong> {itemData.weight}
            </p>
            <p>
              <strong>Стоимость:</strong> {itemData.value} з.
            </p>
            <p>
              <strong>Свойства:</strong> {itemData.properties}
            </p>
            <p>{itemData.description}</p>
          </div>
        </div>
      </div>

      <div className="saved-items-section">
        <h3>Сохранённые предметы</h3>
        {savedItems.length === 0 ? (
          <div className="no-items">Пока нет предметов</div>
        ) : (
          <div className="items-grid">
            {savedItems.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-header">
                  <h4>{item.name}</h4>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(item)}>✏️</button>
                    <button onClick={() => handleDelete(item.id)}>🗑️</button>
                  </div>
                </div>
                <p>
                  {item.type} | {item.rarity}
                </p>
                <p>
                  {item.value} з., {item.weight} кг
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateItem;
