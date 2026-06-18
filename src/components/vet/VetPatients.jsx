import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { updateClient, isSupabaseConfigured } from "../../lib/db.js";
import { TEAL, colors, fontSize, radius, searchInputStyle, compactInputStyle } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Empty from "../ui/Empty.jsx";

export default function VetPatients({ vetId }) {
  const { pets, appts, referti, clients, setClients, notify } = useApp();
  const [q, setQ] = useState("");

  /* Trova i client che hanno avuto almeno un appuntamento con questo vet */
  const myPetIds = [...new Set(appts.filter(a => a.vetId === vetId).map(a => a.petId))];
  const myClientIds = [...new Set(clients.filter(cl => cl.petIds.some(pid => myPetIds.includes(pid))).map(cl => cl.id))];
  const myClients = clients.filter(cl => myClientIds.includes(cl.id));

  /* Filtra per ricerca */
  const filteredClients = myClients.filter(cl => {
    if (!q) return true;
    const lower = q.toLowerCase();
    const clientPets = pets.filter(p => cl.petIds.includes(p.id));
    return cl.fullName.toLowerCase().includes(lower)
      || cl.email.toLowerCase().includes(lower)
      || clientPets.some(p => p.name.toLowerCase().includes(lower));
  });

  /* Modifica dati cliente */
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = (cl) => {
    setEditingClient(cl.id);
    setEditForm({ fullName: cl.fullName, cf: cl.cf, address: cl.address, email: cl.email, phone: cl.phone });
  };

  const saveEdit = async (clId) => {
    setClients(clients.map(cl => cl.id === clId ? { ...cl, ...editForm } : cl));
    setEditingClient(null);
    notify("✅ Dati cliente aggiornati!");
    if (isSupabaseConfigured()) {
      const { error } = await updateClient(clId, editForm);
      if (error) notify("❌ Errore salvataggio: " + error.message);
    }
  };

  /* Espandi/comprimi dettagli */
  const [expanded, setExpanded] = useState(null);

  return (
    <>
      <SectionTitle>Clienti e Pazienti</SectionTitle>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cerca cliente o animale…"
        style={{ ...searchInputStyle, marginBottom: 14 }} />

      <div style={{ display: "grid", gap: 10 }}>
        {filteredClients.length === 0 && myClients.length === 0 && <Empty icon="🐾" text="Non hai ancora pazienti" sub="Appariranno qui quando riceverai prenotazioni" />}
        {filteredClients.length === 0 && myClients.length > 0 && <Empty icon="🔍" text="Nessun cliente trovato" sub="Prova a cambiare la ricerca" />}
        {filteredClients.map(cl => {
          const clientPets = pets.filter(p => cl.petIds.includes(p.id));
          const isExpanded = expanded === cl.id;

          return (
            <Card key={cl.id}>
              {/* Header cliente */}
              <div onClick={() => setExpanded(isExpanded ? null : cl.id)} style={{ cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 36, background: colors.bgTealLight, borderRadius: radius.circle, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: fontSize.xl }}>{cl.fullName}</b>
                  <div style={{ fontSize: fontSize.md, color: colors.textSecondary }}>
                    {clientPets.map(p => `${p.photo} ${p.name}`).join(" · ")}
                  </div>
                  <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>{cl.email} · {cl.phone}</div>
                </div>
                <span style={{ fontSize: 14, color: colors.textMuted, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </div>

              {/* Dettagli espansi */}
              {isExpanded && (
                <div style={{ marginTop: 12, borderTop: `1px solid ${colors.divider}`, paddingTop: 12 }}>
                  {/* Dati fiscali */}
                  {editingClient === cl.id ? (
                    <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>Nome completo</label>
                        <input style={{ ...compactInputStyle, width: "100%", marginTop: 4 }} value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <label style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>C.F.</label>
                          <input style={{ ...compactInputStyle, width: "100%", marginTop: 4 }} value={editForm.cf} onChange={e => setEditForm({ ...editForm, cf: e.target.value.toUpperCase() })} maxLength={16} />
                        </div>
                        <div>
                          <label style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>Telefono</label>
                          <input style={{ ...compactInputStyle, width: "100%", marginTop: 4 }} value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>Indirizzo</label>
                        <input style={{ ...compactInputStyle, width: "100%", marginTop: 4 }} value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>Email</label>
                        <input style={{ ...compactInputStyle, width: "100%", marginTop: 4 }} type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn small onClick={() => saveEdit(cl.id)} disabled={!editForm.fullName}>Salva ✓</Btn>
                        <Btn small variant="light" onClick={() => setEditingClient(null)}>Annulla</Btn>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: fontSize.md, color: colors.textMedium }}>
                        <div>🪪 <b>C.F.:</b> {cl.cf || "—"}</div>
                        <div>📱 {cl.phone}</div>
                        <div>🏠 {cl.address || "—"}</div>
                        <div>📧 {cl.email}</div>
                      </div>
                      <Btn small variant="ghost" style={{ marginTop: 8 }} onClick={() => startEdit(cl)}>✏️ Modifica dati</Btn>
                    </div>
                  )}

                  {/* Animali del cliente */}
                  <div style={{ fontSize: fontSize.sm, fontWeight: 700, color: TEAL, textTransform: "uppercase", marginBottom: 6 }}>Animali</div>
                  {clientPets.map(p => {
                    const visits = appts.filter(a => a.petId === p.id && a.vetId === vetId);
                    const refs = referti.filter(r => r.petId === p.id && r.vetId === vetId);
                    return (
                      <div key={p.id} style={{ background: colors.bgLighter, borderRadius: radius.md, padding: "10px 12px", marginBottom: 6 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 28 }}>{p.photo}</span>
                          <div style={{ flex: 1 }}>
                            <b>{p.name}</b> <span style={{ color: colors.textSecondary, fontSize: fontSize.md }}>· {p.species}, {p.breed}</span>
                            <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>{visits.length} visite · {refs.length} referti</div>
                          </div>
                        </div>
                        {refs.length > 0 && (
                          <div style={{ marginTop: 6, fontSize: fontSize.md }}>
                            {refs.map(r => <div key={r.id} style={{ background: colors.bgTealSel, borderRadius: radius.sm, padding: "4px 8px", marginTop: 3 }}>📄 <b>{r.title}</b> · {r.date}</div>)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
