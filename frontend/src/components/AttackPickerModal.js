import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import {
  FaCrosshairs,
  FaFire,
  FaSnowflake,
  FaBolt,
  FaSkull,
  FaExclamationTriangle,
  FaSearch,
} from 'react-icons/fa';
import './styles/attakPickerModal.css';

import { GetPlayerAttacks, GetPlayerSpells } from '../services/MapService';

const AttackPickerModal = ({ show, onClose, onSelect, profileId }) => {
  const [attacks, setAttacks] = useState([]);
  const [filteredAttacks, setFilteredAttacks] = useState([]);
  const [selectedAttackId, setSelectedAttackId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [damageTypeFilter, setDamageTypeFilter] = useState('all');
  const [selectedAttack, setSelectedAttack] = useState(null);

  // Загрузка данных
  useEffect(() => {
    if (!show || !profileId) return;

    const loadAttacks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [attacksResponse, spellsResponse] = await Promise.all([
          GetPlayerAttacks(profileId),
          GetPlayerSpells(profileId),
        ]);

        const normalizedAttacks = (attacksResponse?.data || []).map((atk) => ({
          id: atk.id,
          name: atk.name || 'Безымянная атака',
          damageDice: atk.damage_dice || 'Не указано',
          damageType: atk.damage_type || 'Без типа',
          range: atk.range || 'Не указано',
          attackType: 'Оружие',
          source: 'attack',
          description: atk.description || '',
          properties: atk.properties || [],
        }));

        const normalizedSpells = (spellsResponse?.data || []).map((spell) => ({
          id: spell.id,
          name: spell.name || 'Безымянное заклинание',
          damageDice: spell.damage || 'Не указано',
          damageType: spell.damage_type || 'Без типа',
          range: spell.range || 'Не указано',
          attackType: 'Заклинание',
          source: 'spell',
          description: spell.effect || '',
          properties: ['Магия'],
        }));

        const combined = [...normalizedAttacks, ...normalizedSpells];

        if (combined.length === 0) {
          setError('Нет доступных атак или заклинаний для выбора');
        }

        setAttacks(combined);
        setFilteredAttacks(combined);
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError(err.message || 'Не удалось загрузить данные');
      } finally {
        setIsLoading(false);
      }
    };

    loadAttacks();
  }, [show, profileId]);

  // Фильтрация
  useEffect(() => {
    let result = attacks;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (atk) =>
          atk.name.toLowerCase().includes(term) ||
          atk.description.toLowerCase().includes(term) ||
          atk.damageType?.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter(
        (atk) => atk.attackType.toLowerCase() === typeFilter
      );
    }

    if (damageTypeFilter !== 'all') {
      result = result.filter(
        (atk) => atk.damageType.toLowerCase() === damageTypeFilter
      );
    }

    setFilteredAttacks(result);

    if (!result.some((atk) => atk.id === selectedAttackId)) {
      setSelectedAttackId(null);
    }
  }, [searchTerm, typeFilter, damageTypeFilter, attacks, selectedAttackId]);

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!show) {
      setSelectedAttackId(null);
      setError(null);
      setSearchTerm('');
      setTypeFilter('all');
      setDamageTypeFilter('all');
    }
  }, [show]);

  const handleSelect = (atk) => {
    setSelectedAttack(atk);
  };

  const handleConfirm = () => {
    if (!selectedAttack) {
      setError('Не выбрана атака или заклинание');
      return;
    }

    onSelect(selectedAttack);
    onClose();
  };

  const getDamageTypeIcon = (damageType) => {
    if (!damageType) return <FaCrosshairs className="damage-icon" />;

    const lowerType = damageType.toLowerCase();

    if (lowerType.includes('огн'))
      return <FaFire className="damage-icon fire" />;
    if (lowerType.includes('холод'))
      return <FaSnowflake className="damage-icon cold" />;
    if (lowerType.includes('электр'))
      return <FaBolt className="damage-icon lightning" />;
    if (lowerType.includes('некро') || lowerType.includes('ядовит'))
      return <FaSkull className="damage-icon poison" />;

    return <FaCrosshairs className="damage-icon" />;
  };

  const getAttackTypeColor = (attackType) => {
    if (!attackType) return 'secondary';

    switch (attackType.toLowerCase()) {
      case 'оружие':
        return 'primary';
      case 'заклинание':
        return 'info';
      case 'особое':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const renderAttackTypeBadge = (attackType) => {
    if (!attackType) return null;

    return (
      <Badge
        bg={getAttackTypeColor(attackType)}
        className="attack-type-badge"
        pill
      >
        {attackType}
      </Badge>
    );
  };

  const renderProperties = (properties) => {
    if (!Array.isArray(properties) || properties.length === 0) {
      return <Badge bg="secondary">Особое</Badge>;
    }

    return properties.slice(0, 3).map((prop, i) => (
      <Badge key={i} bg="dark" className="me-1 property-badge">
        {prop}
      </Badge>
    ));
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="xl"
      className="attack-picker-modal"
      backdrop="static"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>
          <FaCrosshairs className="me-2" />
          Выберите атаку или заклинание
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        {/* Фильтры */}
        <div className="filter-panel p-3">
          <Row className="g-3">
            <Col md={5}>
              <InputGroup className="search-container">
                <InputGroup.Text className="search-icon">
                  <FaSearch />
                </InputGroup.Text>
                <FormControl
                  type="text"
                  placeholder="Поиск..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <FormControl
                as="select"
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Любой тип</option>
                <option value="оружие">Оружие</option>
                <option value="заклинание">Заклинание</option>
              </FormControl>
            </Col>
            <Col md={4}>
              <FormControl
                as="select"
                className="filter-select"
                value={damageTypeFilter}
                onChange={(e) => setDamageTypeFilter(e.target.value)}
              >
                <option value="all">Любой урон</option>
                <option value="колющий">Колющий</option>
                <option value="рубящий">Рубящий</option>
                <option value="дробящий">Дробящий</option>
                <option value="огненный">Огненный</option>
                <option value="холодный">Холодный</option>
                <option value="электрический">Электрический</option>
                <option value="некротический">Некротический</option>
              </FormControl>
            </Col>
          </Row>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Загрузка...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="m-3">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        ) : filteredAttacks.length === 0 ? (
          <div className="no-results text-center py-5">
            <h5>Нет подходящих результатов</h5>
          </div>
        ) : (
          <div className="attack-grid p-3">
            <Row>
              {filteredAttacks.map((atk) => (
                <Col key={atk.id + atk.source} lg={4} md={6} className="mb-4">
                  <div
                    className={`attack-card ${selectedAttack?.id === atk.id && selectedAttack?.source === atk.source ? 'selected' : ''}`}
                    onClick={() => handleSelect(atk)}
                  >
                    <div className="attack-header">
                      <div className="attack-icon-container">
                        {getDamageTypeIcon(atk.damageType)}
                      </div>
                      <div className="attack-title">
                        <h5 className="attack-name">{atk.name}</h5>
                        {renderAttackTypeBadge(atk.attackType)}
                      </div>
                    </div>

                    <div className="attack-body">
                      <div className="attack-stats">
                        <div className="stat-item">
                          <span className="stat-label">Урон:</span>
                          <span className="stat-value damage-dice">
                            {atk.damageDice}
                          </span>
                          <span className="stat-value damage-type">
                            {atk.damageType}
                          </span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Дистанция:</span>
                          <span className="stat-value">{atk.range}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Свойства:</span>
                          <div className="property-list">
                            {renderProperties(atk.properties)}
                          </div>
                        </div>
                      </div>

                      {atk.description && (
                        <div className="attack-description">
                          <p>{atk.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="justify-content-between">
        <div>
          {selectedAttack && (
            <span className="selected-attack-info">
              Выбрано: <strong>{selectedAttack.name}</strong>
            </span>
          )}
        </div>
        <div>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedAttack || isLoading}
            className="ms-2"
          >
            {isLoading ? 'Загрузка...' : 'Выбрать'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AttackPickerModal;
