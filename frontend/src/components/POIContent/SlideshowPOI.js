import React from 'react';

const SlideshowPOI = ({ images, onImageAdd, onImageRemove, onImageMove }) => {
  return (
    <div className="slideshow-content">
      <h4>Управление слайдшоу</h4>
      <div className="image-upload-section">
        <label className="image-upload-label">
          Добавить изображения:
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onImageAdd}
            style={{ display: 'none' }}
            id="slideshow-upload"
          />
          <span className="upload-button" onClick={() => document.getElementById('slideshow-upload').click()}>
            Выбрать файлы
          </span>
        </label>
        <small>Максимум 10 изображений</small>
      </div>

      <div className="slideshow-preview">
        {images.map((img, index) => (
          <div key={index} className="slideshow-item">
            <div className="image-container">
              <img src={img.preview || img.url} alt={`Слайд ${index + 1}`} />
            </div>
            <div className="image-controls">
              <span>Позиция: {index + 1}</span>
              <button
                type="button"
                onClick={() => onImageRemove(index)}
                disabled={images.length <= 1}
              >
                Удалить
              </button>
              <button
                type="button"
                onClick={() => onImageMove(index, index - 1)}
                disabled={index === 0}
              >
                Вверх
              </button>
              <button
                type="button"
                onClick={() => onImageMove(index, index + 1)}
                disabled={index === images.length - 1}
              >
                Вниз
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlideshowPOI;