import {
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
} from "@supabase/supabase-js";
import { useAuthStore } from "../../store/useAuthStore";
import { useBiomarkersStore } from "../../store/useBiomarkersStore";
import { Biomarker } from "../../types/Biomarker";
import { useSupabaseRealtime } from "./useSupabaseRealtime";

export const useBiomarkersRealtime = () => {
  const { user } = useAuthStore();
  const { addBiomarker, updateBiomarker, deleteBiomarker, biomarkers } =
    useBiomarkersStore();

  // Use user ID from auth store instead of biomarkers store
  const userId = user?.id || null;

  useSupabaseRealtime({
    userId: userId,
    tables: [
      {
        table: "biomarkers",
        onInsert: (payload: RealtimePostgresInsertPayload<Biomarker>) => {
          console.log("Biomarker inserted via realtime:", payload.new);
          if (payload.new) {
            addBiomarker(payload.new);
          }
        },
        // TODO not needed for now
        // onUpdate: (payload: RealtimePostgresUpdatePayload<Biomarker>) => {
        //   updateBiomarker(payload.new);
        // },
        onDelete: (payload: RealtimePostgresDeletePayload<Biomarker>) => {
          console.log("Biomarker deleted via realtime:", payload.old);
          const existing = biomarkers.find((b) => b.id === payload.old.id);
          if (existing) {
            deleteBiomarker(payload.old.id);
          }
        },
      },
    ],
  });
};
