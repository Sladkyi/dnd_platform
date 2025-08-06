// AttackEditor.jsx — редактор атак для GLORIOUS NOCTURNE
import React, { useEffect } from 'react';
import '../shared/styles/ClassEditor.css'; // Используем те же стили
import { useParams } from 'react-router-dom';
import {
  GetPlayerAttacks,
  createAttack,
  updateAttack,
  deleteAttack,
} from '../services/MapService';
import useAttackStore from '../store/useAttackStore';

const AttackEditor = () => {
  const { id: profileId } = useParams();
  const damageTypes = [
    'Колющий',
    'Рубящий',
    'Дробящий',
    'Огненный',
    'Холодный',
    'Электрический',
    'Кислотный',
    'Ядовитый',
    'Некротический',
    'Излучение',
    'Психический',
    'Силовой',
  ];

  const attackProperties = [
    'Дальнобойная',
    'Метательная',
    'Фехтовальное',
    'Тяжелое',
    'Универсальная',
    'Особое',
    'Заряженное',
    'Двуручное',
    'Легкое',
  ];

  const {
    attackData,
    savedAttacks,
    selectedAttack,
    updateAttackField,
    toggleProperty,
    setAttackData,
    setSavedAttacks,
    addAttack,
    updateSavedAttack,
    removeAttack,
    setSelectedAttack,
    resetAttackData,
  } = useAttackStore();

  useEffect(() => {
    if (!profileId) {
      console.warn('profileId не передан или пустой');
      return;
    }
    GetPlayerAttacks(profileId)
      .then((res) => {
        console.log('Атаки загружены:', res.data);
        setSavedAttacks(res.data);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке атак:', err);
      });
  }, [profileId, setSavedAttacks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateAttackField(name, value);
  };

  const handlePropertyChange = (property) => {
    toggleProperty(property);
  };

  const handleCreate = async () => {
    try {
      // Формируем поле damage из damageDice и (опционально) attack_bonus, если есть
      const damageString = attackData.damageDice; // или можно включить модификаторы, если нужны

      const payload = {
        name: attackData.name,
        attack_bonus: attackData.attackBonus || 0, // если есть в стейте
        damage: damageString,
        damage_type: attackData.damageType,
        is_ranged: attackData.properties.includes('Дальнобойная'),
        description: attackData.description,

        // Добавь остальные поля, которые нужны по модели
        // properties: attackData.properties, // если сервер ожидает свойства, их тоже передай в нужном формате
        range: attackData.range,
        // owner — скорее всего, нужно не передавать, а сервер установит сам по юзеру
      };

      const response = await createAttack(payload);
      addAttack(response.data);
      resetAttackData();
    } catch (err) {
      console.error('Ошибка при создании атаки:', err);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const damageString = attackData.damageDice;

      const payload = {
        name: attackData.name,
        attack_bonus: attackData.attackBonus || 0,
        damage: damageString,
        damage_type: attackData.damageType,
        is_ranged: attackData.properties.includes('Дальнобойная'),
        description: attackData.description,
        range: attackData.range,
      };

      const response = await updateAttack(id, payload);
      updateSavedAttack(response.data);
      resetAttackData();
    } catch (err) {
      console.error('Ошибка при обновлении атаки:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту атаку?')) return;
    try {
      await deleteAttack(id);
      removeAttack(id);
      if (selectedAttack?.id === id) handleReset();
    } catch (err) {
      console.error('Ошибка при удалении атаки:', err);
    }
  };

  const handleSelectAttack = (atk) => {
    setSelectedAttack(atk);
    setAttackData({
      name: atk.name,
      attackType: atk.attack_type,
      damageDice: atk.damage_dice,
      damageType: atk.damage_type,
      properties: atk.properties || [],
      range: atk.range,
      description: atk.description || '',
    });
  };

  const handleReset = () => {
    resetAttackData();
  };

  return (
    <div className="class-editor-container">
      <div className="class-editor-header">
        <h1>⚔️ Редактор атак D&D</h1>
        <p>Создавайте и настраивайте атаки для вашей кампании</p>
      </div>

      <div className="class-editor-grid">
        <div className="class-form-section">
          <div className="form-section">
            <h3>Параметры атаки</h3>
            <div className="field-grid">
              <div className="form-group">
                <label htmlFor="name">Название атаки</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Длинный меч"
                  value={attackData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="attackType">Тип атаки</label>
                <select
                  id="attackType"
                  name="attackType"
                  value={attackData.attackType}
                  onChange={handleChange}
                >
                  <option value="Оружие">Оружие</option>
                  <option value="Заклинание">Заклинание</option>
                  <option value="Особое">Особое умение</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="damageDice">Кость урона</label>
                <select
                  id="damageDice"
                  name="damageDice"
                  value={attackData.damageDice}
                  onChange={handleChange}
                >
                  {[
                    '1d4',
                    '1d6',
                    '1d8',
                    '1d10',
                    '1d12',
                    '2d6',
                    '2d8',
                    '3d6',
                    '4d6',
                  ].map((die) => (
                    <option key={die} value={die}>
                      {die}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="damageType">Тип урона</label>
                <select
                  id="damageType"
                  name="damageType"
                  value={attackData.damageType}
                  onChange={handleChange}
                >
                  <option value="">—</option>
                  {damageTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Свойства атаки</label>
                <div className="abilities-grid">
                  {attackProperties.map((property) => (
                    <label key={property} className="ability-option">
                      <input
                        type="checkbox"
                        checked={attackData.properties.includes(property)}
                        onChange={() => handlePropertyChange(property)}
                      />
                      {property}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="range">Дистанция</label>
                <input
                  id="range"
                  name="range"
                  type="text"
                  placeholder="5 футов / 20/60 футов"
                  value={attackData.range}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Описание атаки</h3>
            <div className="form-group">
              <textarea
                id="description"
                name="description"
                rows="4"
                placeholder="Особенности использования, дополнительные эффекты..."
                value={attackData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            {selectedAttack ? (
              <>
                <button
                  className="submit-button"
                  onClick={() => handleUpdate(selectedAttack.id)}
                >
                  Обновить атаку
                </button>
                <button className="cancel-button" onClick={handleReset}>
                  Отмена
                </button>
              </>
            ) : (
              <button className="submit-button" onClick={handleCreate}>
                Сохранить атаку
              </button>
            )}
          </div>
        </div>

        <div className="class-preview-section">
          <h3 className="preview-title">Предпросмотр атаки</h3>
          <div className="class-card">
            <div className="class-header">
              <h2>{attackData.name || 'Новая атака'}</h2>
              <span className="attack-type-badge">{attackData.attackType}</span>
            </div>
            <div className="class-meta">
              <span>
                Урон: {attackData.damageDice} {attackData.damageType}
              </span>
              <span>Дистанция: {attackData.range}</span>
              {attackData.properties.length > 0 && (
                <span>Свойства: {attackData.properties.join(', ')}</span>
              )}
            </div>
            <div className="class-description">
              {attackData.description || 'Описание атаки появится здесь...'}
            </div>
          </div>
        </div>
      </div>

      <div className="saved-classes-section">
        <h3>Сохраненные атаки</h3>
        {savedAttacks.length === 0 ? (
          <div className="no-classes">
            <p>Вы пока не создали ни одной атаки</p>
          </div>
        ) : (
          <div className="classes-grid">
            {savedAttacks.map((atk) => (
              <div
                key={atk.id}
                className={`class-item ${selectedAttack?.id === atk.id ? 'active' : ''}`}
                onClick={() => handleSelectAttack(atk)}
              >
                <div className="class-item-header">
                  <h4>{atk.name || 'Безымянная атака'}</h4>
                  <span className="class-hit-dice">{atk.damage_dice}</span>
                </div>
                <div className="class-primary-stat">
                  {atk.damage_type || 'Без типа урона'}
                </div>
                <div className="class-range">{atk.range}</div>
                <button
                  className="delete-class"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(atk.id);
                  }}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackEditor;
