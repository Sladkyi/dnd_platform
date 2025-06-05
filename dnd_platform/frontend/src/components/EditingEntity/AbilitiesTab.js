import React from 'react';
import { Form } from 'react-bootstrap';

const AbilitiesTab = ({ formData, handleChange }) => (
  <div className="pt-3 h-100">
    <Form.Control
      as="textarea"
      className="bg-dark-900 text-light border-dark-700 h-100"
      style={{ minHeight: '200px' }}
      value={formData.known_spells}
      onChange={(e) => handleChange('known_spells', e.target.value)}
      placeholder="Список способностей и заклинаний..."
    />
  </div>
);

export default AbilitiesTab;
