import {
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { useBiomarkersStore } from "../../store/useBiomarkersStore";
import { Biomarker } from "../../types/Biomarker";
import { useSupabaseRealtime } from "./useSupabaseRealtime";

export const useBiomarkersRealtime = () => {
  const { addBiomarker, updateBiomarker, deleteBiomarker, userId } =
    useBiomarkersStore();

  useSupabaseRealtime({
    userId: userId,
    tables: [
      {
        table: "biomarkers",
        onInsert: (payload: RealtimePostgresInsertPayload<Biomarker>) => {
          // console.log("[Realtime] Insert biomarker", payload.new);
          addBiomarker(payload.new);
        },
        onUpdate: (payload: RealtimePostgresUpdatePayload<Biomarker>) => {
          // console.log("[Realtime] Update biomarker", payload.new);
          updateBiomarker(payload.new);
        },
        onDelete: (payload: RealtimePostgresDeletePayload<Biomarker>) => {
          // console.log("[Realtime] Delete biomarker", payload.old);
          deleteBiomarker(payload.old.id);
        },
      },
    ],
  });
};
