import { useSupabaseRealtime } from "./useSupabaseRealtime";

interface Biomarker {
  id: string;
  report_id: string;
  user_id: string;
  marker_name: string;
  value: number;
  unit: string;
  reference_range: string;
  abnormal_flag: string | null;
  created_at: string;
}

interface BiomarkersRealtimeOptions {
  onInsert?: (payload: Biomarker) => void;
  onUpdate?: (payload: Biomarker) => void;
  onDelete?: (payload: Biomarker) => void;
}

export function useBiomarkersRealtime(options: BiomarkersRealtimeOptions) {
  useSupabaseRealtime({
    table: "biomarkers",
    ...options,
  });
}
