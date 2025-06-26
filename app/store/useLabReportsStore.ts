import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deleteLabReportFromDb } from "../services/labReports";
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
  deleteReport: (id: string) => Promise<void>;
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
        const existingReports = get().reports;
        const exists = existingReports.some((r) => r.id === report.id);

        if (!exists) {
          set({ reports: [report, ...existingReports] });
          return;
        } else {
          // Update the existing report while keeping all other reports
          const updatedReports = existingReports.map((r) =>
            r.id === report.id ? report : r
          );
          set({ reports: updatedReports });
        }
      },

      deleteReport: async (id) => {
        const removedId = await deleteLabReportFromDb(id);
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
