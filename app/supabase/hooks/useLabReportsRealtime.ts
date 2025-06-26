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

  console.log("🔄 useLabReportsRealtime initialized with userId:", userId);

  useSupabaseRealtime({
    userId: userId,
    tables: [
      {
        table: "lab_reports",
        onInsert: (payload: RealtimePostgresInsertPayload<LabReport>) => {
          console.log("🎉 [Realtime] Lab report INSERT detected:", payload.new);
          console.log(
            "🎉 [Realtime] Payload user_id:",
            payload.new?.user_id,
            "Current userId:",
            userId
          );
          if (payload.new?.user_id === userId) {
            console.log("✅ [Realtime] Adding lab report to store");
            addReport(payload.new);
          } else {
            console.log("❌ [Realtime] User ID mismatch, not adding report");
          }
        },
        onUpdate: (payload: RealtimePostgresUpdatePayload<LabReport>) => {
          console.log("🔄 [Realtime] Lab report UPDATE detected:", payload.new);
          console.log(
            "🔄 [Realtime] Payload user_id:",
            payload.new?.user_id,
            "Current userId:",
            userId
          );
          if (payload.new?.user_id === userId) {
            console.log("✅ [Realtime] Updating lab report in store");
            updateReport(payload.new);
          } else {
            console.log("❌ [Realtime] User ID mismatch, not updating report");
          }
        },
        // TODO not needed for now
        // onDelete: (payload: RealtimePostgresDeletePayload<LabReport>) => {
        //   // console.log("[Realtime] Delete lab report", payload.old);
        //   deleteReport(payload.old.id);
        // },
      },
    ],
  });
}
