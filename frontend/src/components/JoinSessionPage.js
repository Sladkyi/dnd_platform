import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../shared/styles/JoinSessionPage.css';
import axiosInstance from '../app/axiosInstance';

const JoinSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleJoin = async (selectedShapeId) => {
    console.log(selectedShapeId);
    try {
      const response = await axiosInstance.post(
        `/sessions/joinSessionWithShape/${sessionId}/`,
        { shape_id: selectedShapeId }
      );
      console.log('Успешно присоединились:', response.data);
      navigate(`/edit-map/${response.data.map_id}`, {
        state: { role: 'player', shapeId: selectedShapeId },
      });
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login');
      } else {
        console.error('Ошибка при присоединении:', error);
        setError('Не удалось присоединиться');
      }
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axiosInstance.get(`/maps/join/${sessionId}/`);
        const data = response.data;
        setSessionData(data);

        if (data.role === 'master') {
          navigate(`/edit-map/${data.map_id}`, { state: { role: 'master' } });
        } else {
          setLoading(false);
        }

        console.log(data);
      } catch (err) {
        console.error('Ошибка при получении данных сессии:', err);

        if (err.response?.status === 404) {
          setError('Сессия не найдена');
        } else {
          setError('Произошла ошибка при загрузке сессии');
        }

        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, navigate]);

  if (loading) return <div className="join-loading">Загрузка сессии...</div>;
  if (error) return <div className="join-error">Ошибка: {error}</div>;

  return (
    <div className="join-session-container">
      <h2>Присоединиться к игре</h2>
      <p>Выберите персонажа, за которого будете играть:</p>

      <div className="characters-grid">
        {sessionData.available_shapes.map((shape) => (
          <div key={shape.id} className="character-card">
            <div className="character-avatar">
              <img
                src={shape.image || '/default-avatar.webp'}
                alt={shape.name}
              />
            </div>
            <div className="character-info">
              <h4>{shape.name || 'Без имени'}</h4>
              {/* Здесь можно добавить доп. информацию, если есть */}
              {/* <p>Класс: {shape.character_class}</p> */}
              {/* <p>Уровень: {shape.level}</p> */}
            </div>
            <button
              className="select-button"
              onClick={() => handleJoin(shape.id)}
            >
              Выбрать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinSessionPage;
