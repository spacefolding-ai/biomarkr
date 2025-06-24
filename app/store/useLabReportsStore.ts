import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { removeLabReport } from "../services/labReports";
import { LabReport } from "../types/LabReport";

interface LabReportsState {
  userId: string | null;
  reports: LabReport[];
  refreshing: boolean;
  loading: boolean;
  setUserId: (id: string) => void;
  setReports: (reports: LabReport[]) => void;
  addReport: (report: LabReport) => void;
  updateReport: (report: LabReport) => void;
  deleteReport: (id: string) => void;
  setRefreshing: (refreshing: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useLabReportsStore = create<LabReportsState>()(
  persist(
    (set, get) => ({
      userId: null,
      reports: [] as LabReport[],
      refreshing: false,
      loading: false,

      setUserId: (id) => set({ userId: id }),

      setReports: (reports) => set({ reports }),

      addReport: async (report) => {
        // insert to db handled in n8n
        set({ reports: [report, ...get().reports] });
      },

      updateReport: async (report) => {
        const existing = get().reports;
        const exists = existing.some((r) => r.id === report.id);

        if (!exists) {
          set({ reports: [report, ...existing] });
          return;
        } else {
          set({ reports: [report] });
        }
      },

      deleteReport: async (id) => {
        const removedId = await removeLabReport(id);
        set({ reports: get().reports.filter((r) => r.id !== removedId) });
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
