/* Calcolo disponibilità slot — funzioni pure, identiche in demo e Supabase.
   Estraggono e generalizzano la logica inline di BookingFlow.jsx. */

import { SLOT_TIMES } from "./constants.js";
import { today, fmtDate } from "./helpers.js";

/**
 * Orari occupati per un vet in una data specifica.
 * Esclude appuntamenti cancellati.
 */
const takenSlotsForDay = (vetId, appts, date) =>
  appts
    .filter(a => a.vetId === vetId && a.date === date && a.status !== "cancelled")
    .map(a => a.time);

/**
 * Slot liberi per un vet in una data specifica.
 * @returns {string[]}  es. ["09:00", "10:30", "15:00"]
 */
export function getAvailableSlotsForDay(vet, appts, date) {
  const taken = takenSlotsForDay(vet.id, appts, date);
  return SLOT_TIMES.filter(t => !taken.includes(t));
}

/**
 * Primo slot disponibile per un vet, cercando da fromDate in avanti.
 * @param {object} vet
 * @param {object[]} appts
 * @param {{ fromDate?: string, maxDays?: number }} opts
 * @returns {{ date: string, time: string } | null}
 */
export function getFirstAvailableSlot(vet, appts, { fromDate, maxDays = 21 } = {}) {
  const start = fromDate ? new Date(fromDate) : new Date(today);
  // Se non è passata una fromDate, partiamo da domani
  if (!fromDate) start.setDate(start.getDate() + 1);

  for (let i = 0; i < maxDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = fmtDate(d);
    const dayOfWeek = d.getDay();

    // Salta i giorni non lavorativi del vet
    if (vet.workDays && !vet.workDays.includes(dayOfWeek)) continue;

    const free = getAvailableSlotsForDay(vet, appts, dateStr);
    if (free.length > 0) return { date: dateStr, time: free[0] };
  }
  return null;
}

/**
 * Il vet ha almeno uno slot libero nel range [startDate, endDate]?
 * @param {object} vet
 * @param {object[]} appts
 * @param {string} startDate  YYYY-MM-DD
 * @param {string} endDate    YYYY-MM-DD
 * @returns {boolean}
 */
export function hasAvailabilityInRange(vet, appts, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = fmtDate(d);
    const dayOfWeek = d.getDay();

    if (vet.workDays && !vet.workDays.includes(dayOfWeek)) continue;

    const free = getAvailableSlotsForDay(vet, appts, dateStr);
    if (free.length > 0) return true;
  }
  return false;
}

/**
 * Giorni lavorativi del vet nei prossimi N giorni (per il date picker del booking).
 * @param {object} vet
 * @param {number} count  quanti giorni lavorativi restituire (default 10)
 * @param {number} maxScan  quanti giorni scandire al massimo (default 30)
 * @returns {string[]}  date YYYY-MM-DD
 */
export function getWorkingDays(vet, count = 10, maxScan = 30) {
  const days = [];
  for (let i = 1; i <= maxScan && days.length < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    if (!vet.workDays || vet.workDays.includes(dayOfWeek)) {
      days.push(fmtDate(d));
    }
  }
  return days;
}
