import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { Person, GeoAlt } from 'react-bootstrap-icons';

const InfoTab = ({ formData, handleChange }) => (
  <div className="pt-3">
    <Row className="g-3">
      <Col md={6}>
        <div className="personal-card bg-dark-900 p-3 rounded-3">
          <h5 className="text-success mb-3">
            <Person className="me-2" />
            Личное
          </h5>
          <Row className="g-2">
            <Col md={6}>
              <Form.Label className="text-muted small">Возраст</Form.Label>
              <Form.Control
                type="number"
                className="bg-dark-700 text-light border-dark-600"
                value={formData.age}
                onChange={(e) => handleChange('age', +e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label className="text-muted small">Пол</Form.Label>
              <Form.Control
                className="bg-dark-700 text-light border-dark-600"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label className="text-muted small">Рост</Form.Label>
              <Form.Control
                className="bg-dark-700 text-light border-dark-600"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label className="text-muted small">Вес</Form.Label>
              <Form.Control
                className="bg-dark-700 text-light border-dark-600"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
              />
            </Col>
          </Row>
        </div>
      </Col>

      <Col md={6}>
        <div className="world-card bg-dark-900 p-3 rounded-3">
          <h5 className="text-info mb-3">
            <GeoAlt className="me-2" />
            Мир
          </h5>
          <Form.Control
            as="textarea"
            rows={3}
            className="bg-dark-700 text-light border-dark-600 mb-2"
            placeholder="История"
            value={formData.background}
            onChange={(e) => handleChange('background', e.target.value)}
          />
          <Form.Control
            className="bg-dark-700 text-light border-dark-600"
            placeholder="Родной город"
            value={formData.home_town}
            onChange={(e) => handleChange('home_town', e.target.value)}
          />
        </div>
      </Col>
    </Row>
  </div>
);

export default InfoTab;
