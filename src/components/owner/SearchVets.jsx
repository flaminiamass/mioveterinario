import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE, TYPE_META } from "../../data/constants.js";
import { today, fmtDate } from "../../data/helpers.js";
import { getFirstAvailableSlot, hasAvailabilityInRange } from "../../data/availability.js";
import { colors, fontSize, radius, selectStyle, searchInputStyle, compactInputStyle } from "../../styles/tokens.js";
import Card from "../ui/Card.jsx";
import Stars from "../ui/Stars.jsx";
import Empty from "../ui/Empty.jsx";
import ToggleChips from "../ui/ToggleChips.jsx";
import ServiceSearch from "./ServiceSearch.jsx";

/* Emoji per i nomi dei giorni abbreviati */
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

/* Testo P2B per ciascun ordinamento */
const P2B_TEXT = {
  rating: "ℹ️ Ordine per valutazione media delle recensioni verificate. Nessun risultato sponsorizzato.",
  price: "ℹ️ Ordine per prezzo base della visita in clinica (crescente). Nessun risultato sponsorizzato.",
  availability: "ℹ️ Ordine per primo slot disponibile (più vicino prima). Nessun risultato sponsorizzato.",
  recommended:
    "ℹ️ Ordine per combinazione di valutazione, numero di recensioni e disponibilità prossima. Nessun risultato sponsorizzato.",
};

