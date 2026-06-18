import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL } from "../../data/constants.js";
import { ROME_ZONES, RADIUS_OPTIONS } from "../../utils/location.js";
import { colors, fontSize, radius, selectStyle } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";

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

const QUICK_DAYS = [
  { key: "oggi",    label: "Oggi" },
  { key: "domani",  label: "Domani" },
  { key: "weekend", label: "Weekend" },
  { key: "",        label: "Qualsiasi" },
];

const QUICK_TIMES = [
  { key: "any",       label: "Qualsiasi" },
  { key: "morning",   label: "Mattina" },
  { key: "afternoon", label: "Pomeriggio" },
  { key: "evening",   label: "Sera" },
];

const label = (text) => ({
  display: "block",
  fontSize: fontSize.xs,
  fontWeight: 700,
  color: colors.textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 6,
});

const chipBase = (active) => ({
  padding: "8px 14px",
  minHeight: 38,
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
  transition: "background 0.15s, color 0.15s",
});

const divider = {
  height: 1,
  background: colors.borderLight,
  margin: "0 -16px",
};

export default function BookingQuickForm({ onSearch }) {
  const { pets } = useApp();

  const [petId, setPetId] = useState(pets[0]?.id || "");
  const [serviceId, setServiceId] = useState("sv1");
  const [quickDate, setQuickDate] = useState("domani");
  const [timeWindow, setTimeWindow] = useState("any");
  const [zone, setZone] = useState("Roma");
  const [radiusKm, setRadiusKm] = useState(5);

  const selectedPet = pets.find(p => p.id === petId);
  const species = selectedPet?.species || "";

  const handleSearch = () => {
    onSearch({
      petId: petId || undefined,
      species: species || undefined,
      serviceId: serviceId || undefined,
      quickDate,
      timeWindow,
      zone,
      radiusKm: Number(radiusKm),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── ANIMALE ── */}
      <div style={{ paddingBottom: 14 }}>
        <span style={label("Il tuo animale")}>Il tuo animale</span>
        {pets.length > 0 ? (
          <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {pets.map(p => (
              <button key={p.id} onClick={() => setPetId(petId === p.id ? "" : p.id)}
                style={chipBase(petId === p.id)}>
                {p.photo} {p.name}
              </button>
            ))}
          </div>
        ) : (
          <select style={{ ...selectStyle, width: "100%" }} value={petId} onChange={e => setPetId(e.target.value)}>
            <option value="">Seleziona specie…</option>
            {["Cane", "Gatto", "Coniglio", "Uccelli", "Rettili"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      <div style={divider} />

      {/* ── TIPO VISITA ── */}
      <div style={{ paddingTop: 14, paddingBottom: 14 }}>
        <span style={label("Tipo visita")}>Tipo visita</span>
        <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {QUICK_SERVICES.map(s => (
            <button key={s.id} onClick={() => setServiceId(serviceId === s.id ? "" : s.id)}
              style={chipBase(serviceId === s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={divider} />

      {/* ── GIORNO ── */}
      <div style={{ paddingTop: 14, paddingBottom: 14 }}>
        <span style={label("Giorno")}>Giorno</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {QUICK_DAYS.map(d => (
            <button key={d.key || "any"} onClick={() => setQuickDate(d.key)}
              style={chipBase(quickDate === d.key)}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div style={divider} />

      {/* ── ORARIO ── */}
      <div style={{ paddingTop: 14, paddingBottom: 14 }}>
        <span style={label("Orario")}>Orario</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {QUICK_TIMES.map(t => (
            <button key={t.key} onClick={() => setTimeWindow(t.key)}
              style={chipBase(timeWindow === t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={divider} />

      {/* ── ZONA + RAGGIO ── */}
      <div style={{ paddingTop: 14, paddingBottom: 16 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <span style={label("Zona")}>Zona</span>
            <select value={zone} onChange={e => setZone(e.target.value)}
              style={{ ...selectStyle, width: "100%", fontSize: fontSize.md }}>
              {ROME_ZONES.map(z => <option key={z.key} value={z.key}>{z.label}</option>)}
              <option value="Vicino a me">📍 Vicino a me</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <span style={label("Raggio")}>Raggio</span>
            <select value={radiusKm} onChange={e => setRadiusKm(Number(e.target.value))}
              style={{ ...selectStyle, width: "100%", fontSize: fontSize.md }}>
              {RADIUS_OPTIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
        </div>
        {zone === "Vicino a me" && (
          <p style={{ margin: "6px 0 0", fontSize: fontSize.xs, color: colors.textMuted }}>
            📍 Posizione demo: Roma Centro (prototipo)
          </p>
        )}
      </div>

      {/* ── CTA ── */}
      <Btn
        variant="accent"
        onClick={handleSearch}
        style={{ width: "100%", fontSize: fontSize.lg, fontWeight: 800, minHeight: 52, borderRadius: radius.lg }}
      >
        Mostra slot disponibili →
      </Btn>
    </div>
  );
}
