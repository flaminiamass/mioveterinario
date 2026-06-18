import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { TEAL, ORANGE, SLOT_TIMES } from "../../data/constants.js";
import { SERVICE_CATEGORIES, getTypeFromService, getVetServices } from "../../data/services.js";
import { getAvailableSlotsForDay, getWorkingDays } from "../../utils/availability.js";
import { createAppointment, isSupabaseConfigured } from "../../lib/db.js";
import { mapAppointment } from "../../lib/mappers.js";
import { colors, fontSize, radius, inputStyle } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";

const CAT_EMOJI = { Visite: "🩺", Vaccini: "💉", Analisi: "🩸", Diagnostica: "📷", Chirurgia: "🏥", Altro: "📋" };

/**
 * BookingFlow — step flow di prenotazione.
 *
 * Props:
 *   vet                — oggetto veterinario (obbligatorio)
 *   onDone             — callback al termine
 *   onCancel           — callback annulla
 *   preSelectedServiceId — serviceId preselezionato (via ServiceSearch o navigazione)
 *
 * Props opzionali per slot precompilato (da SlotCard o VetPublicProfile):
 *   initialPetId       — petId preselezionato
 *   initialServiceId   — serviceId preselezionato
 *   initialDate        — data preselezionata (YYYY-MM-DD)
 *   initialTime        — orario preselezionato (HH:MM)
 *   initialType        — tipo preselezionato (clinic/home/video)
 */
