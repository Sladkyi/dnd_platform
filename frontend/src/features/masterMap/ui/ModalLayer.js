import React from 'react';
import RoomModal from './MasterToolbar/RoomModal';
import PointOfInterestModal from '../../../shared/components/PointOfInterestModal';
import CreateItemModal from './MasterToolbar/CreateItemModal';
import EditingEntity from '../../entityEditor/ui/EditingEntity/EditingEntity';
import useMapStore from '../store/useMapStore';
import useMapActions from '../hooks/useMapActions';

const ModalLayer = () => {
  const {
    isRoomModalOpen,
    setIsRoomModalOpen,
    isPOIModalOpen,
    editingPOI,
    setIsPOIModalOpen,
    setEditingPOI,
    pointsOfInterest,
    setPointsOfInterest,
    rooms,
    isItemModalOpen,
    setIsItemModalOpen,
    showEditor,
    selectedShape,
    setShowEditor,
    setSelectedShape,
    setRoomModalSource,
  } = useMapStore();

  const { handleAddRoom } = useMapActions();

  return (
    <>
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onCreate={handleAddRoom}
      />

      {isPOIModalOpen && editingPOI && (
        <PointOfInterestModal
          poi={editingPOI}
          rooms={rooms}
          onCreateNewRoom={() => {
            setIsPOIModalOpen(false);
            setRoomModalSource('portal-poi');
            setIsRoomModalOpen(true);
          }}
          onClose={() => {
            setIsPOIModalOpen(false);
            setEditingPOI(null);
          }}
          onSave={(updatedPOI) => {
            setPointsOfInterest((prev) =>
              prev.map((p) => (p.id === updatedPOI.id ? updatedPOI : p))
            );
            setIsPOIModalOpen(false);
            setEditingPOI(null);
          }}
        />
      )}

      {isItemModalOpen && (
        <CreateItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
        />
      )}

      {showEditor && selectedShape && (
        <EditingEntity
          isOpen={showEditor}
          closeModal={() => {
            setShowEditor(false);
            setSelectedShape(null);
          }}
          selectedShape={selectedShape}
        />
      )}
    </>
  );
};

export default ModalLayer;
