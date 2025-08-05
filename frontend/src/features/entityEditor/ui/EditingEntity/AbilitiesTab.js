import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import {
  colors,
  shojiStyle,
  japanesePattern,
  sectionTitleStyle,
} from './EditingEntityStyles';

const AbilitiesTab = ({ formData, handleChange }) => {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="pt-3 h-100">
      <div
        className="japanese-panel h-100"
        style={shojiStyle('attacks', hovered)}
        onMouseEnter={() => setHovered('attacks')}
        onMouseLeave={() => setHovered(null)}
      >
        <div style={japanesePattern}></div>
        <div style={sectionTitleStyle(colors.attacks)}>
          ✨ 能力 (Способности)
        </div>
        <Form.Control
          as="textarea"
          className="japanese-input h-100"
          style={{ minHeight: '200px' }}
          value={formData.known_spells}
          onChange={(e) => handleChange('known_spells', e.target.value)}
          placeholder="Список способностей и заклинаний..."
        />
      </div>
    </div>
  );
};

export default AbilitiesTab;
