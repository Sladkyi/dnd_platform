import React, { useState, useEffect } from 'react';
import {
  GetPlayerRaces,
  createRace,
  updateRace,
  deleteRace,
} from '../services/MapService';
import '../shared/styles/createRace.css';
import { useParams } from 'react-router-dom';

const initialState = {
  name: '',
  description: '',
  ability_bonuses: {},
  traits: [],
  languages: [],
  size: '',
  speed: 30,
};

const abilityOptions = [
  { key: 'strength', label: 'Сила' },
  { key: 'dexterity', label: 'Ловкость' },
  { key: 'constitution', label: 'Телосложение' },
  { key: 'intelligence', label: 'Интеллект' },
  { key: 'wisdom', label: 'Мудрость' },
  { key: 'charisma', label: 'Харизма' },
];

const sizeOptions = [
  { value: 'tiny', label: 'Крошечный' },
  { value: 'small', label: 'Маленький' },
  { value: 'medium', label: 'Средний' },
  { value: 'large', label: 'Большой' },
  { value: 'huge', label: 'Огромный' },
];

const CreateRace = () => {
  const [raceData, setRaceData] = useState(initialState);
  const [savedRaces, setSavedRaces] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const { id: profileId } = useParams();
  const [traitInput, setTraitInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [bonusInput, setBonusInput] = useState({ ability: '', value: '' });

  useEffect(() => {
    if (!profileId) return;
    const loadRaces = async () => {
      try {
        const res = await GetPlayerRaces(profileId);
        setSavedRaces(res.data);
      } catch (err) {
        console.error('Ошибка при загрузке рас:', err);
      }
    };
    loadRaces();
  }, [profileId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRaceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBonusChange = (e) => {
    const { name, value } = e.target;
    setBonusInput((prev) => ({ ...prev, [name]: value }));
  };

  const addBonus = () => {
    if (bonusInput.ability && bonusInput.value) {
      setRaceData((prev) => ({
        ...prev,
        ability_bonuses: {
          ...prev.ability_bonuses,
          [bonusInput.ability]: parseInt(bonusInput.value),
        },
      }));
      setBonusInput({ ability: '', value: '' });
    }
  };

  const removeBonus = (ability) => {
    setRaceData((prev) => {
      const newBonuses = { ...prev.ability_bonuses };
      delete newBonuses[ability];
      return { ...prev, ability_bonuses: newBonuses };
    });
  };

  const addTrait = () => {
    if (traitInput.trim()) {
      setRaceData((prev) => ({
        ...prev,
        traits: [...prev.traits, traitInput.trim()],
      }));
      setTraitInput('');
    }
  };

  const removeTrait = (index) => {
    setRaceData((prev) => ({
      ...prev,
      traits: prev.traits.filter((_, i) => i !== index),
    }));
  };

  const addLanguage = () => {
    if (languageInput.trim()) {
      setRaceData((prev) => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()],
      }));
      setLanguageInput('');
    }
  };

  const removeLanguage = (index) => {
    setRaceData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...raceData,
        size: raceData.size || 'medium',
      };

      let res;
      if (editingId) {
        res = await updateRace(editingId, payload);
        setSavedRaces((prev) =>
          prev.map((r) => (r.id === editingId ? res.data : r))
        );
      } else {
        res = await createRace(payload);
        setSavedRaces((prev) => [...prev, res.data]);
      }

      setRaceData(initialState);
      setEditingId(null);
    } catch (err) {
      console.error('Ошибка при сохранении расы:', err);
    }
  };

  const handleEdit = (race) => {
    setRaceData({
      name: race.name,
      description: race.description || '',
      ability_bonuses: race.ability_bonuses || {},
      traits: race.traits || [],
      languages: race.languages || [],
      size: race.size,
      speed: race.speed,
    });
    setEditingId(race.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteRace(id);
      setSavedRaces((prev) => prev.filter((r) => r.id !== id));
      if (editingId === id) {
        setRaceData(initialState);
        setEditingId(null);
      }
    } catch (err) {
      console.error('Ошибка при удалении:', err);
    }
  };

  return (
    <div className="race-editor-container">
      <div className="race-editor-header">
        <h1>🧬 Редактор рас D&D</h1>
        <p>Создавайте и настраивайте расы для вашей кампании</p>
      </div>

      <div className="race-editor-grid">
        {/* Форма создания */}
        <div className="race-form-section">
          <h2>{editingId ? 'Редактирование расы' : 'Создание новой расы'}</h2>

          <div className="form-group">
            <label>Название расы</label>
            <input
              type="text"
              name="name"
              value={raceData.name}
              onChange={handleChange}
              placeholder="Эльф, Гном, Орк..."
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              name="description"
              value={raceData.description}
              onChange={handleChange}
              placeholder="Особенности расы, история, культура..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Бонусы к характеристикам</label>
            <div className="bonus-controls">
              <select
                name="ability"
                value={bonusInput.ability}
                onChange={handleBonusChange}
              >
                <option value="">Выберите характеристику</option>
                {abilityOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="value"
                value={bonusInput.value}
                onChange={handleBonusChange}
                placeholder="Значение"
                min="1"
                max="5"
              />
              <button className="add-button" onClick={addBonus}>
                Добавить
              </button>
            </div>

            <div className="bonuses-list">
              {Object.entries(raceData.ability_bonuses).map(
                ([ability, value]) => {
                  const abilityLabel =
                    abilityOptions.find((opt) => opt.key === ability)?.label ||
                    ability;
                  return (
                    <div key={ability} className="bonus-item">
                      <span>
                        {abilityLabel}: +{value}
                      </span>
                      <button
                        className="delete-small"
                        onClick={() => removeBonus(ability)}
                      >
                        ×
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Особые черты</label>
            <div className="traits-controls">
              <input
                type="text"
                value={traitInput}
                onChange={(e) => setTraitInput(e.target.value)}
                placeholder="Темное зрение, Сопротивление магии..."
              />
              <button className="add-button" onClick={addTrait}>
                Добавить
              </button>
            </div>
            <div className="traits-list">
              {raceData.traits.map((trait, index) => (
                <div key={index} className="trait-item">
                  <span>{trait}</span>
                  <button
                    className="delete-small"
                    onClick={() => removeTrait(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Языки</label>
            <div className="languages-controls">
              <input
                type="text"
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                placeholder="Общий, Эльфийский, Дварфский..."
              />
              <button className="add-button" onClick={addLanguage}>
                Добавить
              </button>
            </div>
            <div className="languages-list">
              {raceData.languages.map((lang, index) => (
                <div key={index} className="language-item">
                  <span>{lang}</span>
                  <button
                    className="delete-small"
                    onClick={() => removeLanguage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Размер</label>
              <select name="size" value={raceData.size} onChange={handleChange}>
                <option value="">Выберите размер</option>
                {sizeOptions.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Скорость (фт/ход)</label>
              <input
                type="number"
                name="speed"
                value={raceData.speed}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="submit-button" onClick={handleSubmit}>
              {editingId ? 'Обновить расу' : 'Создать расу'}
            </button>
            {editingId && (
              <button
                className="cancel-button"
                onClick={() => {
                  setRaceData(initialState);
                  setEditingId(null);
                }}
              >
                Отмена
              </button>
            )}
          </div>
        </div>

        {/* Предпросмотр */}
        <div className="race-preview-section">
          <h2>Предпросмотр расы</h2>
          <div className="race-card">
            <div className="race-header">
              <h3>{raceData.name || 'Новая раса'}</h3>
            </div>

            <div className="race-details">
              <div className="detail-row">
                <span>
                  <strong>Размер:</strong>{' '}
                  {sizeOptions.find((s) => s.value === raceData.size)?.label ||
                    '-'}
                </span>
                <span>
                  <strong>Скорость:</strong> {raceData.speed || '0'} фт
                </span>
              </div>

              {Object.keys(raceData.ability_bonuses).length > 0 && (
                <div className="bonus-section">
                  <h4>Бонусы характеристик:</h4>
                  <div className="bonus-grid">
                    {Object.entries(raceData.ability_bonuses).map(
                      ([ability, value]) => {
                        const abilityLabel =
                          abilityOptions.find((opt) => opt.key === ability)
                            ?.label || ability;
                        return (
                          <div key={ability} className="bonus-tag">
                            {abilityLabel} +{value}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {raceData.traits.length > 0 && (
                <div className="traits-section">
                  <h4>Особые черты:</h4>
                  <ul>
                    {raceData.traits.map((trait, i) => (
                      <li key={i}>{trait}</li>
                    ))}
                  </ul>
                </div>
              )}

              {raceData.languages.length > 0 && (
                <div className="languages-section">
                  <h4>Языки:</h4>
                  <div className="languages-grid">
                    {raceData.languages.map((lang, i) => (
                      <span key={i} className="language-tag">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {raceData.description && (
                <div className="description-section">
                  <h4>Описание:</h4>
                  <p>{raceData.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Список сохраненных рас */}
      <div className="saved-races-section">
        <h3>Сохранённые расы</h3>

        {savedRaces.length === 0 ? (
          <div className="no-races">Пока не создано ни одной расы</div>
        ) : (
          <div className="races-grid">
            {savedRaces.map((race) => (
              <div
                key={race.id}
                className={`race-item ${editingId === race.id ? 'active' : ''}`}
                onClick={() => handleEdit(race)}
              >
                <div className="race-item-header">
                  <h4>{race.name}</h4>
                  <div className="race-meta">
                    <span className="race-size">
                      {sizeOptions.find((s) => s.value === race.size)?.label ||
                        'Средний'}
                    </span>
                    <span className="race-speed">{race.speed} фт</span>
                  </div>
                </div>
                <div className="bonus-preview">
                  {Object.entries(race.ability_bonuses || {}).map(
                    ([ability, value]) => {
                      const abilityLabel =
                        abilityOptions.find((opt) => opt.key === ability)
                          ?.label || ability;
                      return (
                        <span key={ability} className="bonus-tag">
                          {abilityLabel}+{value}
                        </span>
                      );
                    }
                  )}
                </div>
                <div className="race-actions">
                  <button
                    className="edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(race);
                    }}
                  >
                    ✏️ Редактировать
                  </button>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(race.id);
                    }}
                  >
                    🗑️ Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRace;
