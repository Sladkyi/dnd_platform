// ClassEditor.jsx — центральный редактор классов в GLORIOUS NOCTURNE
import React, { useState, useEffect } from 'react';
import './styles/ClassEditor.css';

const ClassEditor = () => {
  const [classData, setClassData] = useState({
    name: '',
    hitDice: 'd8',
    primaryStat: 'Интеллект',
    description: '',
    spellcastingAbility: '',
    primaryAbilities: [],
    proficiencies: '',
    features: '',
  });

  const [savedClasses, setSavedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const storedClasses = JSON.parse(localStorage.getItem('dnd-classes')) || [];
    setSavedClasses(storedClasses);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClassData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!classData.name.trim()) return;
    const updatedClasses = [...savedClasses, classData];
    setSavedClasses(updatedClasses);
    localStorage.setItem('dnd-classes', JSON.stringify(updatedClasses));
    setClassData({
      name: '',
      hitDice: 'd8',
      primaryStat: 'Интеллект',
      description: '',
      spellcastingAbility: '',
      primaryAbilities: [],
      proficiencies: '',
      features: '',
    });
  };

  const handleDelete = (index) => {
    const updatedClasses = savedClasses.filter((_, i) => i !== index);
    setSavedClasses(updatedClasses);
    localStorage.setItem('dnd-classes', JSON.stringify(updatedClasses));
    if (selectedClass === index) setSelectedClass(null);
  };

  const handleSelectClass = (index) => {
    setSelectedClass(index === selectedClass ? null : index);
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
                <label htmlFor="primaryStat">Основная характеристика</label>
                <select
                  id="primaryStat"
                  name="primaryStat"
                  value={classData.primaryStat}
                  onChange={handleChange}
                >
                  {[
                    'Сила',
                    'Ловкость',
                    'Телосложение',
                    'Интеллект',
                    'Мудрость',
                    'Харизма',
                  ].map((stat) => (
                    <option key={stat} value={stat}>
                      {stat}
                    </option>
                  ))}
                </select>
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
                  {[
                    'Сила',
                    'Ловкость',
                    'Телосложение',
                    'Интеллект',
                    'Мудрость',
                    'Харизма',
                  ].map((stat) => (
                    <option key={stat} value={stat}>
                      {stat}
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
                placeholder="Краткое описание ключевых черт класса..."
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
                placeholder="Список оружия, доспехов, инструментов и т.п."
                value={classData.proficiencies}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="submit-button" onClick={handleSave}>
              Сохранить класс
            </button>
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
              <span>Осн. характеристика: {classData.primaryStat}</span>
              {classData.spellcastingAbility && (
                <span>Магия через: {classData.spellcastingAbility}</span>
              )}
            </div>
            <div className="class-description">
              {classData.description || 'Описание появится здесь...'}
            </div>
            {classData.features && (
              <div className="class-features">
                Особенности: {classData.features}
              </div>
            )}
            {classData.proficiencies && (
              <div className="class-proficiencies">
                Владения: {classData.proficiencies}
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
            {savedClasses.map((cls, index) => (
              <div
                key={index}
                className={`class-item ${index === selectedClass ? 'active' : ''}`}
                onClick={() => handleSelectClass(index)}
              >
                <div className="class-item-header">
                  <h4>{cls.name || 'Безымянный класс'}</h4>
                  <span className="class-hit-dice">{cls.hitDice}</span>
                </div>
                <div className="class-primary-stat">{cls.primaryStat}</div>
                <button
                  className="delete-class"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
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
