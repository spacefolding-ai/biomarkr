import {
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { useEffect } from "react";
import { supabase } from "../supabaseClient";

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
    // Don't subscribe if there's no userId
    if (!userId) {
      console.log("⏸️ useSupabaseRealtime: No userId, skipping subscription");
      return;
    }

    console.log("🔄 useSupabaseRealtime initialized with userId:", userId);

    // Clean up any existing subscriptions for this user first
    const existingChannels = supabase.getChannels();
    existingChannels.forEach((ch) => {
      if (ch.topic.includes(userId)) {
        console.log(`🧹 Cleaning up existing channel: ${ch.topic}`);
        ch.unsubscribe();
      }
    });

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
        const channelName = `realtime:${schema}:${table}:${userId}`;
        const channel = supabase.channel(channelName);

        console.log(`📡 Subscribing to: ${channelName}`);

        if (onInsert) {
          channel.on(
            "postgres_changes",
            { event: "INSERT", schema, table },
            (payload: RealtimePostgresInsertPayload<T>) => {
              console.log(`[INSERT] ${table}:`, payload.new);
              if (payload.new?.user_id === userId) onInsert(payload);
            }
          );
        }

        if (onUpdate) {
          channel.on(
            "postgres_changes",
            { event: "UPDATE", schema, table },
            (payload: RealtimePostgresUpdatePayload<T>) => {
              console.log(`[UPDATE] ${table}:`, payload.new);
              if (payload.new?.user_id === userId) onUpdate(payload);
            }
          );
        }

        if (onDelete) {
          channel.on(
            "postgres_changes",
            { event: "DELETE", schema, table },
            (payload: RealtimePostgresDeletePayload<T>) => {
              console.log(`[DELETE] ${table}:`, payload.old);
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
  }, [userId]);
};
