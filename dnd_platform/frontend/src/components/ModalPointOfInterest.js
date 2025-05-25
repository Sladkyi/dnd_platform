import React, { useEffect, useState } from 'react';

const AddPointModal = ({
  isPointModalOpen,
  coords,
  onClose,
  onSave,
  rooms,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [image, setImage] = useState(null);
  const [show, setShow] = useState(false);
  const [selectedRoomObject, setSelectedRoomObject] = useState(null);

  // Анимация появления/исчезновения
  useEffect(() => {
    let timeout;
    if (isPointModalOpen) {
      setShow(true);
    } else {
      timeout = setTimeout(() => setShow(false), 200); // ждём завершения анимации
    }
    return () => clearTimeout(timeout);
  }, [isPointModalOpen]);

  if (!isPointModalOpen && !show) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value; // получаем id выбранной комнаты
    setSelectedRoom(roomId);

    // Находим объект комнаты по id
    const selectedRoomObject = rooms.find((room) => room.id === roomId);
    setSelectedRoomObject(selectedRoomObject);
  };

  return (
    <div
      style={{
        ...overlayStyles,
        opacity: isPointModalOpen ? 1 : 0,
        pointerEvents: isPointModalOpen ? 'auto' : 'none',
        transition: 'opacity 0.2s ease-in-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          ...modalStyles,
          transform: isPointModalOpen ? 'scale(1)' : 'scale(0.9)',
          transition: 'transform 0.2s ease-in-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={titleStyles}>Добавить точку интереса</h3>
        <p style={coordsText}>
          Координаты: x: {coords?.x}, y: {coords?.y}
        </p>
        <div style={formGroupStyles}>
          <label htmlFor="name" style={labelStyles}>
            Название
          </label>
          <input
            type="text"
            id="name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название точки"
            style={inputStyles}
          />
        </div>
        <div style={formGroupStyles}>
          <label htmlFor="description" style={labelStyles}>
            Описание
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание точки"
            style={textareaStyles}
          />
        </div>
        <div style={formGroupStyles}>
          <label htmlFor="room" style={labelStyles}>
            Комната
          </label>
          <select
            id="room"
            value={selectedRoom}
            onChange={handleRoomChange} // меняем обработчик на handleRoomChange
            style={inputStyles}
          >
            <option value="">Выберите комнату</option>
            {rooms?.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>

        <div style={formGroupStyles}>
          <label htmlFor="image" style={labelStyles}>
            Загрузить изображение
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            style={inputStyles}
          />
          {image && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={image}
                alt="preview"
                style={{ width: '100px', height: 'auto' }}
              />
            </div>
          )}
        </div>
        <div style={actionsStyles}>
          <button
            style={{ ...buttonStyles, background: '#444' }}
            onClick={onClose}
          >
            Отменить
          </button>
          <button
            style={buttonStyles}
            onClick={() =>
              onSave(
                title,
                description,
                selectedRoom,
                image,
                selectedRoomObject
              )
            }
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

const overlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyles = {
  background: '#2b2b2b',
  padding: '30px',
  borderRadius: '20px',
  width: '420px',
  color: '#eee',
  boxShadow: `
    8px 8px 16px #1f1f1f,
    -8px -8px 16px #3b3b3b
  `,
};

const titleStyles = {
  marginBottom: '10px',
  fontSize: '20px',
  color: '#fff',
};

const coordsText = {
  fontSize: '12px',
  color: '#888',
  marginBottom: '20px',
};

const formGroupStyles = {
  marginBottom: '20px',
  display: 'flex',
  flexDirection: 'column',
};

const labelStyles = {
  marginBottom: '5px',
  fontSize: '14px',
};

const inputStyles = {
  padding: '10px',
  borderRadius: '10px',
  background: '#2b2b2b',
  border: 'none',
  color: '#fff',
  boxShadow: `
    inset 4px 4px 8px #1f1f1f,
    inset -4px -4px 8px #3b3b3b
  `,
};

const textareaStyles = {
  ...inputStyles,
  height: '80px',
  resize: 'vertical',
};

const actionsStyles = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
};

const buttonStyles = {
  padding: '10px 20px',
  borderRadius: '12px',
  background: '#333',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  boxShadow: `
    4px 4px 8px #1f1f1f,
    -4px -4px 8px #3b3b3b
  `,
  transition: 'all 0.2s ease-in-out',
};

export default AddPointModal;
