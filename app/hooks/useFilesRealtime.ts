import { useSupabaseRealtime } from "./useSupabaseRealtime";
import { useAuth } from "../context/AuthContext";

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
  const { session } = useAuth();
  const userId = session?.user?.id;

  useSupabaseRealtime({
    userId,
    tables: [
      {
        table: "files",
        onInsert: options.onInsert,
        onUpdate: options.onUpdate,
        onDelete: options.onDelete,
      },
    ],
  });
}