export default function BookingFlow({
  vet, onDone, onCancel,
  preSelectedServiceId,
  initialPetId,
  initialServiceId,
  initialDate,
  initialTime,
  initialType,
}) {
  const { pets, appts, setAppts, notify } = useApp();
  const { user } = useAuthContext();

  const effectiveServiceId = initialServiceId || preSelectedServiceId || "";
  const effectivePetId = initialPetId || pets[0]?.id || "";

  // Se arrivano data+ora precompilate, partiamo dallo step di conferma (step 4)
  // se mancano animale o servizio, da 1 o 2.
  const deriveStartStep = () => {
    if (initialDate && initialTime) {
      if (!effectivePetId) return 1;
      if (!effectiveServiceId) return 2;
      return 4; // tutto precompilato → vai al riepilogo
    }
    return 1;
  };

  const [step, setStep] = useState(deriveStartStep);
  const [petId, setPetId] = useState(effectivePetId);
  const [serviceId, setServiceId] = useState(effectiveServiceId);
  const [date, setDate] = useState(initialDate || "");
  const [time, setTime] = useState(initialTime || "");
  const [notes, setNotes] = useState("");
  const [openCat, setOpenCat] = useState(null);

  const vetServices = getVetServices(vet);
  const service = vetServices.find(s => s.id === serviceId);
  const type = initialType || (service ? getTypeFromService(serviceId) : "clinic");

  const availableServices = vetServices.filter(s => {
    const sType = getTypeFromService(s.id);
    return vet.types.includes(sType);
  });
  const availableCats = SERVICE_CATEGORIES.filter(c => availableServices.some(s => s.cat === c));

  const days = getWorkingDays(vet);
  const freeSlots = date ? getAvailableSlotsForDay(vet, appts, date) : [];
  const takenSlots = SLOT_TIMES.filter(t => !freeSlots.includes(t));

  const confirm = async () => {
    const isAutoConfirm = vet.autoConfirm || false;
    const newStatus = isAutoConfirm ? "confirmed" : "pending";

    if (isSupabaseConfigured() && user) {
      const { data, error } = await createAppointment({
        petId, vetId: vet.id, ownerId: user.id,
        date, time, type, serviceId, ownerNotes: notes,
      });
      if (error) { notify("❌ Errore nel salvataggio: " + error.message); return; }
      setAppts([...appts, mapAppointment(data)]);
    } else {
      setAppts([...appts, {
        id: "a" + Date.now(), petId, vetId: vet.id, date, time, type,
        serviceId, status: newStatus, ownerNotes: notes, vetNotes: "", proposal: null,
        createdAt: new Date().toISOString(),
      }]);
    }
    setStep(5);
  };

  const stepDot = (n, lbl) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
      <div style={{ width: 28, height: 28, borderRadius: radius.circle, background: step >= n ? TEAL : colors.borderLight, color: step >= n ? colors.white : colors.textMuted, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: fontSize.md }}>
        {n === 5 ? "✓" : n}
      </div>
      <div style={{ fontSize: fontSize.xs, marginTop: 4, color: step >= n ? TEAL : colors.textMuted }}>{lbl}</div>
    </div>
  );

  const slotWasPreselected = !!initialDate && !!initialTime;

  return (
    <>
      {step < 5 && <Btn small variant="light" onClick={onCancel}>← Annulla</Btn>}
      <h2 style={{ margin: "14px 0 4px" }}>
        {step === 5 ? (vet.autoConfirm ? "Prenotazione confermata! ✅" : "Richiesta inviata! ✅") : `Prenota con ${vet.name}`}
      </h2>

      {/* Riepilogo slot se preselezionato */}
      {slotWasPreselected && step < 5 && (
        <div style={{ background: colors.bgTealSel, borderRadius: radius.lg, padding: "10px 14px", marginBottom: 12, fontSize: fontSize.base }}>
          <b style={{ color: TEAL }}>📅 Slot selezionato:</b> {date} ore {time}
          {service && <span> · {service.emoji} {service.name} · €{service.price}</span>}
        </div>
      )}

      <div style={{ display: "flex", margin: "14px 0 20px" }}>
        {stepDot(1, "Animale")}{stepDot(2, "Prestazione")}{stepDot(3, "Orario")}{stepDot(4, "Conferma")}{stepDot(5, "Fatto")}
      </div>

      {/* Step 1: Animale */}
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

      {/* Step 2: Prestazione */}
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
                  <button onClick={() => setOpenCat(isOpen ? null : cat)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 14px", background: isOpen ? colors.bgTealSel : colors.white, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                    <span style={{ fontWeight: 700, fontSize: fontSize.xl, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 22 }}>{CAT_EMOJI[cat]}</span>
                      {cat}
                      <span style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 400 }}>({catServices.length})</span>
                    </span>
                    <span style={{ fontSize: 14, color: isOpen ? TEAL : colors.textMuted, transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                  </button>
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${colors.divider}` }}>
                      {catServices.map(s => {
                        const selected = serviceId === s.id;
                        return (
                          <div key={s.id} onClick={() => setServiceId(s.id)} style={{ padding: "12px 14px", cursor: "pointer", background: selected ? colors.bgTealSel : colors.white, borderBottom: `1px solid ${colors.divider}`, borderLeft: selected ? `3px solid ${TEAL}` : "3px solid transparent", display: "flex", alignItems: "center", gap: 12 }}>
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
            <Btn onClick={() => setStep(slotWasPreselected ? 4 : 3)} style={{ flex: 2 }} disabled={!serviceId}>
              {slotWasPreselected ? "Vai al riepilogo →" : "Continua →"}
            </Btn>
          </div>
        </Card>
      )}

      {/* Step 3: Data e ora (solo se slot non preselezionato) */}
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
                {SLOT_TIMES.map(t => {
                  const taken = takenSlots.includes(t);
                  return (
                    <div key={t} onClick={() => !taken && setTime(t)} style={{ padding: "10px 14px", borderRadius: radius.md, cursor: taken ? "not-allowed" : "pointer", border: `2px solid ${time === t ? TEAL : colors.borderLight}`, background: time === t ? TEAL : taken ? colors.bgLight : colors.white, color: time === t ? colors.white : taken ? colors.textMuted : "#333", fontWeight: 600, fontSize: fontSize.base, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", opacity: taken ? 0.5 : 1, textDecoration: taken ? "line-through" : "none" }}>{t}</div>
                  );
                })}
              </div>
              {freeSlots.length === 0 && (
                <div style={{ color: colors.dangerFg, fontSize: fontSize.md, marginTop: 8, background: colors.dangerBg, padding: "8px 12px", borderRadius: radius.md }}>
                  ⚠️ Tutti gli orari sono occupati per questa data. Prova un altro giorno.
                </div>
              )}
            </>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Btn variant="light" onClick={() => setStep(2)} style={{ flex: 1 }}>← Indietro</Btn>
            <Btn onClick={() => setStep(4)} style={{ flex: 2 }} disabled={!date || !time}>Continua →</Btn>
          </div>
        </Card>
      )}

      {/* Step 4: Riepilogo */}
      {step === 4 && (
        <Card>
          <b>Riepilogo</b>
          {(() => {
            const p = pets.find(x => x.id === petId);
            return (
              <div style={{ background: colors.bgLighter, borderRadius: radius.lg, padding: 14, margin: "10px 0", fontSize: fontSize.base, lineHeight: 1.8 }}>
                🐾 <b>{p?.name}</b> ({p?.species})<br />
                👩‍⚕️ {vet.name} — {vet.clinic}<br />
                📍 {vet.address}<br />
                {service?.emoji} <b>{service?.name}</b> · ~{service?.duration} min<br />
                📅 <b>{date}</b> ore <b>{time}</b><br />
                💶 <b style={{ color: ORANGE }}>€{service?.price}</b> (prezzo indicativo — confermato dal veterinario)
              </div>
            );
          })()}

          {type === "video" && (
            <div style={{ background: "#FFF3CD", borderRadius: radius.lg, padding: "10px 14px", margin: "10px 0", fontSize: fontSize.md, color: "#856404", lineHeight: 1.6 }}>
              <b>⚠️ Video-consulto:</b> La consulenza a distanza non sostituisce una visita fisica quando clinicamente necessaria. Il veterinario valuterà se il video-consulto è appropriato per il tuo caso.
            </div>
          )}

          <div style={{ fontSize: fontSize.sm, color: colors.textMuted, background: colors.bgLighter, borderRadius: radius.md, padding: "8px 12px", margin: "10px 0", lineHeight: 1.6 }}>
            ℹ️ <b>Cancellazione:</b> gratuita fino a <b>{vet.cancellationHours || 24}h</b> prima della visita.
          </div>

          {vet.autoConfirm && (
            <div style={{ background: "#D1FAE5", borderRadius: radius.md, padding: "8px 12px", margin: "10px 0", fontSize: fontSize.md, color: "#065F46", fontWeight: 600 }}>
              ✓ Questo veterinario conferma automaticamente — riceverai conferma immediata.
            </div>
          )}

          <label htmlFor="booking-notes" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>Note per il veterinario</label>
          <p style={{ fontSize: fontSize.xs, color: colors.textMuted, margin: "4px 0 0" }}>
            Inserisci solo informazioni utili per la visita del tuo animale.
          </p>
          <textarea id="booking-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Note per il veterinario (facoltativo)…" rows={3} style={{ ...inputStyle, borderRadius: radius.lg, marginTop: 6 }} maxLength={1000} />

          <p style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 8, lineHeight: 1.5 }}>
            Confermando accetti le <b>Condizioni d'uso</b>. I dati saranno condivisi con il veterinario solo per gestire la visita.
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn variant="light" onClick={() => setStep(slotWasPreselected && serviceId ? 2 : 3)} style={{ flex: 1 }}>← Indietro</Btn>
            <Btn variant="accent" onClick={confirm} style={{ flex: 2 }}>Conferma prenotazione ✓</Btn>
          </div>
        </Card>
      )}

      {/* Step 5: Successo */}
      {step === 5 && (
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>{vet.autoConfirm ? "✅" : "🎉"}</div>
          <h3 style={{ margin: "0 0 8px", color: colors.textDark }}>
            {vet.autoConfirm ? "Prenotazione confermata!" : "Richiesta inviata!"}
          </h3>
          {(() => {
            const p = pets.find(x => x.id === petId);
            return (
              <div style={{ background: colors.bgLighter, borderRadius: radius.lg, padding: 14, margin: "10px 0", fontSize: fontSize.base, lineHeight: 1.8, textAlign: "left" }}>
                🐾 <b>{p?.name}</b><br />
                👩‍⚕️ <b>{vet.name}</b><br />
                {service?.emoji} {service?.name}<br />
                📅 <b>{date}</b> ore <b>{time}</b><br />
                💶 <b style={{ color: ORANGE }}>€{service?.price}</b>
              </div>
            );
          })()}

          {vet.autoConfirm ? (
            <div style={{ background: "#D1FAE5", borderRadius: radius.lg, padding: "12px 14px", margin: "10px 0", fontSize: fontSize.base, lineHeight: 1.6, textAlign: "left", color: "#065F46" }}>
              ✅ <b>Prenotazione confermata.</b> Segnati la data!<br />
              <span style={{ fontWeight: 400 }}>📲 Riceverai un promemoria prima della visita.</span>
            </div>
          ) : (
            <div style={{ background: colors.bgOrangeLight, borderRadius: radius.lg, padding: "12px 14px", margin: "10px 0", fontSize: fontSize.base, lineHeight: 1.6, textAlign: "left", color: colors.textMedium }}>
              ⏳ <b>Richiesta inviata.</b><br />
              Il veterinario la confermerà o proporrà un'alternativa. Controlla "Visite" per gli aggiornamenti.<br />
              <span style={{ fontSize: fontSize.sm }}>📲 Riceverai un promemoria prima della visita.</span>
            </div>
          )}

          <Btn variant="accent" onClick={onDone} style={{ marginTop: 14, width: "100%" }}>Vai alle mie visite →</Btn>
        </Card>
      )}
    </>
  );
}
