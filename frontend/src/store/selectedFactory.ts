import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SelectedFactoryState = {
  factoryId: string | null;
  setFactoryId: (id: string | null) => void;
};

export const useSelectedFactory = create<SelectedFactoryState>()(
  persist(
    (set) => ({
      factoryId: null,
      setFactoryId: (factoryId) => set({ factoryId }),
    }),
    { name: 'veesiri-selected-factory' },
  ),
);
