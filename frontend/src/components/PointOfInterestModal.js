import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './styles/PointOfInterestModal.css';
import { updatePointOfInterest } from '../services/MapService';
import StoryPOI from './POIContent/StoryPOI';
import TrapPOI from './POIContent/TrapPOI';
import PortalPOI from './POIContent/PortalPOI';
import ChestPOI from './POIContent/ChestPOI';
import CombatPOI from './POIContent/CombatPOI';
import NotePOI from './POIContent/NotePOI';
import HiddenPOI from './POIContent/HiddenPOI';
import TriggerPOI from './POIContent/TriggerPOI';
import NPCPOI from './POIContent/NPCPOI';
import SoundPOI from './POIContent/SoundPOI';
import SlideshowPOI from './POIContent/SlideshowPOI';
import { normalizePOIToFormData } from "./utils/normilizedPOI";

const POI_TYPES = [
  { value: 'story', label: '📜 Сюжет', component: StoryPOI },
  { value: 'trap', label: '💣 Ловушка', component: TrapPOI },
  { value: 'chest', label: '🎒 Сундук', component: ChestPOI },
  { value: 'portal', label: '🌀 Портал', component: PortalPOI },
  { value: 'combat', label: '⚔️ Бой', component: CombatPOI },
  { value: 'note', label: '📝 Заметка', component: NotePOI },
  { value: 'hidden', label: '👁️ Скрытое', component: HiddenPOI },
  { value: 'trigger', label: '🎯 Триггер', component: TriggerPOI },
  { value: 'npc', label: '🧍 NPC', component: NPCPOI },
  { value: 'sound', label: '🔊 Звук', component: SoundPOI },
  { value: 'slideshow', label: '🖼️ Слайдшоу', component: SlideshowPOI }
];

const PointOfInterestModal = ({ poi, onClose, onSave, rooms , onCreateNewRoom }) => {
  const [formData, setFormData] = useState({
    title: poi.title || '',
    icon_type: poi.icon_type || 'story',
    additional_data: poi.additional_data || {}
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(true);

  // Initialize images and form data
  useEffect(() => {
    const initialImages = [];

    if (poi.image) {
      initialImages.push({
        id: 'main',
        url: poi.image,
        type: 'existing'
      });
    }

    if (poi.images?.length > 0) {
      poi.images
        .sort((a, b) => a.order - b.order)
        .forEach((img) => {
          initialImages.push({
            id: img.id,
            url: img.image,
            type: 'slide'
          });
        });
    }

    setImages(initialImages);
    setFormData({
      title: poi.title || '',
      icon_type: poi.icon_type || 'story',
      additional_data: poi.additional_data || {},
      target_room: poi.target_room ?? null,
    });
  }, [poi]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
    };
  }, [images]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  }, []);

  const handleAdditionalDataChange = useCallback((data) => {
    setFormData(prev => ({
      ...prev,
      additional_data: { ...prev.additional_data, ...data }
    }));
    setHasChanges(true);
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError(`Файл ${file.name} не является изображением`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`Файл ${file.name} слишком большой (макс. 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: 'new'
    }));

    setImages(prev => [...prev, ...newImages].slice(0, 10));
    setHasChanges(true);
    setError(null);
  };

  const handleRemoveImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
    setHasChanges(true);
  };

  const handleMoveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;

    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataPayload = normalizePOIToFormData({
        formData,
        poi,
        images,
        rooms
      });
      console.log(formDataPayload)
      const response = await updatePointOfInterest(poi.id, formDataPayload);
      onSave(response.data);
    } catch (err) {
      console.error('Ошибка обновления POI:', err);
      setError(err.response?.data?.message || 'Не удалось сохранить изменения');
    } finally {
      setLoading(false);
    }
  };

  const CurrentPOIComponent = POI_TYPES.find(
    type => type.value === formData.icon_type
  )?.component;

  return (
    <div
      className="poi-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="poi-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="poi-modal">
        <div className="poi-modal-header">
          <h3 id="poi-modal-title">Редактировать точку интереса</h3>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Закрыть модальное окно"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="poi-modal-form">
          <div className="form-group">
            <label htmlFor="title">Название:</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="icon_type">Тип точки:</label>
            <select
              id="icon_type"
              name="icon_type"
              value={formData.icon_type}
              onChange={handleChange}
            >
              {POI_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {CurrentPOIComponent && (
            <CurrentPOIComponent
              data={{
                ...formData.additional_data,
                ...(formData.icon_type === 'portal' && { target_room: formData.target_room })
              }}
              onChange={(data) => {
                if (formData.icon_type === 'portal' && 'target_room' in data) {
                  setFormData(prev => ({ ...prev, target_room: data.target_room }));
                } else {
                  handleAdditionalDataChange(data);
                }
              }}
              images={images}
              onImageAdd={handleImageChange}
              onImageRemove={handleRemoveImage}
              onImageMove={handleMoveImage}
              rooms={rooms}
              onCreateNewRoom = {onCreateNewRoom}
            />

          )}

          {error && (
            <div className="error-message">
              {error}
              <button
                type="button"
                onClick={() => setError(null)}
                className="error-close"
              >
                &times;
              </button>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="secondary-button"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="primary-button"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Сохранение...
                </>
              ) : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PointOfInterestModal.propTypes = {
  poi: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
    icon_type: PropTypes.string,
    image: PropTypes.string,
    images: PropTypes.array,
    map: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    room: PropTypes.number,
    additional_data: PropTypes.object
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  rooms: PropTypes.array
};

PointOfInterestModal.defaultProps = {
  rooms: []
};

export default PointOfInterestModal;