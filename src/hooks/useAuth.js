/*
 * useAuth — Hook per gestire l'autenticazione con Supabase.
 *
 * Cosa fa:
 * - Al caricamento, controlla se l'utente è già loggato (sessione salvata)
 * - Ascolta i cambiamenti di stato (login, logout)
 * - Carica il profilo dell'utente dalla tabella "profiles"
 * - Restituisce: { user, profile, loading, signOut }
 */

import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

export default function useAuth() {
  const supabaseActive = isSupabaseConfigured();
  const [user, setUser] = useState(null); // oggetto auth di Supabase
  const [profile, setProfile] = useState(null); // riga dalla tabella profiles
  const [loading, setLoading] = useState(supabaseActive); // true finché non sappiamo se è loggato

  /* Carica il profilo dalla tabella profiles.
     Se il profilo non esiste → l'account è incompleto/corrotto,
     forziamo il logout così l'utente torna alla schermata di login. */
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

    if (data) return data;

    /* Profilo non trovato → logout forzato */
    console.warn("Profilo non trovato per utente", userId, "— logout forzato.", error?.message);
    await supabase.auth.signOut();
    return null;
  }, []);

  useEffect(() => {
    /* Se Supabase non è configurato, non c'è auth da controllare */
    if (!supabaseActive) return;

    /* 1. Controlla se c'è già una sessione attiva */
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        setProfile(p);
        if (!p) setUser(null); // profilo mancante → resetta anche user
      }
      setLoading(false);
    });

    /* 2. Ascolta cambiamenti di stato (login/logout) */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        setProfile(p);
        if (!p) setUser(null); // profilo mancante → resetta anche user
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      }
    });

    /* Pulizia: rimuovi il listener quando il componente si smonta */
    return () => subscription.unsubscribe();
  }, [fetchProfile, supabaseActive]);

  /* Funzione di logout */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  return { user, profile, loading, signOut };
}
