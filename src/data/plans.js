/* Modello commerciale MioVeterinario — PROTOTIPO BETA
   Prezzi indicativi, soggetti a revisione prima del lancio.
   Nessun pagamento reale viene processato in questa demo. */

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    badge: "Profilo gratuito",
    description: "Il tuo profilo online visibile ai proprietari, senza costi.",
    color: "#64748B",
    emoji: "🌱",
    recommended: false,
    features: [
      "Profilo pubblico visibile",
      "Comparsa nei risultati di ricerca",
      "Ricezione recensioni",
      "Visualizzazione telefono e indirizzo",
      "Specializzazioni e prezzi indicativi",
    ],
    notIncluded: [
      "Prenotazioni online H24",
      "Agenda digitale",
      "Promemoria automatici",
      "Chat con proprietari",
      "Statistiche avanzate",
      "Pagamenti online",
    ],
    limits: {
      onlineBooking: false,
      agenda: false,
      reminders: false,
      chat: false,
      advancedStats: false,
      waitlist: false,
      onlinePayments: false,
      boosted: false,
      multiSede: false,
    },
    commissionRate: null,
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 29,
    badge: "Agenda online",
    description: "Attiva le prenotazioni H24 e gestisci la tua agenda da qualsiasi dispositivo.",
    color: "#0D7E83",
    emoji: "📅",
    recommended: false,
    features: [
      "Tutto del piano Free",
      "Prenotazioni online H24",
      "Agenda digitale completa",
      "Gestione appuntamenti",
      "Promemoria base ai clienti",
      "Profilo completo con foto e bio",
      "Dashboard appuntamenti",
    ],
    notIncluded: [
      "Chat con proprietari",
      "Lista d'attesa",
      "Statistiche avanzate",
      "Pagamenti online",
      "Visibilità prioritaria",
    ],
    limits: {
      onlineBooking: true,
      agenda: true,
      reminders: true,
      chat: false,
      advancedStats: false,
      waitlist: false,
      onlinePayments: false,
      boosted: false,
      multiSede: false,
    },
    commissionRate: null,
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 59,
    badge: "Più prenotazioni",
    description: "Lo strumento completo per il tuo studio. Chat, statistiche e pagamenti online simulati.",
    color: "#F0813A",
    emoji: "⭐",
    recommended: true,
    features: [
      "Tutto del piano Starter",
      "Chat diretta con i proprietari",
      "Promemoria avanzati (email + app)",
      "Lista d'attesa automatica",
      "Gestione completa cartella paziente",
      "Statistiche e andamento studio",
      "Pagamenti online simulati",
    ],
    notIncluded: ["Profilo evidenziato in ricerca", "Badge Premium", "Multi-sede / multi-professionista"],
    limits: {
      onlineBooking: true,
      agenda: true,
      reminders: true,
      chat: true,
      advancedStats: true,
      waitlist: true,
      onlinePayments: true,
      boosted: false,
      multiSede: false,
    },
    commissionRate: 2.9,
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceMonthly: 99,
    badge: "Massima visibilità",
    description: "Per gli studi ambiziosi. Visibilità prioritaria, report avanzati e gestione multi-sede.",
    color: "#7C3AED",
    emoji: "🏆",
    recommended: false,
    features: [
      "Tutto del piano Pro",
      "Profilo evidenziato nei risultati",
      "Badge Premium verificato",
      "Multi-sede e multi-professionista (simulato)",
      "Report avanzati e analytics",
      "Commissione pagamenti online ridotta",
      "Priorità nel supporto",
    ],
    notIncluded: [],
    limits: {
      onlineBooking: true,
      agenda: true,
      reminders: true,
      chat: true,
      advancedStats: true,
      waitlist: true,
      onlinePayments: true,
      boosted: true,
      multiSede: true,
    },
    commissionRate: 1.9,
  },
};

export const PLAN_ORDER = ["free", "starter", "pro", "premium"];

/* ─── Helper: ottieni il piano di un vet ─────────────────── */
export function getPlan(vet) {
  const planId = vet?.plan || "free";
  return PLANS[planId] || PLANS.free;
}

/* ─── Feature gates ──────────────────────────────────────── */
export function hasFeature(vet, featureKey) {
  const plan = getPlan(vet);
  return plan.limits[featureKey] === true;
}

export function canUseOnlineBooking(vet) {
  return hasFeature(vet, "onlineBooking") && (vet?.acceptsOnlineBooking !== false);
}

export function canUseChat(vet) {
  return hasFeature(vet, "chat");
}

export function canUsePayments(vet) {
  return hasFeature(vet, "onlinePayments") && (vet?.acceptsOnlinePayments === true);
}

export function canUseWaitlist(vet) {
  return hasFeature(vet, "waitlist");
}

export function canUseAdvancedStats(vet) {
  return hasFeature(vet, "advancedStats");
}

export function getCommissionRate(vet) {
  const plan = getPlan(vet);
  return plan.commissionRate;
}

export function isBoosted(vet) {
  return hasFeature(vet, "boosted") && (vet?.boosted === true);
}

/* ─── Ordinamento vet per ricerca (lato proprietario) ───── */
export function sortVetsForSearch(vets) {
  return [...vets].sort((a, b) => {
    // 1. Verificati prima
    const aVerified = a.profileStatus === "verified" || a.status === "verified" ? 1 : 0;
    const bVerified = b.profileStatus === "verified" || b.status === "verified" ? 1 : 0;
    if (bVerified !== aVerified) return bVerified - aVerified;

    // 2. Prenotazione online attiva
    const aBooking = canUseOnlineBooking(a) ? 1 : 0;
    const bBooking = canUseOnlineBooking(b) ? 1 : 0;
    if (bBooking !== aBooking) return bBooking - aBooking;

    // 3. Rating
    const ratingDiff = (b.rating || 0) - (a.rating || 0);
    if (Math.abs(ratingDiff) > 0.05) return ratingDiff;

    // 4. Boost Premium — fattore leggero, non dominante
    const aBoosted = isBoosted(a) ? 0.5 : 0;
    const bBoosted = isBoosted(b) ? 0.5 : 0;
    return bBoosted - aBoosted;
  });
}

/* ─── Testo descrittivo per paymentMode ─────────────────── */
export function paymentModeLabel(mode) {
  switch (mode) {
    case "optional":
      return "Pagamento in studio o online (a scelta tua)";
    case "required":
      return "Pagamento online richiesto dal veterinario";
    default:
      return "Pagamento in studio";
  }
}

/* ─── Upgrade path: piano successivo ─────────────────────── */
export function nextPlan(vet) {
  const currentId = vet?.plan || "free";
  const idx = PLAN_ORDER.indexOf(currentId);
  if (idx === -1 || idx >= PLAN_ORDER.length - 1) return null;
  return PLANS[PLAN_ORDER[idx + 1]];
}
