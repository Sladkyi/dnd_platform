import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Tab, Tabs, Row, Col, Image, Alert, ProgressBar } from 'react-bootstrap';
import { 
  Shield, Backpack, Magic, Book, Pencil, XLg, Save, 
  HeartPulse, LightningCharge, Person, GeoAlt, GenderAmbiguous,
  ShieldShaded, FileEarmarkText, Journal, Gear
} from 'react-bootstrap-icons';
import './EditingEntity.css';

const initialFormState = () => ({
  // Базовые свойства
  name: '',
  type: '',
  x: 0,
  y: 0,
  rotation: 0,
  fill: '#FFFFFF',
  stroke: '',
  stroke_width: 1.0,
  image: null,
  wiewField: 60,
  isPlayer: false,
  is_npc: false,

  // Основные характеристики
  race: '',
  character_class: '',
  level: 1,
  max_hp: 10,
  current_hp: 10,
  speed: 30,
  armor_class: 10,
  attack_bonus: 0,
  damage: '',
  
  // Атрибуты
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,

  // Навыки и спасброски
  strength_check: '',
  dexterity_save: '',
  constitution_check: '',
  intelligence_save: '',
  wisdom_check: '',
  charisma_save: '',

  // Дополнительные поля
  background: '',
  personality_traits: '',
  ideals: '',
  bonds: '',
  flaws: '',
  appearance: '',
  allies: '',
  notes: '',
  achievements: '',
  past_experiences: '',
  alignment: '',
  fears: '',
  motivations: '',
  reputation: '',
  notable_features: '',
  conditions: '',
  age: null,
  height: '',
  weight: '',
  gender: '',
  pronouns: '',
  fighting_style: '',
  known_spells: '',
  equipment: '',
  resistances: '',
  vulnerabilities: '',
  rumors: '',
  quotes: '',
  memories: '',
  legacy: '',
  home_town: '',
  patrons: '',
  rivalries: '',
  quests: '',
  sanity: 100,
  insanity: '',
  mood: '',
  proficiencies: ''
});

