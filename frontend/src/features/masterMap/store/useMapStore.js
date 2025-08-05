import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMapStore = create(
  persist(
    (set) => ({
      // 🔄 Общие
      mapId: null,
      mapData: null,
      loading: false,
      error: null,

      // 🧩 Комнаты
      rooms: [],
      mainRoom: null,
      currentRoom: null,

      // 🧙‍♂️ Сущности
      shapes: [],
      items: [],
      pointsOfInterest: [],
      playerShapes: [],

      // 👥 Сессия
      sessionId: null,
      players: [],
      profileId: null,

      // 🖼️ UI-состояния
      scale: 1,
      position: { x: 0, y: 0 },
      activeTab: null,
      selectedShape: null,
      selectedItemInstance: null,
      selectedPOI: null,
      editingPOI: null,
      isPOIModalOpen: false,
      isItemModalOpen: false,
      isRoomModalOpen: false,
      showEditor: false,
      currentTurnShapeId: null,
      roomModalSource: null,
      itemInstances: [],

      // ✅ Сеттеры (основные)
      setMapId: (id) => set({ mapId: id }),
      setMapData: (data) => set({ mapData: data }),
      setLoading: (v) => set({ loading: v }),
      setError: (e) => set({ error: e }),
      setProfileId: (id) => set({ profileId: id }),
      setRooms: (v) => set({ rooms: v }),
      setMainRoom: (v) => set({ mainRoom: v }),
      setCurrentRoom: (v) => set({ currentRoom: v }),
      setShapes: (v) => set({ shapes: v }),
      setItems: (v) => set({ items: v }),
      setPointsOfInterest: (v) => set({ pointsOfInterest: v }),
      setPlayerShapes: (v) => set({ playerShapes: v }),
      setSessionId: (v) => set({ sessionId: v }),
      setPlayers: (v) => set({ players: v }),
      setItemInstances: (instances) => set({ itemInstances: instances }),
      // ✅ Сеттеры (UI)
      setScale: (v) => set({ scale: v }),
      setPosition: (v) => set({ position: v }),
      setActiveTab: (v) => set({ activeTab: v }),
      setSelectedShape: (v) => set({ selectedShape: v }),
      setSelectedItemInstance: (v) => set({ selectedItemInstance: v }),
      setSelectedPOI: (v) => set({ selectedPOI: v }),
      setEditingPOI: (v) => set({ editingPOI: v }),
      setIsPOIModalOpen: (v) => set({ isPOIModalOpen: v }),
      setIsItemModalOpen: (v) => set({ isItemModalOpen: v }),
      setIsRoomModalOpen: (v) => set({ isRoomModalOpen: v }),
      setShowEditor: (v) => set({ showEditor: v }),
      setCurrentTurnShapeId: (v) => set({ currentTurnShapeId: v }),
      setRoomModalSource: (v) => set({ roomModalSource: v }),

      // 🧹 Сброс всех состояний редактора
      resetEditor: () =>
        set({
          mapId: null,
          mapData: null,
          loading: false,
          error: null,
          rooms: [],
          mainRoom: null,
          currentRoom: null,
          shapes: [],
          items: [],
          pointsOfInterest: [],
          playerShapes: [],
          sessionId: null,
          players: [],
          scale: 1,
          position: { x: 0, y: 0 },
          activeTab: null,
          selectedShape: null,
          selectedItemInstance: null,
          selectedPOI: null,
          editingPOI: null,
          isPOIModalOpen: false,
          isItemModalOpen: false,
          isRoomModalOpen: false,
          showEditor: false,
          currentTurnShapeId: null,
          roomModalSource: null,
        }),
    }),
    {
      name: 'map-store', // localStorage key
      partialize: (state) => ({
        profileId: state.profileId,
        mapId: state.mapId,
        sessionId: state.sessionId,
        currentRoom: state.currentRoom,
      }),
    }
  )
);

export default useMapStore;
