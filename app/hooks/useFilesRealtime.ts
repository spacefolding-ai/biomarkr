import { useSupabaseRealtime } from "./useSupabaseRealtime";

interface File {
  id: string;
  user_id: string;
  file_path: string;
  original_file_name: string;
  uploaded_at: string;
  lab_report_id: string | null;
  extraction_status: string;
}

interface FilesRealtimeOptions {
  onInsert?: (payload: File) => void;
  onUpdate?: (payload: File) => void;
  onDelete?: (payload: File) => void;
}

export function useFilesRealtime(options: FilesRealtimeOptions) {
  useSupabaseRealtime({
    table: "files",
    ...options,
  });
}
