import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  deleteAllBiomarkersFromDbByReportId,
  deleteBiomarkerFromDb,
  updateBiomarkerInDb,
} from "../services/biomarkers";
import { Biomarker } from "../types/Biomarker";

interface BiomarkersState {
  userId: string | null;
  biomarkers: Biomarker[];
  refreshing: boolean;
  loading: boolean;
  setUserId: (id: string | null) => void;
  setBiomarkers: (biomarkers: Biomarker[]) => void;
  addBiomarker: (biomarker: Biomarker) => void;
  updateBiomarker: (biomarker: Biomarker) => void;
  deleteBiomarker: (id: string) => void;
  deleteBiomarkersForReport: (reportId: string) => void;
  setRefreshing: (refreshing: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useBiomarkersStore = create<BiomarkersState>()(
  persist(
    (set, get) => ({
      userId: null,
      biomarkers: [] as Biomarker[],
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

      updateBiomarker: async (biomarker) => {
        const updated = await updateBiomarkerInDb(biomarker);
        const updatedBiomarkers = get().biomarkers.map((b) =>
          b.id === updated.id ? updated : b
        );
        set({ biomarkers: updatedBiomarkers });
      },

      deleteBiomarker: async (id) => {
        const removedId = await deleteBiomarkerFromDb(id);
        set({ biomarkers: get().biomarkers.filter((b) => b.id !== removedId) });
      },

      deleteBiomarkersForReport: async (reportId) => {
        await deleteAllBiomarkersFromDbByReportId(reportId);
        set({ biomarkers: get().biomarkers.filter((b) => b.id !== reportId) });
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
