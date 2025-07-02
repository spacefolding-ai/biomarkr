import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  deleteLabReportFromDb,
  getAllLabReports,
  updateLabReportInDb,
} from "../services/labReports";
import { LabReport } from "../types/LabReport";

interface LabReportsState {
  userId: string | null;
  reports: LabReport[];
  refreshing: boolean;
  loading: boolean;
  setUserId: (id: string | null) => void;
  setReports: (reports: LabReport[]) => void;
  addReport: (report: LabReport) => void;
  updateReport: (report: LabReport) => void;
  deleteReport: (id: string) => Promise<void>;
  refreshLabReports: () => Promise<void>;
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

      addReport: (report) => {
        // Get current state
        const currentReports = get().reports;

        // Check if report already exists to prevent duplicates
        const exists = currentReports.some((r) => r.id === report.id);

        if (!exists) {
          // Add the new report at the beginning and ensure state update triggers re-render
          const newReports = [report, ...currentReports];
          set({ reports: newReports });
        }
      },

      updateReport: async (report) => {
        try {
          // Update in Supabase first
          const updatedReport = await updateLabReportInDb(report);

          // Then update local state
          const existingReports = get().reports;
          const exists = existingReports.some((r) => r.id === report.id);

          if (!exists) {
            set({ reports: [updatedReport, ...existingReports] });
          } else {
            // Update the existing report while keeping all other reports
            const updatedReports = existingReports.map((r) =>
              r.id === updatedReport.id ? updatedReport : r
            );
            set({ reports: updatedReports });
          }
        } catch (error) {
          // If update fails, don't update local state
          throw error;
        }
      },

      deleteReport: async (id) => {
        const removedId = await deleteLabReportFromDb(id);
        set({ reports: get().reports.filter((r) => r.id !== removedId) });
      },

      refreshLabReports: async () => {
        const reports = await getAllLabReports();
        set({ reports });
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
