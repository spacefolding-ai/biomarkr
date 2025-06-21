import { create } from "zustand";
import { Biomarker } from "../types/Biomarker";

interface BiomarkersState {
  userId: string | null;
  biomarkers: Biomarker[];
  setUserId: (id: string) => void;
  setBiomarkers: (biomarkers: Biomarker[]) => void;
  addBiomarker: (biomarker: Biomarker) => void;
  updateBiomarker: (biomarker: Biomarker) => void;
  deleteBiomarker: (id: string) => void;
}

export const useBiomarkersStore = create<BiomarkersState>((set) => ({
  userId: null,
  biomarkers: [],

  setUserId: (id) => set({ userId: id }),

  setBiomarkers: (biomarkers) => set({ biomarkers }),

  addBiomarker: (biomarker) =>
    set((state) => {
      if (state.biomarkers.some((b) => b.id === biomarker.id)) {
        return state;
      }
      return { biomarkers: [biomarker, ...state.biomarkers] };
    }),

  updateBiomarker: (biomarker) =>
    set((state) => ({
      biomarkers: state.biomarkers.map((b) =>
        b.id === biomarker.id ? biomarker : b
      ),
    })),

  deleteBiomarker: (id) =>
    set((state) => ({
      biomarkers: state.biomarkers.filter((b) => b.id !== id),
    })),
}));
