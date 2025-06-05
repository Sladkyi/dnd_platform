import React, { useState } from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import {
  FaFistRaised,
  FaRunning,
  FaShieldAlt,
  FaBrain,
  FaEye,
  FaComments,
  FaDiceD20,
} from 'react-icons/fa';

const getMod = (score) => Math.floor((score - 10) / 2);
const rollD20 = () => Math.floor(Math.random() * 20) + 1;

const StatBlock = ({
  label,
  base,
  skills,
  onChangeBase,
  formData,
  handleChange,
  icon,
  statKey,
  proficiencyBonus,
}) => {
  const mod = getMod(base);
  const [rolling, setRolling] = useState(false);
  const [recentRolls, setRecentRolls] = useState([]);

  const handleRoll = (skillName, proficient) => {
    setRolling(true);
    setTimeout(() => {
      const bonus = mod + (proficient ? proficiencyBonus : 0);
      const roll = rollD20();
      const total = roll + bonus;
      const result = {
        skill: skillName,
        roll,
        bonus,
        total,
        isCritical: roll === 20,
        isFail: roll === 1,
      };

      setRecentRolls((prev) => [result, ...prev.slice(0, 4)]);
      setRolling(false);

      const resultElement = document.getElementById('dice-result');
      if (resultElement) {
        resultElement.innerHTML = `
          <div class="dice-result-inner ${
            result.isCritical
              ? 'critical-success'
              : result.isFail
                ? 'critical-fail'
                : ''
          }">
            <div class="dice-roll">${roll}</div>
            <div class="dice-total">${total}</div>
            <div class="dice-details">${skillName}: ${roll} + ${bonus} = ${total}</div>
            ${
              result.isCritical
                ? '<div class="critical-text">КРИТИЧЕСКИЙ УСПЕХ!</div>'
                : ''
            }
            ${
              result.isFail
                ? '<div class="critical-text">КРИТИЧЕСКИЙ ПРОВАЛ!</div>'
                : ''
            }
          </div>
        `;
        resultElement.style.display = 'block';
        setTimeout(() => {
          resultElement.style.opacity = 1;
          resultElement.style.transform = 'translateY(0)';
        }, 10);
        setTimeout(() => {
          resultElement.style.opacity = 0;
          resultElement.style.transform = 'translateY(20px)';
          setTimeout(() => {
            resultElement.style.display = 'none';
          }, 500);
        }, 3000);
      }
    }, 600);
  };

  return (
    <Card className="stat-tile">
      <Card.Header className="stat-header">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className="stat-icon">{icon}</span>
            <h3 className="stat-title">{label}</h3>
          </div>
          <span className="mod-badge">{mod >= 0 ? `+${mod}` : mod}</span>
        </div>
      </Card.Header>

      <Card.Body>
        <Form.Control
          type="number"
          value={base}
          onChange={onChangeBase}
          className="stat-input text-center mb-3"
          min="1"
          max="30"
        />

        {/* Мини-блок: Бонус мастерства */}
        <div className="mini-proficiency mb-3">
          <span className="mini-proficiency-label">Бонус мастерства:</span>
          <span className="mini-proficiency-badge">
            {proficiencyBonus >= 0 ? `+${proficiencyBonus}` : proficiencyBonus}
          </span>
        </div>

        {/* Спасбросок */}
        <div className="saving-throw mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Form.Check
                type="checkbox"
                id={`${statKey}-save`}
                className="me-2"
                checked={!!formData[`${statKey}_save_proficient`]}
                onChange={(e) =>
                  handleChange(`${statKey}_save_proficient`, e.target.checked)
                }
                label={<span className="skill-name">Спасбросок</span>}
              />
              <Button
                size="sm"
                variant="outline-light"
                onClick={() =>
                  handleRoll(
                    `Спасбросок ${label}`,
                    formData[`${statKey}_save_proficient`]
                  )
                }
                className={`dice-button ${rolling ? 'rolling' : ''}`}
                disabled={rolling}
              >
                <FaDiceD20 />
              </Button>
            </div>
            <span className="skill-bonus">
              {(() => {
                const prof = formData[`${statKey}_save_proficient`];
                const totalBonus = mod + (prof ? proficiencyBonus : 0);
                return totalBonus >= 0 ? `+${totalBonus}` : totalBonus;
              })()}
            </span>
          </div>
        </div>

        {/* Список навыков */}
        <div className="skill-list">
          {skills.map(({ name, key }) => {
            const proficient = !!formData[`${key}_proficient`];
            const bonus = mod + (proficient ? proficiencyBonus : 0);
            return (
              <div
                key={key}
                className="skill-row d-flex justify-content-between align-items-center mb-2"
              >
                <div className="d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    className="me-2"
                    checked={proficient}
                    onChange={(e) =>
                      handleChange(`${key}_proficient`, e.target.checked)
                    }
                    label={<span className="skill-name">{name}</span>}
                  />
                  <Button
                    size="sm"
                    variant="outline-light"
                    onClick={() => handleRoll(name, proficient)}
                    className={`dice-button ${rolling ? 'rolling' : ''}`}
                    disabled={rolling}
                  >
                    <FaDiceD20 />
                  </Button>
                </div>
                <span className="skill-bonus">
                  {bonus >= 0 ? `+${bonus}` : bonus}
                </span>
              </div>
            );
          })}
        </div>
      </Card.Body>

      <Card.Footer className="recent-rolls">
        {recentRolls.length > 0 && (
          <>
            <div className="recent-label">Последние броски:</div>
            {recentRolls.map((roll, index) => (
              <div
                key={index}
                className={`recent-roll ${
                  roll.isCritical ? 'critical' : roll.isFail ? 'fail' : ''
                }`}
              >
                <span className="roll-skill">{roll.skill}:</span>
                <span className="roll-result">{roll.total}</span>
                <span className="roll-details">
                  ({roll.roll} + {roll.bonus})
                </span>
              </div>
            ))}
          </>
        )}
      </Card.Footer>
    </Card>
  );
};

