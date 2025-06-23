import React from 'react';

const ClassEditor = () => {
  return (
    <div className="spell-editor-wrapper">
      <div className="spell-editor-form">
        <h2 className="spell-title">Создание класса персонажа</h2>

        <div className="field-grid">
          <div className="form-group">
            <label htmlFor="className">Название</label>
            <input id="className" type="text" placeholder="Боевой маг" />
          </div>

          <div className="form-group">
            <label htmlFor="role">Роль</label>
            <select id="role">
              <option>Поддержка</option>
              <option>Урон</option>
              <option>Контроль</option>
              <option>Флекс</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mainStat">Основной атрибут</label>
            <select id="mainStat">
              <option>Сила</option>
              <option>Ловкость</option>
              <option>Телосложение</option>
              <option>Интеллект</option>
              <option>Мудрость</option>
              <option>Харизма</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="shortDesc">Описание</label>
          <textarea
            id="shortDesc"
            rows="3"
            placeholder="Кратко опишите суть класса"
          />
        </div>

        <div className="form-group">
          <label htmlFor="features">Особенности</label>
          <textarea
            id="features"
            rows="4"
            placeholder="Укажите ключевые черты, механики и особенности"
          />
        </div>

        <div className="action-buttons">
          <button className="btn-primary">Сохранить</button>
          <button className="btn-secondary">Предпросмотр</button>
        </div>
      </div>

      <div className="spell-preview">
        <h3 className="preview-title">Предпросмотр</h3>
        <div className="preview-card">
          <p className="preview-line">
            🛡 <strong>Название:</strong> Боевой маг
          </p>
          <p className="preview-line">
            <strong>Роль:</strong> Урон
          </p>
          <p className="preview-line">
            <strong>Атрибут:</strong> Интеллект
          </p>
          <p className="preview-line">
            <strong>Описание:</strong> Мастер боевых заклинаний в тяжелой броне.
          </p>
          <p className="preview-line">
            <strong>Особенности:</strong> Заклинания + Меч, зачарование оружия,
            броня мага.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClassEditor;
