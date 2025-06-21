import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Biomarker } from "../types/Biomarker";

interface BiomarkersState {
  userId: string | null;
  biomarkers: Biomarker[];
  refreshing: boolean;
  loading: boolean;
  setUserId: (id: string) => void;
  setBiomarkers: (biomarkers: Biomarker[]) => void;
  addBiomarker: (biomarker: Biomarker) => void;
  updateBiomarker: (biomarker: Biomarker) => void;
  deleteBiomarker: (id: string) => void;
  setRefreshing: (refreshing: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useBiomarkersStore = create<BiomarkersState>()(
  persist(
    (set, get) => ({
      userId: null,
      biomarkers: [],
      refreshing: false,
      loading: false,

      setUserId: (id) => set({ userId: id }),

      setBiomarkers: (biomarkers) => set({ biomarkers }),

      addBiomarker: (biomarker) => {
        const existing = get().biomarkers;
        const exists = existing.find((b) => b.id === biomarker.id);
        if (!exists) {
          set({ biomarkers: [biomarker, ...existing] });
        }
      },

      updateBiomarker: (biomarker) => {
        const updated = get().biomarkers.map((b) =>
          b.id === biomarker.id ? biomarker : b
        );
        set({ biomarkers: updated });
      },

      deleteBiomarker: (id) => {
        const filtered = get().biomarkers.filter((b) => b.id !== id);
        set({ biomarkers: filtered });
      },

      setRefreshing: (refreshing) => set({ refreshing }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "biomarkers-storage",
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: (key, value) => {
          return AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key) => {
          return AsyncStorage.removeItem(key);
        },
      },
    }
  )
);
