import {
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useLabReportsStore } from "../../store/useLabReportsStore";
import { LabReport } from "../../types/LabReport";
import { useSupabaseRealtime } from "./useSupabaseRealtime";

export function useLabReportsRealtime() {
  const { user } = useAuthStore();
  const { addReport, updateReport } = useLabReportsStore();

  // Use user ID from auth store instead of lab reports store
  const userId = user?.id || null;

  // Debug: Log whenever this hook runs
  useEffect(() => {
    console.log("🔄 useLabReportsRealtime: Hook initialized");
    console.log("👤 Current user ID:", userId);
    console.log("👤 User object:", user);
  }, [userId, user]);

  useSupabaseRealtime({
    userId: userId,
    tables: [
      {
        table: "lab_reports",
        onInsert: (payload: RealtimePostgresInsertPayload<LabReport>) => {
          console.log("📥 Lab report INSERT event received via realtime:");
          console.log("  - Payload:", JSON.stringify(payload, null, 2));
          console.log("  - New record user_id:", payload.new?.user_id);
          console.log("  - Current user_id:", userId);
          console.log("  - User IDs match:", payload.new?.user_id === userId);

          if (payload.new) {
            console.log("✅ Adding lab report to store:", {
              id: payload.new.id,
              laboratory_name: payload.new.laboratory_name,
              extraction_status: payload.new.extraction_status,
              user_id: payload.new.user_id,
            });
            addReport(payload.new);
          } else {
            console.warn("⚠️ Payload.new is null/undefined");
          }
        },
        onUpdate: (payload: RealtimePostgresUpdatePayload<LabReport>) => {
          console.log("📝 Lab report UPDATE event received via realtime:");
          console.log("  - Payload:", JSON.stringify(payload, null, 2));
          console.log("  - New record user_id:", payload.new?.user_id);
          console.log("  - Current user_id:", userId);

          if (payload.new) {
            console.log("✅ Updating lab report in store:", {
              id: payload.new.id,
              laboratory_name: payload.new.laboratory_name,
              extraction_status: payload.new.extraction_status,
            });
            updateReport(payload.new);
          } else {
            console.warn("⚠️ Payload.new is null/undefined");
          }
        },
      },
    ],
  });
}
