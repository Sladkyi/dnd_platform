import React from 'react';
import { Form } from 'react-bootstrap';

const MentalTab = ({ formData, handleChange }) => (
  <div className="mental-tab">
    <Form.Group className="form-group">
      <Form.Label>Настроение</Form.Label>
      <Form.Control
        type="text"
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
        value={formData.sanity}
        onChange={(e) => handleChange('sanity', +e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Безумие</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.insanity}
        onChange={(e) => handleChange('insanity', e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Страхи</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.fears}
        onChange={(e) => handleChange('fears', e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Мотивации</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.motivations}
        onChange={(e) => handleChange('motivations', e.target.value)}
      />
    </Form.Group>
  </div>
);

export default MentalTab;
