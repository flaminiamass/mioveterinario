import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL } from "../../data/constants.js";
import { today, fmtDate } from "../../data/helpers.js";
import { getAllAvailableSlots } from "../../utils/availability.js";
import { ROME_ZONES, RADIUS_OPTIONS } from "../../utils/location.js";
import { colors, fontSize, radius, selectStyle } from "../../styles/tokens.js";
import SlotCard from "./SlotCard.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Empty from "../ui/Empty.jsx";
import Btn from "../ui/Btn.jsx";

const QUICK_SERVICES = [
  { id: "sv1",     label: "🩺 Visita" },
  { id: "sv9",     label: "💉 Vaccino" },
  { id: "sv8",     label: "🚨 Urgenza" },
  { id: "sv3",     label: "🔬 Dermatologia" },
  { id: "sv5",     label: "🦴 Ortopedia" },
  { id: "sv6",     label: "🏠 Domicilio" },
  { id: "sv7",     label: "📹 Video" },
  { id: "c_exotic", label: "🦎 Esotici" },
];

const SPECIES = ["Cane", "Gatto", "Coniglio", "Uccelli", "Rettili", "Altro"];
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

function buildDateRange(quickDate) {
  const t = new Date(today);
  const fmt = (d) => fmtDate(d);
  if (quickDate === "oggi") return [fmt(t), fmt(t)];
  if (quickDate === "domani") { const d = new Date(t); d.setDate(t.getDate() + 1); return [fmt(d), fmt(d)]; }
  if (quickDate === "weekend") {
    const dUntilSat = (6 - t.getDay() + 7) % 7 || 7;
    const sat = new Date(t); sat.setDate(t.getDate() + dUntilSat);
    const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
    return [fmt(sat), fmt(sun)];
  }
  const end = new Date(t); end.setDate(t.getDate() + 10);
  return [fmt(t), fmt(end)];
}

function groupSlotsByDay(slots) {
  const map = {};
  for (const s of slots) {
    if (!map[s.date]) map[s.date] = [];
    map[s.date].push(s);
  }
  return map;
}

function dayGroupLabel(dateStr) {
  const t = new Date(today);
  const d = new Date(dateStr);
  const diff = Math.round((d - t) / 86400000);
  if (diff === 0) return "Oggi";
  if (diff === 1) return "Domani";
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

/* Chip di filtro — bordo quando non attivo, pieno teal quando attivo */
function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        minHeight: 36,
        borderRadius: radius.pill,
        border: active ? "none" : `1.5px solid ${colors.borderLight}`,
        cursor: "pointer",
        fontSize: fontSize.md,
        fontWeight: 600,
        flexShrink: 0,
        whiteSpace: "nowrap",
        background: active ? TEAL : colors.white,
        color: active ? colors.white : colors.textMedium,
        fontFamily: "inherit",
        boxShadow: active ? "none" : "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      {label}
    </button>
  );
}

