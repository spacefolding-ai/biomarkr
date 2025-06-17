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
    console.log("useSupabaseRealtime initialized with userId:", userId);

    const channels = tables.map(
      ({ table, schema = "public", onInsert, onUpdate, onDelete }) => {
        const channelName = `realtime:${schema}:${table}`;
        const channel = supabase.channel(channelName);

        console.log(`Subscribing to channel: ${channelName}`);

        if (onInsert) {
          channel.on(
            "postgres_changes",
            { event: "INSERT", schema, table },
            (payload) => {
              console.log(`INSERT event received for table: ${table}`, payload);
              if (payload.new?.user_id === userId) {
                console.log("User ID matches, triggering onInsert");
                onInsert(payload);
              } else {
                console.log("User ID does not match, ignoring event");
              }
            }
          );
        }

        if (onUpdate) {
          channel.on(
            "postgres_changes",
            { event: "UPDATE", schema, table },
            (payload) => {
              console.log(`UPDATE event received for table: ${table}`, payload);
              if (payload.new?.user_id === userId) {
                console.log("User ID matches, triggering onUpdate");
                onUpdate(payload);
              } else {
                console.log("User ID does not match, ignoring event");
              }
            }
          );
        }

        if (onDelete) {
          channel.on(
            "postgres_changes",
            { event: "DELETE", schema, table },
            (payload) => {
              console.log(`DELETE event received for table: ${table}`, payload);
              if (payload.old?.user_id === userId) {
                console.log("User ID matches, triggering onDelete");
                onDelete(payload);
              } else {
                console.log("User ID does not match, ignoring event");
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
