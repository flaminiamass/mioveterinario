import { useEffect } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient.js";
import { mapNotification } from "../lib/mappers.js";

export default function useRealtimeNotifications({ userId, setNotifications }) {
  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return undefined;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new || payload.old;
          if (!row) return;
          setNotifications((current) => {
            if (payload.eventType === "DELETE") return current.filter((item) => item.id !== row.id);
            const mapped = mapNotification(row);
            const exists = current.some((item) => item.id === mapped.id);
            return exists ? current.map((item) => (item.id === mapped.id ? mapped : item)) : [mapped, ...current];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setNotifications, userId]);
}
