/* Logica disponibilità slot — funzioni pure, sostituibili con Supabase RPC.
   Alimenta BookingSearch, SlotCard e VetPublicProfile. */

import { SLOT_TIMES } from "../data/constants.js";
import { today, fmtDate } from "../data/helpers.js";
import { getVetServices, getTypeFromService } from "../data/services.js";
import { matchesRadius, distanceKm } from "./location.js";

/** Orari occupati per vet+data. Esclude cancellati. */
const takenForDay = (vetId, appts, date) =>
  appts
    .filter(a => a.vetId === vetId && a.date === date && a.status !== "cancelled")
    .map(a => a.time);

/** Slot liberi per vet in una data. */
export function getAvailableSlotsForDay(vet, appts, date) {
  const taken = takenForDay(vet.id, appts, date);
  return SLOT_TIMES.filter(t => !taken.includes(t));
}

/** Filtra slot per fascia oraria. */
export function getTimeWindowRange(timeWindow) {
  if (timeWindow === "morning") return ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  if (timeWindow === "afternoon") return ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
  if (timeWindow === "evening") return ["18:00", "18:30", "19:00", "19:30"];
  return SLOT_TIMES; // "any"
}

/** Slot disponibili per vet in un range di date, con filtri opzionali.
 * @returns {{ date, time }[] }
 */
export function getVetAvailableSlots({ vet, appts, dateRange, timeWindow }) {
  const [startDate, endDate] = dateRange || [];
  const start = startDate ? new Date(startDate) : new Date(today);
  const end = endDate ? new Date(endDate) : (() => { const d = new Date(today); d.setDate(d.getDate() + 21); return d; })();
  const allowedTimes = getTimeWindowRange(timeWindow || "any");

  const result = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = fmtDate(d);
    const dow = d.getDay();
    const workDays = vet.workDays || [1, 2, 3, 4, 5];
    if (!workDays.includes(dow)) continue;

    const freeSlots = getAvailableSlotsForDay(vet, appts, dateStr)
      .filter(t => allowedTimes.includes(t));

    for (const time of freeSlots) {
      result.push({ date: dateStr, time });
    }
  }
  return result;
}

/** Prossimi N slot disponibili per un vet. */
export function getNextSlotsForVet({ vet, appts, serviceId, limit = 3 }) {
  const slots = getVetAvailableSlots({ vet, appts, serviceId, timeWindow: "any" });
  return slots.slice(0, limit);
}

/** Primo slot disponibile per un vet (compatibile con funzione esistente). */
export function getFirstAvailableSlot(vet, appts, { fromDate, maxDays = 21 } = {}) {
  const start = fromDate ? new Date(fromDate) : new Date(today);
  if (!fromDate) start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + maxDays);

  const slots = getVetAvailableSlots({
    vet, appts, timeWindow: "any",
    dateRange: [fmtDate(start), fmtDate(end)],
  });
  return slots[0] || null;
}

/** Il vet ha almeno uno slot nel range? */
export function hasAvailabilityInRange(vet, appts, startDate, endDate) {
  const slots = getVetAvailableSlots({
    vet, appts, timeWindow: "any",
    dateRange: [startDate, endDate],
  });
  return slots.length > 0;
}

/** Giorni lavorativi del vet (per il date picker di BookingFlow). */
export function getWorkingDays(vet, count = 10, maxScan = 30) {
  const days = [];
  for (let i = 1; i <= maxScan && days.length < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const workDays = vet.workDays || [1, 2, 3, 4, 5];
    if (workDays.includes(dow)) days.push(fmtDate(d));
  }
  return days;
}

/**
 * Tutti gli slot disponibili su tutti i vet, con filtri.
 * Restituisce array di oggetti Slot normalizzati.
 * @param {{ vets, appts, serviceId?, species?, dateRange?, timeWindow?, zone?, radiusKm?, type?, sort? }}
 * @returns {SlotObject[]}
 */
export function getAllAvailableSlots({
  vets, appts,
  serviceId, species,
  dateRange, timeWindow,
  zone, radiusKm,
  type: appointmentType,
  sort = "earliest",
}) {
  const allowedTimes = getTimeWindowRange(timeWindow || "any");
  const [startDate, endDate] = dateRange || [];
  const start = startDate ? new Date(startDate) : (() => { const d = new Date(today); d.setDate(d.getDate() + 1); return d; })();
  const end = endDate ? new Date(endDate) : (() => { const d = new Date(today); d.setDate(d.getDate() + 14); return d; })();

  const slots = [];

  for (const vet of vets) {
    if (vet.status !== "verified") continue;

    // Filtro animale/specie
    if (species && !vet.animals.includes(species)) continue;

    // Filtro tipo appuntamento
    const vetTypes = vet.types || ["clinic"];
    if (appointmentType && appointmentType !== "any" && !vetTypes.includes(appointmentType)) continue;

    // Filtro zona/raggio
    if (zone && zone !== "any" && zone !== "Vicino a me") {
      if (!matchesRadius(vet, zone, radiusKm || 10)) continue;
    }
    if (zone === "Vicino a me") {
      // posizione demo: Roma Centro
      if (!matchesRadius(vet, "Roma Centro", radiusKm || 5)) continue;
    }

    // Servizi del vet
    const vetServices = getVetServices(vet);
    let targetService = null;
    if (serviceId) {
      targetService = vetServices.find(s => s.id === serviceId);
      if (!targetService) continue;
    }

    // Tipo derivato dal servizio
    const derivedType = serviceId ? getTypeFromService(serviceId) : null;
    if (derivedType && !vetTypes.includes(derivedType)) continue;

    // Calcola distanza simulata
    const dist = distanceKm(vet, zone || "Roma Centro");

    // Scorri le date
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = fmtDate(d);
      const dow = d.getDay();
      const workDays = vet.workDays || [1, 2, 3, 4, 5];
      if (!workDays.includes(dow)) continue;

      const freeSlots = getAvailableSlotsForDay(vet, appts, dateStr)
        .filter(t => allowedTimes.includes(t));

      for (const time of freeSlots) {
        const svc = targetService || vetServices[0];
        if (!svc) continue;

        const slotType = derivedType || (vet.types.includes("clinic") ? "clinic" : vet.types[0]);
        const price = slotType === "home" ? (vet.fees.home || svc.price)
          : slotType === "video" ? (vet.fees.video || svc.price)
            : svc.price;

        slots.push({
          id: `${vet.id}-${svc.id}-${dateStr}-${time}`,
          vet,
          vetId: vet.id,
          service: svc,
          serviceId: svc.id,
          date: dateStr,
          time,
          type: slotType,
          price,
          duration: svc.duration,
          distanceKm: dist,
          zone: vet.zone || vet.city || "Roma",
          address: vet.address,
          rating: vet.rating,
          reviews: vet.reviews,
          autoConfirm: vet.autoConfirm || false,
        });
      }
    }
  }

  // Ordinamento
  if (sort === "earliest") {
    slots.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return cmp !== 0 ? cmp : a.time.localeCompare(b.time);
    });
  } else if (sort === "distance") {
    slots.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (sort === "rating") {
    slots.sort((a, b) => b.rating - a.rating || a.date.localeCompare(b.date));
  } else if (sort === "price") {
    slots.sort((a, b) => a.price - b.price || a.date.localeCompare(b.date));
  }

  // Dedup: un solo slot per (vet, date, time) — prende il più economico
  const seen = new Set();
  return slots.filter(s => {
    const key = `${s.vetId}-${s.date}-${s.time}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
