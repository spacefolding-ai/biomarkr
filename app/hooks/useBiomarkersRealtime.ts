import {
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { useAuthStore } from "../store/useAuthStore";
import { Biomarker } from "../types/Biomarker";
import { useSupabaseRealtime } from "./useSupabaseRealtime";

interface BiomarkersRealtimeOptions {
  onInsert?: (payload: RealtimePostgresInsertPayload<Biomarker>) => void;
  onUpdate?: (payload: RealtimePostgresUpdatePayload<Biomarker>) => void;
  onDelete?: (payload: RealtimePostgresDeletePayload<Biomarker>) => void;
}

export function useBiomarkersRealtime(options: BiomarkersRealtimeOptions) {
  const { user, session, loading, initAuth } = useAuthStore();
  const userId = session?.user?.id;

  useSupabaseRealtime({
    userId,
    tables: [
      {
        table: "biomarkers",
        onInsert: options.onInsert,
        onUpdate: options.onUpdate,
        onDelete: options.onDelete,
      },
    ],
  });
}
