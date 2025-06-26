import { useAuthStore } from "../../store/useAuthStore";
import { File } from "../../types/File";
import { useSupabaseRealtime } from "./useSupabaseRealtime";

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
