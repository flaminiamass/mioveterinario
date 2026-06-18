import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE, SLOT_TIMES } from "../../data/constants.js";
import { addDays } from "../../data/helpers.js";
import { SERVICE_CATEGORIES, getTypeFromService, getVetServices } from "../../data/services.js";
import { colors, fontSize, radius, inputStyle } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";

/* Emoji per ogni categoria */
const CAT_EMOJI = { Visite: "🩺", Vaccini: "💉", Analisi: "🩸", Diagnostica: "📷", Chirurgia: "🏥", Altro: "📋" };

export default function BookingFlow({ vet, onDone, onCancel }) {
  const { pets, appts, setAppts } = useApp();
  /* Ordine step: Animale → Prestazione → Orario → Conferma → Fatto */
  const [step, setStep] = useState(1);
  const [petId, setPetId] = useState(pets[0]?.id || "");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  /* Accordion: quale categoria è aperta */
  const [openCat, setOpenCat] = useState(null);

  /* Servizi disponibili per questo vet (con prezzi personalizzati) */
  const vetServices = getVetServices(vet);
  const service = vetServices.find(s => s.id === serviceId);
  const type = service ? getTypeFromService(serviceId) : "clinic";

  /* Filtra servizi compatibili con il vet (home/video) */
  const availableServices = vetServices.filter(s => {
    const sType = getTypeFromService(s.id);
    return vet.types.includes(sType);
  });

  /* Categorie che hanno almeno un servizio disponibile */
  const availableCats = SERVICE_CATEGORIES.filter(c => availableServices.some(s => s.cat === c));

  /* Giorni disponibili */
  const allDays = Array.from({ length: 21 }, (_, i) => addDays(i + 1));
  const days = allDays.filter(d => {
    const dayOfWeek = new Date(d).getDay();
    return !vet.workDays || vet.workDays.includes(dayOfWeek);
  }).slice(0, 10);

  const takenSlots = appts.filter(a => a.vetId === vet.id && a.date === date && a.status !== "cancelled").map(a => a.time);
  const freeSlots = SLOT_TIMES.filter(t => !takenSlots.includes(t));

  const confirm = () => {
    setAppts([...appts, {
      id: "a" + Date.now(), petId, vetId: vet.id, date, time, type,
      serviceId, status: "pending", ownerNotes: notes, vetNotes: "", proposal: null,
      createdAt: new Date().toISOString(),
    }]);
    setStep(5);
  };

  const stepDot = (n, lbl) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
      <div style={{ width: 28, height: 28, borderRadius: radius.circle, background: step >= n ? TEAL : colors.borderLight, color: step >= n ? colors.white : colors.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: fontSize.md }}>{n === 5 ? "✓" : n}</div>
      <div style={{ fontSize: fontSize.xs, marginTop: 4, color: step >= n ? TEAL : colors.textMuted }}>{lbl}</div>
    </div>
  );

  return (
    <>
      {step < 5 && <Btn small variant="light" onClick={onCancel}>← Annulla</Btn>}
      <h2 style={{ margin: "14px 0 4px" }}>{step === 5 ? "Prenotazione inviata! ✅" : `Prenota con ${vet.name}`}</h2>
      <div style={{ display: "flex", margin: "14px 0 20px" }}>
        {stepDot(1, "Animale")}{stepDot(2, "Prestazione")}{stepDot(3, "Orario")}{stepDot(4, "Conferma")}{stepDot(5, "Fatto")}
      </div>

      {/* Step 1: Scelta animale (prima!) */}
      {step === 1 && (
        <Card>
          <b>Per quale animale vuoi prenotare?</b>
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            {pets.map(p => (
              <div key={p.id} onClick={() => setPetId(p.id)} style={{ padding: "10px 14px", borderRadius: radius.lg, border: `2px solid ${petId === p.id ? TEAL : colors.borderLight}`, cursor: "pointer", background: petId === p.id ? colors.bgTealSel : colors.white }}>
                {p.photo} <b>{p.name}</b> <span style={{ color: colors.textSecondary, fontSize: fontSize.md }}>· {p.species}, {p.breed}</span>
              </div>
            ))}
          </div>
          <Btn onClick={() => setStep(2)} style={{ marginTop: 16, width: "100%" }} disabled={!petId}>Continua →</Btn>
        </Card>
      )}

      {/* Step 2: Scelta prestazione — stile Treatwell con accordion */}
      {step === 2 && (
        <Card>
          <b>Scegli la prestazione</b>
          <div style={{ fontSize: fontSize.md, color: colors.textMuted, marginTop: 4, marginBottom: 12 }}>
            Clicca su una categoria per vedere i servizi disponibili
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            {availableCats.map(cat => {
              const catServices = availableServices.filter(s => s.cat === cat);
              const isOpen = openCat === cat;

              return (
                <div key={cat} style={{ borderRadius: radius.lg, border: `1px solid ${colors.borderLight}`, overflow: "hidden" }}>
                  {/* Header categoria */}
                  <button onClick={() => setOpenCat(isOpen ? null : cat)} style={{
                    width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 14px", background: isOpen ? colors.bgTealSel : colors.white,
                    border: "none", cursor: "pointer", fontFamily: "inherit",
                  }}>
                    <span style={{ fontWeight: 700, fontSize: fontSize.xl, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 22 }}>{CAT_EMOJI[cat]}</span>
                      {cat}
                      <span style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 400 }}>({catServices.length})</span>
                    </span>
                    <span style={{ fontSize: 14, color: isOpen ? TEAL : colors.textMuted, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                  </button>

                  {/* Lista servizi della categoria */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${colors.divider}` }}>
                      {catServices.map(s => {
                        const selected = serviceId === s.id;
                        return (
                          <div key={s.id} onClick={() => setServiceId(s.id)} style={{
                            padding: "12px 14px", cursor: "pointer",
                            background: selected ? colors.bgTealSel : colors.white,
                            borderBottom: `1px solid ${colors.divider}`,
                            borderLeft: selected ? `3px solid ${TEAL}` : "3px solid transparent",
                            display: "flex", alignItems: "center", gap: 12,
                          }}>
                            <span style={{ fontSize: 24, flexShrink: 0 }}>{s.emoji}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: fontSize.base }}>{s.name}</div>
                              {s.desc && <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 }}>{s.desc}</div>}
                              <div style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }}>⏱ ~{s.duration} min</div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontWeight: 800, color: ORANGE, fontSize: fontSize.xl }}>€{s.price}</div>
                              {selected && <div style={{ fontSize: fontSize.xs, color: TEAL, fontWeight: 600 }}>✓ Selezionato</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Riepilogo selezione corrente */}
          {service && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: colors.bgTealSel, borderRadius: radius.lg, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{service.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: fontSize.base }}>{service.name}</div>
                <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>⏱ ~{service.duration} min</div>
              </div>
              <b style={{ color: ORANGE }}>€{service.price}</b>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Btn variant="light" onClick={() => setStep(1)} style={{ flex: 1 }}>← Indietro</Btn>
            <Btn onClick={() => setStep(3)} style={{ flex: 2 }} disabled={!serviceId}>Continua →</Btn>
          </div>
        </Card>
      )}

      {/* Step 3: Data e ora */}
      {step === 3 && (
        <Card>
          <b>Scegli il giorno</b>
          <div className="date-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 0", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}>
            {days.map(d => {
              const dd = new Date(d);
              return (
                <div key={d} onClick={() => { setDate(d); setTime(""); }} style={{ minWidth: 64, textAlign: "center", padding: "10px 6px", borderRadius: radius.lg, cursor: "pointer", border: `2px solid ${date === d ? TEAL : colors.borderLight}`, background: date === d ? colors.bgTealSel : colors.white, scrollSnapAlign: "start" }}>
                  <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>{["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"][dd.getDay()]}</div>
                  <div style={{ fontWeight: 700 }}>{dd.getDate()}/{dd.getMonth() + 1}</div>
                </div>
              );
            })}
          </div>
          {date && (
            <>
              <b style={{ display: "block", marginTop: 10 }}>Orari disponibili</b>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {freeSlots.map(t => (
                  <div key={t} onClick={() => setTime(t)} style={{ padding: "10px 14px", borderRadius: radius.md, cursor: "pointer", border: `2px solid ${time === t ? TEAL : colors.borderLight}`, background: time === t ? TEAL : colors.white, color: time === t ? colors.white : "#333", fontWeight: 600, fontSize: fontSize.base, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>{t}</div>
                ))}
              </div>
            </>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Btn variant="light" onClick={() => setStep(2)} style={{ flex: 1 }}>← Indietro</Btn>
            <Btn onClick={() => setStep(4)} style={{ flex: 2 }} disabled={!date || !time}>Continua →</Btn>
          </div>
        </Card>
      )}

      {/* Step 4: Riepilogo e conferma */}
      {step === 4 && (
        <Card>
          <b>Riepilogo</b>
          {(() => { const p = pets.find(x => x.id === petId); return (
            <div style={{ background: colors.bgLighter, borderRadius: radius.lg, padding: 14, margin: "10px 0", fontSize: fontSize.base, lineHeight: 1.8 }}>
              🐾 <b>{p?.name}</b> ({p?.species})<br/>
              👩‍⚕️ {vet.name} — {vet.clinic}<br/>
              📍 {vet.address}<br/>
              {service?.emoji} <b>{service?.name}</b> · ~{service?.duration} min<br/>
              📅 <b>{date}</b> ore <b>{time}</b><br/>
              💶 <b style={{ color: ORANGE }}>€{service?.price}</b> (prezzo indicativo — confermato dal veterinario)
            </div>
          ); })()}

          {/* Disclaimer video-consulto — HIGH fix */}
          {type === "video" && (
            <div style={{ background: "#FFF3CD", borderRadius: radius.lg, padding: "10px 14px", margin: "10px 0", fontSize: fontSize.md, color: "#856404", lineHeight: 1.6 }}>
              <b>⚠️ Video-consulto:</b> La consulenza a distanza non sostituisce una visita fisica quando clinicamente necessaria. Il veterinario valuterà se il video-consulto è appropriato per il tuo caso e potrà richiedere una visita in presenza. In caso di emergenza, contatta un pronto soccorso veterinario.
            </div>
          )}

          {/* Info cancellazione/no-show — HIGH fix (placeholder policy) */}
          <div style={{ fontSize: fontSize.sm, color: colors.textMuted, background: colors.bgLighter, borderRadius: radius.md, padding: "8px 12px", margin: "10px 0", lineHeight: 1.6 }}>
            ℹ️ <b>Cancellazione:</b> policy di cancellazione e no-show da definire prima del go-live. [TODO — policy cancellazione]
          </div>

          <label htmlFor="booking-notes" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>Note per il veterinario</label>
          {/* Avviso campi liberi — MEDIUM fix */}
          <p style={{ fontSize: fontSize.xs, color: colors.textMuted, margin: "4px 0 0" }}>
            Inserisci solo informazioni utili per la visita del tuo animale. Non inserire dati sanitari tuoi o di altre persone se non strettamente necessari.
          </p>
          <textarea id="booking-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Note per il veterinario (facoltativo)…" rows={3}
            style={{ ...inputStyle, borderRadius: radius.lg, marginTop: 6 }} maxLength={1000} />

          {/* Informativa trattamento dati prenotazione */}
          <p style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 8, lineHeight: 1.5 }}>
            Confermando la prenotazione accetti le <b>Condizioni d'uso</b>. I tuoi dati saranno condivisi con il veterinario prenotato al solo scopo di gestire la visita, come descritto nella <b>Privacy Policy</b>.
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn variant="light" onClick={() => setStep(3)} style={{ flex: 1 }}>← Indietro</Btn>
            <Btn variant="accent" onClick={confirm} style={{ flex: 2 }}>Conferma prenotazione ✓</Btn>
          </div>
        </Card>
      )}

      {/* Step 5: Conferma avvenuta */}
      {step === 5 && (
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
          <h3 style={{ margin: "0 0 8px", color: colors.textDark }}>Prenotazione inviata!</h3>
          {(() => { const p = pets.find(x => x.id === petId); return (
            <div style={{ background: colors.bgLighter, borderRadius: radius.lg, padding: 14, margin: "10px 0", fontSize: fontSize.base, lineHeight: 1.8, textAlign: "left" }}>
              🐾 <b>{p?.name}</b><br/>
              👩‍⚕️ <b>{vet.name}</b><br/>
              {service?.emoji} {service?.name}<br/>
              📅 <b>{date}</b> ore <b>{time}</b><br/>
              💶 <b style={{ color: ORANGE }}>€{service?.price}</b>
            </div>
          ); })()}
          <div style={{ background: colors.bgOrangeLight, borderRadius: radius.lg, padding: "12px 14px", margin: "10px 0", fontSize: fontSize.base, lineHeight: 1.6, textAlign: "left", color: colors.textMedium }}>
            ⏳ <b>Cosa succede ora?</b><br/>
            Il veterinario riceverà la tua richiesta e potrà <b>confermarla</b> o <b>proporti un'alternativa</b>. Controlla la sezione "Visite" per gli aggiornamenti!
          </div>
          <Btn variant="accent" onClick={onDone} style={{ marginTop: 14, width: "100%" }}>Vai alle mie visite →</Btn>
        </Card>
      )}
    </>
  );
}
