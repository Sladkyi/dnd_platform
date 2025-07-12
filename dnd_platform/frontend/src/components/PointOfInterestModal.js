import React, { useState, useEffect } from 'react';
import './styles/PointOfInterestModal.css';
import { updatePointOfInterest } from '../services/MapService';

const PointOfInterestModal = ({ poi, onClose, onSave }) => {
  const [title, setTitle] = useState(poi.title || '');
  const [images, setImages] = useState([]); // массив изображений
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Инициализация изображений при монтировании
  useEffect(() => {
    const initialImages = [];

    // Добавляем основное изображение если есть
    if (poi.image) {
      initialImages.push({
        id: 'main',
        url: poi.image,
        type: 'existing',
      });
    }

    // Добавляем изображения из слайд-шоу
    if (poi.images && poi.images.length > 0) {
      poi.images
        .sort((a, b) => a.order - b.order)
        .forEach((img) => {
          initialImages.push({
            id: img.id,
            url: img.image,
            type: 'slide',
          });
        });
    }

    setImages(initialImages);
  }, [poi]);

  // Обработчик добавления изображений
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: 'new',
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // Обработчик удаления изображения
  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const newImages = [...prev];
      // Освобождаем объект URL если был создан
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Перемещение изображения вверх
  const handleMoveUp = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const newImages = [...prev];
      [newImages[index - 1], newImages[index]] = [
        newImages[index],
        newImages[index - 1],
      ];
      return newImages;
    });
  };

  // Перемещение изображения вниз
  const handleMoveDown = (index) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const newImages = [...prev];
      [newImages[index], newImages[index + 1]] = [
        newImages[index + 1],
        newImages[index],
      ];
      return newImages;
    });
  };

  // Очистка превью при размонтировании
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
    };
  }, [images]);

  // Отправка данных
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);

      // Обязательные поля
      formData.append('map', poi.map);
      formData.append('x', poi.x);
      formData.append('y', poi.y);
      if (poi.room) formData.append('room', poi.room);

      // Порядок изображений
      const imagesOrder = images
        .map((img, index) => {
          if (img.id && img.id !== 'main') return { id: img.id, order: index };
          return null;
        })
        .filter(Boolean);
      formData.append('images_order', JSON.stringify(imagesOrder));

      // Новые изображения
      images.forEach((img) => {
        if (img.type === 'new') {
          formData.append('new_images', img.file);
        }
      });

      // Удалённые изображения
      const existingIds = poi.images ? poi.images.map((img) => img.id) : [];
      const currentIds = images
        .map((img) => img.id)
        .filter((id) => id && id !== 'main' && typeof id === 'number');
      const deletedIds = existingIds.filter((id) => !currentIds.includes(id));
      formData.append('deleted_images', JSON.stringify(deletedIds));

      const { data } = await updatePointOfInterest(poi.id, formData);
      onSave(data);
    } catch (err) {
      console.error('Ошибка обновления POI:', err);
      setError('Не удалось сохранить изменения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="poi-modal-overlay">
      <div className="poi-modal">
        <h3>Редактировать точку интереса</h3>

        <form onSubmit={handleSubmit}>
          <label>
            Название:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="image-upload-label">
            Добавить изображения:
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <span className="upload-button">Выбрать файлы</span>
          </label>

          <div className="images-container">
            {images.map((img, index) => (
              <div key={index} className="image-item">
                <div className="image-preview">
                  <img
                    src={img.preview || img.url}
                    alt={`Превью ${index + 1}`}
                  />
                </div>
                <div className="image-controls">
                  <span>
                    {index + 1}/{images.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                  >
                    Удалить
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === images.length - 1}
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Отмена
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PointOfInterestModal;
