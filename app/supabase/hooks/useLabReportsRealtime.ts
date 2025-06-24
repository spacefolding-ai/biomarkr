import {
  RealtimePostgresDeletePayload,
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
          // console.log("[Realtime] Insert lab report", payload.new);
          addReport(payload.new);
        },
        onUpdate: (payload: RealtimePostgresUpdatePayload<LabReport>) => {
          // console.log("[Realtime] Update lab report", payload.new);
          updateReport(payload.new);
        },
        onDelete: (payload: RealtimePostgresDeletePayload<LabReport>) => {
          // console.log("[Realtime] Delete lab report", payload.old);
          deleteReport(payload.old.id);
        },
      },
    ],
  });
}
