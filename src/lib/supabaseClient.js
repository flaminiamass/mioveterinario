/*
 * Client Supabase — il "ponte" tra la nostra app React e il database Supabase.
 *
 * Legge le credenziali da .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).
 * Se le credenziali mancano, l'app funziona comunque in modalità demo (seed data).
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* Se le credenziali non sono configurate, avvisa in console */
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("IL-TUO-PROGETTO")) {
  console.warn(
    "⚠️ Supabase non configurato. L'app usa i dati demo.\n" +
      "Per connettere il database, modifica .env.local con le tue credenziali Supabase."
  );
}

/*
 * Esportiamo il client Supabase.
 * Se le credenziali sono placeholder, creiamo comunque un client
 * (le query falliranno e l'app userà il fallback seed data).
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

/*
 * Utility: controlla se Supabase è realmente configurato.
 * Usato in AppContext per decidere se caricare dal database o dal seed.
 */
export const isSupabaseConfigured = () =>
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  !supabaseUrl.includes("IL-TUO-PROGETTO") &&
  !supabaseAnonKey.includes("la-tua-anon-key");
