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
      return;
    }

    // Clean up any existing subscriptions for this user first
    const existingChannels = supabase.getChannels();
    existingChannels.forEach((ch) => {
      if (ch.topic.includes(userId)) {
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

        // Add connection status listeners
        channel
          .on("presence", { event: "sync" }, () => {
            // Channel synced
          })
          .on("presence", { event: "join" }, ({ key, newPresences }) => {
            // Presence joined
          })
          .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
            // Presence left
          });

        if (onInsert) {
          channel.on(
            "postgres_changes",
            { event: "INSERT", schema, table },
            (payload: RealtimePostgresInsertPayload<T>) => {
              if (payload.new?.user_id === userId) {
                onInsert(payload);
              }
            }
          );
        }

        if (onUpdate) {
          channel.on(
            "postgres_changes",
            { event: "UPDATE", schema, table },
            (payload: RealtimePostgresUpdatePayload<T>) => {
              if (payload.new?.user_id === userId) {
                onUpdate(payload);
              }
            }
          );
        }

        if (onDelete) {
          channel.on(
            "postgres_changes",
            { event: "DELETE", schema, table },
            (payload: RealtimePostgresDeletePayload<T>) => {
              if (payload.old?.user_id === userId) {
                onDelete(payload);
              }
            }
          );
        }

        // Subscribe
        channel.subscribe();

        return channel;
      }
    );

    return () => {
      subscriptions.forEach(async (ch) => {
        await ch.unsubscribe();
      });
    };
  }, [userId]);
};
