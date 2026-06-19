import { useEffect } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient.js";
import { mapAppointment } from "../lib/mappers.js";

export default function useRealtimeAppSync({ user, profile, vetId, setAppts, refreshMessages }) {
  useEffect(() => {
    if (!isSupabaseConfigured() || !user || !profile) return undefined;

    const filters = [];
    if (profile.role === "owner") filters.push(`owner_id=eq.${user.id}`);
    if (profile.role === "vet" && vetId) filters.push(`vet_id=eq.${vetId}`);

    const channel = supabase.channel(`app-sync:${user.id}`);
    filters.forEach((filter) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter }, (payload) => {
        const row = payload.new || payload.old;
        if (!row) return;
        setAppts((current) => {
          if (payload.eventType === "DELETE") return current.filter((appt) => appt.id !== row.id);
          const mapped = mapAppointment(row);
          const exists = current.some((appt) => appt.id === mapped.id);
          return exists ? current.map((appt) => (appt.id === mapped.id ? mapped : appt)) : [mapped, ...current];
        });
      });
    });
    channel.on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => refreshMessages?.());
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, refreshMessages, setAppts, user, vetId]);
}
