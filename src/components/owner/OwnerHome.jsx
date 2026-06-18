import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE, TYPE_META } from "../../data/constants.js";
import { today, fmtDate, addDays } from "../../data/helpers.js";
import { getService } from "../../data/services.js";
import { getAllAvailableSlots } from "../../utils/availability.js";
import { colors, fontSize, radius, shadow } from "../../styles/tokens.js";
import Badge from "../ui/Badge.jsx";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import BookingQuickForm from "./BookingQuickForm.jsx";

const QUICK_ACTIONS = [
  { label: "Oggi", filters: { quickDate: "oggi" } },
  { label: "Domani", filters: { quickDate: "domani" } },
  { label: "Weekend", filters: { quickDate: "weekend" } },
  { label: "Urgenza", filters: { serviceId: "sv8" } },
  { label: "Vaccino", filters: { serviceId: "sv9" } },
  { label: "Domicilio", filters: { serviceId: "sv6", appointmentType: "home" } },
];

export default function OwnerHome({ goSearch, goPets, onBookingSearch }) {
  const { appts, pets, vets, vaccines, ownerProfile } = useApp();

  const next = appts
    .filter((a) => ["pending", "confirmed"].includes(a.status) && a.date >= fmtDate(today))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextPet = next && pets.find((p) => p.id === next.petId);
  const nextVet = next && vets.find((v) => v.id === next.vetId);
  const nextSvc = next?.serviceId ? getService(next.serviceId) : null;
  const dueVax = vaccines.filter((v) => v.due && new Date(v.due).getTime() < new Date(addDays(45)).getTime());

  const firstName = ownerProfile.name.split(" ")[0];
  const firstPet = pets[0];
  const recommendedSlots = getAllAvailableSlots({
    vets,
    appts,
    species: firstPet?.species,
    zone: "Roma",
    radiusKm: 10,
    sort: "earliest",
  }).slice(0, 3);

  const quickSearch = (filters) => {
    onBookingSearch({
      petId: firstPet?.id || undefined,
      species: firstPet?.species || undefined,
      zone: "Roma",
      radiusKm: 10,
      timeWindow: "any",
      ...filters,
    });
  };

  return (
    <>
      {/* ── Intestazione ── */}
      <div
        style={{
          marginBottom: 18,
          padding: 18,
          borderRadius: radius.xl,
          color: colors.white,
          background: "linear-gradient(135deg, #0D7E83, #12A0A8)",
          boxShadow: "0 14px 32px rgba(13,126,131,0.22)",
        }}
      >
        <div style={{ fontSize: fontSize.md, opacity: 0.9, fontWeight: 700 }}>Ciao {firstName} 👋</div>
        <h1 style={{ margin: "6px 0 8px", fontSize: 27, fontWeight: 900, lineHeight: 1.12 }}>Prenota senza chiamare</h1>
        <p style={{ margin: "0 0 14px", fontSize: fontSize.base, lineHeight: 1.55, opacity: 0.95 }}>
          Trova subito gli slot liberi per {firstPet?.name || "il tuo animale"}, scegli orario e conferma dall’app.
        </p>
        <Btn variant="accent" onClick={() => quickSearch({})} style={{ width: "100%", minHeight: 50, fontWeight: 900 }}>
          Mostra slot disponibili
        </Btn>
      </div>

      <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18 }}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => quickSearch(action.filters)}
            style={{
              border: `1.5px solid ${colors.borderLight}`,
              background: colors.white,
              color: colors.textMedium,
              borderRadius: radius.pill,
              minHeight: 44,
              padding: "9px 14px",
              fontFamily: "inherit",
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            }}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* ── Quick booking card ── */}
      <div
        style={{
          background: colors.white,
          borderRadius: radius.xl,
          boxShadow: shadow.card,
          border: `1px solid ${colors.borderLight}`,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        {/* Header card */}
        <div
          style={{
            padding: "14px 16px 12px",
            borderBottom: `1px solid ${colors.borderLight}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: colors.bgTealSel,
          }}
        >
          <span style={{ fontSize: 22 }}>🗓️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: fontSize.xl, color: colors.textDark, lineHeight: 1.2 }}>
              Prenota una visita
            </div>
            <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Trova uno slot libero vicino a te</div>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: 16 }}>
          <BookingQuickForm onSearch={onBookingSearch} />
        </div>
      </div>

      {recommendedSlots.length > 0 && (
        <>
          <SectionTitle>Slot consigliati per te</SectionTitle>
          <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
            {recommendedSlots.map((slot) => (
              <Card
                key={slot.id}
                onClick={() => onBookingSearch({ petId: firstPet?.id, serviceId: slot.serviceId, quickDate: "" })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  borderLeft: `4px solid ${TEAL}`,
                }}
              >
                <div style={{ minWidth: 74 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: TEAL }}>{slot.time}</div>
                  <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
                    {slot.date.slice(5).replace("-", "/")}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: colors.textDark }}>
                    {slot.service.emoji} {slot.service.name}
                  </div>
                  <div style={{ fontSize: fontSize.md, color: colors.textSecondary }}>
                    {slot.vet.name} · {slot.zone}
                  </div>
                </div>
                <div style={{ fontWeight: 900, color: ORANGE }}>€{slot.price}</div>
              </Card>
            ))}
          </div>
        </>
      )}

      <Card style={{ marginBottom: 18, background: colors.bgOrangeLight, border: `1px solid ${ORANGE}33` }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 32 }}>🚑</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, color: colors.textDark }}>Emergenza?</div>
            <div style={{ color: colors.textMedium, fontSize: fontSize.md }}>
              Demo: troviamo cliniche aperte o con primo slot urgente.
            </div>
          </div>
        </div>
        <Btn
          variant="accent"
          onClick={() => quickSearch({ serviceId: "sv8", quickDate: "oggi" })}
          style={{ width: "100%", marginTop: 12 }}
        >
          Trova pronto soccorso veterinario vicino
        </Btn>
      </Card>

      {/* ── Prossima visita ── */}
      {next && (
        <>
          <SectionTitle>Prossima visita</SectionTitle>
          <Card style={{ borderLeft: `4px solid ${TEAL}`, marginBottom: 16 }}>
            <div
              style={{
                fontSize: fontSize.xs,
                color: TEAL,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              In programma
            </div>
            <div style={{ fontSize: fontSize["2xl"], fontWeight: 700, margin: "6px 0 4px", color: colors.textDark }}>
              {nextPet?.photo} {nextPet?.name}
            </div>
            <div style={{ fontSize: fontSize.base, color: colors.textSecondary, marginBottom: 4 }}>
              📅 {next.date} ore {next.time}
            </div>
            <div style={{ color: colors.textSecondary, fontSize: fontSize.base }}>
              {nextVet?.name} · {nextSvc ? `${nextSvc.emoji} ${nextSvc.name}` : TYPE_META[next.type]}
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <Badge status={next.status} />
              <span style={{ fontSize: fontSize.sm, color: colors.textMuted }}>📲 Promemoria prima della visita</span>
            </div>
          </Card>
        </>
      )}

      {/* ── Scadenze vaccini ── */}
      {dueVax.length > 0 && (
        <>
          <SectionTitle>Scadenze imminenti</SectionTitle>
          <Card style={{ borderLeft: `4px solid ${ORANGE}`, marginBottom: 16 }}>
            <div
              style={{
                fontSize: fontSize.xs,
                color: ORANGE,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              Vaccini in scadenza
            </div>
            {dueVax.map((v, i) => {
              const pet = pets.find((p) => p.id === v.petId);
              return (
                <div key={i} style={{ fontSize: fontSize.base, paddingVertical: 2, lineHeight: 1.7 }}>
                  💉 <b>{pet?.name}</b>: {v.name}
                  <span style={{ color: ORANGE, fontWeight: 700 }}> · scade il {v.due}</span>
                </div>
              );
            })}
          </Card>
        </>
      )}

      {/* ── Link rapidi ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card onClick={goPets} style={{ textAlign: "center", cursor: "pointer", padding: "18px 12px" }}>
          <div style={{ fontSize: 30, marginBottom: 6 }}>🐾</div>
          <div style={{ fontWeight: 700, color: TEAL, fontSize: fontSize.base }}>I miei animali</div>
        </Card>
        <Card onClick={goSearch} style={{ textAlign: "center", cursor: "pointer", padding: "18px 12px" }}>
          <div style={{ fontSize: 30, marginBottom: 6 }}>👩‍⚕️</div>
          <div style={{ fontWeight: 700, color: TEAL, fontSize: fontSize.base }}>Veterinari</div>
        </Card>
      </div>
    </>
  );
}
