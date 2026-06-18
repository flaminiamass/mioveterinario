import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL, colors, fontSize, inputStyle } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";

export default function OwnerProfile({ onBack }) {
  const { ownerProfile, setOwnerProfile, notify } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...ownerProfile });
  const inp = { ...inputStyle, marginTop: 6 };

  const save = () => { setOwnerProfile({ ...form }); setEditing(false); notify("✅ Profilo aggiornato!"); };

  return (
    <>
      <Btn small variant="light" onClick={onBack}>← Indietro</Btn>
      <SectionTitle style={{ marginTop: 12 }}>Il mio profilo</SectionTitle>
      <Card style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56 }}>👤</div>
        {!editing ? (
          <>
            <h2 style={{ margin: "8px 0 4px" }}>{ownerProfile.fullName}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12, fontSize: fontSize.base, color: colors.textMedium }}>
              <div>📧 {ownerProfile.email}</div>
              <div>📱 {ownerProfile.phone}</div>
              <div>🏠 {ownerProfile.address || "—"}</div>
              <div>🪪 C.F.: {ownerProfile.cf || "—"}</div>
            </div>
            <div style={{ marginTop: 10, padding: "8px 12px", background: colors.bgTealSel, borderRadius: 8, fontSize: fontSize.sm, color: TEAL }}>
              ℹ️ Il codice fiscale e l'indirizzo servono per ricevere fatture detraibili.
            </div>
            <Btn small variant="ghost" style={{ marginTop: 14 }} onClick={() => { setForm({ ...ownerProfile }); setEditing(true); }}>✏️ Modifica</Btn>
          </>
        ) : (
          <div style={{ textAlign: "left", marginTop: 12 }}>
            <label htmlFor="prof-name" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>Nome completo</label>
            <input id="prof-name" style={inp} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
            <label htmlFor="prof-email" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}>Email</label>
            <input id="prof-email" style={inp} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <label htmlFor="prof-phone" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}>Telefono</label>
            <input id="prof-phone" style={inp} type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <label htmlFor="prof-address" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}>Indirizzo</label>
            <input id="prof-address" style={inp} placeholder="Via, CAP, Città" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <label htmlFor="prof-cf" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}>Codice Fiscale</label>
            <input id="prof-cf" style={inp} placeholder="RSSMRA80A01H501Z" value={form.cf} onChange={e => setForm({ ...form, cf: e.target.value.toUpperCase() })} maxLength={16} />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn variant="light" onClick={() => setEditing(false)} style={{ flex: 1 }}>Annulla</Btn>
              <Btn onClick={save} style={{ flex: 1 }} disabled={!form.fullName}>Salva ✓</Btn>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
