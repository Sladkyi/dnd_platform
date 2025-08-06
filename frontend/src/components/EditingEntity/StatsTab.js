import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFistRaised,
  FaRunning,
  FaShieldAlt,
  FaBrain,
  FaEye,
  FaComments,
  FaDiceD20,
  FaDice,
  FaCrown,
  FaHistory,
  FaFilter,
  FaSave,
  FaUpload,
  FaTrash,
  FaPlus,
  FaMinus,
} from 'react-icons/fa';

const getMod = (score) => Math.floor((score - 10) / 2);
const rollDie = (sides) => Math.floor(Math.random() * sides) + 1;

const StatBlock = ({
  label,
  base,
  skills,
  onChangeBase,
  rawBase,
  racialBonus,
  formData,
  handleChange,
  icon,
  statKey,
  proficiencyBonus,
  onRoll,
  customSkills,
  onAddCustomSkill,
  onRemoveCustomSkill,
  isReadOnly,
}) => {
  const mod = getMod(rawBase + racialBonus);
  const [rolling, setRolling] = useState(false);
  const [recentRolls, setRecentRolls] = useState([]);
  const [advantage, setAdvantage] = useState(null);

  useEffect(() => {
    if (statKey === 'dexterity') {
      handleChange('initiative', mod);
    }
  }, [mod, statKey, handleChange]);

  const handleRoll = useCallback(
    (skillName, proficient, customRoll) => {
      setRolling(true);

      setTimeout(() => {
        let rollResult, bonus;

        if (customRoll) {
          const [count, sides] = customRoll.split('d').map(Number);
          let rolls = [];
          let total = 0;

          for (let i = 0; i < count; i++) {
            const roll = rollDie(sides);
            rolls.push(roll);
            total += roll;
          }

          rollResult = {
            skill: skillName,
            rolls,
            total,
            isCustom: true,
            expression: customRoll,
          };
        } else {
          let roll1 = rollDie(20);
          let roll2 = advantage ? rollDie(20) : null;

          let finalRoll;
          if (advantage === 'advantage') {
            finalRoll = Math.max(roll1, roll2);
          } else if (advantage === 'disadvantage') {
            finalRoll = Math.min(roll1, roll2);
          } else {
            finalRoll = roll1;
          }

          bonus = mod + (proficient ? proficiencyBonus : 0);
          const total = finalRoll + bonus;

          rollResult = {
            skill: skillName,
            roll: finalRoll,
            bonus,
            total,
            isCritical: finalRoll === 20,
            isFail: finalRoll === 1,
            hasAdvantage: advantage,
            secondRoll: advantage
              ? advantage === 'advantage'
                ? Math.max(roll1, roll2)
                : Math.min(roll1, roll2)
              : null,
          };
        }

        setRecentRolls((prev) => [rollResult, ...prev.slice(0, 1)]);

        setRolling(false);
        onRoll(rollResult);
        setAdvantage(null);
      }, 600);
    },
    [mod, proficiencyBonus, advantage, onRoll]
  );

  const allSkills = [...skills, ...(customSkills[statKey] || [])];

  return (
    <div className="stat-tile">
      {/* Заголовок */}
      <div className="stat-header">
        <div className="header-content">
          <div className="header-left">
            <span className="stat-icon">{icon}</span>
            <h3 className="stat-title">{label}</h3>
          </div>
          <span className={`mod-badge ${mod >= 0 ? 'positive' : 'negative'}`}>
            {mod >= 0 ? `+${mod}` : mod}
          </span>
        </div>
      </div>

      {/* Контент */}
      <div className="stat-content">
        {/* Ввод значения */}
        <input
          type="number"
          value={rawBase === 0 ? '' : rawBase}
          onChange={onChangeBase}
          className="stat-input"
          min="0"
          max="30"
          disabled={isReadOnly}
        />

        {/* Бонусы */}
        <div className="race-bonus">
          <span>Бонус расы: </span>
          <span className="bonus-value">
            {racialBonus >= 0 ? `+${racialBonus}` : racialBonus}
          </span>
        </div>

        <div className="total-value">
          <span>Итого: {rawBase + racialBonus}</span>
        </div>

        {/* Преимущество / Помеха */}
        <div className="advantage-controls">
          <button
            className={`advantage-btn ${advantage === 'advantage' ? 'active' : ''}`}
            onClick={() =>
              setAdvantage(advantage === 'advantage' ? null : 'advantage')
            }
            disabled={rolling}
          >
            Преимущество
          </button>
          <button
            className={`disadvantage-btn ${advantage === 'disadvantage' ? 'active' : ''}`}
            onClick={() =>
              setAdvantage(advantage === 'disadvantage' ? null : 'disadvantage')
            }
            disabled={rolling}
          >
            Помеха
          </button>
        </div>

        {/* Блок спасброска */}
        <div className="saving-row">
          <div className="saving-left">
            <label className="custom-checkbox">
              <input
                type="checkbox"
                checked={!!formData[`${statKey}_save_proficient`]}
                onChange={(e) =>
                  handleChange(`${statKey}_save_proficient`, e.target.checked)
                }
                disabled={isReadOnly}
              />
              <span className="checkmark"></span>
            </label>

            <button
              className={`dice-button small ${rolling ? 'rolling' : ''}`}
              onClick={() =>
                handleRoll(
                  `Спасбросок ${label}`,
                  formData[`${statKey}_save_proficient`]
                )
              }
              disabled={rolling}
              title="Спасбросок"
            >
              <FaShieldAlt />
            </button>

            <button
              className={`dice-button small ${rolling ? 'rolling' : ''}`}
              onClick={() => handleRoll(`Проверка ${label}`, false)}
              disabled={rolling}
              title="Проверка"
            >
              <FaDice />
            </button>
          </div>

          <span className="skill-bonus">
            {(() => {
              const prof = formData[`${statKey}_save_proficient`];
              const totalBonus = mod + (prof ? proficiencyBonus : 0);
              return totalBonus >= 0 ? `+${totalBonus}` : totalBonus;
            })()}
          </span>
        </div>

        {/* Список навыков */}
        <div className="skill-list">
          {allSkills.map((skill) => {
            const proficient = !!formData[`${skill.key}_proficient`];
            const bonus = mod + (proficient ? proficiencyBonus : 0);

            return (
              <div
                key={skill.key}
                className={`skill-row ${proficient ? 'proficient' : ''}`}
              >
                <div className="skill-left">
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={proficient}
                      onChange={(e) =>
                        handleChange(
                          `${skill.key}_proficient`,
                          e.target.checked
                        )
                      }
                      disabled={isReadOnly}
                    />
                    <span className="checkmark"></span>
                  </label>

                  <span
                    className="skill-name"
                    title={skill.tooltip || 'Стандартный навык'}
                  >
                    {skill.name}
                  </span>

                  {skill.isCustom && !isReadOnly && (
                    <button
                      className="delete-button"
                      onClick={() => onRemoveCustomSkill(statKey, skill.key)}
                      title="Удалить навык"
                    >
                      <FaTrash size={12} />
                    </button>
                  )}

                  <button
                    className={`dice-button ${rolling ? 'rolling' : ''}`}
                    onClick={() => handleRoll(skill.name, proficient)}
                    disabled={rolling}
                    title={`Бросить ${skill.name}`}
                  >
                    <FaDiceD20 />
                  </button>
                </div>

                <span
                  className={`skill-bonus ${bonus >= 0 ? 'positive' : 'negative'}`}
                >
                  {bonus >= 0 ? `+${bonus}` : bonus}
                </span>
              </div>
            );
          })}

          {!isReadOnly && (
            <div className="add-skill-container">
              <button
                className="add-skill-button"
                onClick={() => {
                  const name = prompt('Название навыка:');
                  if (name) {
                    const tooltip = prompt('Описание навыка (опционально):');
                    const key = `custom_${Date.now()}`;
                    onAddCustomSkill(statKey, {
                      name,
                      key,
                      tooltip,
                      isCustom: true,
                    });
                  }
                }}
              >
                <FaPlus size={10} className="icon" /> Добавить навык
              </button>
            </div>
          )}
        </div>
      </div>

      {/* История бросков */}
      <div className="recent-rolls">
        {recentRolls.length > 0 && (
          <>
            <div className="recent-label">Последние броски:</div>
            {recentRolls.map((roll, index) => (
              <div
                key={index}
                className={`recent-roll ${roll.isCritical ? 'critical' : roll.isFail ? 'fail' : ''}`}
              >
                <span className="roll-skill">{roll.skill}:</span>
                <span className="roll-result">{roll.total}</span>
                {!roll.isCustom && (
                  <span className="roll-details">
                    ({roll.roll} + {roll.bonus})
                    {roll.hasAdvantage && (
                      <span>
                        {roll.hasAdvantage === 'advantage' ? '▲' : '▼'}
                      </span>
                    )}
                  </span>
                )}
                {roll.isCustom && (
                  <span className="roll-details">
                    ({roll.rolls.join(' + ')})
                  </span>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const DiceHistory = ({ history, filters, setFilters, clearHistory }) => {
  const filteredHistory = history.filter((roll) => {
    if (filters.criticalOnly && !roll.isCritical) return false;
    if (filters.failOnly && !roll.isFail) return false;
    return true;
  });

  return (
    <div className="history-panel">
      <div className="history-header">
        <div className="header-left">
          <FaHistory className="icon" />
          <span>История бросков</span>
        </div>
        <div className="header-controls">
          <button
            className={`filter-btn ${filters.criticalOnly ? 'active' : ''}`}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                criticalOnly: !prev.criticalOnly,
                failOnly: false,
              }))
            }
            title="Только критические успехи"
          >
            <FaCrown />
          </button>
          <button
            className={`filter-btn ${filters.failOnly ? 'active' : ''}`}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                failOnly: !prev.failOnly,
                criticalOnly: false,
              }))
            }
            title="Только критические провалы"
          >
            <FaFilter />
          </button>
          <button
            className="clear-btn"
            onClick={clearHistory}
            title="Очистить историю"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      <div className="history-body">
        {filteredHistory.length === 0 ? (
          <div className="empty-history">История бросков пуста</div>
        ) : (
          <div className="history-list">
            {filteredHistory.map((roll, index) => (
              <div
                key={index}
                className={`history-item ${roll.isCritical ? 'critical' : roll.isFail ? 'fail' : ''}`}
              >
                <div className="history-skill">{roll.skill}</div>
                <div className="history-result">
                  {roll.total}
                  {roll.isCritical && <span className="icon">🔥</span>}
                  {roll.isFail && <span className="icon">💥</span>}
                </div>
                <div className="history-details">
                  {roll.isCustom ? (
                    <span>
                      {roll.expression}: [{roll.rolls.join(', ')}]
                    </span>
                  ) : (
                    <span>
                      {roll.roll} + {roll.bonus}
                      {roll.hasAdvantage && (
                        <span>
                          {' '}
                          (
                          {roll.hasAdvantage === 'advantage'
                            ? 'Преимущество'
                            : 'Помеха'}
                          )
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="history-time">{roll.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatsTab = ({ formData, handleChange }) => {
  const stats = [
    {
      label: 'Сила',
      key: 'strength',
      icon: <FaFistRaised />,
      skills: [
        {
          name: 'Атлетика',
          key: 'athletics',
          tooltip: 'Прыжки, лазание, плавание, борьба',
        },
      ],
    },
    {
      label: 'Ловкость',
      key: 'dexterity',
      icon: <FaRunning />,
      skills: [
        {
          name: 'Акробатика',
          key: 'acrobatics',
          tooltip: 'Баланс, сальто, сложные движения',
        },
        {
          name: 'Ловкость рук',
          key: 'sleight_of_hand',
          tooltip: 'Карманные кражи, фокусы, скрытые действия',
        },
        {
          name: 'Скрытность',
          key: 'stealth',
          tooltip: 'Передвижение незаметно, укрытие',
        },
      ],
    },
    {
      label: 'Телосложение',
      key: 'constitution',
      icon: <FaShieldAlt />,
      skills: [],
    },
    {
      label: 'Интеллект',
      key: 'intelligence',
      icon: <FaBrain />,
      skills: [
        {
          name: 'Анализ',
          key: 'investigation',
          tooltip: 'Поиск улик, анализ информации',
        },
        {
          name: 'История',
          key: 'history',
          tooltip: 'Знание исторических событий и личностей',
        },
        {
          name: 'Магия',
          key: 'arcana',
          tooltip: 'Знание магических традиций и существ',
        },
        {
          name: 'Природа',
          key: 'nature',
          tooltip: 'Знание растений, животных, погоды',
        },
        {
          name: 'Религия',
          key: 'religion',
          tooltip: 'Знание божеств, ритуалов, религиозных орденов',
        },
      ],
    },
    {
      label: 'Мудрость',
      key: 'wisdom',
      icon: <FaEye />,
      skills: [
        {
          name: 'Восприятие',
          key: 'perception',
          tooltip: 'Замечать детали, скрытые объекты, звуки',
        },
        {
          name: 'Выживание',
          key: 'survival',
          tooltip: 'Ориентирование, выслеживание, охота',
        },
        {
          name: 'Медицина',
          key: 'medicine',
          tooltip: 'Диагностика болезней, лечение ран',
        },
        {
          name: 'Проницательность',
          key: 'insight',
          tooltip: 'Понимание мотивов, обнаружение лжи',
        },
        {
          name: 'Уход за животными',
          key: 'animal_handling',
          tooltip: 'Успокаивание, управление, тренировка животных',
        },
      ],
    },
    {
      label: 'Харизма',
      key: 'charisma',
      icon: <FaComments />,
      skills: [
        {
          name: 'Выступление',
          key: 'performance',
          tooltip: 'Пение, танец, актерское мастерство',
        },
        {
          name: 'Запугивание',
          key: 'intimidation',
          tooltip: 'Запугивание, психологическое давление',
        },
        {
          name: 'Обман',
          key: 'deception',
          tooltip: 'Ложь, маскировка, блеф',
        },
        {
          name: 'Убеждение',
          key: 'persuasion',
          tooltip: 'Убеждение, переговоры, дипломатия',
        },
      ],
    },
  ];

  const [proficiencyBonus, setProficiencyBonus] = useState(
    formData.proficiency_bonus || 2
  );
  const [diceHistory, setDiceHistory] = useState([]);
  const [filters, setFilters] = useState({
    criticalOnly: false,
    failOnly: false,
  });
  const [customSkills, setCustomSkills] = useState({});
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [characterClass, setCharacterClass] = useState(
    formData.character_class || ''
  );

  const getFinalStat = (key) => {
    const racialBonus = formData.race_ability_bonuses?.[key.toUpperCase()] || 0;
    return (formData[key] ?? 10) + racialBonus;
  };

  useEffect(() => {
    if (typeof characterClass === 'string') {
      let bonus;
      switch (characterClass.toLowerCase()) {
        case 'воин':
        case 'паладин':
        case 'следопыт':
          bonus = 2;
          break;
        case 'чародей':
        case 'волшебник':
        case 'жрец':
          bonus = 3;
          break;
        case 'маг':
        case 'друид':
          bonus = 4;
          break;
        default:
          bonus = 2;
      }
      setProficiencyBonus(bonus);
      handleChange('proficiency_bonus', bonus);
    }
  }, [characterClass, handleChange]);

  const handleRoll = useCallback((rollResult) => {
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    setDiceHistory((prev) => [
      {
        ...rollResult,
        id: Date.now(),
        time,
      },
      ...prev.slice(0, 49),
    ]);
  }, []);

  const clearHistory = useCallback(() => {
    setDiceHistory([]);
  }, []);

  const addCustomSkill = useCallback((statKey, skill) => {
    setCustomSkills((prev) => ({
      ...prev,
      [statKey]: [...(prev[statKey] || []), skill],
    }));
  }, []);

  const removeCustomSkill = useCallback((statKey, skillKey) => {
    setCustomSkills((prev) => ({
      ...prev,
      [statKey]: (prev[statKey] || []).filter(
        (skill) => skill.key !== skillKey
      ),
    }));
  }, []);
  const handleUseSlot = (index) => {
    if (formData.spell_slots_used < formData.spell_slots_total) {
      handleChange('spell_slots_used', formData.spell_slots_used + 1);
    }
  };

  const handleResetSlots = () => {
    handleChange('spell_slots_used', 0);
  };
  const exportStats = useCallback(() => {
    const data = {
      ...formData,
      customSkills,
      diceHistory,
      proficiencyBonus,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dnd-stats-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [formData, customSkills, diceHistory, proficiencyBonus]);

  const importStats = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          Object.keys(data).forEach((key) => {
            if (key !== 'customSkills' && key !== 'diceHistory') {
              handleChange(key, data[key]);
            }
          });

          if (data.customSkills) setCustomSkills(data.customSkills);
          if (data.diceHistory) setDiceHistory(data.diceHistory);
          if (data.proficiencyBonus) setProficiencyBonus(data.proficiencyBonus);

          alert('Данные успешно импортированы!');
        } catch (error) {
          console.error('Ошибка импорта:', error);
          alert('Ошибка при импорте данных');
        }
      };
      reader.readAsText(file);
    },
    [handleChange]
  );

  return (
    <div className="stats-tab">
      <div className="controls-container">
        <div className="form-group">
          <label>Класс персонажа</label>
          <select
            value={characterClass}
            onChange={(e) => {
              setCharacterClass(e.target.value);
              handleChange('character_class', e.target.value);
            }}
          >
            <option value="">Выберите класс</option>
            <option value="Воин">Воин</option>
            <option value="Паладин">Паладин</option>
            <option value="Следопыт">Следопыт</option>
            <option value="Чародей">Чародей</option>
            <option value="Волшебник">Волшебник</option>
            <option value="Жрец">Жрец</option>
            <option value="Маг">Маг</option>
            <option value="Друид">Друид</option>
          </select>
        </div>

        <div className="form-group">
          <label>Бонус мастерства</label>
          <div className="bonus-controls">
            <button
              className="bonus-btn"
              onClick={() => {
                const newBonus = Math.max(1, proficiencyBonus - 1);
                setProficiencyBonus(newBonus);
                handleChange('proficiency_bonus', newBonus);
              }}
              disabled={proficiencyBonus <= 1}
            >
              <FaMinus />
            </button>
            <input
              type="number"
              value={proficiencyBonus}
              onChange={(e) => {
                const newBonus = parseInt(e.target.value) || 2;
                setProficiencyBonus(newBonus);
                handleChange('proficiency_bonus', newBonus);
              }}
              min="1"
              max="10"
            />
            <button
              className="bonus-btn"
              onClick={() => {
                const newBonus = Math.min(10, proficiencyBonus + 1);
                setProficiencyBonus(newBonus);
                handleChange('proficiency_bonus', newBonus);
              }}
              disabled={proficiencyBonus >= 10}
            >
              <FaPlus />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Режим</label>
          <button
            className={`mode-btn ${isReadOnly ? 'read-only' : ''}`}
            onClick={() => setIsReadOnly(!isReadOnly)}
          >
            {isReadOnly ? 'Только чтение' : 'Редактирование'}
          </button>
        </div>

        <div className="import-export">
          <button
            className="export-btn"
            onClick={exportStats}
            title="Экспорт данных"
          >
            <FaSave />
          </button>
          <label className="import-btn" title="Импорт данных">
            <FaUpload />
            <input
              type="file"
              accept=".json"
              onChange={importStats}
              className="hidden-input"
            />
          </label>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.key}>
            <StatBlock
              label={stat.label}
              statKey={stat.key}
              base={getFinalStat(stat.key)}
              rawBase={formData[stat.key]}
              racialBonus={formData.race_ability_bonuses?.[stat.key] || 0}
              skills={stat.skills}
              onChangeBase={(e) => handleChange(stat.key, +e.target.value)}
              formData={formData}
              handleChange={handleChange}
              icon={stat.icon}
              proficiencyBonus={proficiencyBonus}
              onRoll={handleRoll}
              customSkills={customSkills}
              onAddCustomSkill={addCustomSkill}
              onRemoveCustomSkill={removeCustomSkill}
              isReadOnly={isReadOnly}
            />
          </div>
        ))}

        <div className="history-container">
          <DiceHistory
            history={diceHistory}
            filters={filters}
            setFilters={setFilters}
            clearHistory={clearHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default StatsTab;
