import React, { useState, useEffect } from 'react';
import './styles/CreateSpell.css'; // Предполагается, что у вас есть этот CSS файл

const CreateSpell = () => {
  const [spell, setSpell] = useState({
    name: '',
    level: 0,
    school: 'воплощение',
    casting_time: '1 действие',
    range: 'На себя',
    duration: 'Мгновенно',
    components: 'В',
    materials: '',
    description: '',
    effect: '',
    higher_levels: '',
    is_concentration: false,
    is_ritual: false,
    damage_type: '',
    save_type: '',
    classes: [],
  });

  const [preview, setPreview] = useState(false);
  const [savedSpells, setSavedSpells] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const magicSchools = [
    'воплощение',
    'очарование',
    'вызов',
    'прорицание',
    'ограждение',
    'некромантия',
    'преобразование',
    'иллюзия',
  ];

  const damageTypes = [
    '',
    'кислотный',
    'холод',
    'огонь',
    'силовой',
    'электричество',
    'некротический',
    'яд',
    'психический',
    'излучение',
    'дробящий',
    'колющий',
    'рубящий',
  ];

  const saveTypes = [
    '',
    'Сила',
    'Ловкость',
    'Телосложение',
    'Интеллект',
    'Мудрость',
    'Харизма',
  ];

  const classesList = [
    'Бард',
    'Волшебник',
    'Друид',
    'Жрец',
    'Колдун',
    'Паладин',
    'Следопыт',
    'Чародей',
  ];

  useEffect(() => {
    const spellsFromStorage = localStorage.getItem('customSpells');
    if (spellsFromStorage) {
      setSavedSpells(JSON.parse(spellsFromStorage));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSpell((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleClassToggle = (className) => {
    setSpell((prev) => {
      if (prev.classes.includes(className)) {
        return {
          ...prev,
          classes: prev.classes.filter((c) => c !== className),
        };
      } else {
        return {
          ...prev,
          classes: [...prev.classes, className],
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newSpell = {
      ...spell,
      id: Date.now(),
      created: new Date().toLocaleString(),
    };

    let updatedSpells;
    if (isEditing) {
      updatedSpells = savedSpells.map((s) => (s.id === editId ? newSpell : s));
    } else {
      updatedSpells = [...savedSpells, newSpell];
    }

    setSavedSpells(updatedSpells);
    localStorage.setItem('customSpells', JSON.stringify(updatedSpells));

    setSpell({
      name: '',
      level: 0,
      school: 'воплощение',
      casting_time: '1 действие',
      range: 'На себя',
      duration: 'Мгновенно',
      components: 'В',
      materials: '',
      description: '',
      effect: '',
      higher_levels: '',
      is_concentration: false,
      is_ritual: false,
      damage_type: '',
      save_type: '',
      classes: [],
    });

    setIsEditing(false);
    setEditId(null);
  };

  const loadSpell = (spellToLoad) => {
    setSpell(spellToLoad);
    setIsEditing(true);
    setEditId(spellToLoad.id);
    window.scrollTo(0, 0);
  };

  const deleteSpell = (id, e) => {
    e.stopPropagation();
    const updatedSpells = savedSpells.filter((s) => s.id !== id);
    setSavedSpells(updatedSpells);
    localStorage.setItem('customSpells', JSON.stringify(updatedSpells));

    if (isEditing && id === editId) {
      setIsEditing(false);
      setEditId(null);
      setSpell({
        name: '',
        level: 0,
        school: 'воплощение',
        casting_time: '1 действие',
        range: 'На себя',
        duration: 'Мгновенно',
        components: 'В',
        materials: '',
        description: '',
        effect: '',
        higher_levels: '',
        is_concentration: false,
        is_ritual: false,
        damage_type: '',
        save_type: '',
        classes: [],
      });
    }
  };

  const renderSpellLevel = (level) => {
    if (level === 0) return 'Заговор';
    if (level === 1) return '1-й уровень';
    return `${level}-й уровень`;
  };

  return (
    <div className="spell-editor-container">
      <header className="spell-editor-header">
        <h1>📜 Редактор заклинаний</h1>
        <p>Создавайте собственные заклинания для D&D 5e</p>
      </header>

      <div className="spell-editor-grid">
        <div className="spell-form-section">
          <form className="spell-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Название заклинания</label>
              <input
                type="text"
                name="name"
                placeholder="Огненный шар"
                value={spell.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Уровень</label>
                <select
                  name="level"
                  value={spell.level}
                  onChange={handleChange}
                  required
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl === 0 ? 'Заговор' : `${lvl}-й уровень`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Школа магии</label>
                <select
                  name="school"
                  value={spell.school}
                  onChange={handleChange}
                  required
                >
                  {magicSchools.map((school) => (
                    <option key={school} value={school}>
                      {school.charAt(0).toUpperCase() + school.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Время накладывания</label>
                <input
                  type="text"
                  name="casting_time"
                  placeholder="1 действие, 1 бонусное действие, 1 реакция и т.д."
                  value={spell.casting_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Дистанция</label>
                <input
                  type="text"
                  name="range"
                  placeholder="На себя, 30 футов, 1 миля и т.д."
                  value={spell.range}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Длительность</label>
                <input
                  type="text"
                  name="duration"
                  placeholder="Мгновенно, 1 час, до рассеивания и т.д."
                  value={spell.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Компоненты</label>
                <div className="components-row">
                  {['В', 'С', 'М'].map((comp) => (
                    <label key={comp} className="component-checkbox">
                      <input
                        type="checkbox"
                        checked={spell.components.includes(comp)}
                        onChange={() => {
                          let newComponents = spell.components;
                          if (newComponents.includes(comp)) {
                            newComponents = newComponents.replace(comp, '');
                          } else {
                            newComponents += comp;
                          }
                          setSpell((prev) => ({
                            ...prev,
                            components: newComponents,
                          }));
                        }}
                      />
                      {comp}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {spell.components.includes('М') && (
              <div className="form-group">
                <label>Материальные компоненты</label>
                <input
                  type="text"
                  name="materials"
                  placeholder="Щепотка пепла, алмаз стоимостью 50 зм и т.д."
                  value={spell.materials}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Тип урона (если есть)</label>
                <select
                  name="damage_type"
                  value={spell.damage_type}
                  onChange={handleChange}
                >
                  {damageTypes.map((type) => (
                    <option key={type} value={type}>
                      {type || 'Не наносит урон'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Спасбросок (если есть)</label>
                <select
                  name="save_type"
                  value={spell.save_type}
                  onChange={handleChange}
                >
                  {saveTypes.map((type) => (
                    <option key={type} value={type}>
                      {type || 'Не требует'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Описание заклинания</label>
              <textarea
                name="description"
                placeholder="Опишите, что происходит при накладывании заклинания..."
                value={spell.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Механика заклинания</label>
              <textarea
                name="effect"
                placeholder="Подробно опишите механику работы (урон, эффекты, условия и т.д.)"
                value={spell.effect}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Эффект на высоких уровнях</label>
              <textarea
                name="higher_levels"
                placeholder="Как заклинание работает, если накладывается ячейкой более высокого уровня?"
                value={spell.higher_levels}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Классы</label>
                <div className="classes-grid">
                  {classesList.map((className) => (
                    <label key={className} className="class-checkbox">
                      <input
                        type="checkbox"
                        checked={spell.classes.includes(className)}
                        onChange={() => handleClassToggle(className)}
                      />
                      {className}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Дополнительные параметры</label>
                <div className="options-row">
                  <label className="option-checkbox">
                    <input
                      type="checkbox"
                      name="is_concentration"
                      checked={spell.is_concentration}
                      onChange={handleChange}
                    />
                    Концентрация
                  </label>
                  <label className="option-checkbox">
                    <input
                      type="checkbox"
                      name="is_ritual"
                      checked={spell.is_ritual}
                      onChange={handleChange}
                    />
                    Ритуал
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                {isEditing ? 'Обновить заклинание' : 'Создать заклинание'}
              </button>
              <button
                type="button"
                className="preview-button"
                onClick={() => setPreview(!preview)}
              >
                {preview ? 'Скрыть предпросмотр' : 'Предпросмотр'}
              </button>
            </div>
          </form>
        </div>

        {preview && (
          <div className="spell-preview-section">
            <div className="spell-card">
              <div className="spell-header">
                <h2>{spell.name || 'Название заклинания'}</h2>
                <div className="spell-meta">
                  <span>{renderSpellLevel(spell.level)}</span>
                  <span>
                    {spell.school.charAt(0).toUpperCase() +
                      spell.school.slice(1)}
                  </span>
                  {spell.is_ritual && (
                    <span className="ritual-tag">Ритуал</span>
                  )}
                </div>
              </div>

              <div className="spell-details">
                <p>
                  <strong>Время накладывания:</strong> {spell.casting_time}
                </p>
                <p>
                  <strong>Дистанция:</strong> {spell.range}
                </p>
                <p>
                  <strong>Компоненты:</strong>{' '}
                  {spell.components
                    .split('')
                    .map((c) => {
                      if (c === 'В') return 'Вербальный ';
                      if (c === 'С') return 'Соматический ';
                      if (c === 'М')
                        return `Материальный${spell.materials ? ` (${spell.materials})` : ''}`;
                      return '';
                    })
                    .join(', ')}
                </p>
                <p>
                  <strong>Длительность:</strong>{' '}
                  {spell.is_concentration
                    ? `Концентрация, до ${spell.duration}`
                    : spell.duration}
                </p>
              </div>

              <div className="spell-description">
                <p>
                  {spell.description || 'Описание заклинания появится здесь.'}
                </p>

                {spell.effect && (
                  <div className="spell-effect">
                    <p>
                      <strong>Механика:</strong> {spell.effect}
                    </p>
                  </div>
                )}

                {spell.damage_type && (
                  <p>
                    <strong>Тип урона:</strong> {spell.damage_type}
                  </p>
                )}

                {spell.save_type && (
                  <p>
                    <strong>Спасбросок:</strong> {spell.save_type}
                  </p>
                )}

                {spell.higher_levels && (
                  <div className="higher-levels">
                    <p>
                      <strong>На высоких уровнях:</strong> {spell.higher_levels}
                    </p>
                  </div>
                )}
              </div>

              {spell.classes.length > 0 && (
                <div className="spell-classes">
                  <p>
                    <strong>Доступно классам:</strong>{' '}
                    {spell.classes.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="saved-spells-section">
        <h3>Сохранённые заклинания ({savedSpells.length})</h3>

        {savedSpells.length === 0 ? (
          <p className="no-spells">Вы ещё не создали ни одного заклинания.</p>
        ) : (
          <div className="spells-grid">
            {savedSpells.map((savedSpell) => (
              <div
                key={savedSpell.id}
                className={`spell-item ${editId === savedSpell.id ? 'active' : ''}`}
                onClick={() => loadSpell(savedSpell)}
              >
                <div className="spell-item-header">
                  <h4>{savedSpell.name}</h4>
                  <span className="spell-level">
                    {renderSpellLevel(savedSpell.level)}
                  </span>
                </div>
                <p className="spell-school">
                  {savedSpell.school.charAt(0).toUpperCase() +
                    savedSpell.school.slice(1)}
                </p>
                <p className="spell-classes">{savedSpell.classes.join(', ')}</p>
                <button
                  className="delete-spell"
                  onClick={(e) => deleteSpell(savedSpell.id, e)}
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

export default CreateSpell;