const StatBlock = ({ title, value, skills, onCheckChange, checks }) => {
  const modifier = Math.floor((value - 10) / 2);
  
  return (
    <div className="stat-block bg-dark-700 rounded-3 p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-primary mb-0">{title}</h5>
        <div className="text-center">
          <div className="stat-value display-6">{value}</div>
          <div className="text-muted fs-7">({modifier >= 0 ? `+${modifier}` : modifier})</div>
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

const EditingEntity = ({ isOpen, closeModal, selectedShape }) => {
  const [formData, setFormData] = useState(initialFormState());
  const [activeTab, setActiveTab] = useState('combat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedShape) {
      setFormData({ ...initialFormState(), ...selectedShape });
    }
  }, [selectedShape]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedShape?.id) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`/api/shapes/${selectedShape.id}/`, {
        method: 'PATCH',
        headers: { 'X-CSRFToken': getCSRFToken() },
        body: formData
      });

      if (!response.ok) throw new Error('Image upload failed');
      handleChange('image', URL.createObjectURL(file));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/shapes/${selectedShape.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Save failed: ' + await response.text());
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = {
    strength: { skills: [] },
    dexterity: { skills: [] },
    constitution: { skills: [] },
    intelligence: { skills: [] },
    wisdom: { skills: [] },
    charisma: { skills: [] }
  };

  return (
<Modal show={isOpen} onHide={closeModal} size="xl" centered className="entity-editor dark-theme">
  <Modal.Header closeButton className="bg-dark-900 border-dark-700 py-3">
    <Modal.Title className="w-100">
      <Row className="align-items-center g-2">
        <Col xs="auto">
          <div className="avatar-upload position-relative">
            <Image
              src={formData.image || '/default-avatar.png'}
              roundedCircle
              className="border border-primary"
              style={{ width: '90px', height: '90px' }}
            />
            <label className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1">
              <Pencil size={18} className="text-white" />
              <input type="file" onChange={handleFileUpload} className="d-none" />
            </label>
          </div>
        </Col>
        <Col>
          <Form.Control
            plaintext
            className="h2 text-light mb-1 border-bottom border-primary bg-transparent"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
          />
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Form.Control
              plaintext
              className="text-info fs-5 bg-transparent"
              value={formData.race}
              onChange={e => handleChange('race', e.target.value)}
              placeholder="Раса"
            />
            <Form.Control
              plaintext
              className="text-warning fs-5 bg-transparent"
              value={formData.character_class}
              onChange={e => handleChange('character_class', e.target.value)}
              placeholder="Класс"
            />
            <div className="d-flex align-items-center ms-auto">
              <ShieldShaded className="text-muted me-2" />
              <Form.Control
                type="number"
                min="1"
                className="text-success fs-5 bg-dark-700 border-dark-600"
                style={{ width: '70px' }}
                value={formData.level}
                onChange={e => handleChange('level', +e.target.value)}
              />
            </div>
          </div>
        </Col>
      </Row>
    </Modal.Title>
  </Modal.Header>

  <Modal.Body className="bg-dark-800 p-0" style={{ minHeight: '65vh' }}>
    <Row className="g-0 h-100">
      {/* Левая панель - характеристики */}
      <Col md={6} className="border-end border-dark-700 p-3">
        <Row className="g-3">
          {/* Первая колонка характеристик */}
          <Col md={6}>
            {Object.entries(statsConfig)
              .slice(0, 3)
              .map(([key, config]) => (
                <StatBlock
                  key={key}
                  title={key.toUpperCase()}
                  value={formData[key]}
                  skills={config.skills}
                  checks={formData[`${key}_checks`] || []}
                  onCheckChange={(skill, checked) => {
                    const newChecks = checked
                      ? [...(formData[`${key}_checks`] || []), skill]
                      : (formData[`${key}_checks`] || []).filter(s => s !== skill);
                    handleChange(`${key}_checks`, newChecks);
                  }}
                />
              ))}
          </Col>

          {/* Вторая колонка характеристик */}
          <Col md={6}>
            {Object.entries(statsConfig)
              .slice(3)
              .map(([key, config]) => (
                <StatBlock
                  key={key}
                  title={key.toUpperCase()}
                  value={formData[key]}
                  skills={config.skills}
                  checks={formData[`${key}_checks`] || []}
                  onCheckChange={(skill, checked) => {
                    const newChecks = checked
                      ? [...(formData[`${key}_checks`] || []), skill]
                      : (formData[`${key}_checks`] || []).filter(s => s !== skill);
                    handleChange(`${key}_checks`, newChecks);
                  }}
                />
              ))}

            {/* Блок владений */}
            <div className="proficiencies bg-dark-900 rounded-3 p-3 mt-3">
              <h5 className="text-primary mb-3"><Journal className="me-2" />Владения</h5>
              <Form.Control
                as="textarea"
                rows={3}
                className="bg-dark-700 text-light border-dark-600"
                value={formData.proficiencies}
                onChange={e => handleChange('proficiencies', e.target.value)}
              />
            </div>
          </Col>
        </Row>
      </Col>

      {/* Правая панель - вкладки */}
      <Col md={6} className="p-3">
        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="border-bottom border-dark-700">
          <Tab eventKey="combat" title={<><Shield className="me-2" />Боевые</>}>
            <div className="pt-3">
              <Row className="g-3">
                <Col md={6}>
                  <div className="combat-card bg-dark-900 p-3 rounded-3">
                    <h5 className="text-danger mb-3"><HeartPulse className="me-2" />Здоровье</h5>
                    <ProgressBar
                      now={(formData.current_hp / formData.max_hp) * 100}
                      variant="danger"
                      className="mb-3"
                      label={`${formData.current_hp}/${formData.max_hp}`}
                    />
                    <Row className="g-2">
                      <Col>
                        <Form.Label className="text-muted small">Макс. HP</Form.Label>
                        <Form.Control
                          type="number"
                          className="bg-dark-700 text-light border-dark-600"
                          value={formData.max_hp}
                          onChange={e => handleChange('max_hp', +e.target.value)}
                        />
                      </Col>
                      <Col>
                        <Form.Label className="text-muted small">Текущее HP</Form.Label>
                        <Form.Control
                          type="number"
                          className="bg-dark-700 text-light border-dark-600"
                          value={formData.current_hp}
                          onChange={e => handleChange('current_hp', +e.target.value)}
                        />
                      </Col>
                    </Row>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="defense-card bg-dark-900 p-3 rounded-3">
                    <h5 className="text-warning mb-3"><Shield className="me-2" />Защита</h5>
                    <Row className="g-2">
                      <Col>
                        <Form.Label className="text-muted small">Класс брони</Form.Label>
                        <Form.Control
                          type="number"
                          className="bg-dark-700 text-light border-dark-600"
                          value={formData.armor_class}
                          onChange={e => handleChange('armor_class', +e.target.value)}
                        />
                      </Col>
                      <Col>
                        <Form.Label className="text-muted small">Скорость</Form.Label>
                        <Form.Control
                          type="number"
                          className="bg-dark-700 text-light border-dark-600"
                          value={formData.speed}
                          onChange={e => handleChange('speed', +e.target.value)}
                        />
                      </Col>
                    </Row>
                  </div>
                </Col>

                <Col md={12}>
                  <div className="attack-card bg-dark-900 p-3 rounded-3">
                    <h5 className="text-info mb-3"><LightningCharge className="me-2" />Атаки</h5>
                    <Row className="g-2">
                      <Col md={6}>
                        <Form.Label className="text-muted small">Бонус атаки</Form.Label>
                        <Form.Control
                          type="number"
                          className="bg-dark-700 text-light border-dark-600"
                          value={formData.attack_bonus}
                          onChange={e => handleChange('attack_bonus', +e.target.value)}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="text-muted small">Урон</Form.Label>
                        <Form.Control
                          className="bg-dark-700 text-light border-dark-600"
                          value={formData.damage}
                          onChange={e => handleChange('damage', e.target.value)}
                        />
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </div>
          </Tab>

          <Tab eventKey="info" title={<><FileEarmarkText className="me-2" />Инфо</>}>
            <div className="pt-3">
              <Row className="g-3">
                <Col md={6}>
                  <div className="personal-card bg-dark-900 p-3 rounded-3">
                    <h5 className="text-success mb-3"><Person className="me-2" />Личное</h5>
                    <Row className="g-2">
                      <Col md={6}>
                        <Form.Label className="text-muted small">Возраст</Form.Label>
                        <Form.Control
                          type="number"
                          className="bg-dark-700 text-light border-dark-600"
                          value={formData.age}
                          onChange={e => handleChange('age', +e.target.value)}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="text-muted small">Пол</Form.Label>
                        <Form.Control
                          className="bg-dark-700 text-light border-dark-600"
                          value={formData.gender}
                          onChange={e => handleChange('gender', e.target.value)}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="text-muted small">Рост</Form.Label>
                        <Form.Control
                          className="bg-dark-700 text-light border-dark-600"
                          value={formData.height}
                          onChange={e => handleChange('height', e.target.value)}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="text-muted small">Вес</Form.Label>
                        <Form.Control
                          className="bg-dark-700 text-light border-dark-600"
                          value={formData.weight}
                          onChange={e => handleChange('weight', e.target.value)}
                        />
                      </Col>
                    </Row>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="world-card bg-dark-900 p-3 rounded-3">
                    <h5 className="text-info mb-3"><GeoAlt className="me-2" />Мир</h5>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      className="bg-dark-700 text-light border-dark-600 mb-2"
                      placeholder="История"
                      value={formData.background}
                      onChange={e => handleChange('background', e.target.value)}
                    />
                    <Form.Control
                      className="bg-dark-700 text-light border-dark-600"
                      placeholder="Родной город"
                      value={formData.home_town}
                      onChange={e => handleChange('home_town', e.target.value)}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Tab>

          <Tab eventKey="abilities" title={<><Magic className="me-2" />Способности</>}>
            <div className="pt-3 h-100">
              <Form.Control
                as="textarea"
                className="bg-dark-900 text-light border-dark-700 h-100"
                style={{ minHeight: '200px' }}
                value={formData.known_spells}
                onChange={e => handleChange('known_spells', e.target.value)}
                placeholder="Список способностей и заклинаний..."
              />
            </div>
          </Tab>
        </Tabs>
      </Col>
    </Row>
  </Modal.Body>

  <Modal.Footer className="bg-dark-900 border-dark-700 py-3">
    <Button variant="secondary" onClick={closeModal} className="bg-dark-700 border-dark-600">
      <XLg className="me-2" />
      Закрыть
    </Button>
    <Button
      variant="primary"
      onClick={handleSubmit}
      disabled={loading}
      className="bg-primary border-primary"
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2"></span>
          Сохранение...
        </>
      ) : (
        <>
          <Save className="me-2" />
          Сохранить
        </>
      )}
    </Button>
  </Modal.Footer>
</Modal>
  );
};

const getCSRFToken = () => 
  document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';

export  {EditingEntity};