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
import '../../../../shared/styles/EditingEntity/base.css';
import '../../../../shared/styles/EditingEntity/modal.css';
import '../../../../shared/styles/EditingEntity/nav.css';
import '../../../../shared/styles/EditingEntity/stats.css';
import '../../../../shared/styles/EditingEntity/dice.css';
import '../../../../shared/styles/EditingEntity/responsive.css';
import '../../../../shared/styles/EditingEntity/CombatTab.css';
import axiosInstance from '../../../../app/axiosInstance';
import MentalTab from './MentalTab';
import StoryTab from './StoryTab';
import WorldTab from './WorldTab';
import StatsTab from './StatsTab';
import ClassPickerModal from '../../../../shared/components/ChooseClassModal';
import RacePickerModal from '../../../../shared/components/ChooseRaceModal';

const normalizeShapeData = (selectedShape = {}) => ({
  id: selectedShape.id,
  name: selectedShape.name || '',
  type: selectedShape.type || '',
  x: selectedShape.x || 0,
  y: selectedShape.y || 0,
  rotation: selectedShape.rotation || 0,
  fill: selectedShape.fill || '#FFFFFF',
  stroke: selectedShape.stroke || '',
  stroke_width: selectedShape.stroke_width ?? 1.0,
  image: selectedShape.image || null,
  wiewField: selectedShape.wiewField ?? 60,
  isPlayer: selectedShape.isPlayer || false,
  is_npc: selectedShape.is_npc || false,
  experience: selectedShape.experience ?? 0,
  race: selectedShape.race || '',
  race_name: selectedShape.race_name || '',
  race_traits: selectedShape.race_traits || [],
  race_languages: selectedShape.race_languages || [],
  race_ability_bonuses: selectedShape.race_ability_bonuses || {},
  race_size: selectedShape.race_size || 'medium',
  race_speed: selectedShape.race_speed ?? 30,
  temp_hp: selectedShape.temp_hp ?? 0,
  character_class: selectedShape.character_class || '',
  character_class_name: selectedShape.character_class_name || '',
  class_primary_abilities: selectedShape.class_primary_abilities || [],
  class_hit_dice: selectedShape.class_hit_dice || '1d10',
  class_proficiencies: selectedShape.class_proficiencies || '',
  class_features: selectedShape.class_features || [],
  spells: selectedShape.spells || [],
  level: selectedShape.level ?? 1,
  max_hp: selectedShape.max_hp ?? 10,
  current_hp: selectedShape.current_hp ?? 10,
  speed: selectedShape.race_speed ?? 30,
  armor_class: selectedShape.armor_class ?? 10,
  attack_bonus: selectedShape.attack_bonus ?? 0,
  damage: selectedShape.damage || '',

  strength: selectedShape.strength ?? 10,
  dexterity: selectedShape.dexterity ?? 10,
  constitution: selectedShape.constitution ?? 10,
  intelligence: selectedShape.intelligence ?? 10,
  wisdom: selectedShape.wisdom ?? 10,
  charisma: selectedShape.charisma ?? 10,

  background: selectedShape.background || '',
  personality_traits: selectedShape.personality_traits || '',
  ideals: selectedShape.ideals || '',
  bonds: selectedShape.bonds || '',
  flaws: selectedShape.flaws || '',
  appearance: selectedShape.appearance || '',
  allies: selectedShape.allies || '',
  notes: selectedShape.notes || '',
  achievements: selectedShape.achievements || '',
  past_experiences: selectedShape.past_experiences || '',
  alignment: selectedShape.alignment || '',
  fears: selectedShape.fears || '',
  motivations: selectedShape.motivations || '',
  reputation: selectedShape.reputation || '',
  notable_features: selectedShape.notable_features || '',
  conditions: selectedShape.conditions || '',
  age: selectedShape.age ?? null,
  height: selectedShape.height || '',
  weight: selectedShape.weight || '',
  gender: selectedShape.gender || '',
  pronouns: selectedShape.pronouns || '',
  fighting_style: selectedShape.fighting_style || '',
  known_spells: selectedShape.known_spells || '',
  equipment: selectedShape.equipment || '',
  resistances: selectedShape.resistances || '',
  vulnerabilities: selectedShape.vulnerabilities || '',
  rumors: selectedShape.rumors || '',
  quotes: selectedShape.quotes || '',
  memories: selectedShape.memories || '',
  legacy: selectedShape.legacy || '',
  home_town: selectedShape.home_town || '',
  patrons: selectedShape.patrons || '',
  rivalries: selectedShape.rivalries || '',
  quests: selectedShape.quests || '',
  sanity: selectedShape.sanity ?? 100,
  insanity: selectedShape.insanity || '',
  mood: selectedShape.mood || '',
  proficiencies: selectedShape.proficiencies || '',

  // боевые поля:
  initiative: selectedShape.initiative ?? 0,
  proficiency_bonus: selectedShape.proficiency_bonus ?? 2,
  hit_dice: selectedShape.hit_dice || '1d10',
  max_ap: selectedShape.max_ap ?? 3,
  current_ap: selectedShape.current_ap ?? 3,
  str_save: selectedShape.str_save ?? 0,
  dex_save: selectedShape.dex_save ?? 0,
  con_save: selectedShape.con_save ?? 0,
  int_save: selectedShape.int_save ?? 0,
  wis_save: selectedShape.wis_save ?? 0,
  cha_save: selectedShape.cha_save ?? 0,
  attacks: selectedShape.attacks || [],
  states: selectedShape.statuses || [],
  dice_macro: '',
  combat_actions: selectedShape.combat_actions || '',
  owner: selectedShape.owner || '',
});

