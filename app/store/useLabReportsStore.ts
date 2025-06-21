import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LabReport } from "../types/LabReport";

interface LabReportsState {
  reports: LabReport[];
  refreshing: boolean;
  loading: boolean;
  setReports: (reports: LabReport[]) => void;
  addReport: (report: LabReport) => void;
  updateReport: (report: LabReport) => void;
  removeReport: (id: string) => void;
  setRefreshing: (refreshing: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useLabReportsStore = create<LabReportsState>()(
  persist(
    (set, get) => ({
      reports: [],
      refreshing: false,
      loading: false,

      setReports: (reports) => set({ reports }),

      addReport: (report) => {
        const existing = get().reports;
        const exists = existing.find((r) => r.id === report.id);
        if (!exists) {
          set({ reports: [report, ...existing] });
        }
      },

      updateReport: (report) => {
        const updated = get().reports.map((r) =>
          r.id === report.id ? report : r
        );
        set({ reports: updated });
      },

      removeReport: (id) => {
        set({ reports: get().reports.filter((r) => r.id !== id) });
      },

      setRefreshing: (refreshing) => set({ refreshing }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "lab-reports-storage",
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
