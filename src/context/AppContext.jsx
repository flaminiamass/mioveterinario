/* Context React — gestisce tutto lo stato condiviso dell'app.
   Ogni componente può accedere ai dati con useApp() invece di riceverli a catena.

   Supporta due modalità:
   - Demo (senza Supabase): usa seedData, role da Landing
   - Supabase: role e profilo vengono da AuthContext, dati dal database

   In questa Fase 3 aggiungiamo il caricamento dati da Supabase.
   I componenti non cambiano: leggono sempre da useApp(). */

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import {
  seedVets,
  seedPets,
  seedAppointments,
  seedReferti,
  seedInvoices,
  seedReviews,
  seedVaccines,
  seedClients,
  seedMessages,
} from "../data/seedData.js";
import { seedDirectoryListings } from "../data/seedDirectoryListings.js";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";
import { useAuthContext } from "./AuthContext.jsx";
import {
  mapVet,
  mapDirectoryListing,
  mapPet,
  mapAppointment,
  mapReferto,
  mapInvoice,
  mapReview,
  mapVaccine,
  mapClient,
  mapNotification,
} from "../lib/mappers.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getDirectoryListingsInBounds,
  searchDirectoryListings,
} from "../lib/db.js";
import { publicDirectoryListings } from "../utils/directory.js";
import { bboxFromCenter } from "../utils/location.js";
import useRealtimeNotifications from "../hooks/useRealtimeNotifications.js";
import useRealtimeAppSync from "../hooks/useRealtimeAppSync.js";

const AppContext = createContext(null);

function readStored(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored == null ? fallback : JSON.parse(stored);
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable; app still works in memory.
  }
}

