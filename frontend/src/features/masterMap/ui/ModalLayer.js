import React from 'react';
import RoomModal from './MasterToolbar/RoomModal';
import PointOfInterestModal from '../../../shared/components/PointOfInterestModal';
import CreateItemModal from './MasterToolbar/CreateItemModal';
import EditingEntity from '../../entityEditor/ui/EditingEntity/EditingEntity';

const ModalLayer = ({
  isRoomModalOpen,
  closeRoomModal,
  handleAddRoom,
  isPOIModalOpen,
  editingPOI,
  closePOIModal,
  savePOI,
  createNewRoomFromPOI,
  rooms,
  isItemModalOpen,
  closeItemModal,
  showEditor,
  selectedShape,
  closeEditor,
  profileId,
}) => {
  return (
    <>
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={closeRoomModal}
        onCreate={handleAddRoom}
      />

      {isPOIModalOpen && editingPOI && (
        <PointOfInterestModal
          poi={editingPOI}
          rooms={rooms}
          onCreateNewRoom={createNewRoomFromPOI}
          onClose={closePOIModal}
          onSave={savePOI}
        />
      )}

      {isItemModalOpen && (
        <CreateItemModal
          isOpen={isItemModalOpen}
          onClose={closeItemModal}
        />
      )}

      {showEditor && selectedShape && (
        <EditingEntity
          isOpen={showEditor}
          closeModal={closeEditor}
          selectedShape={selectedShape}
          profileId={profileId}
        />
      )}
    </>
  );
};

export default ModalLayer;
