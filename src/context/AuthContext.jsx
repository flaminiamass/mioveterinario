/*
 * AuthContext — Fornisce i dati di autenticazione a tutta l'app.
 *
 * Avvolge l'intera app e rende disponibili:
 * - user: l'utente di Supabase Auth (o null)
 * - profile: i dati dalla tabella profiles (role, display_name, ecc.)
 * - loading: true finché non sappiamo se l'utente è loggato
 * - signOut: funzione per il logout
 *
 * In modalità demo (Supabase non configurato), user e profile sono null
 * e l'app funziona con il vecchio sistema (Landing → role selection).
 */

import { createContext, useContext } from "react";
import useAuth from "../hooks/useAuth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext deve essere usato dentro AuthProvider");
  return ctx;
}
