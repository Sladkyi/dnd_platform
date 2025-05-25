import React, { useEffect, useRef, useState } from 'react';
import { createNoise2D } from 'simplex-noise';
import { EditingEntity } from './EditingEntity';
import AddPointModal from './ModalPointOfInterest';
import useImage from 'use-image';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Circle } from 'react-konva';
import { Modal, Button, Alert, Dropdown } from 'react-bootstrap';
import { Rect } from 'react-konva';
import { Image as KonvaImage } from 'react-konva';
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiUpload,
  FiUsers,
  FiGrid,
  FiArrowRight,
  FiZoomIn,
  FiZoomOut,
  FiMove,
} from 'react-icons/fi';
import './EditMap.css';
import {
  FaUser,
  FaAccessibleIcon,
  FaArrowAltCircleRight,
} from 'react-icons/fa';

const EditMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mapData, setMapData] = useState({ title: '', description: '' });
  const [shapes, setShapes] = useState([]);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [shapeToDelete, setShapeToDelete] = useState(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [lastRoom, setLastRoom] = useState(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [invisibleObjects, setInvisibleObjects] = useState(false);
  const [MapUploadModal, setMapUploadModal] = useState(false);
  const [file, setFile] = useState(null);
  const [mapImage, setMapImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [image, setImage] = useState(null);
  const [currentRoomImage, setCurrentRoomImage] = useState(null);
  const imageRef = useRef(null);
  const [roomImageObject, setRoomImageObject] = useState(null);
  const [isEditingEntityModalVisible, setIsEditingEntityModalVisible] =
    useState(false);
  const [shapeImages, setShapeImages] = useState([]);
  const img = new window.Image();
  const [mapMainImage, setMapMainImage] = useState(null);
  const [newPointCoords, setNewPointCoords] = useState(null);
  const [isPointModalOpen, setPointModalOpen] = useState(false);
  const [pointsOfInterest, setPointsOfInterest] = useState([]);

  const getCSRFToken = () => {
    const name = 'csrftoken=';
    const value = document.cookie
      .split(';')
      .find((cookie) => cookie.trim().startsWith(name));
    return value ? value.split('=')[1] : '';
  };

const handleCreateRoomURL = async () => {
  try {
   const token = localStorage.getItem('token'); // Получаем JWT токен из localStorage (или из куки)
    const response = await fetch(`http://localhost:8000/api/maps/createURL/${id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
        'Authorization': `Bearer ${token}`,  // Токен аутентификации
      },
      body: JSON.stringify({ user: userId }),
    });

    if (!response.ok) {
      throw new Error("Не удалось создать ссылку");
    }

    const data = await response.json();
    console.log("Созданная ссылка:", data.join_url);
    // Можно отобразить пользователю, скопировать, и т.д.
  } catch (error) {
    console.error("Ошибка при создании ссылки:", error);
  }
};

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/maps/${id}/`);
        if (!response.ok) throw new Error('Ошибка при загрузке карты');
        const data = await response.json();

        setMapData({ title: data.title, description: data.description });
        setShapes(data.shapes || []);
        setPointsOfInterest(data.pointsOfInterest || []);
        console.log(
          '====================================================',
          data
        );
        setUserId(data.user);

        const img = new window.Image();
        img.src = data.full_card_map_image;

        // После загрузки изображения, обновляем состояние
        img.onload = () => {
          setMapMainImage(img); // Сохраняем изображение в состояние
        };

        const lastRoomId = data.last_opened_room_id || 0;
        setCurrentRoomId(lastRoomId);
        if (lastRoomId) {
          const roomResponse = await fetch(
            `http://localhost:8000/api/maps/rooms/${data.last_opened_room_id}/`
          );
          if (!roomResponse.ok) throw new Error('Ошибка при загрузке комнаты');
          const roomData = await roomResponse.json();
          chooseRoom(roomData);
        }
      } catch (error) {
        setError(error);
      }
    };

    fetchMapData();
  }, [id]);

  const handleAddPointOfInterest = async (
    title,
    description,
    selectedRoomObject,
    image
  ) => {
    console.log(title);
    try {
      console.log(title);
      const response = await fetch(
        `http://localhost:8000/api/maps/PontOfInterest/${id}/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
          },
          body: JSON.stringify({
            title: title,
            description: description,
            room: selectedRoomObject,
            x: newPointCoords.x,
            y: newPointCoords.y,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Точка интереса успешно добавлена:', data);
      } else {
        const errorData = await response.json();
        console.error('Ошибка при добавлении точки:', errorData);
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    }
  };

  const chooseRoom = async (room) => {
    console.log('Selected room:', room); // Проверка данных, которые передаются
    setCurrentRoomId(room.id);
    setCurrentRoomImage(room.background_image);

    try {
      const response = await fetch(`http://localhost:8000/api/maps/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({ last_opened_room_id: room.id }),
      });
      if (!response.ok)
        console.error('Ошибка при обновлении карты:', response.status);
    } catch (error) {
      console.error('Ошибка сети или сервера:', error);
    }
  };

  useEffect(() => {
    if (!currentRoomImage) {
      setRoomImageObject(null);
      return;
    }
    const img = new window.Image();
    img.src = `http://localhost:8000${currentRoomImage}`;
    img.onload = () => {
      setRoomImageObject(img);
    };
  }, [currentRoomImage]);

  const handleMouseDown = (e) => {
    if (e.evt.button !== 0) return;
    setIsDragging(true);
    setLastMousePos({ x: e.evt.clientX, y: e.evt.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !lastMousePos) return;

    const dx = e.evt.clientX - lastMousePos.x;
    const dy = e.evt.clientY - lastMousePos.y;

    requestAnimationFrame(() => {
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    });

    setLastMousePos({ x: e.evt.clientX, y: e.evt.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastMousePos(null);
  };

  const handleWheel = (e) => {
    const scaleBy = 1.1;
    let newScale = scale;

    if (e.evt.deltaY < 0) {
      newScale *= scaleBy;
    } else {
      newScale /= scaleBy;
    }

    setScale(Math.min(Math.max(newScale, 0.1), 3));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Выберите файл');

    const formData = new FormData();
    formData.append('background_image', file);
    formData.append('name', 'newFile');
    formData.append('description', 'newDescription');

    try {
      const response = await fetch(
        `http://localhost:8000/api/maps/CreateNewRoom/${id}/`,
        {
          method: 'POST',
          headers: { 'X-CSRFToken': getCSRFToken() },
          body: formData,
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Комната загружена:', data);
      }
    } catch (err) {
      console.error('Ошибка при загрузке:', err);
    }
  };

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') handleDeleteShape();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [selectedShapeId]);

  const handleDragEnd = async (e) => {
    await handleAfterDragSaveShape(e.target);
  };

  const handleAddCircle = async () => {
    const newCircle = {
      type: 'circle',
      x: 100,
      y: 100,
      radius: 30,
      fill: '#3498db',
      isPlayer: false,
    };
    await handleDynamicallySaveShape(newCircle);
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/maps/GetRooms/${id}/`
        );
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const data = await response.json();
        setRooms(data);
      } catch (err) {
        console.error('Ошибка при загрузке:', err);
      }
    };
    fetchRooms();
  }, [id]);

  const handleShapeChange = (key, value) => {
    setShapes((prev) =>
      prev.map((shape) =>
        shape.id === selectedShapeId ? { ...shape, [key]: value } : shape
      )
    );
  };

  const openMapUploadModal = () => setMapUploadModal(true);
  const closeMapUploadModal = () => setMapUploadModal(false);

  const handleAfterDragSaveShape = async (shape) => {
    try {
      const shapeData = {
        id: shape.id(),
        x: shape.x(),
        y: shape.y(),
        fill: shape.fill(),
        type: shape.attrs.type || 'circle',
      };
      const response = await fetch(
        `http://localhost:8000/api/maps/changePosition/${shape.id()}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
          },
          body: JSON.stringify({
            title: mapData.title,
            user: mapData.user,
            shapes: [shapeData],
          }),
        }
      );
      if (response.ok) {
        const updatedMap = await response.json();
        setShapes((prev) =>
          prev.map((s) => (s.id === updatedMap.id ? updatedMap : s))
        );
      }
    } catch (error) {
      console.error('Ошибка при обновлении координат фигуры:', error);
    }
  };

  const handleDynamicallySaveShape = async (newCircle) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/maps/change/${id}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
          },
          body: JSON.stringify({
            ...mapData,
            shapes: [newCircle],
            user: userId,
          }),
        }
      );
      if (response.ok) {
        const updatedMap = await response.json();
        setShapes(updatedMap.shapes || []);
      }
    } catch (error) {
      console.error('Ошибка при сохранении фигуры:', error);
    }
  };

  const handleDeleteShape = async () => {
    if (!shapeToDelete) return;
    try {
      const response = await fetch(
        `http://localhost:8000/api/maps/changePosition/delete/${shapeToDelete.id}/`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (response.ok) {
        setShapes((prev) => prev.filter((s) => s.id !== shapeToDelete.id));
        setShowModal(false);
        setShapeToDelete(null);
        setContextMenuVisible(false);
      }
    } catch (error) {
      console.error('Ошибка при удалении фигуры:', error);
    }
  };

  const selectedShape = shapes.find((s) => s.id === selectedShapeId);

  const handleRightClick = (e, shape) => {
    e.evt.preventDefault();
    setSelectedShapeId(shape.id);
    setContextMenuPosition({ x: e.evt.clientX, y: e.evt.clientY });
    setContextMenuVisible(true);
  };
  const handleDblClick = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    // Корректировка координат с учетом трансформаций
    const adjustedPos = {
      x: (pos.x - stage.x()) / scale,
      y: (pos.y - stage.y()) / scale,
    };

    setNewPointCoords(adjustedPos);
    setPointModalOpen(true);
  };
  useEffect(() => {
    const loadObjectImages = () => {
      const loadedImages = shapes.map((shape) => {
        const img = new window.Image();
        img.src = shape.image;
        return new Promise((resolve) => {
          img.onload = () => resolve(img);
        });
      });
      Promise.all(loadedImages).then(setShapeImages);
    };
    if (shapes.length > 0) loadObjectImages();
  }, [shapes]);

  return (
    <div className="edit-map-container">
      <div className="main-content">
        <Stage
          width={window.innerWidth - 320}
          height={window.innerHeight - 120}
          scaleX={scale}
          scaleY={scale}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDblClick={handleDblClick}
          x={position.x}
          y={position.y}
          draggable
        >
          <Layer>
            {roomImageObject && (
              <KonvaImage
                image={roomImageObject}
                x={100}
                y={100}
                width={roomImageObject.width}
                height={roomImageObject.height}
                ref={imageRef}
              />
            )}
          </Layer>
          <Layer>
            {!roomImageObject && mapMainImage && (
              <KonvaImage
                image={mapMainImage}
                x={100}
                y={100}
                width={mapMainImage.width}
                height={mapMainImage.height}
                ref={imageRef}
              />
            )}
          </Layer>

          <Layer>
            {shapes.map(
              (shape, index) =>
                shapeImages[index] && (
                  <KonvaImage
                    key={shape.id}
                    id={shape.id}
                    image={shapeImages[index]}
                    x={shape.x}
                    y={shape.y}
                    width={(shape.radius || 30) * 2}
                    height={(shape.radius || 30) * 2}
                    draggable
                    shadowColor="#f1c40f"
                    shadowBlur={15}
                    onClick={() => setSelectedShapeId(shape.id)}
                    onDragEnd={handleDragEnd}
                    onContextMenu={(e) => handleRightClick(e, shape)}
                  />
                )
            )}
          </Layer>
          <Layer>
            {pointsOfInterest.map((point, index) => (
              <Circle
                key={point.id}
                id={point.id}
                x={point.x}
                y={point.y}
                radius={point.radius || 30}
                fill="blue" // Убираем цвет заливки для круга
                onClick={() => {
                  console.log('Circle clicked:', point.room);
                  chooseRoom(point.room);
                }}>
              </Circle>
            ))}
          </Layer>
        </Stage>
      </div>

      <div className="side-panel">
        <div className="panel-section">
          {/* Если изображение карты существует, отображаем его */}
          {mapMainImage && (
            <div className="map-main-image-container">
              <img
                src={mapMainImage.src}
                alt="Главная карта"
                className="map-main-image"
                onClick={() => chooseRoom(mapMainImage)} // обработчик клика
              />
            </div>
          )}

          <h4>
            <FiGrid /> {mapData.title}
          </h4>
          <div className="tool-section">
            <button className="tool-button" onClick={handleAddCircle}>
              <FiPlus /> Добавить объект
            </button>
            <button className="tool-button" onClick={handleCreateRoomURL}>
              <FiPlus /> пригласить игроков
            </button>

            {selectedShape && (
              <>
                <button
                  className="tool-button"
                  onClick={() => setIsEditingEntityModalVisible(true)}
                >
                  <FiEdit /> Редактировать
                </button>
                <button
                  className="tool-button danger"
                  onClick={() => {
                    setShapeToDelete(selectedShape);
                    setShowModal(true);
                  }}
                >
                  <FiTrash2 /> Удалить
                </button>
              </>
            )}
          </div>
        </div>

        <div className="panel-section rooms-section">
          <div className="section-header">
            <h5>
              <FiArrowRight /> Комнаты
            </h5>
            <button className="icon-button" onClick={openMapUploadModal}>
              <FiPlus />
            </button>
          </div>
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`room-card ${room.id === currentRoomId ? 'active' : ''}`}
                onClick={() => chooseRoom(room)}
              >
                <img
                  src={`http://localhost:8000${room.background_image}`}
                  alt={room.name}
                  className="room-thumbnail"
                />
                <div className="room-info">
                  <h6>{room.name}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Нижняя панель мастера */}
      <div className="master-controls">
        <div className="scale-controls">
          <button onClick={() => setScale(Math.min(scale + 0.1, 3))}>
            <FiZoomIn />
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(Math.max(scale - 0.1, 0.1))}>
            <FiZoomOut />
          </button>
        </div>
        <button
          className="reset-position"
          onClick={() => setPosition({ x: 0, y: 0 })}
        >
          <FiMove /> Сбросить позицию
        </button>
      </div>

      {/* Модальные окна и вспомогательные элементы */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Подтвердите удаление</Modal.Title>
        </Modal.Header>
        <Modal.Body>Вы уверены, что хотите удалить эту фигуру?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDeleteShape}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>

      {contextMenuVisible && (
        <div
          className="context-menu"
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          <button onClick={handleDeleteShape}>
            <FiTrash2 /> Удалить
          </button>
          <button onClick={() => setContextMenuVisible(false)}>Отмена</button>
        </div>
      )}

      {MapUploadModal && (
        <div className="upload-modal-overlay">
          <div className="upload-modal">
            <div className="modal-header">
              <h4>Создать комнату</h4>
              <button onClick={closeMapUploadModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <input type="file" onChange={handleFileChange} />
              <button type="submit">
                <FiUpload /> Загрузить
              </button>
            </form>
          </div>
        </div>
      )}

      {isEditingEntityModalVisible && (
        <EditingEntity
          id={id}
          selectedShapeId={selectedShapeId}
          isOpen={isEditingEntityModalVisible}
          selectedShape={selectedShape}
          closeModal={() => setIsEditingEntityModalVisible(false)}
        />
      )}

      <AddPointModal
        isPointModalOpen={isPointModalOpen}
        coords={newPointCoords}
        rooms={rooms} // Переходящий список комнат
        onClose={() => setPointModalOpen(false)}
        onSave={(title, description, selectedRoomObject, image) =>
          handleAddPointOfInterest(
            title,
            description,
            selectedRoomObject,
            image
          )
        }
      />
    </div>
  );
};

export default EditMap;
