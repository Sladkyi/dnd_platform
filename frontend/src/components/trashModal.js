import React, { useEffect, useState } from 'react';
const modalStyles = {};
const titleStyles = {};
const coordsText = {};
const formGroupStyles = {};
const labelStyles = {};
const inputStyles = {};
const textareaStyles = {};
const actionsStyles = {};
const buttonStyles = {};
const overlayStyles = {};
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
  const [iconType, setIconType] = useState('story');
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
      setImage(file); // сохраняем сам файл
    }
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value; // получаем id выбранной комнаты
    setSelectedRoom(roomId);

    // Находим объект комнаты по id
    const selectedRoomObject = rooms.find((room) => room.id === roomId);
    setSelectedRoomObject(selectedRoomObject);
  };

  const validateData =() => {
    console.log('👉 iconType перед отправкой:', iconType); // вставь перед onSave
    onSave(
      title,
      description,
      selectedRoom,
      image,
      selectedRoomObject,
      iconType
    )

  }

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
          <label htmlFor="iconType" style={labelStyles}>
            Тип точки
          </label>
          <select
            id="iconType"
            value={iconType}
            onChange={(e) => setIconType(e.target.value)}
            style={inputStyles}
          >
            <option value="story">📜 Сюжет</option>
            <option value="trap">💣 Ловушка</option>
            <option value="chest">🎒 Сундук</option>
            <option value="portal">🌀 Портал</option>
            <option value="combat">⚔️ Бой</option>
            <option value="note">📝 Заметка</option>
            <option value="hidden">👁️ Скрытое</option>
            <option value="trigger">🎯 Триггер</option>
            <option value="npc">🧍 NPC</option>
            <option value="sound">🔊 Звук</option>
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
                src={URL.createObjectURL(image)} // создаём URL прямо здесь
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
              
validateData()
            }
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPointModal;
