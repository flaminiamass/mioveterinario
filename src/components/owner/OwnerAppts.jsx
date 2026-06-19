import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TYPE_META, SLOT_TIMES } from "../../data/constants.js";
import { today, fmtDate, addDays } from "../../data/helpers.js";
import { getService } from "../../data/services.js";
import * as db from "../../lib/db.js";
import { TEAL, ORANGE, colors, fontSize, radius, inputStyle } from "../../styles/tokens.js";
import Badge from "../ui/Badge.jsx";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import AvatarImage from "../ui/AvatarImage.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Empty from "../ui/Empty.jsx";
import FilterPills from "../ui/FilterPills.jsx";
import { phoneHref } from "../../utils/phone.js";

const FILTER_OPTIONS = [
  { key: "all", label: "Tutte" },
  { key: "pending", label: "In attesa" },
  { key: "confirmed", label: "Confermate" },
  { key: "completed", label: "Completate" },
  { key: "cancelled", label: "Cancellate" },
];

const CANCEL_REASONS = ["Non posso in quella data", "Ho trovato un altro veterinario", "L'animale sta meglio", "Altro"];

export default function OwnerAppts({ onReview, onGoSearch, onRebook, onChatVet }) {
  const { appts, setAppts, pets, vets, reviews, ownerProfile, notify } = useApp();
  const [filter, setFilter] = useState("all");
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelOtherText, setCancelOtherText] = useState("");
  /* Proposta modifica */
  const [editingId, setEditingId] = useState(null);
  const [propDate, setPropDate] = useState("");
  const [propTime, setPropTime] = useState("");
  const [propMsg, setPropMsg] = useState("");

  const list = appts
    .filter((a) => filter === "all" || a.status === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const propDays = Array.from({ length: 14 }, (_, i) => addDays(i + 1));

  /* Accetta proposta del vet */
  const acceptProposal = async (a) => {
    setAppts(
      appts.map((x) =>
        x.id === a.id ? { ...x, date: a.proposal.date, time: a.proposal.time, proposal: null, status: "confirmed" } : x
      )
    );
    notify("✅ Proposta accettata! Appuntamento aggiornato.");
    if (db.isSupabaseConfigured()) {
      const { error } = await db.acceptProposal(a.id, a.proposal.date, a.proposal.time);
      if (error) notify("❌ Errore salvataggio: " + error.message);
    }
  };

  /* Rifiuta proposta del vet */
  const rejectProposal = async (a) => {
    setAppts(appts.map((x) => (x.id === a.id ? { ...x, proposal: null } : x)));
    notify("Proposta rifiutata.");
    if (db.isSupabaseConfigured()) {
      const { error } = await db.rejectProposal(a.id);
      if (error) notify("❌ Errore salvataggio: " + error.message);
    }
  };

  /* Invia proposta modifica dall'owner */
  const sendProposal = async (apptId) => {
    const proposal = { from: "owner", date: propDate, time: propTime, message: propMsg || "" };
    const appt = appts.find((a) => a.id === apptId);
    const vetObj = vets.find((v) => v.id === appt?.vetId);
    setAppts(appts.map((x) => (x.id === apptId ? { ...x, proposal } : x)));
    setEditingId(null);
    notify("📝 Proposta di modifica inviata al veterinario!");
    if (db.isSupabaseConfigured()) {
      const { error } = await db.sendProposal(apptId, proposal);
      if (error) notify("❌ Errore salvataggio: " + error.message);
      /* Notifica al vet */
      if (vetObj?.userId) {
        db.createNotification({
          userId: vetObj.userId,
          type: "appt_proposal",
          title: `📝 Proposta modifica`,
          message: `${ownerProfile.name || "Un cliente"} propone: ${propDate} alle ${propTime}${propMsg ? ` — "${propMsg}"` : ""}`,
        });
      }
    }
  };

  return (
    <>
      <SectionTitle>Le mie visite</SectionTitle>
      <FilterPills options={FILTER_OPTIONS} active={filter} onChange={setFilter} />
      <div style={{ display: "grid", gap: 10 }}>
        {list.length === 0 && appts.length === 0 && (
          <Empty
            icon="📅"
            text="Non hai ancora visite"
            sub="Cerca un veterinario e prenota la prima!"
            action={
              onGoSearch && (
                <Btn variant="accent" onClick={onGoSearch}>
                  🔍 Cerca veterinario
                </Btn>
              )
            }
          />
        )}
        {list.length === 0 && appts.length > 0 && <Empty icon="📅" text="Nessuna visita in questa categoria" />}
        {list.map((a) => {
          const pet = pets.find((p) => p.id === a.petId);
          const vet = vets.find((v) => v.id === a.vetId);
          const svc = a.serviceId ? getService(a.serviceId) : null;
          const reviewed = reviews.some((r) => r.apptId === a.id);
          const canCancel = ["pending", "confirmed"].includes(a.status) && a.date > fmtDate(today);
          const canEdit = ["pending", "confirmed"].includes(a.status) && a.date > fmtDate(today);

          return (
            <Card key={a.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <AvatarImage src={pet?.photo} emoji={pet?.photo} name={pet?.name} size={42} rounded="rounded" />
                  <div>
                    <b>
                      {pet?.name} · {a.date} ore {a.time}
                    </b>
                    <div style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: 2 }}>
                      {vet?.name} · {svc ? `${svc.emoji} ${svc.name}` : TYPE_META[a.type]}
                      {svc && <span style={{ color: ORANGE, fontWeight: 600 }}> · €{svc.price}</span>}
                    </div>
                    {a.ownerNotes && (
                      <div style={{ fontSize: fontSize.md, color: colors.textMedium, marginTop: 4 }}>
                        📝 {a.ownerNotes}
                      </div>
                    )}
                    {a.vetNotes && (
                      <div
                        style={{
                          fontSize: fontSize.md,
                          color: TEAL,
                          marginTop: 4,
                          background: colors.bgTealSel,
                          padding: "4px 8px",
                          borderRadius: radius.sm,
                        }}
                      >
                        👩‍⚕️ Note vet: {a.vetNotes}
                      </div>
                    )}
                    {a.rejectReason && a.status === "cancelled" && (
                      <div
                        style={{
                          fontSize: fontSize.md,
                          color: colors.dangerFg,
                          marginTop: 4,
                          background: colors.dangerBg,
                          padding: "4px 8px",
                          borderRadius: radius.sm,
                        }}
                      >
                        ❌ Motivo rifiuto: {a.rejectReason}
                      </div>
                    )}
                    {a.ownerCancelReason && a.status === "cancelled" && (
                      <div
                        style={{
                          fontSize: fontSize.md,
                          color: colors.textMedium,
                          marginTop: 4,
                          background: colors.bgLight,
                          padding: "4px 8px",
                          borderRadius: radius.sm,
                        }}
                      >
                        🙍 Motivo cancellazione: {a.ownerCancelReason}
                      </div>
                    )}
                  </div>
                </div>
                <Badge status={a.status} />
              </div>

              {/* Banner proposta dal vet */}
              {a.proposal && a.proposal.from === "vet" && (
                <div
                  style={{
                    marginTop: 10,
                    background: colors.bgOrangeLight,
                    borderRadius: radius.md,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: fontSize.base, color: ORANGE }}>
                    📅 Il veterinario propone un cambio:
                  </div>
                  <div style={{ fontSize: fontSize.base, marginTop: 4 }}>
                    Nuova data: <b>{a.proposal.date}</b> ore <b>{a.proposal.time}</b>
                  </div>
                  {a.proposal.message && (
                    <div style={{ fontSize: fontSize.md, color: colors.textMedium, marginTop: 4, fontStyle: "italic" }}>
                      "{a.proposal.message}"
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <Btn small onClick={() => acceptProposal(a)}>
                      ✓ Accetta
                    </Btn>
                    <Btn small variant="light" onClick={() => rejectProposal(a)}>
                      ✗ Rifiuta
                    </Btn>
                  </div>
                </div>
              )}

              {/* Azioni normali */}
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {canCancel && (
                  <Btn small variant="danger" onClick={() => setCancelId(a.id)}>
                    Cancella
                  </Btn>
                )}
                {a.status === "pending" && (
                  <Btn
                    small
                    variant="light"
                    onClick={() => notify("Richiesta inviata: il veterinario deve ancora confermare.")}
                  >
                    Vedi stato
                  </Btn>
                )}
                {a.status === "confirmed" && (
                  <Btn
                    small
                    variant="light"
                    onClick={() => notify("Demo: qui apriremo indicazioni e dettagli clinica.")}
                  >
                    Indicazioni
                  </Btn>
                )}
                {vet && ["pending", "confirmed", "completed"].includes(a.status) && (
                  <Btn small variant="light" onClick={() => onChatVet?.(vet, a)}>
                    Chat con veterinario
                  </Btn>
                )}
                {vet && ["pending", "confirmed"].includes(a.status) && phoneHref(vet.phone) && (
                  <Btn small variant="light" onClick={() => (window.location.href = phoneHref(vet.phone))}>
                    Chiama ora
                  </Btn>
                )}
                {canEdit && !a.proposal && (
                  <Btn
                    small
                    variant="ghost"
                    onClick={() => {
                      setEditingId(a.id);
                      setPropDate("");
                      setPropTime("");
                      setPropMsg("");
                    }}
                  >
                    ✏️ Modifica
                  </Btn>
                )}
                {a.status === "completed" && !reviewed && (
                  <Btn small variant="accent" onClick={() => onReview(a)}>
                    ⭐ Lascia recensione
                  </Btn>
                )}
                {a.status === "completed" && onRebook && (
                  <Btn small variant="light" onClick={() => onRebook(a)}>
                    Prenota di nuovo
                  </Btn>
                )}
                {a.status === "completed" && reviewed && (
                  <span style={{ fontSize: fontSize.md, color: colors.success, fontWeight: 600, alignSelf: "center" }}>
                    ✓ Recensione inviata
                  </span>
                )}
                {a.status === "cancelled" && (
                  <Btn small variant="accent" onClick={onGoSearch}>
                    Trova alternativa
                  </Btn>
                )}
              </div>

              {/* Form modifica inline */}
              {editingId === a.id && (
                <div style={{ marginTop: 10, borderTop: `1px solid ${colors.divider}`, paddingTop: 10 }}>
                  <b style={{ fontSize: fontSize.base }}>Proponi una nuova data/ora</b>
                  <div
                    className="date-scroll"
                    style={{
                      display: "flex",
                      gap: 6,
                      overflowX: "auto",
                      padding: "8px 0",
                      WebkitOverflowScrolling: "touch",
                      scrollSnapType: "x mandatory",
                    }}
                  >
                    {propDays.map((d) => {
                      const dd = new Date(d);
                      return (
                        <div
                          key={d}
                          onClick={() => {
                            setPropDate(d);
                            setPropTime("");
                          }}
                          style={{
                            minWidth: 56,
                            textAlign: "center",
                            padding: "8px 4px",
                            borderRadius: radius.md,
                            cursor: "pointer",
                            border: `2px solid ${propDate === d ? TEAL : colors.borderLight}`,
                            background: propDate === d ? colors.bgTealSel : colors.white,
                            scrollSnapAlign: "start",
                            fontSize: fontSize.sm,
                          }}
                        >
                          <div style={{ color: colors.textMuted }}>
                            {["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"][dd.getDay()]}
                          </div>
                          <div style={{ fontWeight: 700 }}>
                            {dd.getDate()}/{dd.getMonth() + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {propDate && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                      {SLOT_TIMES.map((t) => (
                        <div
                          key={t}
                          onClick={() => setPropTime(t)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: radius.sm,
                            cursor: "pointer",
                            border: `1.5px solid ${propTime === t ? TEAL : colors.borderLight}`,
                            background: propTime === t ? TEAL : colors.white,
                            color: propTime === t ? colors.white : "#333",
                            fontWeight: 600,
                            fontSize: fontSize.sm,
                          }}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                  <textarea
                    value={propMsg}
                    onChange={(e) => setPropMsg(e.target.value)}
                    placeholder="Motivo della modifica (facoltativo)…"
                    rows={2}
                    style={{ ...inputStyle, borderRadius: radius.md, marginTop: 8 }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <Btn small variant="light" onClick={() => setEditingId(null)}>
                      Annulla
                    </Btn>
                    <Btn small disabled={!propDate || !propTime} onClick={() => sendProposal(a.id)}>
                      Invia proposta
                    </Btn>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Dialog cancellazione con motivo */}
      {cancelId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Card style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🗑️</div>
            <b style={{ fontSize: fontSize.xl }}>Cancellare la visita?</b>
            <p style={{ fontSize: fontSize.base, color: colors.textMuted, margin: "8px 0 14px" }}>
              Seleziona il motivo della cancellazione:
            </p>
            <div style={{ display: "grid", gap: 8, textAlign: "left" }}>
              {CANCEL_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setCancelReason(r);
                    if (r !== "Altro") setCancelOtherText("");
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: radius.md,
                    border: `2px solid ${cancelReason === r ? TEAL : colors.borderLight}`,
                    background: cancelReason === r ? colors.bgTealSel : colors.white,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: fontSize.base,
                    fontWeight: cancelReason === r ? 700 : 400,
                    textAlign: "left",
                    color: colors.textDark,
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            {cancelReason === "Altro" && (
              <textarea
                value={cancelOtherText}
                onChange={(e) => setCancelOtherText(e.target.value)}
                placeholder="Spiega brevemente…"
                rows={2}
                style={{
                  ...inputStyle,
                  borderRadius: radius.md,
                  marginTop: 10,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
              <Btn
                variant="light"
                onClick={() => {
                  setCancelId(null);
                  setCancelReason("");
                  setCancelOtherText("");
                }}
              >
                Annulla
              </Btn>
              <Btn
                variant="danger"
                disabled={!cancelReason || (cancelReason === "Altro" && !cancelOtherText.trim())}
                onClick={async () => {
                  const reason = cancelReason === "Altro" ? cancelOtherText.trim() : cancelReason;
                  const appt = appts.find((a) => a.id === cancelId);
                  const pet = pets.find((p) => p.id === appt?.petId);
                  const vetObj = vets.find((v) => v.id === appt?.vetId);
                  setAppts(
                    appts.map((x) => (x.id === cancelId ? { ...x, status: "cancelled", ownerCancelReason: reason } : x))
                  );
                  notify("Visita cancellata.");
                  if (db.isSupabaseConfigured()) {
                    const { error } = await db.updateAppointmentStatus(cancelId, "cancelled", {
                      ownerCancelReason: reason,
                    });
                    if (error) notify("❌ Errore salvataggio: " + error.message);
                    /* Notifica al vet */
                    if (vetObj?.userId) {
                      db.createNotification({
                        userId: vetObj.userId,
                        type: "appt_cancelled",
                        title: `🙍 Visita cancellata`,
                        message: `${ownerProfile.name || "Un cliente"} ha cancellato la visita di ${pet?.name || "un animale"} del ${appt?.date} alle ${appt?.time}. Motivo: ${reason}`,
                      });
                    }
                  }
                  setCancelId(null);
                  setCancelReason("");
                  setCancelOtherText("");
                }}
              >
                Sì, cancella
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
