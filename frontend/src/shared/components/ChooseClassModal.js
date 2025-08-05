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
  FaHeart,
  FaShieldAlt,
  FaMagic,
  FaFistRaised,
  FaBook,
  FaExclamationTriangle,
  FaSearch,
} from 'react-icons/fa';
import '../styles/ClassPickerModal.css';
import { GetPlayerClasses } from '../../services/MapService';

const ClassPickerModal = ({ show, onClose, onSelect, profileId }) => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [complexityFilter, setComplexityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedClass, setSelectedClass] = useState(null);
  // Загрузка данных
  useEffect(() => {
    if (!show || !profileId) return;

    const loadClasses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await GetPlayerClasses(profileId);

        // Проверка структуры ответа
        if (!Array.isArray(response?.data)) {
          throw new Error('Некорректный формат данных классов');
        }

        // Нормализация данных
        const normalizedClasses = response.data
          .map((cls) => ({
            id: cls.id || null,
            name: cls.name || 'Безымянный класс',
            description: cls.description || 'Описание отсутствует',
            role: cls.role || 'unknown',
            complexity: cls.complexity || 'medium',
            hitPoints: cls.hit_dice || 'Не указано',
            primaryAbility: Array.isArray(cls.primary_abilities)
              ? cls.primary_abilities
              : ['Не указано'],
            savingThrows: cls.saving_throws || ['Не указано'],
            startingFeatures: cls.features
              ? typeof cls.features === 'string'
                ? cls.features.split(',')
                : Array.isArray(cls.features)
                  ? cls.features
                  : [cls.features]
              : ['Нет начальных умений'],
            proficiencies: cls.proficiencies || 'Не указано',
            isPublic: cls.is_public || false,
            createdAt: cls.created_at || null,
          }))
          .filter((cls) => cls.id !== null);

        if (normalizedClasses.length === 0) {
          setError('Нет доступных классов для выбора');
        } else {
          setClasses(normalizedClasses);
          setFilteredClasses(normalizedClasses);
        }
      } catch (err) {
        console.error('Ошибка загрузки классов:', err);
        setError(err.message || 'Не удалось загрузить классы');
      } finally {
        setIsLoading(false);
      }
    };

    loadClasses();
  }, [show, profileId]);

  // Фильтрация классов
  useEffect(() => {
    let result = classes;

    // Фильтрация по поиску
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (cls) =>
          cls.name.toLowerCase().includes(term) ||
          cls.description.toLowerCase().includes(term) ||
          cls.role?.toLowerCase().includes(term) ||
          (Array.isArray(cls.startingFeatures) &&
            cls.startingFeatures.some((feature) =>
              feature.toLowerCase().includes(term)
            ))
      );
    }

    // Фильтрация по сложности
    if (complexityFilter !== 'all') {
      result = result.filter(
        (cls) => cls.complexity.toLowerCase() === complexityFilter
      );
    }

    // Фильтрация по роли
    if (roleFilter !== 'all') {
      result = result.filter((cls) => cls.role.toLowerCase() === roleFilter);
    }

    setFilteredClasses(result);

    // Сброс выбора при изменении фильтров
    if (!result.some((cls) => cls.id === selectedClassId)) {
      setSelectedClassId(null);
    }
  }, [searchTerm, complexityFilter, roleFilter, classes, selectedClassId]);

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!show) {
      setSelectedClassId(null);
      setError(null);
      setSearchTerm('');
      setComplexityFilter('all');
      setRoleFilter('all');
    }
  }, [show]);

  const handleSelect = (cls) => {
    setSelectedClass(cls);
  };

  const handleConfirm = () => {
    if (!selectedClass) {
      setError('Не выбран класс');
      return;
    }

    onSelect(selectedClass); // <== теперь передаём объект
    onClose();
  };

  const getRoleIcon = (role) => {
    if (!role) return <FaBook className="role-icon" />;

    switch (role.toLowerCase()) {
      case 'tank':
        return <FaShieldAlt className="role-icon tank" />;
      case 'healer':
        return <FaHeart className="role-icon healer" />;
      case 'dps':
        return <FaFistRaised className="role-icon dps" />;
      case 'support':
        return <FaMagic className="role-icon support" />;
      default:
        return <FaBook className="role-icon" />;
    }
  };

  const getComplexityColor = (complexity) => {
    if (!complexity) return 'secondary';

    switch (complexity.toLowerCase()) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const renderComplexityBadge = (complexity) => {
    if (!complexity) return null;

    const textMap = {
      easy: 'Простой',
      medium: 'Средний',
      hard: 'Сложный',
    };

    return (
      <Badge
        bg={getComplexityColor(complexity)}
        className="complexity-badge"
        pill
      >
        {textMap[complexity.toLowerCase()] || complexity}
      </Badge>
    );
  };

  const renderRoleTag = (role) => {
    if (!role) return null;

    const roleMap = {
      tank: 'Танк',
      healer: 'Лекарь',
      dps: 'Урон',
      support: 'Поддержка',
      unknown: 'Роль не указана',
    };

    return (
      <span className={`role-tag ${role.toLowerCase()}`}>
        {roleMap[role.toLowerCase()] || role}
      </span>
    );
  };

  const renderAbilities = (abilities) => {
    if (!Array.isArray(abilities)) {
      return <Badge bg="secondary">Нет данных</Badge>;
    }

    return abilities.map((a, i) => (
      <Badge key={i} bg="dark" className="me-1 ability-badge">
        {a || 'Не указано'}
      </Badge>
    ));
  };

  const renderFeatures = (features) => {
    if (!Array.isArray(features)) {
      return <li>Нет данных об умениях</li>;
    }

    return features
      .slice(0, 3)
      .map((f, i) => <li key={i}>{f || 'Не указано'}</li>)
      .concat(
        features.length > 3 ? (
          <li key="more" className="more-features">
            +{features.length - 3} других умений
          </li>
        ) : (
          []
        )
      );
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="xl"
      className="class-picker-modal"
      backdrop="static"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>
          <FaBook className="me-2" />
          Выберите класс персонажа
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        {/* Панель фильтров */}
        <div className="filter-panel p-3">
          <Row className="g-3">
            <Col md={5}>
              <InputGroup className="search-container">
                <InputGroup.Text className="search-icon">
                  <FaSearch />
                </InputGroup.Text>
                <FormControl
                  type="text"
                  placeholder="Поиск классов..."
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
                value={complexityFilter}
                onChange={(e) => setComplexityFilter(e.target.value)}
              >
                <option value="all">Любая сложность</option>
                <option value="easy">Простой</option>
                <option value="medium">Средний</option>
                <option value="hard">Сложный</option>
              </FormControl>
            </Col>
            <Col md={4}>
              <FormControl
                as="select"
                className="filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Любая роль</option>
                <option value="tank">Танк</option>
                <option value="healer">Лекарь</option>
                <option value="dps">Урон</option>
                <option value="support">Поддержка</option>
                <option value="unknown">Другое</option>
              </FormControl>
            </Col>
          </Row>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Загрузка классов...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="m-3">
            <FaExclamationTriangle className="me-2" />
            {error}
            <div className="mt-2">
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Попробовать снова
              </Button>
            </div>
          </Alert>
        ) : filteredClasses.length === 0 ? (
          <div className="no-results text-center py-5">
            <h5>Нет подходящих классов</h5>
            <p>Попробуйте изменить параметры поиска</p>
            <Button
              variant="outline-primary"
              size="sm"
              className="mt-2"
              onClick={() => {
                setSearchTerm('');
                setComplexityFilter('all');
                setRoleFilter('all');
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        ) : (
          <div className="class-grid p-3">
            <Row>
              {filteredClasses.map((cls) => (
                <Col key={cls.id} lg={4} md={6} className="mb-4">
                  <div
                    className={`class-card ${selectedClass?.id === cls.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(cls)}
                    data-testid={`class-card-${cls.id}`}
                  >
                    <div className="class-header">
                      <div className="class-icon-container">
                        {getRoleIcon(cls.role)}
                      </div>
                      <div className="class-title">
                        <h5 className="class-name">{cls.name}</h5>
                        {renderComplexityBadge(cls.complexity)}
                      </div>
                    </div>

                    <div className="class-body">
                      <p className="class-description">{cls.description}</p>
                      <div className="class-stats">
                        <div className="stat-item">
                          <span className="stat-label">Кость хитов:</span>
                          <span className="stat-value">{cls.hitPoints}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">
                            Основные характеристики:
                          </span>
                          <div className="ability-list">
                            {renderAbilities(cls.primaryAbility)}
                          </div>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Владения:</span>
                          <span className="stat-value">
                            {cls.proficiencies}
                          </span>
                        </div>
                      </div>
                      <div className="class-features">
                        <h6>Особенности класса:</h6>
                        <ul>{renderFeatures(cls.startingFeatures)}</ul>
                      </div>
                    </div>

                    <div className="class-footer">
                      {renderRoleTag(cls.role)}
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
          {selectedClass && (
            <span className="selected-class-info">
              Выбран: <strong>{selectedClass.name}</strong>
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
            disabled={!selectedClass || isLoading}
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
                Обработка...
              </>
            ) : (
              'Выбрать класс'
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ClassPickerModal;
