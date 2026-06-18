import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE, TYPE_META } from "../../data/constants.js";
import { today, fmtDate, addDays } from "../../data/helpers.js";
import { getService } from "../../data/services.js";
import { colors, fontSize, radius, shadow } from "../../styles/tokens.js";
import Badge from "../ui/Badge.jsx";
import Card from "../ui/Card.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import BookingQuickForm from "./BookingQuickForm.jsx";

export default function OwnerHome({ goSearch, goPets, onBookingSearch }) {
  const { appts, pets, vets, vaccines, ownerProfile } = useApp();

  const next = appts
    .filter(a => ["pending", "confirmed"].includes(a.status) && a.date >= fmtDate(today))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextPet = next && pets.find(p => p.id === next.petId);
  const nextVet = next && vets.find(v => v.id === next.vetId);
  const nextSvc = next?.serviceId ? getService(next.serviceId) : null;
  const dueVax = vaccines.filter(v => v.due && new Date(v.due).getTime() < new Date(addDays(45)).getTime());

  const firstName = ownerProfile.name.split(" ")[0];

  return (
    <>
      {/* ── Intestazione ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: fontSize.md, color: colors.textMuted, fontWeight: 500 }}>
          Ciao {firstName} 👋
        </div>
        <h1 style={{ margin: "4px 0 6px", fontSize: 24, fontWeight: 800, color: colors.textDark, lineHeight: 1.2 }}>
          Prenota senza chiamare
        </h1>
        <p style={{ margin: 0, fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 1.5 }}>
          Scegli animale, prestazione, zona e orario.<br />
          Ti mostriamo solo gli slot disponibili.
        </p>
      </div>

      {/* ── Quick booking card ── */}
      <div style={{
        background: colors.white,
        borderRadius: radius.xl,
        boxShadow: shadow.card,
        border: `1px solid ${colors.borderLight}`,
        overflow: "hidden",
        marginBottom: 20,
      }}>
        {/* Header card */}
        <div style={{
          padding: "14px 16px 12px",
          borderBottom: `1px solid ${colors.borderLight}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: colors.bgTealSel,
        }}>
          <span style={{ fontSize: 22 }}>🗓️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: fontSize.xl, color: colors.textDark, lineHeight: 1.2 }}>
              Prenota una visita
            </div>
            <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>
              Trova uno slot libero vicino a te
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: 16 }}>
          <BookingQuickForm onSearch={onBookingSearch} />
        </div>
      </div>

      {/* ── Prossima visita ── */}
      {next && (
        <>
          <SectionTitle>Prossima visita</SectionTitle>
          <Card style={{ borderLeft: `4px solid ${TEAL}`, marginBottom: 16 }}>
            <div style={{ fontSize: fontSize.xs, color: TEAL, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
              <span style={{ fontSize: fontSize.sm, color: colors.textMuted }}>
                📲 Promemoria prima della visita
              </span>
            </div>
          </Card>
        </>
      )}

      {/* ── Scadenze vaccini ── */}
      {dueVax.length > 0 && (
        <>
          <SectionTitle>Scadenze imminenti</SectionTitle>
          <Card style={{ borderLeft: `4px solid ${ORANGE}`, marginBottom: 16 }}>
            <div style={{ fontSize: fontSize.xs, color: ORANGE, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Vaccini in scadenza
            </div>
            {dueVax.map((v, i) => {
              const pet = pets.find(p => p.id === v.petId);
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
