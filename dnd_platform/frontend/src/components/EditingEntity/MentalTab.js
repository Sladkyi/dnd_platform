import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import {
  colors,
  shojiStyle,
  japanesePattern,
  sectionTitleStyle,
} from './EditingEntityStyles';

const MentalTab = ({ formData, handleChange }) => {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="mental-tab">
      <div
        className="japanese-panel"
        style={shojiStyle('hitdice', hovered)}
        onMouseEnter={() => setHovered('hitdice')}
        onMouseLeave={() => setHovered(null)}
      >
        <div style={japanesePattern}></div>
        <div style={sectionTitleStyle(colors.hitdice)}>心 (Психика)</div>

        <Form.Group className="form-group">
          <Form.Label>Настроение</Form.Label>
          <Form.Control
            type="text"
            className="japanese-input"
            value={formData.mood}
            onChange={(e) => handleChange('mood', e.target.value)}
          />
        </Form.Group>

        <Form.Group className="form-group">
          <Form.Label>Рассудок</Form.Label>
          <Form.Control
            type="number"
            min={0}
            max={100}
            className="japanese-input"
            value={formData.sanity}
            onChange={(e) => handleChange('sanity', +e.target.value)}
          />
        </Form.Group>

        <Form.Group className="form-group">
          <Form.Label>Безумие</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            className="japanese-input"
            value={formData.insanity}
            onChange={(e) => handleChange('insanity', e.target.value)}
          />
        </Form.Group>

        <Form.Group className="form-group">
          <Form.Label>Страхи</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            className="japanese-input"
            value={formData.fears}
            onChange={(e) => handleChange('fears', e.target.value)}
          />
        </Form.Group>

        <Form.Group className="form-group">
          <Form.Label>Мотивации</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            className="japanese-input"
            value={formData.motivations}
            onChange={(e) => handleChange('motivations', e.target.value)}
          />
        </Form.Group>
      </div>
    </div>
  );
};

export default MentalTab;
