import {
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
} from "@supabase/supabase-js";
import { useBiomarkersStore } from "../../store/useBiomarkersStore";
import { Biomarker } from "../../types/Biomarker";
import { useSupabaseRealtime } from "./useSupabaseRealtime";

export const useBiomarkersRealtime = () => {
  const { addBiomarker, updateBiomarker, deleteBiomarker, userId, biomarkers } =
    useBiomarkersStore();

  useSupabaseRealtime({
    userId: userId,
    tables: [
      {
        table: "biomarkers",
        onInsert: (payload: RealtimePostgresInsertPayload<Biomarker>) => {
          addBiomarker(payload.new);
        },
        // TODO not needed for now
        // onUpdate: (payload: RealtimePostgresUpdatePayload<Biomarker>) => {
        //   updateBiomarker(payload.new);
        // },
        onDelete: (payload: RealtimePostgresDeletePayload<Biomarker>) => {
          const existing = biomarkers.find((b) => b.id === payload.old.id);
          if (existing) {
            deleteBiomarker(payload.old.id);
          }
        },
      },
    ],
  });
};
