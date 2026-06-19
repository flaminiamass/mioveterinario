import { useMemo, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL } from "../../data/constants.js";
import { fmtDate, formatRelativeDateLabel, today } from "../../data/helpers.js";
import { getAllAvailableSlots } from "../../utils/availability.js";
import { RADIUS_OPTIONS, ROME_ZONES } from "../../utils/location.js";
import { colors, fontSize, radius, selectStyle } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Empty from "../ui/Empty.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import SlotCard from "./SlotCard.jsx";
import VetMap from "../map/VetMap.jsx";
import useGeolocation from "../../hooks/useGeolocation.js";

const QUICK_SERVICES = [
  { id: "sv1", label: "🩺 Visita" },
  { id: "sv9", label: "💉 Vaccino" },
  { id: "sv8", label: "🚨 Urgenza" },
  { id: "sv3", label: "🔬 Dermatologia" },
  { id: "sv5", label: "🦴 Ortopedia" },
  { id: "sv6", label: "🏠 Domicilio" },
  { id: "sv7", label: "📹 Video" },
  { id: "c_exotic", label: "🦎 Esotici" },
];

const SPECIES = ["Cane", "Gatto", "Coniglio", "Uccelli", "Rettili", "Altro"];

function buildDateRange(quickDate) {
  const t = new Date(today);
  if (quickDate === "oggi") return [fmtDate(t), fmtDate(t)];
  if (quickDate === "domani") {
    const d = new Date(t);
    d.setDate(t.getDate() + 1);
    return [fmtDate(d), fmtDate(d)];
  }
  if (quickDate === "weekend") {
    const daysUntilSat = (6 - t.getDay() + 7) % 7 || 7;
    const sat = new Date(t);
    sat.setDate(t.getDate() + daysUntilSat);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    return [fmtDate(sat), fmtDate(sun)];
  }
  const end = new Date(t);
  end.setDate(t.getDate() + 10);
  return [fmtDate(t), fmtDate(end)];
}

function groupSlotsByDay(slots) {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 14px",
        minHeight: 44,
        borderRadius: radius.pill,
        border: active ? "none" : `1.5px solid ${colors.borderLight}`,
        cursor: "pointer",
        fontSize: fontSize.md,
        fontWeight: 700,
        flexShrink: 0,
        whiteSpace: "nowrap",
        background: active ? TEAL : colors.white,
        color: active ? colors.white : colors.textMedium,
        fontFamily: "inherit",
        boxShadow: active ? "0 4px 10px rgba(13,126,131,0.22)" : "0 1px 2px rgba(0,0,0,0.05)",
        transition: "transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease",
      }}
    >
      {label}
    </button>
  );
}

