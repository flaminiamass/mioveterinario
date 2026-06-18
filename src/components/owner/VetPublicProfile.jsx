import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE, TYPE_META } from "../../data/constants.js";
import { SERVICE_CATEGORIES, getVetServices } from "../../data/services.js";
import { colors, fontSize, radius } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import Stars from "../ui/Stars.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";

const CAT_EMOJI = { Visite: "🩺", Vaccini: "💉", Analisi: "🩸", Diagnostica: "📷", Chirurgia: "🏥", Altro: "📋" };

export default function VetPublicProfile({ vet, onBack, onBook }) {
  const { reviews } = useApp();
  const vetReviews = reviews.filter(r => r.vetId === vet.id);

  /* Servizi del vet raggruppati per categoria */
  const vetServices = getVetServices(vet);
  const availableCats = SERVICE_CATEGORIES.filter(c => vetServices.some(s => s.cat === c));
  const [openCat, setOpenCat] = useState(null);

  return (
    <>
      <Btn small variant="light" onClick={onBack}>← Indietro</Btn>
      <Card style={{ marginTop: 12, textAlign: "center" }}>
        <div style={{ fontSize: 56 }}>{vet.avatar}</div>
        <h2 style={{ margin: "8px 0 2px" }}>{vet.name}</h2>
        <div style={{ color: colors.textSecondary }}>{vet.clinic}</div>
        <div style={{ margin: "6px 0" }}><Stars n={vet.rating} /> <b>{vet.rating}</b> · {vet.reviews} recensioni</div>
        <div style={{ fontSize: fontSize.base, color: colors.textMedium, margin: "10px 0", textAlign: "left" }}>{vet.bio}</div>
        <div style={{ fontSize: fontSize.md, color: colors.textSecondary }}>📍 {vet.address}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
          {vet.types.map(t => <span key={t} style={{ background: colors.bgOrangeLight, color: ORANGE, fontSize: fontSize.sm, padding: "4px 10px", borderRadius: radius.md, fontWeight: 600 }}>{TYPE_META[t]}</span>)}
        </div>
        <Btn variant="accent" onClick={onBook} style={{ marginTop: 16, width: "100%" }}>Prenota una visita</Btn>
      </Card>

      {/* Listino servizi */}
      <SectionTitle style={{ marginTop: 20 }}>Prestazioni e prezzi</SectionTitle>
      <div style={{ display: "grid", gap: 6 }}>
        {availableCats.map(cat => {
          const catServices = vetServices.filter(s => s.cat === cat);
          const isOpen = openCat === cat;
          return (
            <div key={cat} style={{ borderRadius: radius.lg, border: `1px solid ${colors.borderLight}`, overflow: "hidden" }}>
              <button onClick={() => setOpenCat(isOpen ? null : cat)} style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 14px", background: isOpen ? colors.bgTealSel : colors.white,
                border: "none", cursor: "pointer", fontFamily: "inherit",
              }}>
                <span style={{ fontWeight: 700, fontSize: fontSize.base, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{CAT_EMOJI[cat]}</span> {cat}
                  <span style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 400 }}>({catServices.length})</span>
                </span>
                <span style={{ fontSize: 14, color: isOpen ? TEAL : colors.textMuted, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </button>
              {isOpen && (
                <div style={{ borderTop: `1px solid ${colors.divider}` }}>
                  {catServices.map(s => (
                    <div key={s.id} style={{ padding: "10px 14px", borderBottom: `1px solid ${colors.divider}`, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: fontSize.base }}>{s.name}</div>
                        {s.desc && <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>{s.desc}</div>}
                        <div style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>⏱ ~{s.duration} min</div>
                      </div>
                      <b style={{ color: ORANGE, fontSize: fontSize.xl }}>€{s.price}</b>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recensioni — HIGH fix: distinzione verificata/non verificata */}
      <SectionTitle style={{ marginTop: 20 }}>Recensioni</SectionTitle>
      {/* Nota trasparenza recensioni — art. 22(5-bis) Cod. Consumo */}
      <p style={{ fontSize: fontSize.xs, color: colors.textMuted, margin: "0 0 10px", lineHeight: 1.5 }}>
        Le recensioni <b>verificate ✓</b> provengono da utenti che hanno prenotato e completato una visita tramite MioVeterinario. Le recensioni senza indicazione non sono state verificate in questa versione demo. [TODO — implementare verifica tecnica prima del go-live]
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {vetReviews.map(r => {
          const isVerified = !!r.apptId;
          return (
            <Card key={r.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <b style={{ fontSize: fontSize.base }}>{r.author}</b>
                  {isVerified && (
                    <span style={{ marginLeft: 8, fontSize: fontSize.xs, background: colors.bgTealSel, color: TEAL, borderRadius: radius.sm, padding: "2px 6px", fontWeight: 700 }}>✓ Verificata</span>
                  )}
                  {!isVerified && (
                    <span style={{ marginLeft: 8, fontSize: fontSize.xs, background: colors.bgLighter, color: colors.textMuted, borderRadius: radius.sm, padding: "2px 6px" }}>Non verificata</span>
                  )}
                </div>
                <span style={{ fontSize: fontSize.sm, color: colors.textMuted }}>{r.date}</span>
              </div>
              <Stars n={r.rating} />
              <div style={{ fontSize: fontSize.base, marginTop: 4 }}>{r.comment}</div>
              {r.reply && <div style={{ marginTop: 8, background: colors.bgTealSel, padding: "8px 10px", borderRadius: radius.md, fontSize: fontSize.md }}><b style={{ color: TEAL }}>Risposta del veterinario:</b> {r.reply}</div>}
            </Card>
          );
        })}
      </div>
    </>
  );
}
