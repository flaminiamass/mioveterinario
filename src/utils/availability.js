/* Logica disponibilità slot — funzioni pure, sostituibili con Supabase RPC.
   Alimenta BookingSearch, SlotCard, VetsDirectory e VetPublicProfile. */

import { SLOT_TIMES } from "../data/constants.js";
import { today, fmtDate, parseDateOnly } from "../data/helpers.js";
import { getTypeFromService, getVetServices } from "../data/services.js";
import { distanceKm, matchesRadius } from "./location.js";

const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5];
export const DEFAULT_MIN_LEAD_MINUTES = 90;

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function slotDateTime(dateStr, time) {
  const date = parseDateOnly(dateStr);
  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function respectsLeadTime(dateStr, time, minLeadMinutes = DEFAULT_MIN_LEAD_MINUTES) {
  if (dateStr !== fmtDate(today)) return true;
  return slotDateTime(dateStr, time) >= addMinutes(new Date(), minLeadMinutes);
}

function takenForDay(vetId, appts, date) {
  return appts
    .filter((appt) => appt.vetId === vetId && appt.date === date && appt.status !== "cancelled")
    .map((appt) => appt.time);
}

function isWorkingDay(vet, date) {
  return (vet.workDays || DEFAULT_WORK_DAYS).includes(date.getDay());
}

function typeMatches(vet, type) {
  return !type || type === "any" || (vet.types || ["clinic"]).includes(type);
}

function speciesMatches(vet, species) {
  return !species || (vet.animals || []).includes(species);
}

function serviceType(service) {
  return getTypeFromService(service.id);
}

function serviceMatches({ vet, service, type }) {
  const derivedType = serviceType(service);
  const vetTypes = vet.types || ["clinic"];
  if (!vetTypes.includes(derivedType)) return false;
  if (type && type !== "any" && derivedType !== type) return false;
  return true;
}

function getBookableServices({ vet, serviceId, type }) {
  const vetServices = getVetServices(vet);
  const candidates = serviceId ? vetServices.filter((service) => service.id === serviceId) : vetServices;
  return candidates.filter((service) => serviceMatches({ vet, service, type }));
}

function slotPrice(vet, service, type) {
  if (type === "home") return vet.fees?.home ?? service.price;
  if (type === "video") return vet.fees?.video ?? service.price;
  return service.price ?? vet.fees?.clinic ?? 0;
}

function normalizeSlot({ vet, service, date, time, zone, distance }) {
  const type = serviceType(service);
  return {
    id: `${vet.id}-${service.id}-${date}-${time}`,
    vet,
    vetId: vet.id,
    service,
    serviceId: service.id,
    date,
    time,
    type,
    price: slotPrice(vet, service, type),
    duration: service.duration,
    distanceKm: distance,
    zone: vet.zone || vet.city || zone || "Roma",
    address: vet.address,
    rating: vet.rating,
    reviews: vet.reviews,
    autoConfirm: vet.autoConfirm || false,
  };
}

/** Filtra slot per fascia oraria. */
export function getTimeWindowRange(timeWindow) {
  if (timeWindow === "morning") return ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  if (timeWindow === "afternoon") return ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
  if (timeWindow === "evening") return ["18:00", "18:30", "19:00", "19:30"];
  return SLOT_TIMES;
}

/** Slot liberi per vet in una data. Esclude occupati e, per oggi, quelli prima di now + anticipo minimo. */
export function getAvailableSlotsForDay(
  vet,
  appts,
  date,
  { timeWindow, minLeadMinutes = DEFAULT_MIN_LEAD_MINUTES } = {}
) {
  const taken = takenForDay(vet.id, appts, date);
  const allowedTimes = getTimeWindowRange(timeWindow || "any");
  return SLOT_TIMES.filter((time) => allowedTimes.includes(time))
    .filter((time) => !taken.includes(time))
    .filter((time) => respectsLeadTime(date, time, minLeadMinutes));
}

/** Slot disponibili per un singolo vet, filtrati per servizio/tipo/specie. */
export function getVetAvailableSlots({
  vet,
  appts,
  dateRange,
  timeWindow,
  serviceId,
  type,
  species,
  zone,
  distance,
  minLeadMinutes = DEFAULT_MIN_LEAD_MINUTES,
}) {
  if (!speciesMatches(vet, species)) return [];

  const bookableServices = getBookableServices({ vet, serviceId, type });
  if (!bookableServices.length) return [];

  // Se non c'è una prestazione esplicita, scegliamo il primo servizio reale prenotabile del vet.
  const servicesForSlot = serviceId ? bookableServices : [bookableServices[0]];
  const [startDate, endDate] = dateRange || [];
  const start = startDate ? parseDateOnly(startDate) : parseDateOnly(fmtDate(today));
  const end = endDate
    ? parseDateOnly(endDate)
    : (() => {
        const date = parseDateOnly(fmtDate(today));
        date.setDate(date.getDate() + 21);
        return date;
      })();

  const slots = [];
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    if (!isWorkingDay(vet, date)) continue;
    const dateStr = fmtDate(date);
    const freeTimes = getAvailableSlotsForDay(vet, appts, dateStr, { timeWindow, minLeadMinutes });

    for (const time of freeTimes) {
      for (const service of servicesForSlot) {
        slots.push(normalizeSlot({ vet, service, date: dateStr, time, zone, distance }));
      }
    }
  }
  return slots;
}