const StatsTab = ({ formData, handleChange }) => {
  const stats = [
    {
      label: 'Сила',
      key: 'strength',
      icon: <FaFistRaised />,
      skills: [{ name: 'Атлетика', key: 'athletics' }],
    },
    {
      label: 'Ловкость',
      key: 'dexterity',
      icon: <FaRunning />,
      skills: [
        { name: 'Акробатика', key: 'acrobatics' },
        { name: 'Ловкость рук', key: 'sleight_of_hand' },
        { name: 'Скрытность', key: 'stealth' },
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
        { name: 'Анализ', key: 'investigation' },
        { name: 'История', key: 'history' },
        { name: 'Магия', key: 'arcana' },
        { name: 'Природа', key: 'nature' },
        { name: 'Религия', key: 'religion' },
      ],
    },
    {
      label: 'Мудрость',
      key: 'wisdom',
      icon: <FaEye />,
      skills: [
        { name: 'Восприятие', key: 'perception' },
        { name: 'Выживание', key: 'survival' },
        { name: 'Медицина', key: 'medicine' },
        { name: 'Проницательность', key: 'insight' },
        { name: 'Уход за животными', key: 'animal_handling' },
      ],
    },
    {
      label: 'Харизма',
      key: 'charisma',
      icon: <FaComments />,
      skills: [
        { name: 'Выступление', key: 'performance' },
        { name: 'Запугивание', key: 'intimidation' },
        { name: 'Обман', key: 'deception' },
        { name: 'Убеждение', key: 'persuasion' },
      ],
    },
  ];

  const proficiencyBonus = formData.proficiency_bonus || 2;

  return (
    <div className="stats-tab">
      <div id="dice-result"></div>

      <Row className="g-3">
        {stats.map((stat) => (
          <Col
            xs={12}
            sm={6}
            md={4}
            className="d-flex align-items-stretch"
            key={stat.key}
          >
            <div className="w-100 d-flex flex-column">
              <StatBlock
                label={stat.label}
                statKey={stat.key}
                base={formData[stat.key]}
                skills={stat.skills}
                onChangeBase={(e) => handleChange(stat.key, +e.target.value)}
                formData={formData}
                handleChange={handleChange}
                icon={stat.icon}
                proficiencyBonus={proficiencyBonus}
              />
            </div>
          </Col>
        ))}
        {/* Убрали внешний блок «Бонус мастерства» */}
      </Row>
    </div>
  );
};

export default StatsTab;
