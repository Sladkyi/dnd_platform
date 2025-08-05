// components/CreateItemModal.js
import React from 'react';
import CreateItem from '../../../../components/CreateItem';
import './styles/CreateItemModal.css';

const CreateItemModal = ({ onClose, onItemCreated , isOpen }) => {
  const handleBackdropClick = (e) => {
    // Закрываем только если клик был по фону, а не по контенту
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* <button className="modal-close" onClick={onClose}>✖</button> */}
        <CreateItem onItemCreated={onItemCreated } isModal = {isOpen} />
      </div>
    </div>
  );
};

export default CreateItemModal;
