import { useEffect } from "react";
import { supabase } from "../services/supabaseClient";

interface UseSupabaseRealtimeProps {
  table: string;
  schema?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export const useSupabaseRealtime = ({
  table,
  schema = "public",
  onInsert,
  onUpdate,
  onDelete,
}: UseSupabaseRealtimeProps) => {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${schema}:${table}`)
      .on("postgres_changes", { event: "INSERT", schema, table }, (payload) => {
        if (onInsert) onInsert(payload);
      })
      .on("postgres_changes", { event: "UPDATE", schema, table }, (payload) => {
        if (onUpdate) onUpdate(payload);
      })
      .on("postgres_changes", { event: "DELETE", schema, table }, (payload) => {
        if (onDelete) onDelete(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, onInsert, onUpdate, onDelete]);
};
