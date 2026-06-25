import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE, TYPE_META } from "../../data/constants.js";
import { fmtDate, formatRelativeDateLabel, today } from "../../data/helpers.js";
import { getFirstAvailableSlot, getNextSlotsForVet } from "../../utils/availability.js";
import { colors, fontSize, radius, searchInputStyle, selectStyle } from "../../styles/tokens.js";
import { isBoosted, canUseOnlineBooking } from "../../data/plans.js";
import Card from "../ui/Card.jsx";
import Stars from "../ui/Stars.jsx";
import Empty from "../ui/Empty.jsx";
import Btn from "../ui/Btn.jsx";
import AvatarImage from "../ui/AvatarImage.jsx";
import { phoneHref } from "../../utils/phone.js";

function fmtSlot(slot) {
  if (!slot) return null;
  return `${formatRelativeDateLabel(slot.date)} ${slot.time}`;
}

function nextWeekendRange() {
  const start = new Date(today);
  const daysUntilSat = (6 - start.getDay() + 7) % 7 || 7;
  start.setDate(start.getDate() + daysUntilSat);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return [fmtDate(start), fmtDate(end)];
}

const ANIMAL_OPTIONS = ["Cane", "Gatto", "Coniglio", "Uccelli", "Rettili"];
const TYPE_OPTIONS = [
  { key: "clinic", label: "🏥 Clinica" },
  { key: "home", label: "🏠 Domicilio" },
  { key: "video", label: "📹 Video" },
];

const P2B_TEXT = {
  rating: "Ordine per valutazione media delle recensioni verificate.",
  price: "Ordine per prezzo base visita in clinica (crescente).",
  availability: "Ordine per primo slot disponibile (più vicino prima).",
  recommended: "Ordine per combinazione valutazione, recensioni e disponibilità.",
};

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px",
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
        boxShadow: active ? "none" : "0 1px 2px rgba(0,0,0,0.06)",
      }}
    >
      {label}
    </button>
  );
}

