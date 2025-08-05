import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../shared/styles/CreateMap.css';
import { useParams } from 'react-router-dom';
import axiosInstance from '../app/axiosInstance';
import { createMap } from '../services/MapService';
const CreateMap = () => {
  const [mapName, setMapName] = useState('');
  const [mapImage, setMapImage] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  console.log(id);

  const handleNameChange = (event) => {
    setMapName(event.target.value);
  };

  const handleImageChange = (event) => {
    setMapImage(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!mapImage || !mapName) {
      alert('Пожалуйста, введите название карты и загрузите изображение.');
      return;
    }

    const formData = new FormData();
    formData.append('full_card_map_image', mapImage);
    formData.append('title', mapName);
    formData.append('description', 'Описание карты');

    try {
      const response = await createMap(id, formData);
      console.log('Карта создана:', response.data);
      navigate('/login');
    } catch (err) {
      console.error(
        'Ошибка при создании карты:',
        err.response?.data || err.message
      );
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
