import { useSupabaseRealtime } from "./useSupabaseRealtime";
import { useAuth } from "../context/AuthContext";

interface LabReport {
  id: string;
  user_id: string;
  patient_name: string;
  patient_dob: string;
  patient_gender: string;
  laboratory_name: string;
  report_date: string;
  description: string;
  created_at: string;
}

interface LabReportsRealtimeOptions {
  onInsert?: (payload: LabReport) => void;
  onUpdate?: (payload: LabReport) => void;
  onDelete?: (payload: LabReport) => void;
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
