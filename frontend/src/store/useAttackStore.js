import { create } from 'zustand';

const initialAttackData = {
  name: '',
  attackType: 'Оружие',
  damageDice: '1d6',
  damageType: '',
  properties: [],
  range: '5 футов',
  description: '',
};

const useAttackStore = create((set) => ({
  attackData: initialAttackData,
  savedAttacks: [],
  selectedAttack: null,
  // Update a field on attackData
  updateAttackField: (name, value) =>
    set((state) => ({
      attackData: { ...state.attackData, [name]: value },
    })),
  // Toggle property in attackData.properties
  toggleProperty: (property) =>
    set((state) => {
      const exists = state.attackData.properties.includes(property);
      const properties = exists
        ? state.attackData.properties.filter((p) => p !== property)
        : [...state.attackData.properties, property];
      return { attackData: { ...state.attackData, properties } };
    }),
  setAttackData: (data) => set({ attackData: data }),
  setSavedAttacks: (attacks) => set({ savedAttacks: attacks }),
  addAttack: (attack) =>
    set((state) => ({ savedAttacks: [...state.savedAttacks, attack] })),
  updateSavedAttack: (attack) =>
    set((state) => ({
      savedAttacks: state.savedAttacks.map((a) =>
        a.id === attack.id ? attack : a
      ),
    })),
  removeAttack: (id) =>
    set((state) => ({
      savedAttacks: state.savedAttacks.filter((a) => a.id !== id),
    })),
  setSelectedAttack: (attack) => set({ selectedAttack: attack }),
  resetAttackData: () => set({ attackData: initialAttackData, selectedAttack: null }),
}));

export default useAttackStore;
export { initialAttackData };
