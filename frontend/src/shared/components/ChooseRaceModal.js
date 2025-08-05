import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
  InputGroup,
  FormControl,
  Badge,
} from 'react-bootstrap';
import {
  FaSearch,
  FaUserAlt,
  FaExclamationTriangle,
  FaRunning,
  FaArrowsAlt,
  FaMagic,
  FaComment,
} from 'react-icons/fa';
import '../styles/ClassPickerModal.css';
import { GetPlayerRaces } from '../../services/MapService';

const sizeLabels = {
  tiny: 'Крошечный',
  small: 'Маленький',
  medium: 'Средний',
  large: 'Большой',
  huge: 'Огромный',
};

const abilityLabels = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма',
};

const RacePickerModal = ({ show, onClose, onSelect, profileId }) => {
  const [races, setRaces] = useState([]);
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all');

  useEffect(() => {
    console.log('🎯 RacePickerModal активен?', show, 'ID профиля:', profileId);
    if (!show || !profileId) return;

    const loadRaces = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await GetPlayerRaces(profileId);
        console.log(response);
        if (!Array.isArray(response?.data)) {
          throw new Error('Некорректный формат данных рас');
        }

        const normalizedRaces = response.data
          .map((race) => ({
            id: race.id || null,
            name: race.name || 'Безымянная раса',
            description: race.description || 'Описание отсутствует',
            size: race.size || 'medium',
            speed: race.speed || 30,
            abilityBonuses: race.ability_bonuses || {},
            traits: Array.isArray(race.traits) ? race.traits : [],
            languages: Array.isArray(race.languages) ? race.languages : [],
            features: race.features || [],
            isPublic: race.is_public || false,
          }))
          .filter((r) => r.id !== null);

        setRaces(normalizedRaces);
        setFilteredRaces(normalizedRaces);
      } catch (err) {
        console.error('Ошибка загрузки рас:', err);
        setError(err.message || 'Не удалось загрузить расы');
      } finally {
        setIsLoading(false);
      }
    };

    loadRaces();
  }, [show, profileId]);

  useEffect(() => {
    let result = races;

    // Фильтрация по поиску
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (race) =>
          race.name.toLowerCase().includes(term) ||
          race.description.toLowerCase().includes(term) ||
          (Array.isArray(race.traits) &&
            race.traits.some((trait) => trait.toLowerCase().includes(term))) ||
          (Array.isArray(race.languages) &&
            race.languages.some((lang) => lang.toLowerCase().includes(term)))
      );
    }

    // Фильтрация по размеру
    if (sizeFilter !== 'all') {
      result = result.filter((race) => race.size === sizeFilter);
    }

    setFilteredRaces(result);

    // Сброс выбора при изменении фильтров
    if (!result.some((r) => r.id === selectedRace?.id)) {
      setSelectedRace(null);
    }
  }, [searchTerm, sizeFilter, races, selectedRace]);

  const handleConfirm = () => {
    if (!selectedRace) {
      setError('Не выбрана раса');
      return;
    }
    onSelect(selectedRace);
    onClose();
  };

  const renderAbilityBonuses = (bonuses) => {
    return Object.entries(bonuses).map(([ability, value]) => (
      <Badge key={ability} bg="dark" className="me-1 ability-badge">
        {abilityLabels[ability] || ability}: +{value}
      </Badge>
    ));
  };

  const renderTraits = (traits) => {
    if (!traits.length) return <li>Нет особых черт</li>;

    return traits
      .slice(0, 3)
      .map((trait, i) => <li key={i}>{trait}</li>)
      .concat(
        traits.length > 3 ? (
          <li key="more" className="more-features">
            +{traits.length - 3} других черт
          </li>
        ) : (
          []
        )
      );
  };

  const renderLanguages = (languages) => {
    if (!languages.length) return '—';

    return (
      <div className="languages-grid">
        {languages.slice(0, 4).map((lang, i) => (
          <Badge key={i} bg="dark" className="me-1 mb-1">
            {lang}
          </Badge>
        ))}
        {languages.length > 4 && (
          <Badge bg="dark" className="me-1 mb-1">
            +{languages.length - 4} ещё
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      className="class-picker-modal"
      backdrop="static"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>
          <FaUserAlt className="me-2" />
          Выберите расу персонажа
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        {/* Панель фильтров */}
        <div className="filter-panel p-3">
          <Row className="g-3">
            <Col md={7}>
              <InputGroup className="search-container">
                <InputGroup.Text className="search-icon">
                  <FaSearch />
                </InputGroup.Text>
                <FormControl
                  placeholder="Поиск рас..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={5}>
              <FormControl
                as="select"
                className="filter-select"
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
              >
                <option value="all">Любой размер</option>
                <option value="tiny">Крошечный</option>
                <option value="small">Маленький</option>
                <option value="medium">Средний</option>
                <option value="large">Большой</option>
                <option value="huge">Огромный</option>
              </FormControl>
            </Col>
          </Row>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Загрузка рас...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="m-3">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        ) : filteredRaces.length === 0 ? (
          <div className="no-results text-center py-5">
            <h5>Нет подходящих рас</h5>
            <p>Попробуйте изменить параметры поиска</p>
            <Button
              variant="outline-primary"
              size="sm"
              className="mt-2"
              onClick={() => {
                setSearchTerm('');
                setSizeFilter('all');
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <div className="class-grid p-3">
            <Row>
              {filteredRaces.map((race) => (
                <Col key={race.id} lg={6} className="mb-4">
                  <div
                    className={`class-card ${selectedRace?.id === race.id ? 'selected' : ''}`}
                    onClick={() => setSelectedRace(race)}
                  >
                    <div className="class-header">
                      <div className="race-size-badge">
                        {sizeLabels[race.size] || 'Средний'}
                      </div>
                      <h5 className="class-name">{race.name}</h5>
                    </div>

                    <div className="class-body">
                      <p className="class-description">{race.description}</p>

                      <div className="class-stats">
                        <div className="stat-item">
                          <span className="stat-label">
                            <FaRunning className="me-1" /> Скорость
                          </span>
                          <span className="stat-value">{race.speed} фт</span>
                        </div>

                        {Object.keys(race.abilityBonuses).length > 0 && (
                          <div className="stat-item">
                            <span className="stat-label">
                              <FaMagic className="me-1" /> Бонусы характеристик
                            </span>
                            <div className="ability-list">
                              {renderAbilityBonuses(race.abilityBonuses)}
                            </div>
                          </div>
                        )}

                        <div className="stat-item">
                          <span className="stat-label">
                            <FaComment className="me-1" /> Языки
                          </span>
                          <div className="stat-value">
                            {renderLanguages(race.languages)}
                          </div>
                        </div>
                      </div>

                      {race.traits.length > 0 && (
                        <div className="class-features">
                          <h6>
                            <FaMagic className="me-1" /> Особые черты
                          </h6>
                          <ul>{renderTraits(race.traits)}</ul>
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
          {selectedRace && (
            <span className="selected-class-info">
              Выбрана: <strong>{selectedRace.name}</strong>
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
            disabled={!selectedRace || isLoading}
            className="ms-2"
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  size="sm"
                  animation="border"
                  className="me-2"
                />
                Загрузка...
              </>
            ) : (
              'Выбрать расу'
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default RacePickerModal;
