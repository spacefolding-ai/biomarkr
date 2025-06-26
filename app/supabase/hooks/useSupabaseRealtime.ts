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
    console.log(`🧹 Found ${existingChannels.length} existing channels`);
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

        // Add connection status listeners
        channel
          .on("presence", { event: "sync" }, () => {
            console.log(`🟢 Channel ${channelName} presence synced`);
          })
          .on("presence", { event: "join" }, ({ key, newPresences }) => {
            console.log(
              `🟢 Channel ${channelName} presence joined:`,
              key,
              newPresences
            );
          })
          .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
            console.log(
              `🔴 Channel ${channelName} presence left:`,
              key,
              leftPresences
            );
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

        // Subscribe and log the result
        channel.subscribe((status) => {
          console.log(`📡 Channel ${channelName} subscription status:`, status);
          if (status === "CHANNEL_ERROR") {
            console.error(`❌ Err or subscribing to ${channelName}`);
          }
          if (status === "TIMED_OUT") {
            console.error(`⏰ Timeout subscribing to ${channelName}`);
          }
        });

        return channel;
      }
    );

    return () => {
      console.log(`🛑 Cleaning up ${subscriptions.length} subscriptions`);
      subscriptions.forEach(async (ch) => {
        console.log(`🛑 Unsubscribing from: ${ch.topic}`);
        await ch.unsubscribe();
      });
    };
  }, [userId]);
};
