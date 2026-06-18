/* Context React — gestisce tutto lo stato condiviso dell'app.
   Ogni componente può accedere ai dati con useApp() invece di riceverli a catena.

   Supporta due modalità:
   - Demo (senza Supabase): usa seedData, role da Landing
   - Supabase: role e profilo vengono da AuthContext */

import { useState, createContext, useContext } from "react";
import { seedVets, seedPets, seedAppointments, seedReferti, seedInvoices, seedReviews, seedVaccines, seedClients } from "../data/seedData.js";
import { isSupabaseConfigured } from "../lib/supabaseClient.js";
import { useAuthContext } from "./AuthContext.jsx";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { profile } = useAuthContext();
  const supabaseActive = isSupabaseConfigured();

  /* ── Role e vetId ── */
  // In modalità Supabase: role viene dal profilo auth
  // In modalità demo: role viene dal vecchio stato locale
  const [demoRole, setDemoRole] = useState(null);
  const role = supabaseActive ? (profile?.role || null) : demoRole;
  const setRole = setDemoRole; // solo per modalità demo

  /* VetId: in modalità Supabase sarà derivato dal profilo vet collegato all'utente.
     Per ora usiamo "v1" come fallback (sarà aggiornato nella Fase 3). */
  const [demoVetId, setDemoVetId] = useState("v1");
  const vetId = demoVetId;
  const setVetId = setDemoVetId;

  /* ── Dati ── */
  const [vets, setVets] = useState(seedVets);
  const [pets, setPets] = useState(seedPets);
  const [appts, setAppts] = useState(seedAppointments);
  const [referti, setReferti] = useState(seedReferti);
  const [invoices, setInvoices] = useState(seedInvoices);
  const [reviews, setReviews] = useState(seedReviews);
  const [vaccines, setVaccines] = useState(seedVaccines);
  const [clients, setClients] = useState(seedClients);
  const [toast, setToast] = useState(null);

  /* Profilo proprietario — in modalità Supabase, usa i dati dal profilo auth.
     In modalità demo, usa dati fittizi. */
  const [ownerProfile, setOwnerProfile] = useState(
    supabaseActive && profile?.role === "owner"
      ? {
          name: profile.display_name || "Utente",
          fullName: profile.full_name || profile.display_name || "",
          phone: profile.phone || "",
          email: profile.email || "",
          cf: profile.cf || "",
          address: profile.address || "",
        }
      : {
          name: "Demo U.",
          fullName: "Demo Utente",
          phone: "+39 333 0000000",
          email: "demo@mioveterinario.it",
          cf: "DMOUTN80A01H501Z",
          address: "Via Esempio 42, 00100 Roma",
        }
  );

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  return (
    <AppContext.Provider value={{
      role, setRole, vets, setVets, pets, setPets, appts, setAppts,
      referti, setReferti, invoices, setInvoices, reviews, setReviews,
      vaccines, setVaccines, clients, setClients, toast, notify, vetId, setVetId,
      ownerProfile, setOwnerProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve essere usato dentro AppProvider");
  return ctx;
}