export function AppProvider({ children }) {
  const { user, profile } = useAuthContext();
  const supabaseActive = isSupabaseConfigured();

  /* ── Role e vetId ── */
  const [demoRole, setDemoRole] = useState(null);
  const role = supabaseActive ? profile?.role || null : demoRole;
  const setRole = setDemoRole;

  const [vetId, setVetId] = useState("v1");

  /* ── Flag di caricamento dati ── */
  const [dataLoading, setDataLoading] = useState(false);
  const [directoryLoading, setDirectoryLoading] = useState(false);

  /* ── Dati — partono vuoti in Supabase mode, seed in demo mode ──
     Versione seed: se cambia, invalida il cache locale per ricaricare il seed aggiornato.
     Incrementa SEED_VERSION ogni volta che seedData.js cambia struttura. */
  const SEED_VERSION = "v3-planfix";
  const storedSeedVersion = readStored("mv.seedVersion", null);
  if (!supabaseActive && storedSeedVersion !== SEED_VERSION) {
    localStorage.removeItem("mv.demo.vets");
    localStorage.removeItem("mv.demo.pets");
    writeStored("mv.seedVersion", SEED_VERSION);
  }
  const [vets, setVets] = useState(supabaseActive ? [] : readStored("mv.demo.vets", seedVets));
  /* Schede directory (strutture importate, non gestite): SEMPRE separate da vets,
     così prenotazioni/slot/ranking/recensioni non le vedono mai.
     In demo: seed filtrato (solo pubblicate/non chiuse). In Supabase: caricate da DB. */
  const [directoryListings, setDirectoryListings] = useState(
    supabaseActive ? [] : publicDirectoryListings(seedDirectoryListings)
  );
  const [pets, setPets] = useState(supabaseActive ? [] : readStored("mv.demo.pets", seedPets));
  const [appts, setAppts] = useState(supabaseActive ? [] : seedAppointments);
  const [referti, setReferti] = useState(supabaseActive ? [] : seedReferti);
  const [invoices, setInvoices] = useState(supabaseActive ? [] : seedInvoices);
  const [reviews, setReviews] = useState(supabaseActive ? [] : seedReviews);
  const [vaccines, setVaccines] = useState(supabaseActive ? [] : seedVaccines);
  const [clients, setClients] = useState(supabaseActive ? [] : seedClients);
  const [notifications, setNotifications] = useState([]);
  const [favoriteVetIds, setFavoriteVetIds] = useState(readStored("mv.favoriteVetIds", []));
  const [messages, setMessages] = useState(supabaseActive ? [] : readStored("mv.demo.messages", seedMessages));
  const [selectedPetId, setSelectedPetId] = useState(readStored("mv.selectedPetId", seedPets[0]?.id || ""));
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(
    readStored("mv.browserNotifications", false)
  );
  const [toast, setToast] = useState(null);
  const [bannerNotif, setBannerNotif] = useState(null);

  /* Profilo proprietario */
  const [ownerProfile, setOwnerProfile] = useState(
    supabaseActive
      ? { name: "", fullName: "", phone: "", email: "", cf: "", address: "", avatar: "👤" }
      : {
          name: "Demo U.",
          fullName: "Demo Utente",
          phone: "+39 333 0000000",
          email: "demo@mioveterinario.it",
          cf: "DMOUTN80A01H501Z",
          address: "Via Esempio 42, 00100 Roma",
          avatar: readStored("mv.demo.ownerProfile", {}).avatar || "👤",
        }
  );

  useEffect(() => {
    if (!supabaseActive) writeStored("mv.demo.pets", pets);
  }, [pets, supabaseActive]);

  useEffect(() => {
    if (!supabaseActive) writeStored("mv.demo.vets", vets);
  }, [vets, supabaseActive]);

  useEffect(() => writeStored("mv.favoriteVetIds", favoriteVetIds), [favoriteVetIds]);
  useEffect(() => writeStored("mv.selectedPetId", selectedPetId), [selectedPetId]);
  useEffect(() => writeStored("mv.browserNotifications", browserNotificationsEnabled), [browserNotificationsEnabled]);
  useEffect(() => {
    if (!supabaseActive) writeStored("mv.demo.messages", messages);
  }, [messages, supabaseActive]);
  useEffect(() => {
    if (!supabaseActive) writeStored("mv.demo.ownerProfile", ownerProfile);
  }, [ownerProfile, supabaseActive]);

  useEffect(() => {
    if (pets.length === 0) {
      if (selectedPetId) queueMicrotask(() => setSelectedPetId(""));
      return;
    }
    if (!selectedPetId || !pets.some((pet) => pet.id === selectedPetId)) {
      queueMicrotask(() => setSelectedPetId(pets[0].id));
    }
  }, [pets, selectedPetId]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const showBrowserNotification = useCallback(
    (title, body) => {
      if (!browserNotificationsEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
      new Notification(title, { body });
    },
    [browserNotificationsEnabled]
  );

  const createLocalNotification = useCallback(
    ({ type = "info", title, message = "", data = {} }) => {
      const notification = {
        id: `n_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId: user?.id || "demo-user",
        type,
        title,
        message,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((current) => [notification, ...current].slice(0, 50));
      showBrowserNotification(title, message);
      setBannerNotif({ type, title, message, data, id: notification.id });
      setTimeout(() => {
        setBannerNotif(null);
        // Segna la notifica come letta quando il banner sparisce
        setNotifications((current) => current.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
      }, 4000);
      return notification;
    },
    [showBrowserNotification, user?.id]
  );

  const toggleFavoriteVet = useCallback(
    (id) => {
      setFavoriteVetIds((current) => {
        const next = current.includes(id) ? current.filter((vet) => vet !== id) : [...current, id];
        createLocalNotification({
          type: "favorite_vet_available",
          title: current.includes(id) ? "Veterinario rimosso dai preferiti" : "Veterinario salvato",
          message: current.includes(id) ? "Non apparirà più tra i preferiti." : "Lo troverai in Home e nel profilo.",
          data: { vetId: id },
        });
        return next;
      });
    },
    [createLocalNotification]
  );

  const isFavoriteVet = useCallback((id) => favoriteVetIds.includes(id), [favoriteVetIds]);

  /* ── Directory strutture: caricamento ON-DEMAND ──
     In demo (senza Supabase) le schede seed sono già nello stato e il filtro
     avviene lato client, quindi queste funzioni non fanno nulla. */
  const loadDirectoryNear = useCallback(
    async (center, radiusKm) => {
      if (!supabaseActive || !center) return;
      setDirectoryLoading(true);
      try {
        const bounds = bboxFromCenter(center, radiusKm); // null quando radiusKm è null → nessun vincolo, solo limit
        const { data } = await getDirectoryListingsInBounds({
          ...(bounds || {}),
          limit: radiusKm == null ? 500 : 300,
        });
        setDirectoryListings(publicDirectoryListings((data || []).map(mapDirectoryListing)));
      } catch (err) {
        console.error("Errore caricamento directory:", err);
      }
      setDirectoryLoading(false);
    },
    [supabaseActive]
  );

  const searchDirectory = useCallback(
    async (query) => {
      if (!supabaseActive || !query || !query.trim()) return;
      setDirectoryLoading(true);
      try {
        const { data } = await searchDirectoryListings(query);
        setDirectoryListings(publicDirectoryListings((data || []).map(mapDirectoryListing)));
      } catch (err) {
        console.error("Errore ricerca directory:", err);
      }
      setDirectoryLoading(false);
    },
    [supabaseActive]
  );

  const sendMessage = useCallback(
    (payload) => {
      const msg = {
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString(),
        readAt: null,
        ...payload,
      };
      setMessages((current) => [...current, msg]);
      // Notifica solo se il messaggio viene dall'altro (ricezione), non dall'utente corrente
      if (msg.senderRole !== role) {
        createLocalNotification({
          type: "message_received",
          title: `Nuovo messaggio da ${msg.senderName}`,
          message: msg.text,
          data: { threadId: msg.threadId, vetId: msg.vetId, apptId: msg.apptId },
        });
      }
      return msg;
    },
    [createLocalNotification, role]
  );

  const markThreadRead = useCallback((threadId, role) => {
    setMessages((current) =>
      current.map((message) =>
        message.threadId === threadId && message.senderRole !== role && !message.readAt
          ? { ...message, readAt: new Date().toISOString() }
          : message
      )
    );
  }, []);

  const buildThreads = useCallback((items, role) => {
    const grouped = new Map();
    items.forEach((message) => {
      const existing = grouped.get(message.threadId) || {
        threadId: message.threadId,
        vetId: message.vetId,
        ownerId: message.ownerId,
        ownerName: message.senderRole === "owner" ? message.senderName : "Cliente",
        messages: [],
      };
      existing.messages.push(message);
      if (message.senderRole === "owner") existing.ownerName = message.senderName;
      grouped.set(message.threadId, existing);
    });
    return [...grouped.values()]
      .map((thread) => {
        const sorted = thread.messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        return {
          ...thread,
          lastMessage: sorted[sorted.length - 1],
          unread: sorted.filter((message) => message.senderRole !== role && !message.readAt).length,
        };
      })
      .sort((a, b) => b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt));
  }, []);

  const getThreadsForOwner = useCallback(() => buildThreads(messages, "owner"), [buildThreads, messages]);
  const getThreadsForVet = useCallback(
    (id) =>
      buildThreads(
        messages.filter((message) => message.vetId === id),
        "vet"
      ),
    [buildThreads, messages]
  );

  const unreadMessageCount = messages.filter((message) => message.senderRole !== role && !message.readAt).length;

  /* ── Carica dati per il PROPRIETARIO ── */
  async function loadOwnerData() {
    /* 1. Aggiorna profilo proprietario dalla tabella profiles */
    setOwnerProfile({
      name: profile.display_name || "Utente",
      fullName: profile.full_name || profile.display_name || "",
      phone: profile.phone || "",
      email: profile.email || "",
      cf: profile.cf || "",
      address: profile.address || "",
      avatar: profile.avatar || "👤",
    });

    /* 2. Carica i miei animali */
    const { data: petsData } = await supabase.from("pets").select("*").eq("owner_id", user.id).order("created_at");

    const myPets = (petsData || []).map(mapPet);
    setPets(myPets);

    /* 3. Carica tutti i vet verificati (per la ricerca) + loro servizi */
    const { data: vetsData } = await supabase.from("vets").select("*").eq("status", "verified");

    if (vetsData && vetsData.length > 0) {
      // Carica i servizi di tutti i vet in una sola query
      const vetIds = vetsData.map((v) => v.id);
      const { data: allVetServices } = await supabase.from("vet_services").select("*").in("vet_id", vetIds);

      // Raggruppa i servizi per vet_id
      const servicesByVet = {};
      (allVetServices || []).forEach((vs) => {
        if (!servicesByVet[vs.vet_id]) servicesByVet[vs.vet_id] = [];
        servicesByVet[vs.vet_id].push(vs);
      });

      const mappedVets = vetsData.map((v) => mapVet(v, servicesByVet[v.id] || []));
      setVets(mappedVets);
    } else {
      setVets([]);
    }

    /* 3b. Le schede directory NON si caricano più tutte qui: sono migliaia e
       sparse in tutta Italia. Vengono caricate ON-DEMAND per posizione o
       ricerca testuale (loadDirectoryNear / searchDirectory), quando l'utente
       apre la ricerca veterinari. Partiamo da lista vuota. */
    setDirectoryListings([]);

    /* 4. Carica i miei appuntamenti */
    const { data: apptsData } = await supabase
      .from("appointments")
      .select("*")
      .eq("owner_id", user.id)
      .order("date", { ascending: false });

    setAppts((apptsData || []).map(mapAppointment));

    /* 5. Carica i referti dei miei animali */
    const myPetIds = myPets.map((p) => p.id);
    if (myPetIds.length > 0) {
      const { data: refertiData } = await supabase
        .from("referti")
        .select("*")
        .in("pet_id", myPetIds)
        .order("date", { ascending: false });

      setReferti((refertiData || []).map(mapReferto));

      /* 6. Carica vaccini dei miei animali */
      const { data: vaccinesData } = await supabase
        .from("vaccines")
        .select("*")
        .in("pet_id", myPetIds)
        .order("date", { ascending: false });

      setVaccines((vaccinesData || []).map(mapVaccine));
    } else {
      setReferti([]);
      setVaccines([]);
    }

    /* 7. Carica le fatture dove sono il cliente */
    const { data: invoicesData } = await supabase
      .from("invoices")
      .select("*")
      .eq("client_id", user.id)
      .order("date", { ascending: false });

    setInvoices((invoicesData || []).map(mapInvoice));

    /* 8. Carica le mie recensioni */
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*")
      .eq("author_id", user.id)
      .order("date", { ascending: false });

    setReviews((reviewsData || []).map(mapReview));

    /* 9. Carica le notifiche */
    const { data: notifsData } = await getNotifications(user.id);
    setNotifications((notifsData || []).map(mapNotification));
  }

  /* ── Carica dati per il VETERINARIO ── */
  async function loadVetData() {
    /* 1. Trova il profilo vet collegato all'utente */
    const { data: vetRow } = await supabase.from("vets").select("*").eq("user_id", user.id).single();

    if (!vetRow) {
      console.warn("Nessun profilo veterinario trovato per questo utente.");
      setVets([]);
      return;
    }

    /* Salva il vetId per i componenti */
    setVetId(vetRow.id);

    /* 2. Carica i servizi di questo vet */
    const { data: vetServicesData } = await supabase.from("vet_services").select("*").eq("vet_id", vetRow.id);

    const mappedVet = mapVet(vetRow, vetServicesData || []);
    setVets([mappedVet]);

    /* 3. Carica gli appuntamenti di questo vet */
    const { data: apptsData } = await supabase
      .from("appointments")
      .select("*")
      .eq("vet_id", vetRow.id)
      .order("date", { ascending: false });

    setAppts((apptsData || []).map(mapAppointment));

    /* 4. Carica i referti creati da questo vet */
    const { data: refertiData } = await supabase
      .from("referti")
      .select("*")
      .eq("vet_id", vetRow.id)
      .order("date", { ascending: false });

    setReferti((refertiData || []).map(mapReferto));

    /* 5. Carica le fatture emesse da questo vet */
    const { data: invoicesData } = await supabase
      .from("invoices")
      .select("*")
      .eq("vet_id", vetRow.id)
      .order("date", { ascending: false });

    setInvoices((invoicesData || []).map(mapInvoice));

    /* 6. Carica le recensioni per questo vet */
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*")
      .eq("vet_id", vetRow.id)
      .order("date", { ascending: false });

    setReviews((reviewsData || []).map(mapReview));

    /* 7. Carica i clienti (proprietari con appuntamenti da questo vet) */
    const ownerIds = [...new Set((apptsData || []).map((a) => a.owner_id))];
    if (ownerIds.length > 0) {
      const { data: clientProfiles } = await supabase.from("profiles").select("*").in("id", ownerIds);

      /* Per ogni cliente, trova i suoi animali coinvolti */
      const petOwnerIds = [...new Set((apptsData || []).map((a) => a.pet_id))];
      const { data: clientPetsData } = await supabase.from("pets").select("id, owner_id").in("id", petOwnerIds);

      const petsByOwner = {};
      (clientPetsData || []).forEach((p) => {
        if (!petsByOwner[p.owner_id]) petsByOwner[p.owner_id] = [];
        petsByOwner[p.owner_id].push(p.id);
      });

      setClients((clientProfiles || []).map((cp) => mapClient(cp, petsByOwner[cp.id] || [])));

      /* Carica anche gli animali dei clienti (il vet li vede) */
      if (petOwnerIds.length > 0) {
        const { data: allClientPets } = await supabase.from("pets").select("*").in("id", petOwnerIds);

        setPets((allClientPets || []).map(mapPet));
      }
    } else {
      setClients([]);
      setPets([]);
    }

    /* 8. Carica vaccini degli animali coinvolti */
    const allPetIds = [...new Set((apptsData || []).map((a) => a.pet_id))];
    if (allPetIds.length > 0) {
      const { data: vaccinesData } = await supabase
        .from("vaccines")
        .select("*")
        .in("pet_id", allPetIds)
        .order("date", { ascending: false });

      setVaccines((vaccinesData || []).map(mapVaccine));
    } else {
      setVaccines([]);
    }

    /* 9. Carica le notifiche */
    const { data: notifsData } = await getNotifications(user.id);
    setNotifications((notifsData || []).map(mapNotification));
  }

  /* ══════════════════════════════════════════════════════════════
     FETCH DATI DA SUPABASE — si attiva quando l'utente è loggato.
     Scarica tutto e traduce con i mapper.
     ══════════════════════════════════════════════════════════════ */

  const loadData = useCallback(async () => {
    if (!supabaseActive || !user || !profile) return;

    setDataLoading(true);
    console.log("📦 Caricamento dati da Supabase...");

    try {
      if (profile.role === "owner") {
        await loadOwnerData();
      } else if (profile.role === "vet") {
        await loadVetData();
      }
    } catch (err) {
      console.error("Errore caricamento dati:", err);
    }

    setDataLoading(false);
    console.log("✅ Dati caricati!");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseActive, user?.id, profile?.role]);

  /* ── Attiva il caricamento quando l'utente è loggato ── */
  useEffect(() => {
    if (!supabaseActive || !user?.id || !profile?.role) return;
    queueMicrotask(() => loadData());
  }, [supabaseActive, user?.id, profile?.role, loadData]);

  useRealtimeNotifications({ userId: user?.id, setNotifications });
  useRealtimeAppSync({ user, profile, vetId, setAppts, refreshMessages: () => {} });

  /* ── Helper notifiche ── */
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (supabaseActive) await markNotificationRead(id);
  };

  const markAllRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    if (supabaseActive && user) await markAllNotificationsRead(user.id);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        vets,
        setVets,
        directoryListings,
        directoryLoading,
        loadDirectoryNear,
        searchDirectory,
        pets,
        setPets,
        appts,
        setAppts,
        referti,
        setReferti,
        invoices,
        setInvoices,
        reviews,
        setReviews,
        vaccines,
        setVaccines,
        clients,
        setClients,
        toast,
        notify,
        bannerNotif,
        vetId,
        setVetId,
        ownerProfile,
        setOwnerProfile,
        dataLoading,
        selectedPetId,
        setSelectedPetId,
        favoriteVetIds,
        setFavoriteVetIds,
        toggleFavoriteVet,
        isFavoriteVet,
        messages,
        setMessages,
        sendMessage,
        getThreadsForOwner,
        getThreadsForVet,
        markThreadRead,
        unreadMessageCount,
        createLocalNotification,
        browserNotificationsEnabled,
        setBrowserNotificationsEnabled,
        notifications,
        setNotifications,
        unreadCount,
        markRead,
        markAllRead,
      }}
    >
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
