import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../services/supabaseClient"; // Ensure this import is correct
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
      reports: [],
      refreshing: false,
      loading: false,

      setUserId: (id) => set({ userId: id }),

      setReports: (reports) => set({ reports }),

      addReport: (report) => {
        const existing = get().reports;
        const exists = existing.find((r) => r.id === report.id);
        if (!exists) {
          set({ reports: [report, ...existing] });
        }
      },

      updateReport: async (report) => {
        // TODO check if this is needed. Insert fallback if update arrives before insert or insert is not firing
        const existing = get().reports;
        const exists = existing.some((r) => r.id === report.id);

        if (!exists) {
          set({ reports: [report, ...existing] });
          return;
        }
        // end TODO

        const updated = existing.map((r) => (r.id === report.id ? report : r));

        try {
          await supabase.from("lab_reports").update(report).eq("id", report.id);
          set({ reports: updated });
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Lab report updated successfully!",
          });
        } catch (err) {
          console.error("Unexpected error:", err);
        }
      },

      deleteReport: async (id) => {
        try {
          await supabase.from("files").delete().eq("lab_report_id", id);
          await supabase.from("lab_reports").delete().eq("id", id);
          await supabase.from("biomarkers").delete().eq("lab_report_id", id);
          set({ reports: get().reports.filter((r) => r.id !== id) });
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Lab report deleted successfully!",
          });
        } catch (err) {
          console.error("Unexpected error:", err);
        }
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
