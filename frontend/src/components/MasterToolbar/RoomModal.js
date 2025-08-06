import React, { useState, useRef } from 'react';
import './styles/RoomModal.css';

const RoomModal = ({ isOpen, onClose, onCreate }) => {
  const [roomName, setRoomName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async () => {
    if (roomName.trim() === '') return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', roomName.trim());

    if (fileInputRef.current?.files[0]) {
      formData.append('background_image', fileInputRef.current.files[0]);
    }

    try {
      await onCreate(formData);
      setRoomName('');
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      onClose();
    } catch (error) {
      console.error('Ошибка при создании комнаты:', error);
      alert('Не удалось создать комнату. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content room" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Создать комнату</h3>

        <div
          className={`image-upload ${imagePreview ? 'has-image' : ''}`}
          onClick={triggerFileSelect}
        >
          {imagePreview ? (
            <div
              className="image-preview"
              style={{ backgroundImage: `url(${imagePreview})` }}
            />
          ) : (
            <div className="upload-placeholder">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  d="M4 5H17V12H19V5C19 3.897 18.103 3 17 3H4C2.897 3 2 3.897 2 5V17C2 18.103 2.897 19 4 19H12V17H4V5Z"
                  fill="currentColor"
                />
                <path d="M8 11L5 15H16L12 9L9 13L8 11Z" fill="currentColor" />
                <path
                  d="M19 14H17V17H14V19H17V22H19V19H22V17H19V14Z"
                  fill="currentColor"
                />
              </svg>
              <span>Загрузить изображение</span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden-input"
          />
        </div>

        <div className="input-group">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path
              d="M3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5ZM15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6C13.66 6 15 7.34 15 9ZM6 17C6 15 10 13.9 12 13.9C14 13.9 18 15 18 17V18H6V17Z"
              fill="currentColor"
            />
          </svg>
          <input
            type="text"
            placeholder="Введите название комнаты"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && roomName.trim() && !isLoading) {
                handleSubmit();
              }
            }}
            disabled={isLoading}
          />
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose} disabled={isLoading}>
            Отмена
          </button>
          <button
            className="create-btn"
            onClick={handleSubmit}
            disabled={isLoading || roomName.trim() === ''}
          >
            {isLoading ? <span className="spinner"></span> : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomModal;
