// ClassEditor.jsx — редактор классов для GLORIOUS NOCTURNE
import React, { useState, useEffect } from 'react';
import '../shared/styles/ClassEditor.css';
import { useParams } from 'react-router-dom';
import {
  GetPlayerClasses,
  createClass,
  updateClass,
  deleteClass,
} from '../services/MapService';

const ClassEditor = () => {
  const { id: profileId } = useParams();
  const abilities = [
    'Сила',
    'Ловкость',
    'Телосложение',
    'Интеллект',
    'Мудрость',
    'Харизма',
  ];

  const initialState = {
    name: '',
    hitDice: 'd8',
    primaryStat: [],
    spellcastingAbility: '',
    description: '',
    features: '',
    proficiencies: '',
  };

  const [classData, setClassData] = useState(initialState);
  const [savedClasses, setSavedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    if (!profileId) return;
    GetPlayerClasses(profileId)
      .then((res) => setSavedClasses(res.data))
      .catch((err) => console.error('Ошибка при загрузке классов:', err));
  }, [profileId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClassData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработчик для чекбоксов характеристик
  const handleStatChange = (ability) => {
    setClassData((prev) => {
      const newStats = prev.primaryStat.includes(ability)
        ? prev.primaryStat.filter((a) => a !== ability)
        : [...prev.primaryStat, ability];

      return { ...prev, primaryStat: newStats };
    });
  };

  const handleCreate = async () => {
    try {
      const payload = {
        ...classData,
        primary_abilities: classData.primaryStat,
        spellcasting_ability: classData.spellcastingAbility || null,
      };
      const response = await createClass(payload);
      setSavedClasses((prev) => [...prev, response.data]);
      setClassData(initialState);
    } catch (err) {
      console.error('Ошибка при создании класса:', err);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const payload = {
        ...classData,
        primary_abilities: classData.primaryStat,
        spellcasting_ability: classData.spellcastingAbility || null,
      };
      const response = await updateClass(id, payload);
      setSavedClasses((prev) =>
        prev.map((cls) => (cls.id === id ? response.data : cls))
      );
      setSelectedClass(null);
      setClassData(initialState);
    } catch (err) {
      console.error('Ошибка при обновлении класса:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этот класс?')) return;
    try {
      await deleteClass(id);
      setSavedClasses((prev) => prev.filter((cls) => cls.id !== id));
      if (selectedClass?.id === id) handleReset();
    } catch (err) {
      console.error('Ошибка при удалении класса:', err);
    }
  };

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    setClassData({
      name: cls.name,
      hitDice: cls.hit_dice,
      primaryStat: cls.primary_abilities || [],
      spellcastingAbility: cls.spellcasting_ability || '',
      description: cls.description || '',
      features: cls.features || '',
      proficiencies: cls.proficiencies || '',
    });
  };

  const handleReset = () => {
    setSelectedClass(null);
    setClassData(initialState);
  };

  return (
    <div className="class-editor-container">
      <div className="class-editor-header">
        <h1>🧙 Редактор классов D&D</h1>
        <p>Создавайте и настраивайте классы для вашей кампании</p>
      </div>

      <div className="class-editor-grid">
        <div className="class-form-section">
          <div className="form-section">
            <h3>Основные параметры класса</h3>
            <div className="field-grid">
              <div className="form-group">
                <label htmlFor="name">Название класса</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Изобретатель"
                  value={classData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="hitDice">Кость хитов</label>
                <select
                  id="hitDice"
                  name="hitDice"
                  value={classData.hitDice}
                  onChange={handleChange}
                >
                  {[6, 8, 10, 12].map((die) => (
                    <option key={die} value={`d${die}`}>{`d${die}`}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Основные характеристики</label>
                <div className="abilities-grid">
                  {abilities.map((ability) => (
                    <label key={ability} className="ability-option">
                      <input
                        type="checkbox"
                        checked={classData.primaryStat.includes(ability)}
                        onChange={() => handleStatChange(ability)}
                      />
                      {ability}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="spellcastingAbility">
                  Характеристика заклинаний
                </label>
                <select
                  id="spellcastingAbility"
                  name="spellcastingAbility"
                  value={classData.spellcastingAbility}
                  onChange={handleChange}
                >
                  <option value="">—</option>
                  {abilities.map((ability) => (
                    <option key={ability} value={ability}>
                      {ability}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Описание и особенности</h3>
            <div className="form-group">
              <textarea
                id="description"
                name="description"
                rows="4"
                placeholder="Общее описание класса..."
                value={classData.description}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="features">Особенности</label>
              <textarea
                id="features"
                name="features"
                rows="3"
                placeholder="Ключевые черты класса..."
                value={classData.features}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="proficiencies">Навыки и владения</label>
              <textarea
                id="proficiencies"
                name="proficiencies"
                rows="2"
                placeholder="Оружие, доспехи, инструменты..."
                value={classData.proficiencies}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            {selectedClass ? (
              <>
                <button
                  className="submit-button"
                  onClick={() => handleUpdate(selectedClass.id)}
                >
                  Обновить класс
                </button>
                <button className="cancel-button" onClick={handleReset}>
                  Отмена
                </button>
              </>
            ) : (
              <button className="submit-button" onClick={handleCreate}>
                Сохранить класс
              </button>
            )}
          </div>
        </div>

        <div className="class-preview-section">
          <h3 className="preview-title">Предпросмотр класса</h3>
          <div className="class-card">
            <div className="class-header">
              <h2>{classData.name || 'Новый класс'}</h2>
            </div>
            <div className="class-meta">
              <span>Кость хитов: {classData.hitDice}</span>
              <span>
                Осн. характеристики:{' '}
                {classData.primaryStat.length
                  ? classData.primaryStat.join(', ')
                  : '—'}
              </span>
              {classData.spellcastingAbility && (
                <span>Магия через: {classData.spellcastingAbility}</span>
              )}
            </div>
            <div className="class-description">
              {classData.description || 'Описание появится здесь...'}
            </div>
            {classData.features && (
              <div className="class-features">
                <strong>Особенности:</strong> {classData.features}
              </div>
            )}
            {classData.proficiencies && (
              <div className="class-proficiencies">
                <strong>Владения:</strong> {classData.proficiencies}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="saved-classes-section">
        <h3>Сохраненные классы</h3>
        {savedClasses.length === 0 ? (
          <div className="no-classes">
            <p>Вы пока не создали ни одного класса</p>
          </div>
        ) : (
          <div className="classes-grid">
            {savedClasses.map((cls) => (
              <div
                key={cls.id}
                className={`class-item ${selectedClass?.id === cls.id ? 'active' : ''}`}
                onClick={() => handleSelectClass(cls)}
              >
                <div className="class-item-header">
                  <h4>{cls.name || 'Безымянный класс'}</h4>
                  <span className="class-hit-dice">{cls.hit_dice}</span>
                </div>
                <div className="class-primary-stat">
                  {cls.primary_abilities?.join(', ') || '—'}
                </div>
                <button
                  className="delete-class"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(cls.id);
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

export default ClassEditor;
