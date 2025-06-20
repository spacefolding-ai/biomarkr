import {
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { useAuth } from "../context/AuthContext";
import { LabReport } from "../types/LabReport";
import { useSupabaseRealtime } from "./useSupabaseRealtime";

interface LabReportsRealtimeOptions {
  onInsert?: (payload: RealtimePostgresInsertPayload<LabReport>) => void;
  onUpdate?: (payload: RealtimePostgresUpdatePayload<LabReport>) => void;
  onDelete?: (payload: RealtimePostgresDeletePayload<LabReport>) => void;
}

export function useLabReportsRealtime(options: LabReportsRealtimeOptions) {
  const { session } = useAuth();
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
