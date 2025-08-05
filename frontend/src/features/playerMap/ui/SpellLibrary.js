// src/components/SpellLibrary.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GetPlayerSpells } from '../../../services/MapService';
import '../../../shared/styles/CreateSpell.css'; // или создай отдельный css, если нужно

const SpellLibrary = () => {
  const { id: profileId } = useParams();
  const [savedSpells, setSavedSpells] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [sortBy, setSortBy] = useState('date');

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

  const renderSpellLevel = (level) => {
    if (level === 0) return 'Заговор';
    if (level === 1) return '1-й уровень';
    return `${level}-й уровень`;
  };

  useEffect(() => {
    if (!profileId) return;
    GetPlayerSpells(profileId)
      .then((res) => setSavedSpells(res.data))
      .catch((err) => console.error('Ошибка загрузки заклинаний:', err));
  }, [profileId]);

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

  return (
    <div className="saved-spells-section">
      <div className="spells-controls">
        <h3>Библиотека заклинаний ({filteredSpells.length})</h3>

        <div className="controls-row">
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

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Сначала новые</option>
            <option value="name">По названию</option>
            <option value="level">По уровню</option>
          </select>
        </div>
      </div>

      {filteredSpells.length === 0 ? (
        <p>Нет заклинаний, соответствующих фильтрам или они не созданы.</p>
      ) : (
        <div className="spells-grid">
          {filteredSpells.map((spell) => (
            <div key={spell.id} className="spell-item">
              <div className="spell-item-header">
                <h4>{spell.name}</h4>
                <span className="spell-level">
                  {renderSpellLevel(spell.level)}
                </span>
              </div>
              <p className="spell-school">
                {spell.school.charAt(0).toUpperCase() + spell.school.slice(1)}
                {spell.is_ritual && ' (ритуал)'}
              </p>
              <p className="spell-classes">{spell.classes.join(', ')}</p>
              <p className="spell-source">{spell.source || 'Доморощенное'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpellLibrary;