function FilterLabel({ children }) {
  return (
    <div
      style={{
        fontSize: fontSize.xs,
        fontWeight: 800,
        color: colors.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function FilterBlock({ title, children }) {
  return (
    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${colors.borderLight}` }}>
      <FilterLabel>{title}</FilterLabel>
      {children}
    </div>
  );
}

export default function BookingSearch({ initialFilters, onBook, onViewVet, onChatVet, onViewAllVets }) {
  const { vets, appts, pets, notify } = useApp();
  const geo = useGeolocation();

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [showMore, setShowMore] = useState(false);

  const selectedPet = pets.find((pet) => pet.id === petId);
  const fallbackPetId = petId || pets[0]?.id || "";
  const effectiveSpecies = selectedPet?.species || species;
  const effectiveServiceId = serviceId === "c_exotic" ? "c_v3_1" : serviceId;
  const searchZone = zone === "Vicino a me" ? geo.coords : zone;
  const dateRange = useMemo(() => buildDateRange(quickDate), [quickDate]);

  const slots = useMemo(
    () =>
      getAllAvailableSlots({
        vets,
        appts,
        serviceId: effectiveServiceId || undefined,
        species: effectiveSpecies || undefined,
        dateRange,
        timeWindow: timeWindow !== "any" ? timeWindow : undefined,
        zone: searchZone || undefined,
        radiusKm: Number(radiusKm),
        type: appointmentType !== "any" ? appointmentType : undefined,
        sort,
      }),
    [
      vets,
      appts,
      effectiveServiceId,
      effectiveSpecies,
      dateRange,
      timeWindow,
      searchZone,
      radiusKm,
      appointmentType,
      sort,
    ]
  );

  const grouped = useMemo(() => groupSlotsByDay(slots), [slots]);
  const dates = Object.keys(grouped).sort();
  const visibleDates = showMore ? dates : dates.slice(0, 3);
  const headline = selectedPet
    ? `${slots.length} slot disponibili per ${selectedPet.name}`
    : zone && zone !== "Roma"
      ? `${slots.length} slot disponibili vicino a ${zone}`
      : `${slots.length} slot disponibili vicino a te`;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: colors.textDark }}>{headline}</h2>
        <p style={{ margin: 0, fontSize: fontSize.base, color: colors.textSecondary }}>
          Cambia filtri: i risultati si aggiornano subito.
        </p>
      </div>

      <div
        style={{
          background: colors.white,
          borderRadius: radius.xl,
          border: `1px solid ${colors.borderLight}`,
          overflow: "hidden",
          boxShadow: "0 8px 28px rgba(15, 23, 42, 0.06)",
          marginBottom: 14,
        }}
      >
        <FilterBlock title="Animale">
          <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            <Chip
              label="Tutti"
              active={!petId && !species}
              onClick={() => {
                setPetId("");
                setSpecies("");
              }}
            />
            {pets.map((pet) => (
              <Chip
                key={pet.id}
                label={`${pet.photo} ${pet.name}`}
                active={petId === pet.id}
                onClick={() => {
                  setPetId(petId === pet.id ? "" : pet.id);
                  setSpecies("");
                }}
              />
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Prestazione">
          <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            <Chip label="Tutte" active={!serviceId} onClick={() => setServiceId("")} />
            {QUICK_SERVICES.map((service) => (
              <Chip
                key={service.id}
                label={service.label}
                active={serviceId === service.id}
                onClick={() => setServiceId(serviceId === service.id ? "" : service.id)}
              />
            ))}
          </div>
          <button
            onClick={() => notify("Demo: richiesta prestazione registrata. La aggiungeremo al catalogo.")}
            style={{
              marginTop: 8,
              padding: 0,
              border: "none",
              background: "transparent",
              color: TEAL,
              fontSize: fontSize.sm,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Non trovi questa prestazione?
          </button>
        </FilterBlock>

        <FilterBlock title="Quando">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "oggi", label: "📅 Oggi" },
              { key: "domani", label: "📅 Domani" },
              { key: "weekend", label: "📅 Weekend" },
              { key: "", label: "📅 Tutti" },
            ].map(({ key, label }) => (
              <Chip key={key || "all"} label={label} active={quickDate === key} onClick={() => setQuickDate(key)} />
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Dove">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 112px", gap: 10 }}>
            <select
              value={zone}
              onChange={(event) => {
                setZone(event.target.value);
                if (event.target.value === "Vicino a me") geo.requestLocation();
              }}
              style={{ ...selectStyle, width: "100%" }}
            >
              {ROME_ZONES.map((romeZone) => (
                <option key={romeZone.key} value={romeZone.key}>
                  {romeZone.label}
                </option>
              ))}
              <option value="Vicino a me">📍 Vicino a me</option>
            </select>
            <select
              value={radiusKm}
              onChange={(event) => setRadiusKm(Number(event.target.value))}
              style={{ ...selectStyle, width: "100%" }}
            >
              {RADIUS_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </FilterBlock>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            width: "100%",
            minHeight: 46,
            border: "none",
            background: colors.bgLighter,
            color: TEAL,
            fontSize: fontSize.base,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {showAdvanced ? "▲ Nascondi filtri avanzati" : "▼ Filtri avanzati"}
        </button>

        {showAdvanced && (
          <div style={{ padding: 16, display: "grid", gap: 14, borderTop: `1px solid ${colors.borderLight}` }}>
            <div>
              <FilterLabel>Modalità</FilterLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { key: "any", label: "Tutti" },
                  { key: "clinic", label: "🏥 Clinica" },
                  { key: "home", label: "🏠 Domicilio" },
                  { key: "video", label: "📹 Video" },
                ].map(({ key, label }) => (
                  <Chip
                    key={key}
                    label={label}
                    active={appointmentType === key}
                    onClick={() => setAppointmentType(key)}
                  />
                ))}
              </div>
            </div>

            <div>
              <FilterLabel>Orario</FilterLabel>
              <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                {[
                  { key: "any", label: "Qualsiasi" },
                  { key: "morning", label: "🌅 Mattina" },
                  { key: "afternoon", label: "☀️ Pomeriggio" },
                  { key: "evening", label: "🌙 Sera dopo 18" },
                ].map(({ key, label }) => (
                  <Chip key={key} label={label} active={timeWindow === key} onClick={() => setTimeWindow(key)} />
                ))}
              </div>
            </div>

            {!petId && (
              <div>
                <FilterLabel>Specie manuale</FilterLabel>
                <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                  {SPECIES.map((sp) => (
                    <Chip
                      key={sp}
                      label={sp}
                      active={species === sp}
                      onClick={() => setSpecies(species === sp ? "" : sp)}
                    />
                  ))}
                </div>
                <button
                  onClick={() => notify("Demo: puoi segnalarci razze mancanti dal profilo animale.")}
                  style={{
                    marginTop: 8,
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    color: TEAL,
                    fontSize: fontSize.sm,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Non trovi la razza?
                </button>
              </div>
            )}

            <div>
              <FilterLabel>Ordinamento</FilterLabel>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                style={{ ...selectStyle, width: "100%" }}
              >
                <option value="earliest">Primo disponibile</option>
                <option value="distance">Distanza</option>
                <option value="rating">Rating</option>
                <option value="price">Prezzo</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <Btn variant={viewMode === "list" ? undefined : "light"} onClick={() => setViewMode("list")}>
          Lista
        </Btn>
        <Btn variant={viewMode === "map" ? undefined : "light"} onClick={() => setViewMode("map")}>
          Mappa demo
        </Btn>
      </div>

      {viewMode === "map" ? (
        <>
          {geo.error && (
            <div style={{ color: colors.warning, fontSize: fontSize.sm, marginBottom: 8 }}>{geo.error}</div>
          )}
          <VetMap
            vets={[...new Map(slots.map((slot) => [slot.vetId, slot.vet])).values()]}
            slots={slots.map((slot) => ({ ...slot, initialPetId: fallbackPetId }))}
            userCoords={zone === "Vicino a me" ? geo.coords : null}
            onBookSlot={(slot) => onBook({ ...slot, initialPetId: fallbackPetId })}
            onViewVet={onViewVet}
          />
        </>
      ) : slots.length === 0 ? (
        <div>
          <Empty icon="🗓️" text="Nessuno slot disponibile con questi filtri" />
          <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
            {radiusKm < 20 && (
              <Btn variant="light" onClick={() => setRadiusKm(20)}>
                📍 Aumenta raggio a 20 km
              </Btn>
            )}
            {quickDate !== "domani" && (
              <Btn variant="light" onClick={() => setQuickDate("domani")}>
                📅 Mostra domani
              </Btn>
            )}
            {timeWindow !== "any" && (
              <Btn variant="light" onClick={() => setTimeWindow("any")}>
                🕐 Rimuovi fascia oraria
              </Btn>
            )}
            {onViewAllVets && (
              <Btn variant="light" onClick={onViewAllVets}>
                👩‍⚕️ Vedi tutti i veterinari
              </Btn>
            )}
            <Btn variant="accent" onClick={() => notify("Demo: ti avviseremo se si libera uno slot.")}>
              🔔 Avvisami se si libera uno slot
            </Btn>
          </div>
        </div>
      ) : (
        <>
          {visibleDates.map((date) => (
            <div key={date} style={{ marginBottom: 24 }}>
              <SectionTitle style={{ marginBottom: 12 }}>{formatRelativeDateLabel(date)}</SectionTitle>
              <div style={{ display: "grid", gap: 12 }}>
                {grouped[date].map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    onBook={() => onBook({ ...slot, initialPetId: fallbackPetId })}
                    onViewVet={() => onViewVet(slot.vet)}
                    onChat={() => onChatVet?.(slot.vet)}
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
