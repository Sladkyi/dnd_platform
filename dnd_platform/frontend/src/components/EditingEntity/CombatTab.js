import React, { useState } from 'react';
import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
  // Цветовая схема
  const colors = {
    background: '#0a0a12', // Темно-синий фон
    panel: '#121226', // Панели
    outline: '#2B3A67', // Индиго контуры
    accent: '#FF6B6B', // Кораллово-красный акцент
    text: '#F0F0F0', // Молочный белый текст
    health: '#FF6B6B', // Красный для здоровья
    defense: '#4A6580', // Синий для защиты
    attacks: '#2B3A67', // Индиго для атак
    initiative: '#F0F0F0', // Белый для инициативы
    hitdice: '#FFD166', // Золотистый для костей хитов
    states: '#F0F0F0', // Белый для состояний
  };

  // Стиль для панелей
  const panelStyle = {
    background: colors.panel,
    borderRadius: '0',
    border: `3px solid ${colors.outline}`,
    position: 'relative',
    overflow: 'hidden',
    padding: '1rem',
    fontFamily: "'DotGothic16', sans-serif",
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.8)',
    marginBottom: '1rem',
  };

  // Стиль для заголовков секций
  const sectionTitleStyle = {
    color: colors.text,
    fontSize: '1.3rem',
    fontWeight: 700,
    letterSpacing: '1px',
    borderBottom: `2px solid ${colors.accent}`,
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'DotGothic16', sans-serif",
    textTransform: 'uppercase',
    textShadow: `0 0 5px ${colors.accent}`,
  };

  // Стиль для кнопок
  const buttonStyle = (color) => ({
    background: 'transparent',
    border: `2px solid ${color}`,
    color: color,
    borderRadius: '0',
    padding: '0.4rem 0.8rem',
    transition: 'all 0.3s ease',
    fontFamily: "'VT323', monospace",
    fontSize: '1rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    letterSpacing: '1px',
    '&:hover': {
      background: color,
      color: colors.background,
    },
  });

  // Стиль для инпутов
  const inputStyle = {
    background: 'rgba(0, 0, 0, 0.3)',
    border: `2px solid ${colors.outline}`,
    color: colors.text,
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0',
    fontFamily: "'VT323', monospace",
    fontSize: '1rem',
    letterSpacing: '1px',
  };

  // Функция для генерации SVG волн
  const wavePattern = (color) => (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '12px',
        background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' fill='${encodeURIComponent(color)}'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.5' fill='${encodeURIComponent(color)}'%3E%3C/path%3E%3Cpath d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' fill='${encodeURIComponent(color)}'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        opacity: 0.7,
        zIndex: 1,
      }}
    ></div>
  );

  // Маски для декоративных элементов
  const maskElements = [
    { top: '10%', left: '5%', size: '40px', rotate: '-15deg' },
    { top: '25%', right: '8%', size: '30px', rotate: '10deg' },
    { bottom: '15%', left: '12%', size: '35px', rotate: '5deg' },
    { bottom: '30%', right: '15%', size: '30px', rotate: '-8deg' },
  ];

  return (
    <div
      className="combat-tab"
      style={{
        fontFamily: "'VT323', monospace",
        background: colors.background,
        padding: '1rem',
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20,20 Q40,5 60,20 T100,20 T140,20 T180,20' stroke='%232B3A67' stroke-width='0.3' fill='none' opacity='0.05'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Декоративные маски */}
      {maskElements.map((mask, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: mask.top,
            left: mask.left,
            right: mask.right,
            width: mask.size,
            height: mask.size,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50,15 C60,5 80,5 85,15 C95,25 95,40 85,50 C95,60 95,75 85,85 C75,95 60,95 50,85 C40,95 25,95 15,85 C5,75 5,60 15,50 C5,40 5,25 15,15 C25,5 40,5 50,15 Z' fill='none' stroke='%232B3A67' stroke-width='1.5'/%3E%3C/svg%3E\")",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            opacity: 0.15,
            transform: `rotate(${mask.rotate})`,
            zIndex: 0,
          }}
        ></div>
      ))}
      {/* Тень храма */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          right: '5%',
          width: '120px',
          height: '120px',
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20,80 L30,60 L40,80 L50,50 L60,80 L70,40 L80,80 L90,20 L80,80 L70,40 L60,80 L50,50 L40,80 L30,60 L20,80 Z' fill='%232B3A67' opacity='0.1'/%3E%3C/svg%3E\")",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.1,
          zIndex: 0,
        }}
      ></div>

      {/* Анимированный шум */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
          opacity: 0.03,
          animation: 'grain 8s steps(10) infinite',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      ></div>

      {/* Декоративный иероглиф */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '12rem',
          fontWeight: 900,
          color: 'rgba(43, 58, 103, 0.05)',
          fontFamily: "'Noto Serif JP', serif",
          zIndex: 0,
          pointerEvents: 'none',
          userSelect: 'none',
          textShadow: '0 0 10px rgba(255, 107, 107, 0.1)',
        }}
      >
        武
      </div>

      <Row className="g-3">
        {/* ========== ЗДОРОВЬЕ ========== */}
        <Col md={6}>
          <div className="panel" style={panelStyle}>
            {wavePattern(colors.health)}

            <div style={sectionTitleStyle}>
              <HeartPulse
                style={{ color: colors.accent, fontSize: '1.2rem' }}
              />{' '}
              健康
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
                  fontSize: '1.4rem',
                  color: colors.text,
                  fontFamily: "'VT323', monospace",
                  textShadow: `0 0 5px ${colors.accent}`,
                  letterSpacing: '1px',
                }}
              >
                {formData.current_hp} / {formData.max_hp}
              </div>

              <div
                className="hp-bar"
                style={{
                  height: '35px',
                  background: `linear-gradient(90deg, ${colors.health} ${(formData.current_hp / formData.max_hp) * 100}%, rgba(194, 69, 69, 0.1) 0%)`,
                  borderRadius: '0',
                  border: '2px solid #2B3A67',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: `0 0 8px ${colors.health}80`,
                  animation: 'pulse 2s infinite alternate',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='0.3'/%3E%3C/svg%3E")`,
                    opacity: 0.2,
                  }}
                ></div>
              </div>
            </div>

            <Row className="g-2 align-items-end">
              <Col>
                <label
                  className="mb-1 d-block"
                  style={{
                    color: colors.text,
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  }}
                >
                  最大HP
                </label>
                <input
                  type="number"
                  value={formData.max_hp}
                  onChange={(e) => handleChange('max_hp', +e.target.value)}
                  style={{
                    ...inputStyle,
                    border: `2px solid ${colors.outline}`,
                    fontSize: '1.1rem',
                    padding: '0.4rem',
                  }}
                />
              </Col>
              <Col>
                <label
                  className="mb-1 d-block"
                  style={{
                    color: colors.text,
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  }}
                >
                  現在のHP
                </label>
                <input
                  type="number"
                  value={formData.current_hp}
                  onChange={(e) => handleChange('current_hp', +e.target.value)}
                  style={{
                    ...inputStyle,
                    border: `2px solid ${colors.outline}`,
                    fontSize: '1.1rem',
                    padding: '0.4rem',
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
                    style={{
                      ...buttonStyle(colors.accent),
                      padding: '0.5rem 0.8rem',
                      border: `2px solid ${colors.accent}`,
                      fontSize: '1rem',
                      height: '100%',
                    }}
                    onClick={() => handleChange('current_hp', formData.max_hp)}
                  >
                    <ArrowRepeat
                      style={{ marginRight: '0.3rem', fontSize: '0.9rem' }}
                    />{' '}
                    回復
                  </button>
                </OverlayTrigger>
              </Col>
            </Row>
          </div>
        </Col>

        {/* ========== ЗАЩИТА ========== */}
        <Col md={6}>
          <div className="panel" style={panelStyle}>
            {wavePattern(colors.defense)}

            <div style={sectionTitleStyle}>
              <Shield style={{ color: colors.accent, fontSize: '1.2rem' }} />{' '}
              防御
            </div>

            <Row className="g-2 mb-3">
              <Col md={6}>
                <div
                  className="stat-card"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${colors.outline}`,
                    borderRadius: '0',
                    padding: '0.8rem',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: colors.defense,
                      fontFamily: "'VT323', monospace",
                      textShadow: `0 0 5px ${colors.defense}80`,
                      letterSpacing: '1px',
                    }}
                  >
                    {formData.armor_class || 0}
                  </div>
                  <div
                    style={{
                      color: colors.text,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      marginTop: '0.3rem',
                    }}
                  >
                    鎧のクラス
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div
                  className="stat-card"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${colors.outline}`,
                    borderRadius: '0',
                    padding: '0.8rem',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: colors.initiative,
                      fontFamily: "'VT323', monospace",
                      textShadow: `0 0 5px ${colors.initiative}80`,
                      letterSpacing: '1px',
                    }}
                  >
                    {formData.speed || 0}
                  </div>
                  <div
                    style={{
                      color: colors.text,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      marginTop: '0.3rem',
                    }}
                  >
                    速度
                  </div>
                </div>
              </Col>
            </Row>

            <div className="saving-throws">
              <div
                className="mb-2"
                style={{
                  color: colors.text,
                  fontWeight: 500,
                  fontSize: '1rem',
                  textAlign: 'center',
                  textShadow: `0 0 3px ${colors.accent}`,
                }}
              >
                セービングスロー
              </div>
              <div className="d-flex flex-wrap gap-1">
                {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((ability) => (
                  <div
                    key={ability}
                    className="saving-throw"
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: `1px solid ${colors.outline}`,
                      borderRadius: '0',
                      padding: '0.4rem 0.3rem',
                      textAlign: 'center',
                      flex: '1',
                      minWidth: '70px',
                    }}
                  >
                    <div
                      style={{
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                        color: colors.text,
                        fontWeight: 700,
                        letterSpacing: '1px',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {ability}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: colors.text,
                        fontSize: '1.1rem',
                        fontFamily: "'VT323', monospace",
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
          <div className="panel" style={panelStyle}>
            {wavePattern(colors.attacks)}

            <div
              className="d-flex align-items-center mb-3"
              style={sectionTitleStyle}
            >
              <LightningCharge
                style={{ color: colors.accent, fontSize: '1.2rem' }}
              />{' '}
              攻撃
              <button
                style={{
                  ...buttonStyle(colors.accent),
                  marginLeft: 'auto',
                  border: `2px solid ${colors.accent}`,
                  padding: '0.4rem 0.8rem',
                  fontSize: '1rem',
                }}
                onClick={addAttack}
              >
                <Plus style={{ marginRight: '0.3rem', fontSize: '0.9rem' }} />{' '}
                追加
              </button>
            </div>

            <div
              className="attack-list"
              style={{
                maxHeight: '220px',
                overflowY: 'auto',
                padding: '0.3rem',
              }}
            >
              {(formData.attacks || []).map((attack, idx) => (
                <div
                  key={idx}
                  className="attack-item mb-2"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${colors.outline}`,
                    borderRadius: '0',
                    padding: '0.8rem',
                    position: 'relative',
                  }}
                >
                  <Row className="g-2 align-items-center">
                    <Col md={4}>
                      <input
                        placeholder="攻撃名"
                        value={attack.name}
                        onChange={(e) =>
                          handleChange('attacks', e.target.value, idx, 'name')
                        }
                        style={{
                          ...inputStyle,
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          border: `2px solid ${colors.outline}`,
                          padding: '0.4rem',
                        }}
                      />
                    </Col>
                    <Col md={3}>
                      <div className="d-flex align-items-center">
                        <span
                          className="me-1"
                          style={{
                            color: colors.text,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ボーナス:
                        </span>
                        <input
                          type="number"
                          placeholder="+0"
                          value={attack.bonus}
                          onChange={(e) =>
                            handleChange(
                              'attacks',
                              +e.target.value,
                              idx,
                              'bonus'
                            )
                          }
                          style={{
                            ...inputStyle,
                            width: '70px',
                            textAlign: 'center',
                            border: `2px solid ${colors.outline}`,
                            fontSize: '1.1rem',
                            padding: '0.4rem',
                          }}
                        />
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="d-flex align-items-center">
                        <span
                          className="me-1"
                          style={{
                            color: colors.text,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ダメージ:
                        </span>
                        <input
                          placeholder="1d8+2"
                          value={attack.damage}
                          onChange={(e) =>
                            handleChange(
                              'attacks',
                              e.target.value,
                              idx,
                              'damage'
                            )
                          }
                          style={{
                            ...inputStyle,
                            border: `2px solid ${colors.outline}`,
                            fontSize: '1.1rem',
                            padding: '0.4rem',
                          }}
                        />
                      </div>
                    </Col>
                    <Col md={1} className="text-end">
                      <button
                        style={{
                          ...buttonStyle(colors.accent),
                          padding: '0.3rem',
                          border: `2px solid ${colors.accent}`,
                          fontSize: '1rem',
                        }}
                        onClick={() => removeAttack(idx)}
                      >
                        <Dash />
                      </button>
                    </Col>
                  </Row>
                  <textarea
                    rows={1}
                    placeholder="説明"
                    value={attack.description || ''}
                    className="mt-2"
                    onChange={(e) =>
                      handleChange(
                        'attacks',
                        e.target.value,
                        idx,
                        'description'
                      )
                    }
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '50px',
                      border: `2px solid ${colors.outline}`,
                      fontSize: '0.9rem',
                      padding: '0.4rem',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* ========== ИНИЦИАТИВА И КОСТИ ========== */}
        <Col md={8}>
          <Row className="g-3">
            <Col md={6}>
              <div className="panel h-100" style={panelStyle}>
                {wavePattern(colors.initiative)}

                <div style={sectionTitleStyle}>
                  <Stopwatch
                    style={{ color: colors.accent, fontSize: '1.2rem' }}
                  />{' '}
                  イニシアチブ
                </div>

                <div className="text-center" style={{ marginTop: '0.5rem' }}>
                  <div
                    style={{
                      fontSize: '3rem',
                      fontWeight: 700,
                      color: colors.initiative,
                      lineHeight: 1,
                      fontFamily: "'VT323', monospace",
                      textShadow: `0 0 8px ${colors.initiative}80`,
                      letterSpacing: '2px',
                      animation: 'glitch 1s infinite',
                    }}
                  >
                    {formData.initiative || 0}
                  </div>
                  <div
                    style={{
                      color: colors.text,
                      fontSize: '1rem',
                      fontWeight: 500,
                      marginTop: '0.5rem',
                    }}
                  >
                    修整子: {formData.dex_mod >= 0 ? '+' : ''}
                    {formData.dex_mod || 0}
                  </div>
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="panel h-100" style={panelStyle}>
                {wavePattern(colors.hitdice)}

                <div style={sectionTitleStyle}>
                  <Dice5 style={{ color: colors.accent, fontSize: '1.2rem' }} />{' '}
                  ヒットダイス
                </div>

                <div className="text-center" style={{ marginTop: '0.5rem' }}>
                  <div
                    style={{
                      fontSize: '2.2rem',
                      fontWeight: 700,
                      color: colors.hitdice,
                      fontFamily: "'VT323', monospace",
                      textShadow: `0 0 6px ${colors.hitdice}80`,
                      letterSpacing: '1px',
                    }}
                  >
                    {formData.hit_dice || '1d10'}
                  </div>

                  <div className="d-flex justify-content-center gap-2 mt-2">
                    <button
                      style={{
                        ...buttonStyle(colors.hitdice),
                        border: `2px solid ${colors.hitdice}`,
                        padding: '0.4rem 0.8rem',
                        fontSize: '1rem',
                      }}
                    >
                      使用
                    </button>
                    <button
                      style={{
                        ...buttonStyle(colors.hitdice),
                        border: `2px solid ${colors.hitdice}`,
                        padding: '0.4rem 0.8rem',
                        fontSize: '1rem',
                      }}
                    >
                      休憩
                    </button>
                  </div>
                </div>
              </div>
            </Col>

            <Col md={12}>
              <div className="panel" style={panelStyle}>
                {wavePattern(colors.initiative)}

                <div style={sectionTitleStyle}>戦闘行動</div>

                <textarea
                  rows={2}
                  value={formData.combat_actions || ''}
                  onChange={(e) =>
                    handleChange('combat_actions', e.target.value)
                  }
                  placeholder="特殊能力、呪文、戦術..."
                  style={{
                    ...inputStyle,
                    minHeight: '80px',
                    border: `2px solid ${colors.outline}`,
                    fontSize: '1rem',
                    padding: '0.5rem',
                  }}
                />
              </div>
            </Col>
          </Row>
        </Col>

        {/* ========== СОСТОЯНИЯ И КОСТИ ========== */}
        <Col md={4}>
          <div className="panel h-100" style={panelStyle}>
            {wavePattern(colors.hitdice)}

            <div style={sectionTitleStyle}>状態</div>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {['祝福', '不可視', '狂戦士', '恐怖', '毒', '気絶'].map(
                (state) => (
                  <button
                    key={state}
                    style={{
                      ...buttonStyle(colors.outline),
                      borderRadius: '0',
                      background: formData.states?.includes(state)
                        ? `rgba(43, 58, 103, 0.3)`
                        : 'transparent',
                      border: formData.states?.includes(state)
                        ? `2px solid ${colors.accent}`
                        : `2px solid ${colors.outline}`,
                      color: formData.states?.includes(state)
                        ? colors.accent
                        : colors.text,
                      padding: '0.4rem 0.3rem',
                      flex: '1 0 45%',
                      fontSize: '0.9rem',
                      textShadow: formData.states?.includes(state)
                        ? `0 0 3px ${colors.accent}`
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
                )
              )}
            </div>

            <div style={sectionTitleStyle}>ダイス</div>

            <div className="mb-3">
              <input
                type="text"
                placeholder="1d20+5"
                value={formData.dice_macro || ''}
                onChange={(e) => handleChange('dice_macro', e.target.value)}
                style={{
                  ...inputStyle,
                  marginBottom: '1rem',
                  textAlign: 'center',
                  fontWeight: 700,
                  border: `2px solid ${colors.outline}`,
                  fontSize: '1.1rem',
                  padding: '0.5rem',
                }}
              />

              <div className="d-flex flex-wrap gap-2 mb-3">
                {['d20', 'd12', 'd10', 'd8', 'd6', 'd4'].map((die) => (
                  <button
                    key={die}
                    style={{
                      ...buttonStyle(colors.outline),
                      flex: '1 0 28%',
                      border: `2px solid ${colors.outline}`,
                      padding: '0.5rem 0',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      marginBottom: '0.3rem',
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
                  background: 'transparent',
                  border: `3px solid ${colors.accent}`,
                  color: colors.accent,
                  width: '100%',
                  padding: '0.8rem',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  fontFamily: "'DotGothic16', sans-serif",
                  letterSpacing: '1px',
                  textShadow: `0 0 6px ${colors.accent}`,
                  animation: 'pulse 1.5s infinite',
                }}
              >
                ダイスを振る
              </button>
            </div>
          </div>
        </Col>
      </Row>

      {/* CSS анимации */}
      <style jsx>{`
        @keyframes grain {
          0%,
          100% {
            transform: translate(0, 0);
          }
          10% {
            transform: translate(-5%, -10%);
          }
          20% {
            transform: translate(-15%, 5%);
          }
          30% {
            transform: translate(7%, -25%);
          }
          40% {
            transform: translate(-5%, 25%);
          }
          50% {
            transform: translate(-15%, 10%);
          }
          60% {
            transform: translate(15%, 0%);
          }
          70% {
            transform: translate(0%, 15%);
          }
          80% {
            transform: translate(3%, -35%);
          }
          90% {
            transform: translate(-10%, 10%);
          }
        }

        @keyframes glitch {
          0% {
            text-shadow: 0 0 8px ${colors.initiative}80;
          }
          2% {
            transform: translateX(2px) translateY(-1px);
            text-shadow: 1px 1px 0 ${colors.accent};
          }
          4% {
            transform: translateX(-2px) translateY(1px);
            text-shadow: -1px -1px 0 ${colors.defense};
          }
          6% {
            transform: translateX(0);
            text-shadow: 0 0 8px ${colors.initiative}80;
          }
          100% {
            text-shadow: 0 0 8px ${colors.initiative}80;
          }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 3px ${colors.health}80;
          }
          100% {
            box-shadow: 0 0 12px ${colors.health};
          }
        }
      `}</style>
    </div>
  );
};

export default CombatTab;