export default function SearchVets({ onView, onBookService, initialMode }) {
  const { vets, appts } = useApp();

  /* Sub-tab: per veterinario / per servizio */
  const [mode, setMode] = useState(initialMode || "vet");

  /* Filtri */
  const [q, setQ] = useState("");
  const [quickDate, setQuickDate] = useState(""); // "oggi"|"domani"|"weekend"|""
  const [types, setTypes] = useState([]); // multi-select: clinic, home, video
  const [animal, setAnimal] = useState([]); // single-select (con deselect)
  const [specs, setSpecs] = useState([]); // multi-select specializzazioni
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState("rating");
  const [showFilters, setShowFilters] = useState(false); // accordion filtri avanzati

  /* Specializzazioni uniche tra tutti i vet verificati */
  const allSpecs = useMemo(() => {
    const set = new Set();
    vets.filter((v) => v.status === "verified").forEach((v) => v.spec.forEach((s) => set.add(s)));
    return [...set].sort();
  }, [vets]);

  /* Range date per quickDate */
  const dateRange = useMemo(() => {
    const t = new Date(today);
    const todayStr = fmtDate(t);
    const tomorrow = new Date(t);
    tomorrow.setDate(t.getDate() + 1);
    const tomorrowStr = fmtDate(tomorrow);
    // Weekend: prossimo sabato e domenica
    const daysUntilSat = (6 - t.getDay() + 7) % 7 || 7;
    const sat = new Date(t);
    sat.setDate(t.getDate() + daysUntilSat);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    return {
      oggi: [todayStr, todayStr],
      domani: [tomorrowStr, tomorrowStr],
      weekend: [fmtDate(sat), fmtDate(sun)],
    };
  }, []);

  /* Filtraggio e ordinamento */
  const filtered = useMemo(() => {
    const verified = vets.filter((v) => v.status === "verified");

    let r = verified.filter((v) => {
      // Testo libero
      if (q) {
        const lc = q.toLowerCase();
        const match =
          v.name.toLowerCase().includes(lc) ||
          v.spec.join(" ").toLowerCase().includes(lc) ||
          v.city.toLowerCase().includes(lc) ||
          (v.zone && v.zone.toLowerCase().includes(lc));
        if (!match) return false;
      }
      // Animale
      if (animal.length && !animal.some((a) => v.animals.includes(a))) return false;
      // Tipo visita (multi-select: vet deve avere almeno uno dei tipi selezionati)
      if (types.length && !types.some((t) => v.types.includes(t))) return false;
      // Specializzazioni (multi-select: vet deve avere almeno una delle spec selezionate)
      if (specs.length && !specs.some((s) => v.spec.includes(s))) return false;
      // Range prezzo
      if (priceMin && v.fees.clinic < Number(priceMin)) return false;
      if (priceMax && v.fees.clinic > Number(priceMax)) return false;
      // Quick date
      if (quickDate && dateRange[quickDate]) {
        const [start, end] = dateRange[quickDate];
        if (!hasAvailabilityInRange(v, appts, start, end)) return false;
      }
      return true;
    });

    /* Calcola primo slot per ogni vet filtrato (usato da card e sort) */
    const withSlot = r.map((v) => ({
      ...v,
      _firstSlot: getFirstAvailableSlot(v, appts),
    }));

    /* Ordinamento */
    if (sort === "rating") withSlot.sort((a, b) => b.rating - a.rating);
    else if (sort === "price") withSlot.sort((a, b) => a.fees.clinic - b.fees.clinic);
    else if (sort === "availability") {
      withSlot.sort((a, b) => {
        if (!a._firstSlot && !b._firstSlot) return 0;
        if (!a._firstSlot) return 1;
        if (!b._firstSlot) return -1;
        const cmp = a._firstSlot.date.localeCompare(b._firstSlot.date);
        return cmp !== 0 ? cmp : a._firstSlot.time.localeCompare(b._firstSlot.time);
      });
    } else if (sort === "recommended") {
      const maxReviews = Math.max(...withSlot.map((v) => v.reviews || 0), 1);
      withSlot.sort((a, b) => {
        const scoreA = (a.rating / 5) * 0.4 + ((a.reviews || 0) / maxReviews) * 0.3 + (a._firstSlot ? 0.3 : 0);
        const scoreB = (b.rating / 5) * 0.4 + ((b.reviews || 0) / maxReviews) * 0.3 + (b._firstSlot ? 0.3 : 0);
        return scoreB - scoreA;
      });
    }

    return withSlot;
  }, [q, animal, types, specs, priceMin, priceMax, quickDate, sort, vets, appts, dateRange]);

  /* Formatta primo slot per la card */
  const fmtSlot = (slot) => {
    if (!slot) return null;
    const d = new Date(slot.date);
    return `${DAY_SHORT[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1} ore ${slot.time}`;
  };

  /* Sub-tab: Per servizio */
  if (mode === "service") {
    return (
      <>
        {/* Sub-tab switcher */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 14,
            borderRadius: radius.lg,
            overflow: "hidden",
            border: `1px solid ${colors.borderLight}`,
          }}
        >
          <button
            onClick={() => setMode("vet")}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: fontSize.base,
              fontFamily: "inherit",
              background: colors.white,
              color: colors.textMedium,
            }}
          >
            🔍 Per veterinario
          </button>
          <button
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",
              cursor: "default",
              fontWeight: 700,
              fontSize: fontSize.base,
              fontFamily: "inherit",
              background: TEAL,
              color: colors.white,
            }}
          >
            💊 Per servizio
          </button>
        </div>
        <ServiceSearch onBook={onBookService} />
      </>
    );
  }

  return (
    <>
      {/* Sub-tab switcher */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 14,
          borderRadius: radius.lg,
          overflow: "hidden",
          border: `1px solid ${colors.borderLight}`,
        }}
      >
        <button
          style={{
            flex: 1,
            padding: "10px 0",
            border: "none",
            cursor: "default",
            fontWeight: 700,
            fontSize: fontSize.base,
            fontFamily: "inherit",
            background: TEAL,
            color: colors.white,
          }}
        >
          🔍 Per veterinario
        </button>
        <button
          onClick={() => setMode("service")}
          style={{
            flex: 1,
            padding: "10px 0",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: fontSize.base,
            fontFamily: "inherit",
            background: colors.white,
            color: colors.textMedium,
          }}
        >
          💊 Per servizio
        </button>
      </div>

      {/* Barra ricerca */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Nome, specializzazione, città o zona…"
        style={searchInputStyle}
      />

      {/* Quick date chips */}
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        {[
          { key: "oggi", label: "📅 Oggi" },
          { key: "domani", label: "📅 Domani" },
          { key: "weekend", label: "📅 Weekend" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setQuickDate(quickDate === key ? "" : key)}
            style={{
              padding: "7px 12px",
              minHeight: 36,
              borderRadius: radius.pill,
              border: "none",
              cursor: "pointer",
              fontSize: fontSize.md,
              fontWeight: 600,
              background: quickDate === key ? ORANGE : colors.bgBtn,
              color: quickDate === key ? colors.white : colors.textMedium,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tipo visita — toggle buttons */}
      <div style={{ marginTop: 10 }}>
        <ToggleChips
          options={[
            { key: "clinic", label: "🏥 Clinica" },
            { key: "home", label: "🏠 Domicilio" },
            { key: "video", label: "📹 Video" },
          ]}
          active={types}
          onChange={setTypes}
        />
      </div>

      {/* Animale — single-select pill chips */}
      <ToggleChips
        options={["Cane", "Gatto", "Coniglio", "Uccelli", "Rettili"].map((a) => ({ key: a, label: a }))}
        active={animal}
        onChange={setAnimal}
        single
      />

      {/* Filtri avanzati (accordion) */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: fontSize.md,
          color: TEAL,
          fontWeight: 600,
          padding: "4px 0",
          marginTop: 2,
        }}
      >
        {showFilters ? "▲ Meno filtri" : "▼ Più filtri (specializzazione, prezzo)"}
      </button>

      {showFilters && (
        <div style={{ marginTop: 6 }}>
          {/* Specializzazioni */}
          {allSpecs.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 4, fontWeight: 600 }}>
                Specializzazione
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  overflowX: "auto",
                  paddingBottom: 4,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {allSpecs.map((s) => {
                  const on = specs.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => setSpecs(on ? specs.filter((x) => x !== s) : [...specs, s])}
                      style={{
                        padding: "5px 10px",
                        borderRadius: radius.pill,
                        border: "none",
                        cursor: "pointer",
                        fontSize: fontSize.sm,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        background: on ? colors.bgTealLight : colors.bgBtn,
                        color: on ? TEAL : colors.textMedium,
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Range prezzo */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>Prezzo</span>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Da €"
              style={{ ...compactInputStyle, width: 80 }}
              min={0}
            />
            <span style={{ color: colors.textMuted }}>—</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="A €"
              style={{ ...compactInputStyle, width: 80 }}
              min={0}
            />
          </div>
        </div>
      )}

      {/* Ordinamento */}
      <div style={{ marginTop: 10 }}>
        <select style={selectStyle} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="rating">Ordina: rating</option>
          <option value="price">Ordina: prezzo</option>
          <option value="availability">Ordina: prima disponibilità</option>
          <option value="recommended">Ordina: raccomandati</option>
        </select>
      </div>

      {/* Trasparenza ranking — P2B Reg. UE 2019/1150 */}
      <p style={{ fontSize: fontSize.xs, color: colors.textMuted, margin: "8px 0 0", lineHeight: 1.5 }}>
        {P2B_TEXT[sort]}
      </p>

      {/* Risultati */}
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {filtered.length === 0 && <Empty icon="🔍" text="Nessun veterinario trovato con questi filtri" />}
        {filtered.map((v) => (
          <Card key={v.id} onClick={() => onView(v)}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ fontSize: 40 }}>{v.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: fontSize.xl }}>
                  {v.name}{" "}
                  <span
                    style={{
                      fontSize: fontSize.xs,
                      color: TEAL,
                      fontWeight: 600,
                      background: colors.bgTealLight,
                      padding: "2px 7px",
                      borderRadius: radius.md,
                    }}
                  >
                    ✓ Verificato
                  </span>
                </div>
                <div style={{ color: colors.textSecondary, fontSize: fontSize.md }}>
                  {v.clinic} · {v.city}
                  {v.zone ? ` · ${v.zone}` : ""}
                </div>
                <div style={{ marginTop: 4 }}>
                  <Stars n={v.rating} />{" "}
                  <span style={{ fontSize: fontSize.md, color: colors.textSecondary }}>
                    {v.rating} ({v.reviews} recensioni)
                  </span>
                </div>

                {/* Primo slot disponibile */}
                <div style={{ marginTop: 4, fontSize: fontSize.sm }}>
                  {v._firstSlot ? (
                    <span style={{ color: TEAL, fontWeight: 600 }}>📅 Prossimo slot: {fmtSlot(v._firstSlot)}</span>
                  ) : (
                    <span style={{ color: colors.textMuted }}>Nessuno slot nei prossimi 21gg</span>
                  )}
                </div>

                {/* Specializzazioni */}
                <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {v.spec.map((s) => (
                    <span
                      key={s}
                      style={{
                        background: specs.includes(s) ? colors.bgTealLight : colors.bgBtn,
                        color: specs.includes(s) ? TEAL : colors.textMedium,
                        fontSize: fontSize.xs,
                        padding: "3px 8px",
                        borderRadius: radius.md,
                        fontWeight: 600,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Badge modalità visita */}
                <div style={{ marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {v.types.map((t) => (
                    <span
                      key={t}
                      style={{
                        background: colors.bgOrangeLight,
                        color: ORANGE,
                        fontSize: fontSize.xs,
                        padding: "2px 7px",
                        borderRadius: radius.sm,
                        fontWeight: 600,
                      }}
                    >
                      {TYPE_META[t]}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, color: ORANGE, fontSize: fontSize["2xl"] }}>€{v.fees.clinic}</div>
                <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>visita</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
