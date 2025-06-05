import React, { useState } from 'react';
import {
  Row,
  Col,
  Form,
  Button,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import {
  HeartPulse,
  Shield,
  LightningCharge,
  Stopwatch,
  Dice5,
  Plus,
  Dash,
  ArrowRepeat,
} from 'react-bootstrap-icons';

const CombatTab = ({ formData, handleChange, addAttack, removeAttack }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Японская цветовая схема
  const colors = {
    health: '#c24545', // красный как осенние клены
    defense: '#e0b84a', // золото как солнце на фоне ширмы
    attacks: '#5060a0', // индиго как традиционная краска
    initiative: '#3d6fa5', // синий как ночное небо
    hitdice: '#8a5ac8', // фиолетовый как ирисы
    states: '#2a2a2a', // темный как тушь
    text: '#f6f3e6', // светлый как рисовая бумага
    paper: '#e8d8c9', // цвет васи
    border: '#4b607f', // цвет индиго
    accent: '#f3701e', // оранжевый как закат
  };

  // Стили для японских "ширм" (карточек)
  const shojiStyle = (type) => ({
    background: `linear-gradient(to bottom, rgba(232, 216, 201, 0.05), rgba(13, 15, 21, 0.9))`,
    borderRadius: '4px',
    border: `1px solid rgba(75, 96, 127, 0.25)`,
    boxShadow:
      hoveredCard === type
        ? `0 0 12px rgba(${hexToRgb(colors[type]).r}, ${hexToRgb(colors[type]).g}, ${hexToRgb(colors[type]).b}, 0.3)`
        : '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    padding: '1.2rem',
    fontFamily: "'Noto Sans JP', sans-serif",
  });

  // Фоновый узор в японском стиле
  const japanesePattern = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L100 100 M100 0 L0 100' stroke='%23e8d8c9' stroke-width='0.3' opacity='0.1'/%3E%3C/svg%3E")`,
    opacity: 0.1,
    pointerEvents: 'none',
    zIndex: 0,
  };

  // Преобразование HEX в RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  // Стиль для заголовков секций
  const sectionTitleStyle = (color) => ({
    color: color,
    fontSize: '1.1rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    borderBottom: `2px solid ${color}`,
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  });

  // Стиль для кнопок
  const buttonStyle = (color) => ({
    background: 'transparent',
    border: `1px solid ${color}`,
    color: colors.text,
    borderRadius: '2px',
    padding: '0.3rem 0.8rem',
    transition: 'all 0.3s ease',
    fontFamily: "'Noto Sans JP', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  });

  return (
    <div
      className="combat-tab"
      style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
    >
      <Row className="g-4">
        {/* ========== ЗДОРОВЬЕ ========== */}
        <Col md={6}>
          <div
            className="japanese-panel"
            style={shojiStyle('health')}
            onMouseEnter={() => setHoveredCard('health')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={japanesePattern}></div>

            <div style={sectionTitleStyle(colors.health)}>
              <HeartPulse /> 健康 (Здоровье)
            </div>

            <div
              className="hp-display mb-3"
              style={{ position: 'relative', textAlign: 'center' }}
            >
              <div
                className="hp-numbers"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  color: colors.text,
                  textShadow: '0 0 4px rgba(0,0,0,0.7)',
                }}
              >
                {formData.current_hp} / {formData.max_hp} HP
              </div>

              <div
                className="hp-bar"
                style={{
                  height: '30px',
                  background: `linear-gradient(90deg, ${colors.health} ${(formData.current_hp / formData.max_hp) * 100}%, rgba(60, 20, 20, 0.3) 0%)`,
                  borderRadius: '4px',
                  border: '1px solid rgba(75, 96, 127, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='0.5'/%3E%3C/svg%3E")`,
                    opacity: 0.3,
                  }}
                ></div>
              </div>
            </div>

            <Row className="g-3">
              <Col>
                <label
                  className="small mb-1 d-block"
                  style={{ color: colors.text }}
                >
                  最大HP
                </label>
                <input
                  type="number"
                  value={formData.max_hp}
                  className="japanese-input"
                  onChange={(e) => handleChange('max_hp', +e.target.value)}
                  style={{
                    background: 'rgba(232, 216, 201, 0.1)',
                    border: '1px solid rgba(75, 96, 127, 0.3)',
                    color: colors.text,
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '2px',
                  }}
                />
              </Col>
              <Col>
                <label
                  className="small mb-1 d-block"
                  style={{ color: colors.text }}
                >
                  現在のHP
                </label>
                <input
                  type="number"
                  value={formData.current_hp}
                  className="japanese-input"
                  onChange={(e) => handleChange('current_hp', +e.target.value)}
                  style={{
                    background: 'rgba(232, 216, 201, 0.1)',
                    border: '1px solid rgba(75, 96, 127, 0.3)',
                    color: colors.text,
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '2px',
                  }}
                />
              </Col>
              <Col xs="auto">
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>健康を回復 (Восстановить здоровье)</Tooltip>
                  }
                >
                  <button
                    style={buttonStyle(colors.health)}
                    onClick={() => handleChange('current_hp', formData.max_hp)}
                  >
                    <ArrowRepeat /> 回復
                  </button>
                </OverlayTrigger>
              </Col>
            </Row>
          </div>
        </Col>

        {/* ========== ЗАЩИТА ========== */}
        <Col md={6}>
          <div
            className="japanese-panel"
            style={shojiStyle('defense')}
            onMouseEnter={() => setHoveredCard('defense')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={japanesePattern}></div>

            <div style={sectionTitleStyle(colors.defense)}>
              <Shield /> 防御 (Защита)
            </div>

            <Row className="g-3 mb-3">
              <Col md={6}>
                <div
                  className="stat-card"
                  style={{
                    background: 'rgba(15, 20, 28, 0.3)',
                    border: '1px solid rgba(75, 96, 127, 0.3)',
                    borderRadius: '4px',
                    padding: '1rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: colors.defense,
                      textShadow: `0 0 6px rgba(${hexToRgb(colors.defense).r}, ${hexToRgb(colors.defense).g}, ${hexToRgb(colors.defense).b}, 0.3)`,
                    }}
                  >
                    {formData.armor_class || 0}
                  </div>
                  <div style={{ color: colors.text, fontSize: '0.9rem' }}>
                    鎧のクラス (Класс брони)
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div
                  className="stat-card"
                  style={{
                    background: 'rgba(15, 20, 28, 0.3)',
                    border: '1px solid rgba(75, 96, 127, 0.3)',
                    borderRadius: '4px',
                    padding: '1rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: colors.initiative,
                      textShadow: `0 0 6px rgba(${hexToRgb(colors.initiative).r}, ${hexToRgb(colors.initiative).g}, ${hexToRgb(colors.initiative).b}, 0.3)`,
                    }}
                  >
                    {formData.speed || 0}
                  </div>
                  <div style={{ color: colors.text, fontSize: '0.9rem' }}>
                    速度 (Скорость)
                  </div>
                </div>
              </Col>
            </Row>

            <div className="saving-throws">
              <div className="small mb-2" style={{ color: colors.text }}>
                セービングスロー (Спасброски)
              </div>
              <div className="d-flex flex-wrap gap-2">
                {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((ability) => (
                  <div
                    key={ability}
                    className="saving-throw"
                    style={{
                      background: 'rgba(232, 216, 201, 0.1)',
                      border: '1px solid rgba(75, 96, 127, 0.3)',
                      borderRadius: '4px',
                      padding: '0.3rem 0.8rem',
                      textAlign: 'center',
                      minWidth: '70px',
                    }}
                  >
                    <div
                      style={{
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        color: colors.text,
                      }}
                    >
                      {ability}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: colors.text,
                      }}
                    >
                      +{formData[`${ability}_save`] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Col>

        {/* ========== АТАКИ ========== */}
        <Col md={12}>
          <div
            className="japanese-panel"
            style={shojiStyle('attacks')}
            onMouseEnter={() => setHoveredCard('attacks')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={japanesePattern}></div>

            <div
              className="d-flex align-items-center mb-3"
              style={sectionTitleStyle(colors.attacks)}
            >
              <LightningCharge /> 攻撃 (Атаки)
              <button
                style={{
                  ...buttonStyle(colors.attacks),
                  marginLeft: 'auto',
                  background: `rgba(${hexToRgb(colors.attacks).r}, ${hexToRgb(colors.attacks).g}, ${hexToRgb(colors.attacks).b}, 0.15)`,
                }}
                onClick={addAttack}
              >
                <Plus /> 追加 (Добавить)
              </button>
            </div>

            <div
              className="attack-list"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
              {(formData.attacks || []).map((attack, idx) => (
                <div
                  key={idx}
                  className="attack-item mb-2"
                  style={{
                    background: 'rgba(232, 216, 201, 0.05)',
                    border: '1px solid rgba(75, 96, 127, 0.2)',
                    borderRadius: '2px',
                    padding: '0.8rem',
                  }}
                >
                  <Row className="g-2 align-items-center">
                    <Col md={4}>
                      <input
                        placeholder="攻撃名 (Название)"
                        value={attack.name}
                        className="japanese-input"
                        onChange={(e) =>
                          handleChange('attacks', e.target.value, idx, 'name')
                        }
                        style={{
                          background: 'rgba(232, 216, 201, 0.1)',
                          border: '1px solid rgba(75, 96, 127, 0.3)',
                          color: colors.text,
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '2px',
                        }}
                      />
                    </Col>
                    <Col md={3}>
                      <div className="d-flex align-items-center">
                        <span
                          className="me-2"
                          style={{ color: colors.text, fontSize: '0.9rem' }}
                        >
                          ボーナス (Бонус):
                        </span>
                        <input
                          type="number"
                          placeholder="+0"
                          value={attack.bonus}
                          className="japanese-input"
                          onChange={(e) =>
                            handleChange(
                              'attacks',
                              +e.target.value,
                              idx,
                              'bonus'
                            )
                          }
                          style={{
                            background: 'rgba(232, 216, 201, 0.1)',
                            border: '1px solid rgba(75, 96, 127, 0.3)',
                            color: colors.text,
                            width: '60px',
                            padding: '0.5rem',
                            borderRadius: '2px',
                            textAlign: 'center',
                          }}
                        />
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="d-flex align-items-center">
                        <span
                          className="me-2"
                          style={{ color: colors.text, fontSize: '0.9rem' }}
                        >
                          ダメージ (Урон):
                        </span>
                        <input
                          placeholder="1d8+2"
                          value={attack.damage}
                          className="japanese-input"
                          onChange={(e) =>
                            handleChange(
                              'attacks',
                              e.target.value,
                              idx,
                              'damage'
                            )
                          }
                          style={{
                            background: 'rgba(232, 216, 201, 0.1)',
                            border: '1px solid rgba(75, 96, 127, 0.3)',
                            color: colors.text,
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '2px',
                          }}
                        />
                      </div>
                    </Col>
                    <Col md={1} className="text-end">
                      <button
                        style={{
                          ...buttonStyle(colors.health),
                          padding: '0.2rem 0.5rem',
                          background: `rgba(${hexToRgb(colors.health).r}, ${hexToRgb(colors.health).g}, ${hexToRgb(colors.health).b}, 0.1)`,
                        }}
                        onClick={() => removeAttack(idx)}
                      >
                        <Dash />
                      </button>
                    </Col>
                  </Row>
                  <textarea
                    rows={1}
                    placeholder="説明 (Описание)"
                    value={attack.description || ''}
                    className="mt-2 japanese-input"
                    onChange={(e) =>
                      handleChange(
                        'attacks',
                        e.target.value,
                        idx,
                        'description'
                      )
                    }
                    style={{
                      background: 'rgba(232, 216, 201, 0.1)',
                      border: '1px solid rgba(75, 96, 127, 0.3)',
                      color: colors.text,
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '2px',
                      resize: 'vertical',
                      minHeight: '40px',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* ========== ИНИЦИАТИВА И КОСТИ ========== */}
        <Col md={8}>
          <Row className="g-4">
            <Col md={6}>
              <div
                className="japanese-panel h-100"
                style={shojiStyle('initiative')}
                onMouseEnter={() => setHoveredCard('initiative')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={japanesePattern}></div>

                <div style={sectionTitleStyle(colors.initiative)}>
                  <Stopwatch /> イニシアチブ (Инициатива)
                </div>

                <div className="text-center">
                  <div
                    style={{
                      fontSize: '3.5rem',
                      fontWeight: 700,
                      color: colors.initiative,
                      textShadow: `0 0 10px rgba(${hexToRgb(colors.initiative).r}, ${hexToRgb(colors.initiative).g}, ${hexToRgb(colors.initiative).b}, 0.4)`,
                      lineHeight: 1,
                    }}
                  >
                    {formData.initiative || 0}
                  </div>
                  <div
                    style={{
                      color: colors.text,
                      fontSize: '0.9rem',
                    }}
                  >
                    修整子 (Модификатор): {formData.dex_mod >= 0 ? '+' : ''}
                    {formData.dex_mod || 0}
                  </div>
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div
                className="japanese-panel h-100"
                style={shojiStyle('hitdice')}
                onMouseEnter={() => setHoveredCard('hitdice')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={japanesePattern}></div>

                <div style={sectionTitleStyle(colors.hitdice)}>
                  <Dice5 /> ヒットダイス (Кости хитов)
                </div>

                <div className="text-center">
                  <div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 700,
                      color: colors.hitdice,
                      textShadow: `0 0 8px rgba(${hexToRgb(colors.hitdice).r}, ${hexToRgb(colors.hitdice).g}, ${hexToRgb(colors.hitdice).b}, 0.3)`,
                      marginBottom: '1rem',
                    }}
                  >
                    {formData.hit_dice || '1d10'}
                  </div>

                  <div className="d-flex justify-content-center gap-2">
                    <button style={buttonStyle(colors.hitdice)}>
                      使用 (Использовать)
                    </button>
                    <button style={buttonStyle(colors.hitdice)}>
                      休憩 (Отдых)
                    </button>
                  </div>
                </div>
              </div>
            </Col>

            <Col md={12}>
              <div
                className="japanese-panel"
                style={shojiStyle('initiative')}
                onMouseEnter={() => setHoveredCard('initiative')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={japanesePattern}></div>

                <div style={sectionTitleStyle(colors.initiative)}>
                  戦闘行動 (Боевые действия)
                </div>

                <textarea
                  rows={3}
                  value={formData.combat_actions || ''}
                  className="japanese-input"
                  onChange={(e) =>
                    handleChange('combat_actions', e.target.value)
                  }
                  placeholder="特殊能力、呪文、戦術... (Особые способности, заклинания, тактические приемы...)"
                  style={{
                    background: 'rgba(232, 216, 201, 0.1)',
                    border: '1px solid rgba(75, 96, 127, 0.3)',
                    color: colors.text,
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </Col>
          </Row>
        </Col>

        {/* ========== СОСТОЯНИЯ И КОСТИ ========== */}
        <Col md={4}>
          <div
            className="japanese-panel h-100"
            style={shojiStyle('hitdice')}
            onMouseEnter={() => setHoveredCard('hitdice')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={japanesePattern}></div>

            <div style={sectionTitleStyle(colors.hitdice)}>
              状態 (Состояния)
            </div>

            <div className="d-flex flex-wrap gap-2 mb-4">
              {[
                '祝福 (Благословение)',
                '不可視 (Невидимость)',
                '狂戦士 (Ярость)',
                '恐怖 (Страх)',
                '毒 (Отравление)',
                '気絶 (Оглушение)',
              ].map((state) => (
                <button
                  key={state}
                  style={{
                    ...buttonStyle(colors.hitdice),
                    borderRadius: '30px',
                    background: formData.states?.includes(state)
                      ? `rgba(${hexToRgb(colors.hitdice).r}, ${hexToRgb(colors.hitdice).g}, ${hexToRgb(colors.hitdice).b}, 0.15)`
                      : 'transparent',
                    borderColor: formData.states?.includes(state)
                      ? colors.hitdice
                      : colors.states,
                    color: formData.states?.includes(state)
                      ? colors.text
                      : colors.states,
                    boxShadow: formData.states?.includes(state)
                      ? `0 0 8px rgba(${hexToRgb(colors.hitdice).r}, ${hexToRgb(colors.hitdice).g}, ${hexToRgb(colors.hitdice).b}, 0.3)`
                      : 'none',
                  }}
                  onClick={() => {
                    const states = formData.states || [];
                    const newStates = states.includes(state)
                      ? states.filter((s) => s !== state)
                      : [...states, state];
                    handleChange('states', newStates);
                  }}
                >
                  {state}
                </button>
              ))}
            </div>

            <div style={sectionTitleStyle(colors.hitdice)}>ダイス (Кости)</div>

            <div className="mb-3">
              <input
                type="text"
                placeholder="1d20+5"
                value={formData.dice_macro || ''}
                className="japanese-input"
                onChange={(e) => handleChange('dice_macro', e.target.value)}
                style={{
                  background: 'rgba(232, 216, 201, 0.1)',
                  border: '1px solid rgba(75, 96, 127, 0.3)',
                  color: colors.text,
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '2px',
                  marginBottom: '1rem',
                }}
              />

              <div className="d-flex gap-2">
                {['d20', 'd12', 'd10', 'd8', 'd6', 'd4'].map((die) => (
                  <button
                    key={die}
                    style={{
                      ...buttonStyle(colors.hitdice),
                      flex: 1,
                      background: `rgba(${hexToRgb(colors.hitdice).r}, ${hexToRgb(colors.hitdice).g}, ${hexToRgb(colors.hitdice).b}, 0.1)`,
                    }}
                  >
                    {die}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                style={{
                  ...buttonStyle(colors.accent),
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  background: `linear-gradient(to bottom, rgba(243, 112, 30, 0.2), rgba(243, 112, 30, 0.1))`,
                  border: `1px solid ${colors.accent}`,
                  boxShadow: `0 0 10px rgba(243, 112, 30, 0.3)`,
                }}
              >
                ダイスを振る (БРОСИТЬ КУБИКИ)
              </button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CombatTab;
