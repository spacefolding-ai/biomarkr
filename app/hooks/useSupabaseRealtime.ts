import { useEffect } from "react";
import { supabase } from "../services/supabaseClient";

interface RealtimeTableConfig {
  table: string;
  schema?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

interface UseSupabaseRealtimeProps {
  userId: string;
  tables: RealtimeTableConfig[];
}

export const useSupabaseRealtime = ({
  userId,
  tables,
}: UseSupabaseRealtimeProps) => {
  useEffect(() => {
    const channels = tables.map(
      ({ table, schema = "public", onInsert, onUpdate, onDelete }) => {
        const channelName = `realtime:${schema}:${table}`;
        const channel = supabase.channel(channelName);

        console.log(`Subscribing to channel: ${channelName}`);

        if (onInsert) {
          console.log(`Setting up INSERT handler for table: ${table}`);
          channel.on(
            "postgres_changes",
            { event: "INSERT", schema, table },
            (payload) => {
              if (payload.new?.user_id === userId) {
                console.log(`${table} INSERT`, payload);
                onInsert(payload);
              }
            }
          );
        }

        if (onUpdate) {
          console.log(`Setting up UPDATE handler for table: ${table}`);
          channel.on(
            "postgres_changes",
            { event: "UPDATE", schema, table },
            (payload) => {
              if (payload.new?.user_id === userId) {
                console.log(`${table} UPDATE`, payload);
                onUpdate(payload);
              }
            }
          );
        }

        if (onDelete) {
          console.log(`Setting up DELETE handler for table: ${table}`);
          channel.on(
            "postgres_changes",
            { event: "DELETE", schema, table },
            (payload) => {
              if (payload.old?.user_id === userId) {
                console.log(`${table} DELETE`, payload);
                onDelete(payload);
              }
            }
          );
        }

        channel.subscribe();
        return channel;
      }
    );

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [userId, tables]);
};
