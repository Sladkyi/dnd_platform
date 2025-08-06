// src/components/EditingEntity/StatBlock.js
import React from 'react';
import { Form } from 'react-bootstrap';

const StatBlock = ({ title, value, skills, onCheckChange, checks }) => {
  const modifier = Math.floor((value - 10) / 2);

  return (
    <div className="stat-block bg-dark-700 rounded-3 p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-primary mb-0">{title}</h5>
        <div className="text-center">
          <div className="stat-value display-6">{value}</div>
          <div className="text-muted fs-7">
            ({modifier >= 0 ? `+${modifier}` : modifier})
          </div>
        </div>
      </div>
      <div className="skills">
        {skills.map((skill, index) => (
          <Form.Check
            key={index}
            type="checkbox"
            label={skill}
            checked={checks.includes(skill)}
            onChange={(e) => onCheckChange(skill, e.target.checked)}
            className="text-light small mb-2"
          />
        ))}
      </div>
    </div>
  );
};

export default StatBlock;

// Компоненты CombatTab.js, InfoTab.js и AbilitiesTab.js будут созданы отдельно и подключены в EditingEntity.js
// Основной EditingEntity.js будет импортировать их как модули и рендерить во вкладках Tabs.
