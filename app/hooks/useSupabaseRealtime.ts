import {
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
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

interface WithUserId {
  user_id: string;
}

export const useSupabaseRealtime = ({
  userId,
  tables,
}: UseSupabaseRealtimeProps) => {
  useEffect(() => {
    console.log("🔄 useSupabaseRealtime initialized with userId:", userId);

    const subscriptions = tables.map(
      <T extends WithUserId>({
        table,
        schema = "public",
        onInsert,
        onUpdate,
        onDelete,
      }: {
        table: string;
        schema?: string;
        onInsert?: (payload: RealtimePostgresInsertPayload<T>) => void;
        onUpdate?: (payload: RealtimePostgresUpdatePayload<T>) => void;
        onDelete?: (payload: RealtimePostgresDeletePayload<T>) => void;
      }) => {
        const channelName = `realtime:${schema}:${table}`;
        console.log("schema", schema);
        const channel = supabase.channel(channelName);

        console.log(`📡 Subscribing to: ${channelName}`);

        if (onInsert) {
          channel.on(
            "postgres_changes",
            { event: "INSERT", schema, table },
            (payload: RealtimePostgresInsertPayload<T>) => {
              console.log(`[INSERT] ${table}:`, payload);
              if (payload.new?.user_id === userId) onInsert(payload);
            }
          );
        }

        if (onUpdate) {
          channel.on(
            "postgres_changes",
            { event: "UPDATE", schema, table },
            (payload: RealtimePostgresUpdatePayload<T>) => {
              console.log(`[UPDATE] ${table}:`, payload);
              if (payload.new?.user_id === userId) onUpdate(payload);
            }
          );
        }

        if (onDelete) {
          channel.on(
            "postgres_changes",
            { event: "DELETE", schema, table },
            (payload: RealtimePostgresDeletePayload<T>) => {
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
