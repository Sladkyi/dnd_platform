import React, { useEffect, useState } from 'react';

const JoinRoomModal = ({ roomId, onClose, onJoinSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Функция для присоединения к комнате
  const handleJoinRoom = async () => {
    setLoading(true);
    setError(null);
    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:8000/api/maps/room/${roomId}/join/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.detail);
        onJoinSuccess(); // Вызываем callback, чтобы обновить состояние в родительском компоненте
      } else {
        setError(data.detail || 'Ошибка при присоединении к комнате');
      }
    } catch (err) {
      setError('Ошибка при подключении');
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="modal-overlay">
    <div className="modal">
      <h2>Присоединиться к комнате</h2>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="modal-actions">
        <button
          onClick={handleJoinRoom}
          disabled={loading}
          className="join-button"
        >
          {loading ? 'Загружается...' : 'Присоединиться'}
        </button>
        <button onClick={onClose} className="close-button">
          Закрыть
        </button>
      </div>
    </div>
    // </div>
  );
};

export default JoinRoomModal;
