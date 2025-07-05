import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { GetPlayerSpells } from '../services/MapService';
import { createSpell, updateSpell } from '../services/MapService';
import { deleteSpellFromServer } from '../services/MapService';

const CreateSpell = () => {
  // Состояние заклинания
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
    source: 'Доморощенное',
    area_of_effect: '',
  });

  // Состояния интерфейса
  const [savedSpells, setSavedSpells] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const { id: profileId } = useParams();

  // Константы для выпадающих списков
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
    'Изобретатель',
    'Мистик',
  ];

  const areaTypes = ['', 'Конус', 'Куб', 'Цилиндр', 'Линия', 'Сфера', 'Круг'];

  // Загрузка сохраненных заклинаний
  useEffect(() => {
    if (!profileId) return;

    GetPlayerSpells(profileId)
      .then((res) => setSavedSpells(res.data))
      .catch((err) => console.error('Ошибка загрузки заклинаний:', err));
  }, [profileId]);

  // Обработчик изменений в форме
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSpell((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const CreateNewSpell = async (e) => {
    e.preventDefault();
    if (!spell.name.trim() || !spell.description.trim()) {
      alert('Заполните название и описание заклинания');
      return;
    }

    const payload = {
      ...spell,
    };

    try {
      if (isEditing) {
        await updateSpell(editId, payload);
      } else {
        await createSpell(payload);
      }

      // Обновляем список заклинаний
      const res = await GetPlayerSpells(profileId);
      setSavedSpells(res.data);

      resetForm();
    } catch (error) {
      console.error('❌ Ошибка при сохранении заклинания:', error);
      alert('Ошибка при сохранении. Проверьте форму.');
    }
  };

  // Переключение классов
  const handleClassToggle = (className) => {
    setSpell((prev) => ({
      ...prev,
      classes: prev.classes.includes(className)
        ? prev.classes.filter((c) => c !== className)
        : [...prev.classes, className],
    }));
  };

  // Переключение компонентов
  const handleComponentToggle = (component) => {
    setSpell((prev) => ({
      ...prev,
      components: prev.components.includes(component)
        ? prev.components.replace(component, '')
        : prev.components + component,
    }));
  };

  // Сброс формы
  const resetForm = () => {
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
      source: 'Доморощенное',
      area_of_effect: '',
    });
    setIsEditing(false);
    setEditId(null);
  };

  // Загрузка заклинания для редактирования
  const loadSpell = (spellToLoad) => {
    setSpell(spellToLoad);
    setIsEditing(true);
    setEditId(spellToLoad.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Удаление заклинания
  const deleteSpell = async (id, e) => {
    e.stopPropagation();

    try {
      await deleteSpellFromServer(id);
      const updatedSpells = savedSpells.filter((s) => s.id !== id);
      setSavedSpells(updatedSpells);

      if (isEditing && id === editId) {
        resetForm();
      }
    } catch (err) {
      console.error('Ошибка при удалении заклинания:', err);
      alert('Не удалось удалить заклинание.');
    }
  };

  // Фильтрация и сортировка заклинаний
  const filteredSpells = savedSpells
    .filter((spell) => {
      const matchesSearch = spell.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesLevel =
        filterLevel === 'all' || spell.level.toString() === filterLevel;
      const matchesSchool =
        filterSchool === 'all' || spell.school === filterSchool;
      return matchesSearch && matchesLevel && matchesSchool;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'level') return a.level - b.level;
      return new Date(b.created) - new Date(a.created);
    });

  // Форматирование уровня заклинания
  const renderSpellLevel = (level) => {
    if (level === 0) return 'Заговор';
    if (level === 1) return '1-й уровень';
    return `${level}-й уровень`;
  };

  // Форматирование компонентов
  const renderComponents = (components, materials) => {
    return components
      .split('')
      .map((c) => {
        if (c === 'В') return 'Вербальный';
        if (c === 'С') return 'Соматический';
        if (c === 'М')
          return `Материальный${materials ? ` (${materials})` : ''}`;
        return '';
      })
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="spell-editor-container">
      <header className="spell-editor-header">
        <h1>📜 Редактор заклинаний D&D 5e</h1>
        <p>Создавайте и управляйте своими заклинаниями</p>
      </header>

      <div className="spell-editor-grid">
        {/* Форма создания/редактирования */}
        <div className="spell-form-section">
          <form className="spell-form" onSubmit={CreateNewSpell}>
            {/* Основная информация */}
            <div className="form-section">
              <h3>📌 Основная информация</h3>
              <div className="form-group">
                <label>Название заклинания *</label>
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
                  <label>Уровень *</label>
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
                  <label>Школа магии *</label>
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
            </div>

            {/* Детали заклинания */}
            <div className="form-section">
              <h3>📜 Детали заклинания</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Время накладывания *</label>
                  <input
                    type="text"
                    name="casting_time"
                    placeholder="1 действие, 1 бонусное действие и т.д."
                    value={spell.casting_time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Дистанция *</label>
                  <input
                    type="text"
                    name="range"
                    placeholder="На себя, 30 футов и т.д."
                    value={spell.range}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Длительность *</label>
                  <input
                    type="text"
                    name="duration"
                    placeholder="Мгновенно, 1 час и т.д."
                    value={spell.duration}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Компоненты *</label>
                  <div className="components-row">
                    {['В', 'С', 'М'].map((comp) => (
                      <label key={comp} className="component-checkbox">
                        <input
                          type="checkbox"
                          checked={spell.components.includes(comp)}
                          onChange={() => handleComponentToggle(comp)}
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
            </div>

            {/* Эффекты и механика */}
            <div className="form-section">
              <h3>🎯 Эффекты и механика</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Тип урона</label>
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
                  <label>Спасбросок</label>
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

                <div className="form-group">
                  <label>Зона эффекта</label>
                  <div className="area-of-effect">
                    <select
                      name="area_of_effect"
                      value={spell.area_of_effect}
                      onChange={handleChange}
                    >
                      {areaTypes.map((type) => (
                        <option key={type} value={type}>
                          {type || 'Нет'}
                        </option>
                      ))}
                    </select>
                    {spell.area_of_effect && (
                      <input
                        type="text"
                        placeholder="Размер (например, 15 футов)"
                        value={spell.area_size || ''}
                        onChange={(e) =>
                          setSpell({ ...spell, area_size: e.target.value })
                        }
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Описание заклинания *</label>
                <textarea
                  name="description"
                  placeholder="Опишите, что происходит при накладывании заклинания..."
                  value={spell.description}
                  onChange={handleChange}
                  required
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Механика заклинания</label>
                <textarea
                  name="effect"
                  placeholder="Подробно опишите механику работы (урон, эффекты, условия и т.д.)"
                  value={spell.effect}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Эффект на высоких уровнях</label>
                <textarea
                  name="higher_levels"
                  placeholder="Как заклинание работает, если накладывается ячейкой более высокого уровня?"
                  value={spell.higher_levels}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            {/* Классы и параметры */}
            <div className="form-section">
              <h3>🧙‍♂️ Классы и параметры</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Классы *</label>
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

              <div className="form-group">
                <label>Источник</label>
                <input
                  type="text"
                  name="source"
                  placeholder="Доморощенное, Книга игрока и т.д."
                  value={spell.source}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                {isEditing ? 'Обновить заклинание' : 'Создать заклинание'}
              </button>

              {isEditing && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                >
                  Отмена
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Предпросмотр заклинания */}
        <div className="spell-preview-section">
          <div className="spell-card">
            <div className="spell-header">
              <h2>{spell.name || 'Название заклинания'}</h2>
              <div className="spell-meta">
                <span>{renderSpellLevel(spell.level)}</span>
                <span>
                  {spell.school.charAt(0).toUpperCase() + spell.school.slice(1)}
                </span>
                {spell.is_ritual && (
                  <span className="ritual-tag">(ритуал)</span>
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
                {renderComponents(spell.components, spell.materials)}
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

              {spell.area_of_effect && spell.area_size && (
                <p>
                  <strong>Зона эффекта:</strong> {spell.area_of_effect} (
                  {spell.area_size})
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

            <div className="spell-footer">
              {spell.classes.length > 0 && (
                <p>
                  <strong>Доступно классам:</strong> {spell.classes.join(', ')}
                </p>
              )}
              {spell.source && (
                <p>
                  <strong>Источник:</strong> {spell.source}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Список сохраненных заклинаний */}
      <div className="saved-spells-section">
        <div className="spells-controls">
          <h3>📚 Библиотека заклинаний ({filteredSpells.length})</h3>

          <div className="controls-row">
            <div className="search-filter">
              <input
                type="text"
                placeholder="Поиск по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="all">Все уровни</option>
                <option value="0">Заговоры</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}-й уровень
                  </option>
                ))}
              </select>

              <select
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
              >
                <option value="all">Все школы</option>
                {magicSchools.map((school) => (
                  <option key={school} value={school}>
                    {school.charAt(0).toUpperCase() + school.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Сначала новые</option>
                <option value="name">По названию</option>
                <option value="level">По уровню</option>
              </select>
            </div>
          </div>
        </div>

        {filteredSpells.length === 0 ? (
          <div className="no-spells">
            {savedSpells.length === 0 ? (
              <>
                <p>Вы ещё не создали ни одного заклинания.</p>
                <p>Начните с заполнения формы выше!</p>
              </>
            ) : (
              <p>Нет заклинаний, соответствующих выбранным фильтрам.</p>
            )}
          </div>
        ) : (
          <div className="spells-grid">
            {filteredSpells.map((savedSpell) => (
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
                  {savedSpell.is_ritual && ' (ритуал)'}
                </p>
                <p className="spell-classes">{savedSpell.classes.join(', ')}</p>
                <p className="spell-source">
                  {savedSpell.source || 'Доморощенное'}
                </p>
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
