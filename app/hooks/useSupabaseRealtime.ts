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
    console.log("🔄 useSupabaseRealtime initialized with userId:", userId);

    const subscriptions = tables.map(
      ({ table, schema = "public", onInsert, onUpdate, onDelete }) => {
        console.log("schema", schema);
        const channelName = `realtime:${schema}:${table}`;
        const channel = supabase.channel(channelName);

        console.log(`📡 Subscribing to: ${channelName}`);

        if (onInsert) {
          channel.on(
            "postgres_changes",
            { event: "INSERT", schema, table },
            (payload) => {
              console.log(`[INSERT] ${table}:`, payload);
              if (payload.new?.user_id === userId) onInsert(payload);
            }
          );
        }

        if (onUpdate) {
          channel.on(
            "postgres_changes",
            { event: "UPDATE", schema, table },
            (payload) => {
              console.log(`[UPDATE] ${table}:`, payload);
              if (payload.new?.user_id === userId) onUpdate(payload);
            }
          );
        }

        if (onDelete) {
          channel.on(
            "postgres_changes",
            { event: "DELETE", schema, table },
            (payload) => {
              console.log(`[DELETE] ${table}:`, payload);
              if (payload.old?.user_id === userId) onDelete(payload);
            }
          );
        }

        channel.subscribe();
        return channel;
      }
    );

    return () => {
      subscriptions.forEach(async (ch) => {
        console.log(`🛑 Unsubscribing from: ${ch.topic}`);
        await ch.unsubscribe();
      });
    };
  }, []);
};
