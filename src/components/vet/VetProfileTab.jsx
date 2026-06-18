import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE, colors, fontSize, radius, compactInputStyle, selectStyle } from "../../styles/tokens.js";
import { VET_SERVICES, SERVICE_CATEGORIES, SERVICE_EMOJIS } from "../../data/services.js";
import * as db from "../../lib/db.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import Stars from "../ui/Stars.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";

const ALL_DAYS = [
  { key: 1, label: "Lunedì" },
  { key: 2, label: "Martedì" },
  { key: 3, label: "Mercoledì" },
  { key: 4, label: "Giovedì" },
  { key: 5, label: "Venerdì" },
  { key: 6, label: "Sabato" },
  { key: 0, label: "Domenica" },
];

/* Emoji di default per ogni categoria */
const CAT_EMOJI = { Visite: "🩺", Vaccini: "💉", Analisi: "🩸", Diagnostica: "📷", Chirurgia: "🏥", Altro: "📋" };

export default function VetProfileTab({ vetId }) {
  const { vets, setVets, reviews, setReviews, notify } = useApp();
  const vet = vets.find(v => v.id === vetId);
  const [replyFor, setReplyFor] = useState(null);
  const [replyText, setReplyText] = useState("");

  if (!vet) return <Card>⏳ Caricamento profilo...</Card>;

  const mine = reviews.filter(r => r.vetId === vetId);

  /* Gestione disponibilità */
  const workDays = vet.workDays || [1, 2, 3, 4, 5];
  const toggleDay = async (dayKey) => {
    const updated = workDays.includes(dayKey)
      ? workDays.filter(d => d !== dayKey)
      : [...workDays, dayKey].sort((a, b) => a - b);
    setVets(vets.map(v => v.id === vetId ? { ...v, workDays: updated } : v));
    notify("📅 Disponibilità aggiornata!");
    if (db.isSupabaseConfigured()) {
      const { error } = await db.updateVetWorkDays(vetId, updated);
      if (error) notify("❌ Errore salvataggio: " + error.message);
    }
  };

  /* ── Gestione servizi / listino ── */
  const vetServices = vet.services || [];
  const activeIds = vetServices.map(s => s.id);

  /* Stato per le categorie accordion (aperte/chiuse) */
  const [openCats, setOpenCats] = useState({});
  const toggleCat = (cat) => setOpenCats({ ...openCats, [cat]: !openCats[cat] });

  /* Aggiunge/rimuove un servizio dal catalogo */
  const toggleService = async (svcId) => {
    let updated;
    if (activeIds.includes(svcId)) {
      updated = vetServices.filter(s => s.id !== svcId);
      setVets(vets.map(v => v.id === vetId ? { ...v, services: updated } : v));
      if (db.isSupabaseConfigured()) {
        await db.removeVetServiceByCatalog(vetId, svcId);
      }
    } else {
      updated = [...vetServices, { id: svcId, price: null }];
      setVets(vets.map(v => v.id === vetId ? { ...v, services: updated } : v));
      if (db.isSupabaseConfigured()) {
        await db.addVetService(vetId, svcId, null);
      }
    }
  };

  /* Aggiorna il prezzo custom di un servizio */
  const updatePrice = (svcId, newPrice) => {
    const updated = vetServices.map(s =>
      s.id === svcId ? { ...s, price: newPrice === "" ? null : Number(newPrice) } : s
    );
    setVets(vets.map(v => v.id === vetId ? { ...v, services: updated } : v));
    /* Il salvataggio del prezzo avviene con debounce (quando l'utente cambia campo),
       ma per semplicità salviamo subito. */
    if (db.isSupabaseConfigured()) {
      db.updateVetServicePrice(vetId, svcId, newPrice);
    }
  };

  /* Servizi custom del vet (id non inizia con "sv") */
  const customServices = vetServices.filter(s => !s.id.startsWith("sv"));

  /* Form per nuovo servizio custom */
  const [addingCustom, setAddingCustom] = useState(false);
  const [customForm, setCustomForm] = useState({ name: "", price: "", duration: "", cat: "Visite", emoji: "🩺", desc: "" });

  const addCustomService = async () => {
    if (db.isSupabaseConfigured()) {
      const { data, error } = await db.addCustomVetService(vetId, {
        name: customForm.name, price: customForm.price,
        duration: customForm.duration, category: customForm.cat,
        emoji: customForm.emoji, desc: customForm.desc,
      });
      if (error) { notify("❌ Errore: " + error.message); return; }
      /* Aggiungi allo stato locale con l'id generato da Supabase */
      const newSvc = {
        id: data.id, name: data.custom_name,
        price: Number(data.custom_price), duration: Number(data.custom_duration),
        cat: data.custom_category, emoji: data.custom_emoji, desc: data.custom_desc || "",
      };
      setVets(vets.map(v => v.id === vetId ? { ...v, services: [...vetServices, newSvc] } : v));
    } else {
      const newSvc = {
        id: "c_" + vetId + "_" + Date.now(),
        name: customForm.name, price: Number(customForm.price),
        duration: Number(customForm.duration), cat: customForm.cat,
        emoji: customForm.emoji, desc: customForm.desc || "",
      };
      setVets(vets.map(v => v.id === vetId ? { ...v, services: [...vetServices, newSvc] } : v));
    }
    setCustomForm({ name: "", price: "", duration: "", cat: "Visite", emoji: "🩺", desc: "" });
    setAddingCustom(false);
    notify("✅ Servizio aggiunto!");
  };

  const removeCustom = async (svcId) => {
    setVets(vets.map(v => v.id === vetId ? { ...v, services: vetServices.filter(s => s.id !== svcId) } : v));
    notify("🗑️ Servizio rimosso");
    if (db.isSupabaseConfigured()) {
      await db.removeVetService(svcId);
    }
  };

  /* Stato per modifica servizio custom */
  const [editingCustom, setEditingCustom] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEditCustom = (svc) => {
    setEditingCustom(svc.id);
    setEditForm({ name: svc.name, price: svc.price, duration: svc.duration, cat: svc.cat, emoji: svc.emoji, desc: svc.desc || "" });
  };

  const saveEditCustom = async (svcId) => {
    const updated = vetServices.map(s =>
      s.id === svcId ? { ...s, ...editForm, price: Number(editForm.price), duration: Number(editForm.duration) } : s
    );
    setVets(vets.map(v => v.id === vetId ? { ...v, services: updated } : v));
    setEditingCustom(null);
    notify("✅ Servizio aggiornato!");
    if (db.isSupabaseConfigured()) {
      const { error } = await db.updateCustomVetService(svcId, {
        name: editForm.name, price: editForm.price,
        duration: editForm.duration, category: editForm.cat,
        emoji: editForm.emoji, desc: editForm.desc,
      });
      if (error) notify("❌ Errore salvataggio: " + error.message);
    }
  };

  return (
    <>
      <Card style={{ textAlign: "center" }}>
        <div style={{ fontSize: 50 }}>{vet.avatar}</div>
        <h3 style={{ margin: "6px 0 2px" }}>{vet.name}</h3>
        <div style={{ color: colors.textSecondary, fontSize: fontSize.base }}>{vet.clinic} · {vet.city}</div>
        <div style={{ margin: "8px 0" }}><Stars n={vet.rating} /> <b>{vet.rating}</b> · {vet.reviews} recensioni</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          {vet.spec.map(s => <span key={s} style={{ background: colors.bgTealLight, color: TEAL, fontSize: fontSize.sm, padding: "4px 10px", borderRadius: radius.md, fontWeight: 600 }}>{s}</span>)}
        </div>
      </Card>

      {/* Gestione giorni lavorativi */}
      <SectionTitle style={{ marginTop: 18 }}>📅 Giorni lavorativi</SectionTitle>
      <Card>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ALL_DAYS.map(d => {
            const active = workDays.includes(d.key);
            return (
              <button key={d.key} onClick={() => toggleDay(d.key)} aria-label={`${d.label}: ${active ? "attivo" : "disattivo"}`}
                style={{ padding: "8px 14px", borderRadius: radius.md, border: `2px solid ${active ? TEAL : colors.borderLight}`, background: active ? colors.bgTealSel : colors.white, color: active ? TEAL : colors.textMuted, fontWeight: 600, fontSize: fontSize.md, cursor: "pointer", minHeight: 36 }}>
                {d.label}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 8 }}>
          Clicca un giorno per attivarlo/disattivarlo. I proprietari vedranno solo i giorni attivi.
        </div>
      </Card>

      {/* ── Prestazioni e listino ── */}
      <SectionTitle style={{ marginTop: 18 }}>🩺 Prestazioni e listino</SectionTitle>
      <div style={{ fontSize: fontSize.md, color: colors.textMuted, marginBottom: 10 }}>
        Scegli quali prestazioni offri e personalizza i prezzi. I proprietari vedranno solo i servizi attivi.
      </div>

      {/* Catalogo globale raggruppato per categoria */}
      {SERVICE_CATEGORIES.map(cat => {
        const catServices = VET_SERVICES.filter(s => s.cat === cat);
        const activeInCat = catServices.filter(s => activeIds.includes(s.id)).length;
        const isOpen = openCats[cat];

        return (
          <Card key={cat} style={{ marginBottom: 8, padding: 0, overflow: "hidden" }}>
            {/* Header categoria (accordion) */}
            <button onClick={() => toggleCat(cat)} style={{
              width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
            }}>
              <span style={{ fontWeight: 700, fontSize: fontSize.base }}>
                {CAT_EMOJI[cat]} {cat} <span style={{ color: colors.textMuted, fontWeight: 400, fontSize: fontSize.md }}>({activeInCat}/{catServices.length} attivi)</span>
              </span>
              <span style={{ fontSize: 16, color: colors.textMuted, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
            </button>

            {/* Contenuto (servizi) */}
            {isOpen && (
              <div style={{ borderTop: `1px solid ${colors.divider}`, padding: "8px 14px 14px" }}>
                {catServices.map(svc => {
                  const isActive = activeIds.includes(svc.id);
                  const vetSvc = vetServices.find(s => s.id === svc.id);
                  return (
                    <div key={svc.id} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                      borderBottom: `1px solid ${colors.divider}`, opacity: isActive ? 1 : 0.5,
                    }}>
                      {/* Toggle on/off */}
                      <button onClick={() => toggleService(svc.id)} aria-label={`${isActive ? "Disattiva" : "Attiva"} ${svc.name}`}
                        style={{
                          width: 36, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                          background: isActive ? TEAL : colors.borderLight, position: "relative", flexShrink: 0,
                          transition: "background 0.2s",
                        }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: "50%", background: colors.white,
                          position: "absolute", top: 3, left: isActive ? 17 : 3,
                          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }} />
                      </button>

                      <span style={{ fontSize: 20, flexShrink: 0 }}>{svc.emoji}</span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: fontSize.base }}>{svc.name}</div>
                        <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>⏱ ~{svc.duration} min</div>
                      </div>

                      {/* Campo prezzo (editabile solo se attivo) */}
                      {isActive ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                          <span style={{ fontSize: fontSize.md, color: colors.textMuted }}>€</span>
                          <input
                            type="number" min="0" step="1"
                            value={vetSvc?.price ?? svc.price}
                            onChange={e => updatePrice(svc.id, e.target.value)}
                            style={{ ...compactInputStyle, width: 64, textAlign: "right", fontWeight: 700, color: ORANGE }}
                          />
                        </div>
                      ) : (
                        <span style={{ fontSize: fontSize.md, color: colors.textMuted, flexShrink: 0 }}>€{svc.price}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}

      {/* Servizi personalizzati del vet */}
      {customServices.length > 0 && (
        <>
          <SectionTitle style={{ marginTop: 14 }}>✨ I tuoi servizi personalizzati</SectionTitle>
          {customServices.map(svc => (
            <Card key={svc.id} style={{ marginBottom: 8 }}>
              {editingCustom === svc.id ? (
                /* Form modifica inline */
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select value={editForm.emoji} onChange={e => setEditForm({ ...editForm, emoji: e.target.value })}
                      style={{ ...selectStyle, width: 64, textAlign: "center", fontSize: 20, padding: "4px" }}>
                      {SERVICE_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <input style={{ ...compactInputStyle, flex: 1 }} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Nome" />
                  </div>
                  <input style={compactInputStyle} value={editForm.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} placeholder="Descrizione breve" />
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Prezzo €</label>
                      <input type="number" min="0" style={{ ...compactInputStyle, width: "100%" }} value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Durata min</label>
                      <input type="number" min="5" style={{ ...compactInputStyle, width: "100%" }} value={editForm.duration} onChange={e => setEditForm({ ...editForm, duration: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Categoria</label>
                      <select style={{ ...selectStyle, width: "100%" }} value={editForm.cat} onChange={e => setEditForm({ ...editForm, cat: e.target.value })}>
                        {SERVICE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn small onClick={() => saveEditCustom(svc.id)} disabled={!editForm.name || !editForm.price}>Salva ✓</Btn>
                    <Btn small variant="light" onClick={() => setEditingCustom(null)}>Annulla</Btn>
                  </div>
                </div>
              ) : (
                /* Vista normale */
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{svc.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: fontSize.base }}>{svc.name}</div>
                    {svc.desc && <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>{svc.desc}</div>}
                    <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>⏱ ~{svc.duration} min · {svc.cat}</div>
                  </div>
                  <b style={{ color: ORANGE, fontSize: fontSize.xl }}>€{svc.price}</b>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Btn small variant="ghost" onClick={() => startEditCustom(svc)}>✏️</Btn>
                    <Btn small variant="ghost" onClick={() => removeCustom(svc.id)}>🗑️</Btn>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </>
      )}

      {/* Form aggiungi servizio custom */}
      {addingCustom ? (
        <Card style={{ marginTop: 10 }}>
          <b style={{ fontSize: fontSize.base }}>Nuovo servizio personalizzato</b>
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={customForm.emoji} onChange={e => setCustomForm({ ...customForm, emoji: e.target.value })}
                style={{ ...selectStyle, width: 64, textAlign: "center", fontSize: 20, padding: "4px" }}>
                {SERVICE_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <input style={{ ...compactInputStyle, flex: 1 }} value={customForm.name} onChange={e => setCustomForm({ ...customForm, name: e.target.value })} placeholder="Nome del servizio *" />
            </div>
            <input style={compactInputStyle} value={customForm.desc} onChange={e => setCustomForm({ ...customForm, desc: e.target.value })} placeholder="Descrizione breve (facoltativa)" />
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Prezzo € *</label>
                <input type="number" min="0" style={{ ...compactInputStyle, width: "100%" }} value={customForm.price} onChange={e => setCustomForm({ ...customForm, price: e.target.value })} placeholder="50" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Durata min *</label>
                <input type="number" min="5" style={{ ...compactInputStyle, width: "100%" }} value={customForm.duration} onChange={e => setCustomForm({ ...customForm, duration: e.target.value })} placeholder="30" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Categoria</label>
                <select style={{ ...selectStyle, width: "100%" }} value={customForm.cat} onChange={e => setCustomForm({ ...customForm, cat: e.target.value })}>
                  {SERVICE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Btn onClick={addCustomService} disabled={!customForm.name || !customForm.price || !customForm.duration} style={{ flex: 1 }}>Aggiungi ✓</Btn>
              <Btn variant="light" onClick={() => setAddingCustom(false)} style={{ flex: 1 }}>Annulla</Btn>
            </div>
          </div>
        </Card>
      ) : (
        <Btn variant="accent" onClick={() => setAddingCustom(true)} style={{ marginTop: 10, width: "100%" }}>+ Aggiungi servizio personalizzato</Btn>
      )}

      {/* Recensioni */}
      <SectionTitle style={{ marginTop: 18 }}>Recensioni ricevute</SectionTitle>
      <div style={{ display: "grid", gap: 10 }}>
        {mine.map(r => (
          <Card key={r.id}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <b style={{ fontSize: fontSize.base }}>{r.author}</b><span style={{ fontSize: fontSize.sm, color: colors.textMuted }}>{r.date}</span>
            </div>
            <Stars n={r.rating} />
            <div style={{ fontSize: fontSize.base, marginTop: 4 }}>{r.comment}</div>
            {r.reply ? (
              <div style={{ marginTop: 8, background: colors.bgTealSel, padding: "8px 10px", borderRadius: radius.md, fontSize: fontSize.md }}><b style={{ color: TEAL }}>La tua risposta:</b> {r.reply}</div>
            ) : replyFor === r.id ? (
              <div style={{ marginTop: 8 }}>
                <label htmlFor={`reply-${r.id}`} style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>La tua risposta</label>
                <textarea id={`reply-${r.id}`} value={replyText} onChange={e => setReplyText(e.target.value)} rows={2} placeholder="Scrivi una risposta…"
                  style={{ width: "100%", borderRadius: radius.md, border: `1px solid ${colors.border}`, padding: 8, fontSize: fontSize.md, boxSizing: "border-box", fontFamily: "inherit", marginTop: 4 }} />
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <Btn small onClick={async () => {
                    setReviews(reviews.map(x => x.id === r.id ? { ...x, reply: replyText } : x));
                    setReplyFor(null); setReplyText(""); notify("Risposta pubblicata.");
                    if (db.isSupabaseConfigured()) {
                      const { error } = await db.replyToReview(r.id, replyText);
                      if (error) notify("❌ Errore salvataggio: " + error.message);
                    }
                  }} disabled={!replyText}>Pubblica</Btn>
                  <Btn small variant="light" onClick={() => setReplyFor(null)}>Annulla</Btn>
                </div>
              </div>
            ) : (
              <Btn small variant="ghost" style={{ marginTop: 8 }} onClick={() => setReplyFor(r.id)}>↩ Rispondi</Btn>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
