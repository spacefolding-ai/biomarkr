import {
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { useAuthStore } from "../store/useAuthStore";
import { LabReport } from "../types/LabReport";
import { useSupabaseRealtime } from "./useSupabaseRealtime";

interface LabReportsRealtimeOptions {
  onInsert?: (payload: RealtimePostgresInsertPayload<LabReport>) => void;
  onUpdate?: (payload: RealtimePostgresUpdatePayload<LabReport>) => void;
  onDelete?: (payload: RealtimePostgresDeletePayload<LabReport>) => void;
}

export function useLabReportsRealtime(options: LabReportsRealtimeOptions) {
  const { user, session, loading, initAuth } = useAuthStore();
  const userId = session?.user?.id;

  useSupabaseRealtime({
    userId,
    tables: [
      {
        table: "lab_reports",
        onInsert: options.onInsert,
        onUpdate: options.onUpdate,
        onDelete: options.onDelete,
      },
    ],
  });
}
