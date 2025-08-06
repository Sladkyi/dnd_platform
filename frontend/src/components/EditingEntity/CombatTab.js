import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  HeartPulse,
  Shield,
  LightningCharge,
  Stopwatch,
  Dice5,
  Plus,
  ArrowRepeat,
  ArrowDown,
  ArrowUp,
  Check,
} from 'react-bootstrap-icons';
import {
  FaCrosshairs,
  FaFire,
  FaSnowflake,
  FaBolt,
  FaSkull,
  FaTrash,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AttackPickerModal from '../AttackPickerModal';
import { GetPlayerAttacks } from '../../services/MapService';
import { Trash } from 'react-bootstrap-icons';

const CombatTab = ({ formData, handleChange, removeAttack, selectedShape }) => {
  console.log(`[CombatTab] Рендер компонента. formData:`, formData);

  // Состояния для управления UI
  const [rolledInitiative, setRolledInitiative] = useState(null);
  const [hitDiceResult, setHitDiceResult] = useState(null);
  const [diceRolls, setDiceRolls] = useState([]);
  const [newState, setNewState] = useState('');
  const [showAttackPicker, setShowAttackPicker] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    health: true,
    defense: true,
    attacks: true,
    initiative: true,
    states: true,
  });
  const prevHP = useRef(formData.current_hp);
  const [attacks, setAttacks] = useState([]);
  const [playerAttacks, setPlayerAttacks] = useState([]);
  const currentProfileId = formData.owner;

  // Анимационные варианты
  const popupVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2, ease: 'easeInOut' },
    },
  };

  // Добавление атаки
  const addAttack = () => {
    console.log(`[addAttack] Открытие пикера атак`);
    setShowAttackPicker(true);
  };

  // Использование ячейки заклинаний
  const handleUseSlot = (index) => {
    console.log(`[handleUseSlot] Использование ячейки заклинаний #${index}`);

    if (formData.spell_slots_used < formData.spell_slots_total) {
      handleChange('spell_slots_used', formData.spell_slots_used + 1);
    } else {
      console.log(`[handleUseSlot] Нет доступных ячеек заклинаний`);
    }
  };

  // Сброс ячеек заклинаний
  const handleResetSlots = () => {
    console.log(`[handleResetSlots] Сброс ячеек заклинаний`);
    handleChange('spell_slots_used', 0);
  };

  // Загрузка атак игрока
  useEffect(() => {
    console.log(
      `[useEffect] Загрузка атак игрока. profileId: ${currentProfileId}`
    );

    if (!currentProfileId) {
      console.log(`[useEffect] ID профиля не указан, пропуск загрузки атак`);
      return;
    }

    const fetchAttacks = async () => {
      try {
        console.log(
          `[fetchAttacks] Запрос атак для профиля ${currentProfileId}`
        );
        const res = await GetPlayerAttacks(currentProfileId);

        if (Array.isArray(res.data)) {
          console.log(`[fetchAttacks] Получено ${res.data.length} атак`);
          setPlayerAttacks(res.data);
        } else {
          console.warn(
            `[fetchAttacks] Получены некорректные данные:`,
            res.data
          );
          setPlayerAttacks([]);
        }
      } catch (error) {
        console.error(`[fetchAttacks] Ошибка загрузки атак:`, error);
        setPlayerAttacks([]);
      }
    };

    fetchAttacks();
  }, [currentProfileId]);

  // Отслеживание изменения HP
  useEffect(() => {
    console.log(`[useEffect] Отслеживание изменения HP`);

    if (prevHP.current !== formData.current_hp) {
      const hpChange = formData.current_hp - prevHP.current;
      prevHP.current = formData.current_hp;

      if (Math.abs(hpChange) > 0) {
        console.log(`[useEffect] Изменение HP: ${hpChange}`);

        setHitDiceResult({
          roll: 0,
          mod: hpChange,
          total: hpChange > 0 ? `+${hpChange} HP` : `${hpChange} HP`,
        });

        setTimeout(() => {
          console.log(`[useEffect] Скрытие результата изменения HP`);
          setHitDiceResult(null);
        }, 2500);
      }
    }
  }, [formData.current_hp]);

  // Функции для бросков
  const rollInitiative = () => {
    console.log(`[rollInitiative] Бросок инициативы`);

    const d20 = Math.floor(Math.random() * 20) + 1;
    const dexMod = formData.initiative || 0;
    const total = d20 + dexMod;

    console.log(
      `[rollInitiative] Результат: d20=${d20}, мод=${dexMod}, итог=${total}`
    );
    return { roll: d20, mod: dexMod, total };
  };

  const handleInitiativeRoll = () => {
    console.log(`[handleInitiativeRoll] Запуск броска инициативы`);
    const result = rollInitiative();
    setRolledInitiative(result);

    setTimeout(() => {
      console.log(`[handleInitiativeRoll] Скрытие результата`);
      setRolledInitiative(null);
    }, 3500);
  };

  const rollHitDice = () => {
    console.log(`[rollHitDice] Бросок кости хитов`);

    const [_, dieStr] = (formData.hit_dice || '1d10').split('d');
    const die = parseInt(dieStr) || 10;
    const conMod = parseInt(formData.con_mod) || 0;
    const roll = Math.floor(Math.random() * die) + 1;

    console.log(
      `[rollHitDice] Результат: d${die}=${roll}, мод=${conMod}, итог=${roll + conMod}`
    );
    return { roll, mod: conMod, total: roll + conMod };
  };

  const handleUseHitDice = () => {
    console.log(`[handleUseHitDice] Использование кости хитов`);

    const result = rollHitDice();
    const max = parseInt(formData.max_hp) || 0;
    const current = parseInt(formData.current_hp) || 0;
    const healing = result.total;
    const newHp = Math.min(current + healing, max);

    console.log(`[handleUseHitDice] Лечение: ${healing}, новое HP: ${newHp}`);

    handleChange('current_hp', newHp);
    setHitDiceResult(result);

    setTimeout(() => {
      console.log(`[handleUseHitDice] Скрытие результата`);
      setHitDiceResult(null);
    }, 3500);
  };

  const handleRest = () => {
    console.log(`[handleRest] Полное восстановление HP`);

    const full = parseInt(formData.max_hp) || 0;
    handleChange('current_hp', full);

    setHitDiceResult({
      roll: 0,
      mod: 0,
      total: 'Все HP восстановлены',
    });

    setTimeout(() => {
      console.log(`[handleRest] Скрытие результата`);
      setHitDiceResult(null);
    }, 3000);
  };

  const handleDiceClick = (die) => {
    console.log(`[handleDiceClick] Бросок кости: ${die}`);

    const dieValue = parseInt(die.slice(1));
    const roll = Math.floor(Math.random() * dieValue) + 1;
    const newRoll = {
      id: Date.now(),
      die,
      result: roll,
    };

    console.log(`[handleDiceClick] Результат: ${roll}`);

    setDiceRolls((prev) => [...prev, newRoll]);

    setTimeout(() => {
      console.log(`[handleDiceClick] Удаление результата броска ${die}`);
      setDiceRolls((prev) => prev.filter((r) => r.id !== newRoll.id));
    }, 3500);
  };

  const rollDiceMacro = () => {
    console.log(`[rollDiceMacro] Бросок макроса: ${formData.dice_macro}`);

    if (!formData.dice_macro) {
      console.log(`[rollDiceMacro] Макрос не задан, бросок d20`);
      handleDiceClick('d20');
      return;
    }

    const macro = formData.dice_macro.toLowerCase();
    const match = macro.match(/(\d*)d(\d+)([+-]\d+)?/);

    if (!match) {
      console.warn(`[rollDiceMacro] Некорректный макрос: ${macro}`);
      handleDiceClick('d20');
      return;
    }

    const count = parseInt(match[1] || '1');
    const die = parseInt(match[2]);
    const mod = match[3] ? parseInt(match[3]) : 0;

    let total = 0;
    const rolls = [];

    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * die) + 1;
      rolls.push(roll);
      total += roll;
    }

    total += mod;

    const resultText = `${count > 1 ? `${rolls.join(' + ')} ` : ''}${mod ? `+ ${mod} = ` : ''}${total}`;

    const newRoll = {
      id: Date.now(),
      die: macro,
      result: resultText,
    };

    console.log(`[rollDiceMacro] Результат: ${resultText}`);

    setDiceRolls((prev) => [...prev, newRoll]);

    setTimeout(() => {
      console.log(`[rollDiceMacro] Удаление результата макроса`);
      setDiceRolls((prev) => prev.filter((r) => r.id !== newRoll.id));
    }, 4500);
  };

  // Функции для управления состояниями
  const addCustomState = () => {
    console.log(`[addCustomState] Добавление состояния: ${newState}`);

    if (newState.trim()) {
      const states = formData.states || [];
      const newStates = [...states, newState.trim()];
      handleChange('states', newStates);
      setNewState('');
    }
  };

  const toggleState = (state) => {
    console.log(`[toggleState] Переключение состояния: ${state}`);

    const states = formData.states || [];
    const newStates = states.includes(state)
      ? states.filter((s) => s !== state)
      : [...states, state];

    handleChange('states', newStates);
  };

  // Функции для управления секциями
  const toggleSection = (section) => {
    console.log(`[toggleSection] Переключение секции: ${section}`);

    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Расчет процента HP для прогресс бара
  const hpPercent = Math.max(
    0,
    Math.min(100, ((formData.current_hp || 0) / (formData.max_hp || 1)) * 100)
  );

  const expForNextLevel = (level) => level * 100;

  // Функция расчёта прогресса
  const calculateProgress = (experience, level) => {
    const previousLevelExp = expForNextLevel(level - 1);
    const nextLevelExp = expForNextLevel(level);
    const currentExp = experience - previousLevelExp;
    const neededExp = nextLevelExp - previousLevelExp;
    return Math.min((currentExp / neededExp) * 100, 100);
  };

  const getDamageTypeIcon = (damageType) => {
    console.log(
      `[getDamageTypeIcon] Получение иконки для типа урона: ${damageType}`
    );

    if (!damageType) return <FaCrosshairs className="damage-icon" />;

    const lowerType = damageType.toLowerCase();

    if (lowerType.includes('огн'))
      return <FaFire className="damage-icon fire" />;
    if (lowerType.includes('холод'))
      return <FaSnowflake className="damage-icon cold" />;
    if (lowerType.includes('электр'))
      return <FaBolt className="damage-icon lightning" />;
    if (lowerType.includes('некро') || lowerType.includes('ядовит'))
      return <FaSkull className="damage-icon poison" />;

    return <FaCrosshairs className="damage-icon" />;
  };

  // Обработчик выбора атаки/заклинания
  const handleSelectAttack = (selectedAttack) => {
    console.log(
      `[handleSelectAttack] Выбрана атака/заклинание:`,
      selectedAttack
    );

    if (selectedAttack.source === 'attack') {
      const updatedAttacks = [...(formData.attacks || []), selectedAttack];
      handleChange('attacks', updatedAttacks);
    } else if (selectedAttack.source === 'spell') {
      const updatedSpells = [...(formData.spells || []), selectedAttack];
      handleChange('spells', updatedSpells);
    }

    setShowAttackPicker(false);
  };

  // Обработчик удаления атаки/заклинания
  const handleRemoveAttack = (item) => {
    console.log(`[handleRemoveAttack] Удаление:`, item);

    if (item.source === 'attack') {
      const updatedAttacks = formData.attacks.filter((a) => a.id !== item.id);
      handleChange('attacks', updatedAttacks);
    } else if (item.source === 'spell') {
      const updatedSpells = formData.spells.filter((s) => s.id !== item.id);
      handleChange('spells', updatedSpells);
    }
  };

  return (
    <div className="combat-tab">
      <Row className="g-4">
        {/* ========== ЗДОРОВЬЕ ========== */}
        <Col md={6}>
          <div className="panel health-panel">
            <div
              className="section-title expandable"
              onClick={() => toggleSection('health')}
            >
              <div className="d-flex align-items-center">
                <HeartPulse className="health-icon" />
                <span>Здоровье</span>
              </div>
              {expandedSections.health ? <ArrowUp /> : <ArrowDown />}
            </div>

            <AnimatePresence>
              {expandedSections.health && (
                <motion.div
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="hp-display">
                    <div className="hp-numbers">
                      <span className="current-hp">
                        {formData.current_hp || 0}
                      </span>
                      <span className="max-hp">/ {formData.max_hp || 0}</span>
                      {formData.temp_hp > 0 && (
                        <span className="temp-hp">
                          +{formData.temp_hp || 0} временных
                        </span>
                      )}
                    </div>
                    <div className="hp-bar">
                      <div
                        className="hp-bar-fill"
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="level-section">
                    <span className="level-label">Уровень:</span>
                    <span className="level-value">{formData.level || 1}</span>
                    <div className="level-bar">
                      <div
                        className="level-bar-fill"
                        style={{
                          width: `${calculateProgress(formData.experience || 0, formData.level || 1)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="level-exp">
                      {formData.experience || 0} /{' '}
                      {expForNextLevel(formData.level || 1)} XP
                    </span>
                  </div>
                  <Row className="g-3 align-items-end mt-3">
                    <Col>
                      <label className="mb-2 d-block input-label">
                        Макс. HP
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.max_hp ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const parsed = val === '' ? null : parseInt(val);
                          handleChange('max_hp', parsed);
                        }}
                        className="form-input"
                      />
                    </Col>
                    <Col>
                      <label className="mb-2 d-block input-label">
                        Текущее HP
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.current_hp ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const parsed = val === '' ? null : parseInt(val);
                          handleChange('current_hp', parsed);
                        }}
                        className="form-input"
                      />
                    </Col>
                    <Col xs="auto">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Временные HP</Tooltip>}
                      >
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formData.temp_hp ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const parsed = val === '' ? null : parseInt(val);
                            handleChange('temp_hp', parsed);
                          }}
                          className="form-input temp-hp-input"
                          placeholder="Врем."
                        />
                      </OverlayTrigger>
                    </Col>
                    <Col xs="auto">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Восстановить здоровье</Tooltip>}
                      >
                        <button
                          className="restore-button"
                          onClick={() =>
                            handleChange('current_hp', formData.max_hp)
                          }
                        >
                          <ArrowRepeat />
                        </button>
                      </OverlayTrigger>
                    </Col>
                  </Row>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Col>

        {/* ========== ЯЧЕЙКИ ЗАКЛИНАНИЙ ========== */}
        <div className="panel spell-slots-panel">
          <div className="section-title">Ячейки заклинаний</div>
          <div className="spell-slot-row">
            <span className="spell-slot-count">
              {formData.spell_slots_used} / {formData.spell_slots_total}
            </span>
            <div className="spell-slot-boxes">
              {[...Array(formData.spell_slots_total)].map((_, i) => (
                <div
                  key={i}
                  className={`spell-slot-box ${i < formData.spell_slots_used ? 'used' : ''}`}
                  onClick={() => handleUseSlot(i)}
                ></div>
              ))}
            </div>
            <button
              className="reset-slot-button"
              onClick={handleResetSlots}
              title="Восстановить ячейки"
            >
              <ArrowRepeat />
            </button>
          </div>
        </div>

        {/* ========== ЗАЩИТА ========== */}
        <Col md={6}>
          <div className="panel defense-panel">
            <div
              className="section-title expandable"
              onClick={() => toggleSection('defense')}
            >
              <div className="d-flex align-items-center">
                <Shield className="defense-icon" />
                <span>Защита</span>
              </div>
              {expandedSections.defense ? <ArrowUp /> : <ArrowDown />}
            </div>

            <AnimatePresence>
              {expandedSections.defense && (
                <motion.div
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <label className="mb-1 text-light">Класс брони</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="form-input"
                        value={formData.armor_class ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const parsed = val === '' ? null : parseInt(val);
                          handleChange('armor_class', parsed);
                        }}
                      />
                    </Col>
                    <Col md={6}>
                      <label className="mb-1 text-light">Скорость</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="form-input"
                        value={formData.speed ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const parsed = val === '' ? null : parseInt(val);
                          handleChange('speed', parsed);
                        }}
                      />
                    </Col>
                  </Row>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Col>

        {/* ========== АТАКИ И ЗАКЛИНАНИЯ ========== */}
        <div className="panel attacks-panel">
          <div
            className="section-title attacks-header expandable"
            onClick={() => toggleSection('attacks')}
          >
            <div className="d-flex align-items-center">
              <LightningCharge className="attacks-icon" />
              <span>Атаки и заклинания</span>
              <span className="badge attacks-count">
                {(formData.attacks?.length || 0) +
                  (formData.spells?.length || 0)}
              </span>
            </div>
            <div className="d-flex align-items-center">
              <button
                className="add-attack-button"
                onClick={(e) => {
                  e.stopPropagation();
                  addAttack();
                }}
              >
                <Plus />
                <span>Добавить</span>
              </button>
              {expandedSections.attacks ? <ArrowUp /> : <ArrowDown />}
            </div>
          </div>

          {expandedSections.attacks && (
            <div className="attacks-list">
              {[...formData.attacks, ...formData.spells].length > 0 ? (
                [
                  ...formData.attacks.map((a) => ({ ...a, source: 'attack' })),
                  ...formData.spells.map((s) => ({ ...s, source: 'spell' })),
                ].map((item, index) => (
                  <div key={index} className="attack-card compact">
                    <div className="attack-icon">
                      {getDamageTypeIcon(item.damageType)}
                    </div>
                    <div className="attack-info">
                      <div className="attack-name">{item.name}</div>
                      <div className="attack-stats">
                        <span className="damage">{item.damageDice}</span>
                        <span className="type">{item.damageType}</span>
                        <span className="range">{item.range}</span>
                      </div>
                    </div>
                    <div className="attack-tags">
                      {item.source === 'attack' ? (
                        <span className="badge bg-primary me-2">Атака</span>
                      ) : (
                        <span className="badge bg-info me-2">Заклинание</span>
                      )}
                    </div>
                    <button
                      className="delete-attack"
                      onClick={() => handleRemoveAttack(item)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-attacks">
                  <p>Нет добавленных атак или заклинаний</p>
                  <button className="btn-add-attack" onClick={addAttack}>
                    <Plus size={16} />
                    Добавить первую
                  </button>
                </div>
              )}
            </div>
          )}

          <AttackPickerModal
            show={showAttackPicker}
            onClose={() => {
              console.log(`[AttackPickerModal] Закрытие пикера атак`);
              setShowAttackPicker(false);
            }}
            onSelect={handleSelectAttack}
            profileId={currentProfileId}
            attacks={playerAttacks}
          />
        </div>

        {/* ========== ИНИЦИАТИВА И КОСТИ ========== */}
        <Col md={8}>
          <Row className="g-4">
            <Col md={6}>
              <div className="panel initiative-panel">
                <div
                  className="section-title expandable"
                  onClick={() => toggleSection('initiative')}
                >
                  <div className="d-flex align-items-center">
                    <Stopwatch className="initiative-icon" />
                    <span>Инициатива</span>
                  </div>
                  {expandedSections.initiative ? <ArrowUp /> : <ArrowDown />}
                </div>

                <AnimatePresence>
                  {expandedSections.initiative && (
                    <motion.div
                      variants={sectionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="initiative-display">
                        <div className="initiative-value">
                          {formData.initiative >= 0 ? '+' : ''}
                          {formData.initiative || 0}
                        </div>
                        <div className="initiative-modifier">
                          Модификатор: {formData.initiative >= 0 ? '+' : ''}
                          {formData.initiative || 0}
                        </div>

                        <button
                          className="roll-initiative-button"
                          onClick={handleInitiativeRoll}
                          title="Бросить инициативу"
                        >
                          <Dice5 size={24} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {rolledInitiative && (
                          <motion.div
                            className="roll-result-popup"
                            variants={popupVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            🎲 {rolledInitiative.roll} +{' '}
                            {formData.initiative || 0} ={' '}
                            <strong>{rolledInitiative.total}</strong>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Col>
            <Col md={6}>
              <div className="panel hitdice-panel">
                <div className="section-title">
                  <Dice5 className="hitdice-icon" />
                  <span>Кости хитов</span>
                </div>

                <div className="hitdice-display">
                  <div className="hitdice-value">
                    {formData.class_hit_dice || '1d10'}
                  </div>

                  <div className="d-flex justify-content-center gap-3 mt-2">
                    <button
                      className="hitdice-button use"
                      onClick={handleUseHitDice}
                    >
                      <Dice5 /> Использовать
                    </button>

                    <button
                      className="hitdice-button rest"
                      onClick={handleRest}
                    >
                      <span className="rest-icon">🛌</span> Отдых
                    </button>
                  </div>

                  <AnimatePresence>
                    {hitDiceResult && (
                      <motion.div
                        className="hitdice-popup"
                        variants={popupVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        {typeof hitDiceResult.total === 'string' ? (
                          <strong>{hitDiceResult.total}</strong>
                        ) : (
                          <>
                            +{hitDiceResult.total} HP{' '}
                            <span className="breakdown">
                              ({hitDiceResult.roll} + {hitDiceResult.mod})
                            </span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Col>

            <Col md={12}>
              <div className="panel actions-panel">
                <div className="section-title">Боевые действия</div>
                <textarea
                  rows={3}
                  value={formData.combat_actions || ''}
                  onChange={(e) =>
                    handleChange('combat_actions', e.target.value)
                  }
                  placeholder="Особые способности, заклинания, тактика..."
                  className="actions-textarea"
                />
              </div>
            </Col>
          </Row>
        </Col>

        {/* ========== СОСТОЯНИЯ И КОСТИ ========== */}
        <Col md={4}>
          <div className="panel states-panel">
            <div
              className="section-title expandable"
              onClick={() => toggleSection('states')}
            >
              <div className="d-flex align-items-center">
                <span>Состояния</span>
              </div>
              {expandedSections.states ? <ArrowUp /> : <ArrowDown />}
            </div>

            <AnimatePresence>
              {expandedSections.states && (
                <motion.div
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="states-container">
                    <div className="d-flex mb-2">
                      <input
                        type="text"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        placeholder="Добавить состояние"
                        className="form-control"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newState.trim()) {
                            e.preventDefault();
                            addCustomState();
                          }
                        }}
                      />
                      <button
                        className="btn btn-sm btn-primary ms-2"
                        onClick={addCustomState}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="states-grid">
                      {(formData.states || []).map((state) => (
                        <button
                          key={state}
                          className={`state-button ${formData.states?.includes(state) ? 'active' : ''}`}
                          onClick={() => toggleState(state)}
                        >
                          {state}
                          {formData.states?.includes(state) && (
                            <Check className="state-check" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="section-title dice-section mt-4">Кости</div>
                  <div className="dice-macro-container">
                    <input
                      type="text"
                      placeholder="1d20+5"
                      value={formData.dice_macro || ''}
                      onChange={(e) =>
                        handleChange('dice_macro', e.target.value)
                      }
                      className="dice-macro-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          rollDiceMacro();
                        }
                      }}
                    />
                    <button
                      className="dice-macro-button"
                      onClick={rollDiceMacro}
                    >
                      Бросить
                    </button>
                  </div>
                  <div className="dice-buttons">
                    {['d20', 'd12', 'd10', 'd8', 'd6', 'd4'].map((die) => (
                      <button
                        key={die}
                        className="dice-button"
                        onClick={() => handleDiceClick(die)}
                        title={`Бросить ${die}`}
                      >
                        🎲 {die}
                      </button>
                    ))}
                  </div>

                  <div className="dice-roll-popups">
                    <AnimatePresence>
                      {diceRolls.map(({ id, die, result }) => (
                        <motion.div
                          key={id}
                          className="dice-roll-popup"
                          variants={popupVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          🎲 {die}: <strong>{result}</strong>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CombatTab;
