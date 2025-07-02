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
  userId: string | null;
  tables: RealtimeTableConfig[];
}

interface WithUserId {
  user_id: string;
}

export const useSupabaseRealtime = ({
  userId,
  tables,
}: UseSupabaseRealtimeProps) => {
  console.log("🚀 useSupabaseRealtime called with:");
  console.log("  - userId:", userId);
  console.log(
    "  - tables:",
    tables.map((t) => t.table)
  );

  useEffect(() => {
    console.log("🔄 useSupabaseRealtime useEffect triggered");
    console.log("  - userId in effect:", userId);

    // Don't subscribe if there's no userId
    if (!userId) {
      console.log("❌ No userId provided, skipping realtime subscription");
      return;
    }

    console.log("✅ Setting up realtime subscriptions for user:", userId);

    // Clean up any existing subscriptions for this user first
    const existingChannels = supabase.getChannels();
    console.log(
      "🧹 Cleaning up existing channels, found:",
      existingChannels.length
    );
    existingChannels.forEach((ch) => {
      if (ch.topic.includes(userId)) {
        console.log("🗑️ Unsubscribing from existing channel:", ch.topic);
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
        console.log(`📡 Creating channel for ${table}:`, channelName);
        const channel = supabase.channel(channelName);

        if (onInsert) {
          console.log(`📥 Setting up INSERT listener for ${table}`);
          channel.on(
            "postgres_changes",
            { event: "INSERT", schema, table },
            (payload: RealtimePostgresInsertPayload<T>) => {
              console.log(
                `📨 Raw INSERT event received for ${table}:`,
                payload
              );
              if (payload.new?.user_id === userId) {
                console.log(
                  `✅ Event matches user ${userId}, calling onInsert`
                );
                onInsert(payload);
              } else {
                console.log(
                  `❌ Event user_id (${payload.new?.user_id}) doesn't match current user (${userId})`
                );
              }
            }
          );
        }

        if (onUpdate) {
          console.log(`📝 Setting up UPDATE listener for ${table}`);
          channel.on(
            "postgres_changes",
            { event: "UPDATE", schema, table },
            (payload: RealtimePostgresUpdatePayload<T>) => {
              console.log(
                `📨 Raw UPDATE event received for ${table}:`,
                payload
              );
              if (payload.new?.user_id === userId) {
                console.log(
                  `✅ Event matches user ${userId}, calling onUpdate`
                );
                onUpdate(payload);
              } else {
                console.log(
                  `❌ Event user_id (${payload.new?.user_id}) doesn't match current user (${userId})`
                );
              }
            }
          );
        }

        if (onDelete) {
          console.log(`🗑️ Setting up DELETE listener for ${table}`);
          channel.on(
            "postgres_changes",
            { event: "DELETE", schema, table },
            (payload: RealtimePostgresDeletePayload<T>) => {
              console.log(
                `📨 Raw DELETE event received for ${table}:`,
                payload
              );
              if (payload.old?.user_id === userId) {
                console.log(
                  `✅ Event matches user ${userId}, calling onDelete`
                );
                onDelete(payload);
              } else {
                console.log(
                  `❌ Event user_id (${payload.old?.user_id}) doesn't match current user (${userId})`
                );
              }
            }
          );
        }

        // Subscribe and add error handling
        console.log(`🔌 Attempting to subscribe to ${table}...`);
        channel.subscribe((status) => {
          console.log(`📡 Subscription status for ${table}:`, status);

          if (status === "SUBSCRIBED") {
            console.log(
              `✅ Successfully subscribed to ${table} realtime updates`
            );

            // Special debugging for lab_reports
            if (table === "lab_reports") {
              console.log(`🔍 Lab Reports Subscription Details:`);
              console.log(`  - Channel: ${channelName}`);
              console.log(`  - User ID: ${userId}`);
              console.log(`  - Schema: ${schema}`);
              console.log(`  - Has onInsert: ${!!onInsert}`);
              console.log(`  - Has onUpdate: ${!!onUpdate}`);
            }
          } else if (status === "CHANNEL_ERROR") {
            console.error(`❌ Channel error for ${table}:`, status);
          } else if (status === "TIMED_OUT") {
            console.error(`⏱️ Subscription timed out for ${table}`);
          } else {
            console.log(`🔄 Subscription status for ${table}:`, status);
          }
        });

        return channel;
      }
    );

    console.log(`📊 Created ${subscriptions.length} subscriptions`);

    return () => {
      console.log("🧹 Cleaning up realtime subscriptions for user:", userId);
      subscriptions.forEach(async (ch) => {
        console.log("🗑️ Unsubscribing from:", ch.topic);
        await ch.unsubscribe();
      });
    };
  }, [userId]); // Re-run when userId changes
};
