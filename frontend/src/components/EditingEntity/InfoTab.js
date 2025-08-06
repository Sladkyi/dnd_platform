import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { Person, GeoAlt } from 'react-bootstrap-icons';
import {
  colors,
  shojiStyle,
  japanesePattern,
  sectionTitleStyle,
} from './EditingEntityStyles';

const InfoTab = ({ formData, handleChange }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="pt-3">
      <Row className="g-3">
        <Col md={6}>
          <div
            className="japanese-panel"
            style={shojiStyle('health', hovered)}
            onMouseEnter={() => setHovered('health')}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={japanesePattern}></div>
            <div style={sectionTitleStyle(colors.health)}>
              <Person /> 個人情報 (Личное)
            </div>
            <Row className="g-2">
              <Col md={6}>
                <Form.Label className="text-light small">Возраст</Form.Label>
                <Form.Control
                  type="number"
                  className="japanese-input"
                  value={formData.age}
                  onChange={(e) => handleChange('age', +e.target.value)}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="text-light small">Пол</Form.Label>
                <Form.Control
                  className="japanese-input"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="text-light small">Рост</Form.Label>
                <Form.Control
                  className="japanese-input"
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="text-light small">Вес</Form.Label>
                <Form.Control
                  className="japanese-input"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                />
              </Col>
            </Row>
          </div>
        </Col>

        <Col md={6}>
          <div
            className="japanese-panel"
            style={shojiStyle('defense', hovered)}
            onMouseEnter={() => setHovered('defense')}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={japanesePattern}></div>
            <div style={sectionTitleStyle(colors.defense)}>
              <GeoAlt /> 世界 (Мир)
            </div>
            <Form.Control
              as="textarea"
              rows={3}
              className="japanese-input mb-2"
              placeholder="История"
              value={formData.background}
              onChange={(e) => handleChange('background', e.target.value)}
            />
            <Form.Control
              className="japanese-input"
              placeholder="Родной город"
              value={formData.home_town}
              onChange={(e) => handleChange('home_town', e.target.value)}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default InfoTab;
