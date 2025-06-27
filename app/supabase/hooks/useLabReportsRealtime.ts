import {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { useLabReportsStore } from "../../store/useLabReportsStore";
import { LabReport } from "../../types/LabReport";
import { useSupabaseRealtime } from "./useSupabaseRealtime";

export function useLabReportsRealtime() {
  const { userId, addReport, updateReport, deleteReport } =
    useLabReportsStore();

  useSupabaseRealtime({
    userId: userId,
    tables: [
      {
        table: "lab_reports",
        onInsert: (payload: RealtimePostgresInsertPayload<LabReport>) => {
          if (payload.new?.user_id === userId) {
            addReport(payload.new);
          }
        },
        onUpdate: (payload: RealtimePostgresUpdatePayload<LabReport>) => {
          if (payload.new?.user_id === userId) {
            updateReport(payload.new);
          }
        },
        // TODO not needed for now
        // onDelete: (payload: RealtimePostgresDeletePayload<LabReport>) => {
        //   deleteReport(payload.old.id);
        // },
      },
    ],
  });
}
