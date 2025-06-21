import { useAuthStore } from "../store/useAuthStore";
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

interface RealtimePayload<T> {
  new: T;
  old?: T;
}

interface FilesRealtimeOptions {
  onInsert?: (payload: RealtimePayload<File>) => void;
  onUpdate?: (payload: RealtimePayload<File>) => void;
  onDelete?: (payload: RealtimePayload<File>) => void;
}

export function useFilesRealtime(options: FilesRealtimeOptions) {
  const { session } = useAuthStore();
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