/** Prossimi N slot disponibili per un vet. */
export function getNextSlotsForVet({ vet, appts, serviceId, type, species, dateRange, limit = 3, minLeadMinutes }) {
  return getVetAvailableSlots({
    vet,
    appts,
    serviceId,
    type,
    species,
    dateRange,
    minLeadMinutes,
    timeWindow: "any",
  }).slice(0, limit);
}

/** Primo slot disponibile per un vet. */
export function getFirstAvailableSlot(vet, appts, opts = {}) {
  const { fromDate, maxDays = 21, serviceId, type, species, dateRange, minLeadMinutes } = opts;
  const start = fromDate ? parseDateOnly(fromDate) : parseDateOnly(fmtDate(today));
  const end = new Date(start);
  end.setDate(start.getDate() + maxDays);
  const effectiveRange = dateRange || [fmtDate(start), fmtDate(end)];
  return (
    getVetAvailableSlots({
      vet,
      appts,
      serviceId,
      type,
      species,
      minLeadMinutes,
      timeWindow: "any",
      dateRange: effectiveRange,
    })[0] || null
  );
}

/** Il vet ha almeno uno slot nel range? */
export function hasAvailabilityInRange(vet, appts, startDate, endDate, filters = {}) {
  return (
    getVetAvailableSlots({
      vet,
      appts,
      ...filters,
      timeWindow: filters.timeWindow || "any",
      dateRange: [startDate, endDate],
    }).length > 0
  );
}

/** Giorni lavorativi del vet (per il date picker di BookingFlow). */
export function getWorkingDays(vet, count = 10, maxScan = 30) {
  const days = [];
  const start = parseDateOnly(fmtDate(today));
  for (let i = 0; i <= maxScan && days.length < count; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    if (isWorkingDay(vet, date)) days.push(fmtDate(date));
  }
  return days;
}

function compareDateTime(a, b) {
  const dateCmp = a.date.localeCompare(b.date);
  return dateCmp !== 0 ? dateCmp : timeToMinutes(a.time) - timeToMinutes(b.time);
}

function sortSlots(slots, sort) {
  const sorted = [...slots];
  if (sort === "distance") sorted.sort((a, b) => a.distanceKm - b.distanceKm || compareDateTime(a, b));
  else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating || compareDateTime(a, b));
  else if (sort === "price") sorted.sort((a, b) => a.price - b.price || compareDateTime(a, b));
  else sorted.sort(compareDateTime);
  return sorted;
}

/** Tutti gli slot disponibili su tutti i vet, con filtri. */
export function getAllAvailableSlots({
  vets,
  appts,
  serviceId,
  species,
  dateRange,
  timeWindow,
  zone,
  radiusKm,
  type,
  sort = "earliest",
  minLeadMinutes = DEFAULT_MIN_LEAD_MINUTES,
}) {
  const slots = [];

  for (const vet of vets) {
    if (vet.status !== "verified") continue;
    if (!speciesMatches(vet, species)) continue;
    if (!typeMatches(vet, type)) continue;
    if (zone && zone !== "any" && zone !== "Vicino a me" && !matchesRadius(vet, zone, radiusKm || 10)) continue;
    if (zone === "Vicino a me" && !matchesRadius(vet, "Roma Centro", radiusKm || 5)) continue;

    const dist = distanceKm(vet, zone || "Roma Centro");
    slots.push(
      ...getVetAvailableSlots({
        vet,
        appts,
        serviceId,
        type,
        species,
        dateRange,
        timeWindow,
        minLeadMinutes,
        zone,
        distance: dist,
      })
    );
  }

  // Non deduplichiamo tra servizi diversi: se l'utente sceglie un servizio specifico deve restare esplicito.
  return sortSlots(slots, sort);
}
