import React from 'react';
import { Form } from 'react-bootstrap';

const StoryTab = ({ formData, handleChange }) => (
  <div className="story-tab">
    <Form.Group className="form-group">
      <Form.Label>Прошлый опыт</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.past_experiences}
        onChange={(e) => handleChange('past_experiences', e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Достижения</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.achievements}
        onChange={(e) => handleChange('achievements', e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Заметки</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Цитаты</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.quotes}
        onChange={(e) => handleChange('quotes', e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Воспоминания</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.memories}
        onChange={(e) => handleChange('memories', e.target.value)}
      />
    </Form.Group>

    <Form.Group className="form-group">
      <Form.Label>Наследие</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={formData.legacy}
        onChange={(e) => handleChange('legacy', e.target.value)}
      />
    </Form.Group>
  </div>
);

export default StoryTab;
