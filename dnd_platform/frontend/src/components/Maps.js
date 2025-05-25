import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateMap.css';
  import { useParams } from 'react-router-dom';

const CreateMap = () => {
  const [mapName, setMapName] = useState('');
  const [mapImage, setMapImage] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  console.log(id)

  const handleNameChange = (event) => {
    setMapName(event.target.value);
  };

  const handleImageChange = (event) => {
    setMapImage(event.target.files[0]);
  };

  // Пример получения CSRF-токена (если нужно)
  const getCSRFToken = () => {
    const cookie = document.cookie.match(/csrftoken=([\w-]+)/);
    return cookie ? cookie[1] : '';
  };

  const handleSubmit = async () => {
    if (!mapImage || !mapName) {
      alert('Пожалуйста, введите название карты и загрузите изображение.');
      return;
    }

    const formData = new FormData();
    formData.append('full_card_map_image', mapImage);
    formData.append('title', mapName);
    formData.append('user', id);
    formData.append('description', 'Описание карты'); // Можешь сделать отдельное поле

    try {
      const response = await fetch(`http://localhost:8000/api/maps/change/${id}/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Комната загружена:', data);
        navigate('/maps'); // Переход после успешной загрузки
      } else {
        console.error('Ошибка сервера:', await response.text());
      }
    } catch (err) {
      console.error('Ошибка при загрузке:', err);
    }
  };

  return (
    <div className="map-creation-container">
      <div className="map-creation-card">
        <h2>Создание карты</h2>

        <div className="form-container">
          <label className="input-label">Название карты:</label>
          <input
            className="input-field"
            type="text"
            value={mapName}
            onChange={handleNameChange}
            placeholder="Введите название карты"
          />

          <label className="input-label">Загрузить изображение карты:</label>
          <input
            className="input-field"
            type="file"
            onChange={handleImageChange}
            accept="image/*"
          />

          {mapImage && (
            <div className="image-preview">
              <img src={URL.createObjectURL(mapImage)} alt="Превью карты" />
            </div>
          )}

          <button className="submit-button" onClick={handleSubmit}>
            Сохранить карту
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMap;
