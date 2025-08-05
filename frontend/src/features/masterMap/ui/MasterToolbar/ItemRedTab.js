import React from 'react';
import {
  updateItemInstance,
  deleteItemInstance,
} from '../../../../services/MapService';
import './styles/ItemRedTab.css';
const ItemRedTab = ({ item, clearSelectedItemInstance }) => {
  if (!item) return null;

  const handleHideItem = async () => {
    try {
      await updateItemInstance(item.id, { is_hidden: true });
      console.log('Предмет скрыт');
      clearSelectedItemInstance();
    } catch (err) {
      console.error('Ошибка при скрытии предмета', err);
    }
  };

  const handleTakeItem = async () => {
    try {
      await updateItemInstance(item.id, { is_taken: true });
      console.log('Предмет взят');
      clearSelectedItemInstance();
    } catch (err) {
      console.error('Ошибка при взятии предмета', err);
    }
  };

  const handleDeleteItem = async () => {
    try {
      await deleteItemInstance(item.id);
      console.log('Предмет удалён');
      clearSelectedItemInstance();
    } catch (err) {
      console.error('Ошибка при удалении предмета', err);
    }
  };

  return (
    <div className="item-red-tab">
      <h4>Управление предметом: {item.item?.name || 'Без имени'}</h4>
      <button onClick={handleHideItem}>Скрыть</button>
      <button onClick={handleTakeItem}>Взять</button>
      <button onClick={handleDeleteItem}>Удалить</button>
      <button onClick={clearSelectedItemInstance}>Закрыть</button>
    </div>
  );
};

export default ItemRedTab;