export default function VetsDirectory({ onView, onBookSlot, onChatVet }) {
  const { vets, appts, pets, notify, isFavoriteVet, toggleFavoriteVet } = useApp();
  const fallbackPetId = pets[0]?.id || "";

  const [q, setQ] = useState("");
  const [animal, setAnimal] = useState("");
  const [types, setTypes] = useState([]);
  const [onlyInstant, setOnlyInstant] = useState(false);
  const [availableToday, setAvailableToday] = useState(false);
  const [availableWeekend, setAvailableWeekend] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sort, setSort] = useState("rating");

  const toggleType = (key) => setTypes(types.includes(key) ? types.filter((t) => t !== key) : [...types, key]);

  const filtered = useMemo(() => {
    const verified = vets.filter((v) => v.status === "verified");
    let r = verified.filter((v) => {
      if (q) {
        const lc = q.toLowerCase();
        if (
          !v.name.toLowerCase().includes(lc) &&
          !v.spec.join(" ").toLowerCase().includes(lc) &&
          !v.city.toLowerCase().includes(lc) &&
          !(v.zone && v.zone.toLowerCase().includes(lc)) &&
          !(v.clinic && v.clinic.toLowerCase().includes(lc))
        )
          return false;
      }
      if (animal && !v.animals.includes(animal)) return false;
      if (types.length && !types.some((t) => v.types.includes(t))) return false;
      if (onlyInstant && !v.autoConfirm) return false;
      if (onlyFavorites && !isFavoriteVet(v.id)) return false;
      return true;
    });

    const withSlot = r.map((v) => ({
      ...v,
      _firstSlot: getFirstAvailableSlot(v, appts, {
        dateRange: availableToday ? [fmtDate(today), fmtDate(today)] : undefined,
      }),
      _nextSlots: getNextSlotsForVet({
        vet: v,
        appts,
        limit: 3,
        ...(availableToday ? { dateRange: [fmtDate(today), fmtDate(today)] } : {}),
      }),
    }));

    const todayStr = fmtDate(today);
    const weekendRange = nextWeekendRange();
    const availabilityFiltered = withSlot.filter((v) => {
      if (availableToday && !v._nextSlots.some((slot) => slot.date === todayStr)) return false;
      if (availableWeekend) {
        const weekendSlots = getNextSlotsForVet({ vet: v, appts, limit: 1, dateRange: weekendRange });
        if (!weekendSlots.length) return false;
      }
      return true;
    });

    if (sort === "rating") availabilityFiltered.sort((a, b) => b.rating - a.rating);
    else if (sort === "price") availabilityFiltered.sort((a, b) => a.fees.clinic - b.fees.clinic);
    else if (sort === "availability") {
      availabilityFiltered.sort((a, b) => {
        if (!a._firstSlot && !b._firstSlot) return 0;
        if (!a._firstSlot) return 1;
        if (!b._firstSlot) return -1;
        const cmp = a._firstSlot.date.localeCompare(b._firstSlot.date);
        return cmp !== 0 ? cmp : a._firstSlot.time.localeCompare(b._firstSlot.time);
      });
    } else {
      const maxR = Math.max(...availabilityFiltered.map((v) => v.reviews || 0), 1);
      availabilityFiltered.sort((a, b) => {
        const boostA = isBoosted(a) ? 0.1 : 0;
        const boostB = isBoosted(b) ? 0.1 : 0;
        const sA = (a.rating / 5) * 0.4 + ((a.reviews || 0) / maxR) * 0.3 + (a._firstSlot ? 0.3 : 0) + boostA;
        const sB = (b.rating / 5) * 0.4 + ((b.reviews || 0) / maxR) * 0.3 + (b._firstSlot ? 0.3 : 0) + boostB;
        return sB - sA;
      });
    }
    return availabilityFiltered;
  }, [
    q,
    animal,
    types,
    onlyInstant,
    onlyFavorites,
    availableToday,
    availableWeekend,
    sort,
    vets,
    appts,
    isFavoriteVet,
  ]);

  return (
    <>
      {/* Intestazione */}
      <h2 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800, color: colors.textDark }}>Veterinari</h2>
      <p style={{ margin: "0 0 16px", fontSize: fontSize.base, color: colors.textSecondary }}>
        Consulta profili, recensioni e disponibilità
      </p>

      {/* Ricerca testuale */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="🔍  Nome, clinica, zona, specializzazione…"
        style={{ ...searchInputStyle, marginBottom: 14 }}
      />

      {/* Filtro animale — sezione separata con label */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: fontSize.xs,
            fontWeight: 700,
            color: colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 6,
          }}
        >
          Animale
        </div>
        <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {ANIMAL_OPTIONS.map((a) => (
            <FilterChip key={a} label={a} active={animal === a} onClick={() => setAnimal(animal === a ? "" : a)} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: fontSize.xs,
            fontWeight: 700,
            color: colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 6,
          }}
        >
          Disponibilità
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <FilterChip label="⚡ Conferma immediata" active={onlyInstant} onClick={() => setOnlyInstant(!onlyInstant)} />
          <FilterChip
            label="♥ Solo preferiti"
            active={onlyFavorites}
            onClick={() => setOnlyFavorites(!onlyFavorites)}
          />
          <FilterChip
            label="📅 Disponibile oggi"
            active={availableToday}
            onClick={() => setAvailableToday(!availableToday)}
          />
          <FilterChip
            label="🏖️ Weekend"
            active={availableWeekend}
            onClick={() => setAvailableWeekend(!availableWeekend)}
          />
        </div>
      </div>

      {/* Filtro tipo visita — sezione separata con label */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: fontSize.xs,
            fontWeight: 700,
            color: colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 6,
          }}
        >
          Tipo visita
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TYPE_OPTIONS.map((t) => (
            <FilterChip key={t.key} label={t.label} active={types.includes(t.key)} onClick={() => toggleType(t.key)} />
          ))}
        </div>
      </div>

      {/* Ordinamento + nota P2B */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <select
          style={{ ...selectStyle, fontSize: fontSize.md, flex: 1 }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="rating">Ordina: rating</option>
          <option value="price">Ordina: prezzo</option>
          <option value="availability">Ordina: prima disponibilità</option>
          <option value="recommended">Ordina: raccomandati</option>
        </select>
      </div>
      <p style={{ fontSize: fontSize.xs, color: colors.textMuted, margin: "0 0 16px", lineHeight: 1.5 }}>
        ℹ️ {P2B_TEXT[sort]} Nessun risultato sponsorizzato.
      </p>

      {/* Lista veterinari */}
      <div style={{ display: "grid", gap: 16 }}>
        {filtered.length === 0 && <Empty icon="🔍" text="Nessun veterinario trovato con questi filtri" />}

        {filtered.map((v) => (
          <Card key={v.id} style={{ padding: 0, overflow: "hidden" }}>
            {/* Header card: avatar + info principali + prezzo */}
            <div style={{ padding: "16px 16px 12px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              {/* Avatar */}
              <AvatarImage src={v.avatar} emoji={v.avatar} name={v.name} size={52} rounded="rounded" />

              {/* Testo principale */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: fontSize.xl, color: colors.textDark, lineHeight: 1.3 }}>
                      {v.name}
                    </div>
                    <div style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: 1 }}>{v.clinic}</div>
                    <div style={{ fontSize: fontSize.md, color: colors.textMuted, marginTop: 1 }}>
                      📍 {v.zone || v.city}
                    </div>
                  </div>
                  {/* Prezzo */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <button
                      onClick={() => toggleFavoriteVet(v.id)}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 22,
                        color: ORANGE,
                      }}
                      aria-label={isFavoriteVet(v.id) ? "Rimuovi dai preferiti" : "Salva nei preferiti"}
                    >
                      {isFavoriteVet(v.id) ? "♥" : "♡"}
                    </button>
                    <div style={{ fontWeight: 800, color: ORANGE, fontSize: 18, lineHeight: 1 }}>€{v.fees.clinic}</div>
                    <div style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 }}>visita</div>
                  </div>
                </div>

                {/* Rating */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <Stars n={v.rating} />
                  <span style={{ fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: 600 }}>
                    {v.rating}
                  </span>
                  <span style={{ fontSize: fontSize.sm, color: colors.textMuted }}>({v.reviews} recensioni)</span>
                  <span
                    style={{
                      fontSize: fontSize.xs,
                      color: TEAL,
                      fontWeight: 700,
                      background: colors.bgTealLight,
                      padding: "2px 7px",
                      borderRadius: radius.md,
                      marginLeft: 2,
                    }}
                  >
                    ✓ Verificato
                  </span>
                  {isBoosted(v) && (
                    <span
                      style={{
                        fontSize: fontSize.xs,
                        color: "#7C3AED",
                        fontWeight: 700,
                        background: "#F3E8FF",
                        padding: "2px 7px",
                        borderRadius: radius.md,
                      }}
                    >
                      🏆 Premium
                    </span>
                  )}
                  {canUseOnlineBooking(v) && (
                    <span
                      style={{
                        fontSize: fontSize.xs,
                        color: colors.success,
                        fontWeight: 700,
                        background: "#D1FAE5",
                        padding: "2px 7px",
                        borderRadius: radius.md,
                      }}
                    >
                      📅 Online
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Separatore */}
            <div style={{ height: 1, background: colors.borderLight, margin: "0 16px" }} />

            {/* Specializzazioni + badge tipo */}
            <div style={{ padding: "10px 16px", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {v.spec.map((s) => (
                <span
                  key={s}
                  style={{
                    background: colors.bgBtn,
                    color: colors.textMedium,
                    fontSize: fontSize.xs,
                    padding: "3px 9px",
                    borderRadius: radius.md,
                    fontWeight: 600,
                  }}
                >
                  {s}
                </span>
              ))}
              {v.types.map((t) => (
                <span
                  key={t}
                  style={{
                    background: colors.bgOrangeLight,
                    color: ORANGE,
                    fontSize: fontSize.xs,
                    padding: "3px 9px",
                    borderRadius: radius.md,
                    fontWeight: 600,
                  }}
                >
                  {TYPE_META[t]}
                </span>
              ))}
            </div>

            {/* Prossimi slot */}
            <div style={{ padding: "0 16px 12px" }}>
              {v._nextSlots && v._nextSlots.length > 0 ? (
                <>
                  <div
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: 700,
                      color: colors.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginBottom: 6,
                    }}
                  >
                    Prossimi slot disponibili
                  </div>
                  <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                    {v._nextSlots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => onBookSlot({ ...slot, initialPetId: fallbackPetId })}
                        style={{
                          padding: "7px 12px",
                          borderRadius: radius.pill,
                          border: `1.5px solid ${TEAL}`,
                          background: colors.bgTealSel,
                          color: TEAL,
                          fontSize: fontSize.sm,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          minHeight: 36,
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        📅 {fmtSlot(slot)} · €{slot.price}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: fontSize.sm, color: colors.textMuted, fontStyle: "italic" }}>
                  Nessuno slot nei prossimi 21 giorni
                </div>
              )}
            </div>

            {/* Separatore */}
            <div style={{ height: 1, background: colors.borderLight }} />

            {/* CTA */}
            <div style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
              {v._firstSlot ? (
                <Btn
                  variant="accent"
                  onClick={() => onBookSlot({ ...v._firstSlot, initialPetId: fallbackPetId })}
                  style={{ flex: 2, fontSize: fontSize.md, minHeight: 44 }}
                >
                  Prenota {v._firstSlot.time}
                </Btn>
              ) : null}
              <Btn
                variant="light"
                onClick={() => onView(v)}
                style={{ flex: v._firstSlot ? 1 : 2, fontSize: fontSize.md, minHeight: 44 }}
              >
                Vedi profilo
              </Btn>
            </div>
            <div style={{ padding: "0 16px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {phoneHref(v.phone) ? (
                <Btn small variant="light" onClick={() => (window.location.href = phoneHref(v.phone))}>
                  ☎ Chiama ora
                </Btn>
              ) : (
                <Btn small variant="light" disabled>
                  Numero non disponibile
                </Btn>
              )}
              <Btn small variant="light" onClick={() => onChatVet?.(v)}>
                💬 Chat
              </Btn>
            </div>
          </Card>
        ))}
      </div>
      <Btn
        variant="light"
        onClick={() => notify("Demo: grazie, registriamo la segnalazione della clinica.")}
        style={{ width: "100%", marginTop: 14 }}
      >
        Segnala una clinica
      </Btn>
    </>
  );
}
