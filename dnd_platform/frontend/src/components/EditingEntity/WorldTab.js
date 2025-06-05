import React from 'react';
import { Form } from 'react-bootstrap';

const WorldTab = ({ formData, handleChange }) => (
  <div className="world-tab">
    <Form.Group className="form-group">
      <Form.Label>Родной город</Form.Label>
      <Form.Control
        type="text"
        value={formData.home_town}
        onChange={(e) => handleChange('home_town', e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Союзники</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.allies}
        onChange={(e) => handleChange('allies', e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Покровители</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.patrons}
        onChange={(e) => handleChange('patrons', e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Соперники</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.rivalries}
        onChange={(e) => handleChange('rivalries', e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Слухи</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.rumors}
        onChange={(e) => handleChange('rumors', e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Квесты</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.quests}
        onChange={(e) => handleChange('quests', e.target.value)}
      />
    </Form.Group>
  </div>
);

export default WorldTab;
