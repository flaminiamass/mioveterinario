/* Context React — gestisce tutto lo stato condiviso dell'app.
   Ogni componente può accedere ai dati con useApp() invece di riceverli a catena. */

import { useState, createContext, useContext } from "react";
import { seedVets, seedPets, seedAppointments, seedReferti, seedInvoices, seedReviews, seedVaccines, seedClients } from "../data/seedData.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [role, setRole] = useState(null); // null | 'owner' | 'vet'
  const [vets, setVets] = useState(seedVets);
  const [pets, setPets] = useState(seedPets);
  const [appts, setAppts] = useState(seedAppointments);
  const [referti, setReferti] = useState(seedReferti);
  const [invoices, setInvoices] = useState(seedInvoices);
  const [reviews, setReviews] = useState(seedReviews);
  const [vaccines, setVaccines] = useState(seedVaccines);
  const [clients, setClients] = useState(seedClients);
  const [toast, setToast] = useState(null);

  /* Demo: id del veterinario loggato (sarà da Supabase auth in futuro) */
  const [vetId, setVetId] = useState("v1");

  /* Profilo proprietario DEMO FITTIZIO — in produzione viene da Supabase Auth.
     Non usare nomi o CF reali nei dati di seed. */
  const [ownerProfile, setOwnerProfile] = useState({
    name: "Demo U.",
    fullName: "Demo Utente",
    phone: "+39 333 0000000",
    email: "demo@mioveterinario.it",
    cf: "DMOUTN80A01H501Z",
    address: "Via Esempio 42, 00100 Roma",
  });

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
