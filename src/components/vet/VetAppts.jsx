import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { STATUS_META, TYPE_META, SLOT_TIMES } from "../../data/constants.js";
import { addDays } from "../../data/helpers.js";
import { getService } from "../../data/services.js";
import * as db from "../../lib/db.js";
import { TEAL, ORANGE, colors, fontSize, radius, inputStyle } from "../../styles/tokens.js";
import { canUseWaitlist } from "../../data/plans.js";
import Badge from "../ui/Badge.jsx";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Empty from "../ui/Empty.jsx";
import FilterPills from "../ui/FilterPills.jsx";
import RejectDialog from "../ui/RejectDialog.jsx";
import UpgradePrompt from "../ui/UpgradePrompt.jsx";
import RefertoForm from "./RefertoForm.jsx";
import InvoiceForm from "./InvoiceForm.jsx";

const FILTER_OPTIONS = [
  { key: "all", label: "Tutte" },
  { key: "pending", label: "In attesa" },
  { key: "confirmed", label: "Confermate" },
  { key: "completed", label: "Completate" },
];

export default function VetAppts({ vetId, onGoToPlan }) {
  const { appts, setAppts, pets, vets, referti, invoices, ownerProfile, notify } = useApp();
  const vet = vets.find((v) => v.id === vetId);
  const waitlistEnabled = canUseWaitlist(vet);
  const [filter, setFilter] = useState("all");
  const [refertoFor, setRefertoFor] = useState(null);
  const [invoiceFor, setInvoiceFor] = useState(null);
  /* Nota vet */
  const [notingId, setNotingId] = useState(null);
  const [noteText, setNoteText] = useState("");
  /* Rifiuto */
  const [rejectingId, setRejectingId] = useState(null);
  /* Proposta alternativa (al posto del rifiuto o per cambio orario) */
  const [proposingId, setProposingId] = useState(null);
  const [propDate, setPropDate] = useState("");
  const [propTime, setPropTime] = useState("");
  const [propMsg, setPropMsg] = useState("");

  const list = appts
    .filter((a) => a.vetId === vetId && (filter === "all" || a.status === filter))
    .sort((a, b) => b.date.localeCompare(a.date));
  const setStatus = async (id, status) => {
    /* Controllo conflitto orario quando si conferma */
    if (status === "confirmed") {
      const appt = appts.find((a) => a.id === id);
      const conflict = appts.find(
        (a) =>
          a.id !== id && a.vetId === vetId && a.date === appt.date && a.time === appt.time && a.status === "confirmed"
      );
      if (conflict) {
        const cPet = pets.find((p) => p.id === conflict.petId);
        notify(
          `⚠️ Conflitto: hai già una visita alle ${appt.time} del ${appt.date} con ${cPet?.name || "un paziente"}`
        );
        return;
      }
    }
    const appt = appts.find((a) => a.id === id) || {};
    const pet = pets.find((p) => p.id === appt.petId);
    setAppts(appts.map((a) => (a.id === id ? { ...a, status } : a)));
    notify(`Stato aggiornato: ${STATUS_META[status].label}`);
    if (db.isSupabaseConfigured()) {
      const { error } = await db.updateAppointmentStatus(id, status);
      if (error) notify("❌ Errore salvataggio: " + error.message);
      /* Invia notifica al proprietario */
      if (appt.ownerId) {
        const vetName = vet?.name || "Il veterinario";
        if (status === "confirmed") {
          db.createNotification({
            userId: appt.ownerId,
            type: "appt_confirmed",
            title: `✅ Visita confermata`,
            message: `${vetName} ha confermato la visita di ${pet?.name || "il tuo animale"} del ${appt.date} alle ${appt.time}`,
          });
        } else if (status === "completed") {
          db.createNotification({
            userId: appt.ownerId,
            type: "appt_completed",
            title: `✓ Visita completata`,
            message: `La visita di ${pet?.name || "il tuo animale"} con ${vetName} è completata. Controlla i referti!`,
          });
        }
      }
    }
  };

  const propDays = Array.from({ length: 14 }, (_, i) => addDays(i + 1));

  /* Accetta proposta dell'owner */
  const acceptProposal = async (a) => {
    setAppts(
      appts.map((x) => (x.id === a.id ? { ...x, date: a.proposal.date, time: a.proposal.time, proposal: null } : x))
    );
    notify("✅ Proposta accettata! Appuntamento aggiornato.");
    if (db.isSupabaseConfigured()) {
      const { error } = await db.acceptProposal(a.id, a.proposal.date, a.proposal.time);
      if (error) notify("❌ Errore salvataggio: " + error.message);
    }
  };

  /* Rifiuta proposta dell'owner */
  const rejectProposal = async (a) => {
    setAppts(appts.map((x) => (x.id === a.id ? { ...x, proposal: null } : x)));
    notify("Proposta rifiutata.");
    if (db.isSupabaseConfigured()) {
      const { error } = await db.rejectProposal(a.id);
      if (error) notify("❌ Errore salvataggio: " + error.message);
    }
  };

  /* Invia proposta alternativa dal vet */
  const sendProposal = async (apptId) => {
    const proposal = { from: "vet", date: propDate, time: propTime, message: propMsg || "" };
    const appt = appts.find((a) => a.id === apptId);
    setAppts(appts.map((x) => (x.id === apptId ? { ...x, proposal } : x)));
    setProposingId(null);
    notify("📅 Proposta alternativa inviata al proprietario!");
    if (db.isSupabaseConfigured()) {
      const { error } = await db.sendProposal(apptId, proposal);
      if (error) notify("❌ Errore salvataggio: " + error.message);
      /* Notifica al proprietario */
      if (appt?.ownerId) {
        db.createNotification({
          userId: appt.ownerId,
          type: "appt_proposal",
          title: `📅 Proposta nuovo orario`,
          message: `${vet?.name || "Il veterinario"} propone: ${propDate} alle ${propTime}${propMsg ? ` — "${propMsg}"` : ""}`,
        });
      }
    }
  };

  if (refertoFor) return <RefertoForm appt={refertoFor} vetId={vetId} onDone={() => setRefertoFor(null)} />;
  if (invoiceFor) return <InvoiceForm appt={invoiceFor} vetId={vetId} onDone={() => setInvoiceFor(null)} />;

  return (
    <>
      <SectionTitle>Gestione visite</SectionTitle>
      <FilterPills options={FILTER_OPTIONS} active={filter} onChange={setFilter} />
      <div style={{ display: "grid", gap: 10 }}>
        {list.length === 0 && <Empty icon="🗓️" text="Nessuna visita" />}
        {list.map((a) => {
          const pet = pets.find((p) => p.id === a.petId);
          const svc = a.serviceId ? getService(a.serviceId) : null;
          const hasRef = referti.some((r) => r.apptId === a.id);
          const hasInv = invoices.some((f) => f.apptId === a.id);
          return (
            <Card key={a.id}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <b>
                    {pet?.photo} {pet?.name} · {a.date} ore {a.time}
                  </b>
                  <div style={{ fontSize: fontSize.md, color: colors.textSecondary }}>
                    {svc ? `${svc.emoji} ${svc.name} · ~${svc.duration} min` : TYPE_META[a.type]} · {ownerProfile.name}
                  </div>
                  {svc && (
                    <div style={{ fontSize: fontSize.md, color: ORANGE, fontWeight: 600, marginTop: 2 }}>
                      €{svc.price}
                    </div>
                  )}
                  {a.ownerNotes && (
                    <div style={{ fontSize: fontSize.md, marginTop: 4 }}>
                      📝 <i>{a.ownerNotes}</i>
                    </div>
                  )}
                  {a.paymentStatus && a.paymentStatus !== "not_required" && (() => {
                    const map = {
                      pay_in_clinic: { label: "💶 Pagamento in studio", bg: colors.bgLight, color: colors.textMedium },
                      online_simulated_pending: { label: "💳 Pagamento online (simulato) — in attesa", bg: "#FFF3E8", color: "#D97706" },
                      online_simulated_paid: { label: "💳 Pagamento online simulato ✓", bg: "#D1FAE5", color: colors.success },
                    };
                    const m = map[a.paymentStatus];
                    return m ? (
                      <div style={{ fontSize: fontSize.sm, marginTop: 6, background: m.bg, color: m.color, padding: "4px 10px", borderRadius: radius.sm, fontWeight: 600, display: "inline-block" }}>
                        {m.label}
                      </div>
                    ) : null;
                  })()}
                  {a.vetNotes && (
                    <div
                      style={{
                        fontSize: fontSize.md,
                        color: colors.teal,
                        marginTop: 4,
                        background: colors.bgTealSel,
                        padding: "4px 8px",
                        borderRadius: radius.sm,
                      }}
                    >
                      👩‍⚕️ Note: {a.vetNotes}
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
                      ❌ Motivo: {a.rejectReason}
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
                      🙍 Motivo cancellazione cliente: {a.ownerCancelReason}
                    </div>
                  )}
                </div>
                <Badge status={a.status} />
              </div>

              {/* Banner proposta dall'owner */}
              {a.proposal && a.proposal.from === "owner" && (
                <div
                  style={{
                    marginTop: 10,
                    background: colors.bgOrangeLight,
                    borderRadius: radius.md,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: fontSize.base, color: ORANGE }}>
                    📝 Il proprietario propone una modifica:
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

              {/* Azioni */}
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {a.status === "pending" && (
                  <>
                    <Btn small onClick={() => setStatus(a.id, "confirmed")}>
                      ✓ Conferma
                    </Btn>
                    <Btn small variant="danger" onClick={() => setRejectingId(a.id)}>
                      ✗ Rifiuta
                    </Btn>
                    {!a.proposal && (
                      <Btn
                        small
                        variant="ghost"
                        onClick={() => {
                          setProposingId(a.id);
                          setPropDate("");
                          setPropTime("");
                          setPropMsg("");
                        }}
                      >
                        📅 Proponi alternativa
                      </Btn>
                    )}
                  </>
                )}
                {a.status === "confirmed" && (
                  <>
                    <Btn small variant="light" onClick={() => setStatus(a.id, "completed")}>
                      Segna completata
                    </Btn>
                    {!a.vetNotes && (
                      <Btn
                        small
                        variant="ghost"
                        onClick={() => {
                          setNotingId(a.id);
                          setNoteText("");
                        }}
                      >
                        📝 Nota
                      </Btn>
                    )}
                    {!a.proposal && (
                      <Btn
                        small
                        variant="ghost"
                        onClick={() => {
                          setProposingId(a.id);
                          setPropDate("");
                          setPropTime("");
                          setPropMsg("");
                        }}
                      >
                        📅 Proponi cambio
                      </Btn>
                    )}
                  </>
                )}
                {a.status === "completed" && !hasRef && (
                  <Btn small variant="accent" onClick={() => setRefertoFor(a)}>
                    + Referto
                  </Btn>
                )}
                {a.status === "completed" && !hasInv && (
                  <Btn small variant="ghost" onClick={() => setInvoiceFor(a)}>
                    + Fattura
                  </Btn>
                )}
                {hasRef && (
                  <span style={{ fontSize: fontSize.sm, color: colors.success, fontWeight: 600, alignSelf: "center" }}>
                    📄 Referto ✓
                  </span>
                )}
                {hasInv && (
                  <span style={{ fontSize: fontSize.sm, color: colors.success, fontWeight: 600, alignSelf: "center" }}>
                    🧾 Fattura ✓
                  </span>
                )}
              </div>

              {/* Inline: aggiungi nota vet */}
              {notingId === a.id && (
                <div style={{ marginTop: 10, borderTop: `1px solid ${colors.divider}`, paddingTop: 10 }}>
                  <textarea
                    id={`note-${a.id}`}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={2}
                    placeholder="Nota breve per il proprietario…"
                    style={{ ...inputStyle, borderRadius: radius.lg }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <Btn small variant="light" onClick={() => setNotingId(null)}>
                      Annulla
                    </Btn>
                    <Btn
                      small
                      disabled={!noteText}
                      onClick={async () => {
                        setAppts(appts.map((x) => (x.id === a.id ? { ...x, vetNotes: noteText } : x)));
                        notify("📝 Nota aggiunta.");
                        setNotingId(null);
                        if (db.isSupabaseConfigured()) {
                          const { error } = await db.updateVetNotes(a.id, noteText);
                          if (error) notify("❌ Errore salvataggio: " + error.message);
                        }
                      }}
                    >
                      Salva nota
                    </Btn>
                  </div>
                </div>
              )}

              {/* Inline: proponi alternativa */}
              {proposingId === a.id && (
                <div style={{ marginTop: 10, borderTop: `1px solid ${colors.divider}`, paddingTop: 10 }}>
                  <b style={{ fontSize: fontSize.base }}>Proponi data/ora alternativa</b>
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
                    placeholder="Messaggio per il proprietario (facoltativo)…"
                    rows={2}
                    style={{ ...inputStyle, borderRadius: radius.md, marginTop: 8 }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <Btn small variant="light" onClick={() => setProposingId(null)}>
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

      {!waitlistEnabled && (
        <div style={{ marginTop: 16 }}>
          <UpgradePrompt
            feature="Lista d'attesa automatica"
            requiredPlan="Pro"
            description="Con il piano Pro puoi attivare la lista d'attesa: quando un appuntamento viene cancellato, il prossimo cliente in lista viene avvisato automaticamente."
            onViewPlans={onGoToPlan}
            compact
          />
        </div>
      )}

      <RejectDialog
        open={!!rejectingId}
        onCancel={() => setRejectingId(null)}
        onReject={async (reason) => {
          const appt = appts.find((a) => a.id === rejectingId);
          const pet = pets.find((p) => p.id === appt?.petId);
          setAppts(
            appts.map((a) => (a.id === rejectingId ? { ...a, status: "cancelled", rejectReason: reason || "" } : a))
          );
          notify("Appuntamento rifiutato.");
          if (db.isSupabaseConfigured()) {
            const { error } = await db.updateAppointmentStatus(rejectingId, "cancelled", {
              rejectReason: reason || "",
            });
            if (error) notify("❌ Errore salvataggio: " + error.message);
            /* Notifica al proprietario */
            if (appt?.ownerId) {
              db.createNotification({
                userId: appt.ownerId,
                type: "appt_cancelled",
                title: `❌ Visita rifiutata`,
                message: `${vet?.name || "Il veterinario"} ha rifiutato la visita di ${pet?.name || "il tuo animale"} del ${appt.date}${reason ? `. Motivo: ${reason}` : ""}`,
              });
            }
          }
          setRejectingId(null);
        }}
      />
    </>
  );
}
