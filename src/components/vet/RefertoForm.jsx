import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { today, fmtDate } from "../../data/helpers.js";
import { colors, fontSize, inputStyle } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";

export default function RefertoForm({ appt, vetId, onDone }) {
  const { pets, referti, setReferti, notify } = useApp();
  const pet = pets.find(p => p.id === appt.petId);
  const [f, setF] = useState({ title: "", diagnosis: "", treatments: "", drugs: "", advice: "", next: "" });
  const inp = { ...inputStyle, marginTop: 6 };
  return (
    <>
      <Btn small variant="light" onClick={onDone}>← Indietro</Btn>
      <Card style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Nuovo referto · {pet?.photo} {pet?.name}</h3>
        {/* Disclaimer responsabilità veterinario — HIGH fix */}
        <div style={{ background: "#E3F2FD", borderRadius: colors.radius?.md || 8, padding: "10px 14px", marginBottom: 14, fontSize: fontSize.md, color: "#1565C0", lineHeight: 1.6 }}>
          <b>ℹ️ Nota professionale:</b> Il referto è un documento clinico redatto e firmato sotto la responsabilità esclusiva del veterinario. MioVeterinario fornisce solo lo strumento tecnico di redazione. Il contenuto diagnostico, terapeutico e prescrittivo è di esclusiva competenza e responsabilità del professionista. Il referto non sostituisce la ricetta veterinaria ufficiale (REV) per i farmaci soggetti a prescrizione. [DA VALIDARE CON VETERINARIO/ORDINE]
        </div>

        <label htmlFor="ref-title" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}>Titolo *</label>
        <input id="ref-title" style={inp} placeholder="Es. Visita dermatologica" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} maxLength={100} />

        <label htmlFor="ref-diag" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}>Diagnosi *</label>
        <textarea id="ref-diag" style={inp} rows={2} placeholder="Diagnosi" value={f.diagnosis} onChange={e => setF({ ...f, diagnosis: e.target.value })} maxLength={2000} />

        <label htmlFor="ref-treat" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}>Trattamenti</label>
        <textarea id="ref-treat" style={inp} rows={2} placeholder="Trattamenti effettuati" value={f.treatments} onChange={e => setF({ ...f, treatments: e.target.value })} maxLength={1000} />

        <label htmlFor="ref-drugs" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}>Farmaci</label>
        <textarea id="ref-drugs" style={inp} rows={2} placeholder="Farmaci prescritti" value={f.drugs} onChange={e => setF({ ...f, drugs: e.target.value })} maxLength={500} />

        <label htmlFor="ref-advice" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}>Indicazioni</label>
        <textarea id="ref-advice" style={inp} rows={2} placeholder="Indicazioni per il proprietario" value={f.advice} onChange={e => setF({ ...f, advice: e.target.value })} maxLength={1000} />

        <label htmlFor="ref-next" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}>Prossima visita</label>
        <input id="ref-next" style={inp} placeholder="Prossima visita consigliata" value={f.next} onChange={e => setF({ ...f, next: e.target.value })} maxLength={100} />

        {/* Avviso farmaci — non sostituisce REV */}
        <p style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 8, lineHeight: 1.5 }}>
          ⚠️ Per farmaci soggetti a prescrizione usa la Ricetta Veterinaria Elettronica (REV) ufficiale. Il campo "Farmaci" è solo un promemoria clinico per il proprietario.
        </p>
        <Btn variant="accent" style={{ marginTop: 12, width: "100%" }} disabled={!f.title || !f.diagnosis} onClick={() => {
          setReferti([...referti, { id: "r" + Date.now(), apptId: appt.id, petId: appt.petId, vetId, date: fmtDate(today), ...f }]);
          notify("📄 Referto creato e condiviso col proprietario."); onDone();
        }}>Salva e condividi referto</Btn>
      </Card>
    </>
  );
}