function FilterLabel({ children }) {
  return (
    <div style={{
      fontSize: fontSize.xs, fontWeight: 700, color: colors.textMuted,
      textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

export default function BookingSearch({ initialFilters, onBook, onViewVet }) {
  const { vets, appts, pets } = useApp();

  const iF = initialFilters || {};
  const [petId, setPetId] = useState(iF.petId || "");
  const [species, setSpecies] = useState(iF.species || "");
  const [serviceId, setServiceId] = useState(iF.serviceId || "");
  const [quickDate, setQuickDate] = useState(iF.quickDate || "");
  const [timeWindow, setTimeWindow] = useState(iF.timeWindow || "any");
  const [zone, setZone] = useState(iF.zone || "Roma");
  const [radiusKm, setRadiusKm] = useState(iF.radiusKm || 10);
  const [appointmentType, setAppointmentType] = useState(iF.appointmentType || "any");
  const [sort, setSort] = useState("earliest");
  const [showMore, setShowMore] = useState(false);

  const selectedPet = pets.find(p => p.id === petId);
  const effectiveSpecies = selectedPet?.species || species;
  const effectiveServiceId = serviceId === "c_exotic" ? "c_v3_1" : serviceId;
  const dateRange = useMemo(() => buildDateRange(quickDate), [quickDate]);

  const slots = useMemo(() => getAllAvailableSlots({
    vets, appts,
    serviceId: effectiveServiceId || undefined,
    species: effectiveSpecies || undefined,
    dateRange,
    timeWindow: timeWindow !== "any" ? timeWindow : undefined,
    zone: zone || undefined,
    radiusKm: Number(radiusKm),
    type: appointmentType !== "any" ? appointmentType : undefined,
    sort,
  }), [vets, appts, effectiveServiceId, effectiveSpecies, dateRange, timeWindow, zone, radiusKm, appointmentType, sort]);

  const grouped = useMemo(() => groupSlotsByDay(slots), [slots]);
  const dates = Object.keys(grouped).sort();
  const visibleDates = showMore ? dates : dates.slice(0, 3);

  return (
    <div>
      {/* Intestazione */}
      <h2 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800, color: colors.textDark }}>
        Trova uno slot disponibile
      </h2>
      <p style={{ margin: "0 0 18px", fontSize: fontSize.base, color: colors.textSecondary }}>
        Prenota direttamente dall'app, senza telefonare.
      </p>

      {/* Box filtri */}
      <div style={{
        background: colors.white, borderRadius: radius.xl,
        border: `1px solid ${colors.borderLight}`,
        overflow: "hidden", marginBottom: 20,
      }}>

        {/* Animale */}
        <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${colors.borderLight}` }}>
          <FilterLabel>Animale</FilterLabel>
          {pets.length > 0 && (
            <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, marginBottom: petId ? 0 : 8 }}>
              {pets.map(p => (
                <Chip key={p.id} label={`${p.photo} ${p.name}`} active={petId === p.id}
                  onClick={() => { setPetId(petId === p.id ? "" : p.id); setSpecies(""); }} />
              ))}
            </div>
          )}
          {!petId && (
            <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, marginTop: pets.length ? 8 : 0 }}>
              {SPECIES.map(sp => (
                <Chip key={sp} label={sp} active={species === sp}
                  onClick={() => setSpecies(species === sp ? "" : sp)} />
              ))}
            </div>
          )}
        </div>

        {/* Prestazione */}
        <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${colors.borderLight}` }}>
          <FilterLabel>Tipo visita</FilterLabel>
          <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {QUICK_SERVICES.map(s => (
              <Chip key={s.id} label={s.label} active={serviceId === s.id}
                onClick={() => setServiceId(serviceId === s.id ? "" : s.id)} />
            ))}
          </div>
        </div>

        {/* Giorno */}
        <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${colors.borderLight}` }}>
          <FilterLabel>Giorno</FilterLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "oggi",    label: "📅 Oggi" },
              { key: "domani",  label: "📅 Domani" },
              { key: "weekend", label: "📅 Weekend" },
              { key: "",        label: "📅 Tutti" },
            ].map(({ key, label }) => (
              <Chip key={key || "all"} label={label} active={quickDate === key}
                onClick={() => setQuickDate(key)} />
            ))}
          </div>
        </div>

        {/* Orario */}
        <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${colors.borderLight}` }}>
          <FilterLabel>Orario</FilterLabel>
          <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {[
              { key: "any",       label: "Qualsiasi" },
              { key: "morning",   label: "🌅 Mattina 9–12" },
              { key: "afternoon", label: "☀️ Pomeriggio 15–18" },
              { key: "evening",   label: "🌙 Sera dopo 18" },
            ].map(({ key, label }) => (
              <Chip key={key} label={label} active={timeWindow === key}
                onClick={() => setTimeWindow(key)} />
            ))}
          </div>
        </div>

        {/* Zona + Raggio */}
        <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${colors.borderLight}` }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <FilterLabel>Zona</FilterLabel>
              <select value={zone} onChange={e => setZone(e.target.value)}
                style={{ ...selectStyle, width: "100%", fontSize: fontSize.md }}>
                {ROME_ZONES.map(z => <option key={z.key} value={z.key}>{z.label}</option>)}
                <option value="Vicino a me">📍 Vicino a me</option>
              </select>
              {zone === "Vicino a me" && (
                <p style={{ margin: "4px 0 0", fontSize: fontSize.xs, color: colors.textMuted }}>
                  Posizione demo: Roma Centro
                </p>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <FilterLabel>Raggio</FilterLabel>
              <select value={radiusKm} onChange={e => setRadiusKm(Number(e.target.value))}
                style={{ ...selectStyle, width: "100%", fontSize: fontSize.md }}>
                {RADIUS_OPTIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Tipo appuntamento */}
        <div style={{ padding: "14px 16px 12px" }}>
          <FilterLabel>Modalità</FilterLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "any",    label: "Tutti" },
              { key: "clinic", label: "🏥 In clinica" },
              { key: "home",   label: "🏠 A domicilio" },
              { key: "video",  label: "📹 Video" },
            ].map(({ key, label }) => (
              <Chip key={key} label={label} active={appointmentType === key}
                onClick={() => setAppointmentType(key)} />
            ))}
          </div>
        </div>
      </div>

      {/* Ordinamento */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, flexShrink: 0 }}>Ordina per:</span>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ ...selectStyle, flex: 1, fontSize: fontSize.md }}>
          <option value="earliest">Primo disponibile</option>
          <option value="distance">Distanza</option>
          <option value="rating">Rating</option>
          <option value="price">Prezzo</option>
        </select>
      </div>
      <p style={{ fontSize: fontSize.xs, color: colors.textMuted, margin: "0 0 16px", lineHeight: 1.5 }}>
        ℹ️ Nessun risultato sponsorizzato.
      </p>

      {/* Risultati */}
      {slots.length === 0 ? (
        <div>
          <Empty icon="🗓️" text="Nessuno slot disponibile con questi filtri" />
          <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
            <p style={{ fontSize: fontSize.base, color: colors.textMedium, fontWeight: 600, margin: 0 }}>
              Prova a:
            </p>
            {zone !== "Roma" && (
              <Btn variant="light" onClick={() => setZone("Roma")}>🌍 Amplia a tutta Roma</Btn>
            )}
            {radiusKm < 20 && (
              <Btn variant="light" onClick={() => setRadiusKm(20)}>📍 Aumenta raggio a 20 km</Btn>
            )}
            {quickDate !== "" && (
              <Btn variant="light" onClick={() => setQuickDate("")}>📅 Mostra tutte le date</Btn>
            )}
            {timeWindow !== "any" && (
              <Btn variant="light" onClick={() => setTimeWindow("any")}>🕐 Rimuovi filtro orario</Btn>
            )}
            {serviceId && (
              <Btn variant="light" onClick={() => setServiceId("")}>🩺 Rimuovi filtro prestazione</Btn>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: fontSize.md, color: colors.textSecondary, marginBottom: 12, fontWeight: 600 }}>
            {slots.length} slot disponibil{slots.length === 1 ? "e" : "i"}
          </div>
          {visibleDates.map(date => (
            <div key={date} style={{ marginBottom: 24 }}>
              <SectionTitle style={{ marginBottom: 12 }}>{dayGroupLabel(date)}</SectionTitle>
              <div style={{ display: "grid", gap: 12 }}>
                {grouped[date].map(slot => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    onBook={() => onBook(slot)}
                    onViewVet={() => onViewVet(slot.vet)}
                  />
                ))}
              </div>
            </div>
          ))}
          {dates.length > 3 && !showMore && (
            <Btn variant="light" onClick={() => setShowMore(true)} style={{ width: "100%", marginTop: 4 }}>
              Mostra altri {dates.length - 3} giorni →
            </Btn>
          )}
        </>
      )}
    </div>
  );
}