const EditingEntity = ({ isOpen, closeModal, selectedShape, profileId }) => {
  const [showClassModal, setShowClassModal] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const [activeTab, setActiveTab] = useState('combat');
  const [loading, setLoading] = useState(false);
  const [selectedClassName, setSelectedClassName] = useState('');
  const [showRaceModal, setShowRaceModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    if (selectedShape) {
      setFormData(normalizeShapeData(selectedShape));
    } else {
      setFormData(normalizeShapeData()); // сбрасываем
    }
  }, [selectedShape]);

  const [formData, setFormData] = useState(() => normalizeShapeData());

  const recalculateFinalAbilities = (data) => {
    const bonuses = data.race_ability_bonuses || {};
    return {
      ...data,
      final_strength: (data.strength ?? 10) + (bonuses.strength ?? 0),
      final_dexterity: (data.dexterity ?? 10) + (bonuses.dexterity ?? 0),
      final_constitution:
        (data.constitution ?? 10) + (bonuses.constitution ?? 0),
      final_intelligence:
        (data.intelligence ?? 10) + (bonuses.intelligence ?? 0),
      final_wisdom: (data.wisdom ?? 10) + (bonuses.wisdom ?? 0),
      final_charisma: (data.charisma ?? 10) + (bonuses.charisma ?? 0),
    };
  };

  const removeAttack = async (index) => {
    const updatedAttacks = (formData.attacks || []).filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      attacks: updatedAttacks,
    }));

    try {
      // Например, вызываешь API сохранения измененного formData
      await axiosInstance.patch(`maps/shape/update/${formData.id}/`, {
        ...formData,
        attacks: updatedAttacks,
      });
    } catch (error) {
      console.error('Ошибка при удалении атаки на сервере', error);
      // При ошибке можно откатить состояние или уведомить пользователя
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // для предпросмотра можно также:
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, image: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        statuses: formData.states || [],
        attacks: (formData.attacks || []).map((a) => a.id),
        spells: (formData.spells || []).map((s) => s.id),
        temp_hp: formData.temp_hp,
      };

      if (selectedImage) {
        const patchData = new FormData();

        Object.entries(dataToSend).forEach(([key, value]) => {
          if (value !== null && value !== undefined && key !== 'image') {
            if (Array.isArray(value)) {
              value.forEach((v) => patchData.append(key, v));
            } else {
              patchData.append(key, value);
            }
          }
        });

        patchData.append('image', selectedImage);

        await axiosInstance.patch(
          `maps/shape/update/${selectedShape.id}/`,
          patchData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'X-CSRFToken':
                document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '',
            },
          }
        );
      } else {
        // Если изображение не менялось, отправляем JSON:
        delete dataToSend.image; // 👈 Удаляем поле image
        await axiosInstance.patch(
          `maps/shape/update/${selectedShape.id}/`,
          dataToSend
        );
      }

      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleRaceSelect = (race) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        race: race.id,
        race_name: race.name,
        race_ability_bonuses: race.ability_bonuses, // если нужно
      };
      return recalculateFinalAbilities(updated);
    });
  };

  const handleClassSelect = (cls) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        character_class: cls.id,
        character_class_name: cls.name,
      };
      return recalculateFinalAbilities(updated);
    });
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
                  <input
                    type="file"
                    className="d-none"
                    onChange={handleImageChange} // 👈 Вот сюда обработчик
                  />
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
                <Button
                  variant="outline-info"
                  className="fs-5 w-100 text-start"
                  onClick={() => setShowRaceModal(true)} // заведи состояние showRaceModal
                >
                  {formData.race_name || 'Выбрать расу'}
                </Button>
                <RacePickerModal
                  show={showRaceModal}
                  onClose={() => setShowRaceModal(false)}
                  onSelect={handleRaceSelect}
                  profileId={profileId}
                />
                <Button
                  variant="outline-warning"
                  className="fs-5 w-100 text-start"
                  onClick={() => setShowClassModal(true)}
                >
                  {formData.character_class_name || 'Выбрать класс'}
                </Button>
                <ClassPickerModal
                  show={showClassModal}
                  onClose={() => setShowClassModal(false)}
                  onSelect={handleClassSelect}
                  profileId={profileId}
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
            <CombatTab
              formData={formData}
              handleChange={handleChange}
              removeAttack={removeAttack} // вот сюда передаём функцию
            />
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
