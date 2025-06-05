import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Button,
  Form,
  Tab,
  Tabs,
  Row,
  Col,
  Image,
} from 'react-bootstrap';
import { Pencil, XLg, Save, ShieldShaded } from 'react-bootstrap-icons';
import CombatTab from './CombatTab';
import InfoTab from './InfoTab';
import AbilitiesTab from './AbilitiesTab';
import StatBlock from './StatBlock';
import '../styles/EditingEntity.css';
import axiosInstance from '../../axiosInstance';
import MentalTab from './MentalTab';
import StoryTab from './StoryTab';
import WorldTab from './WorldTab';
import StatsTab from './StatsTab';
const initialFormState = () => ({
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
  race: '',
  character_class: '',
  level: 1,
  max_hp: 10,
  current_hp: 10,
  speed: 30,
  armor_class: 10,
  attack_bonus: 0,
  damage: '',
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
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
  proficiencies: '',
});

const EditingEntity = ({ isOpen, closeModal, selectedShape }) => {
  const [formData, setFormData] = useState(initialFormState());
  const [activeTab, setActiveTab] = useState('combat');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedShape) {
      setFormData({ ...initialFormState(), ...selectedShape });
    }
  }, [selectedShape]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axiosInstance.patch(
        `maps/shape/update/${selectedShape.id}/`,
        formData,
        {
          headers: {
            'X-CSRFToken':
              document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '',
          },
        }
      );
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={isOpen}
      onHide={closeModal}
      size="xl"
      centered
      className="entity-editor dark-theme"
    >
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
                  <input type="file" className="d-none" />
                </label>
              </div>
            </Col>
            <Col>
              <Form.Control
                plaintext
                className="h2 text-light mb-1 border-bottom border-primary bg-transparent"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              <div className="d-flex align-items-center flex-wrap gap-2">
                <Form.Control
                  plaintext
                  className="text-info fs-5 bg-transparent"
                  value={formData.race}
                  onChange={(e) => handleChange('race', e.target.value)}
                  placeholder="Раса"
                />
                <Form.Control
                  plaintext
                  className="text-warning fs-5 bg-transparent"
                  value={formData.character_class}
                  onChange={(e) =>
                    handleChange('character_class', e.target.value)
                  }
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
                    onChange={(e) => handleChange('level', +e.target.value)}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-dark-800 p-0" style={{ minHeight: '65vh' }}>
        <Tabs
          activeKey={activeTab}
          onSelect={setActiveTab}
          className="border-bottom border-dark-700 px-3 pt-3"
        >
          <Tab eventKey="combat" title="🛡 БОЕВЫЕ">
            <CombatTab formData={formData} handleChange={handleChange} />
          </Tab>
          <Tab eventKey="info" title="📄 ИНФО">
            <InfoTab formData={formData} handleChange={handleChange} />
          </Tab>
          <Tab eventKey="abilities" title="✨ СПОСОБНОСТИ">
            <AbilitiesTab formData={formData} handleChange={handleChange} />
          </Tab>
          <Tab eventKey="mental" title="🧠 ПСИХИКА">
            <MentalTab formData={formData} handleChange={handleChange} />
          </Tab>
          <Tab eventKey="story" title="📜 ИСТОРИЯ">
            <StoryTab formData={formData} handleChange={handleChange} />
          </Tab>
          <Tab eventKey="world" title="🌍 МИР">
            <WorldTab formData={formData} handleChange={handleChange} />
          </Tab>
          <Tab eventKey="stats" title="🧬 ХАРАКТЕРИСТИКИ">
            <StatsTab formData={formData} handleChange={handleChange} />
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer className="bg-dark-900 border-dark-700 py-3">
        <Button
          variant="secondary"
          onClick={closeModal}
          className="bg-dark-700 border-dark-600"
        >
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

export default EditingEntity;
