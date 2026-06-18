import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE, colors, fontSize, radius, searchInputStyle } from "../../styles/tokens.js";
import { printInvoice } from "../../utils/invoicePrint.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";

export default function OwnerDocs() {
  const { referti, invoices, pets, vets, ownerProfile } = useApp();
  const [tab, setTab] = useState("referti");
  const [open, setOpen] = useState(null);
  const [q, setQ] = useState("");

  const matchQ = (text) => !q || text.toLowerCase().includes(q.toLowerCase());

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[["referti", "📄 Referti"], ["fatture", "🧾 Fatture"]].map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); setOpen(null); setQ(""); }} style={{ flex: 1, padding: "10px", borderRadius: radius.lg, border: "none", cursor: "pointer", fontWeight: 700, background: tab === k ? TEAL : colors.bgBtn, color: tab === k ? colors.white : colors.textMedium }}>{l}</button>
        ))}
      </div>

      <input id="docs-search" value={q} onChange={e => setQ(e.target.value)}
        placeholder={tab === "referti" ? "Cerca referto…" : "Cerca fattura…"}
        style={{ ...searchInputStyle, marginBottom: 14 }} />

      {tab === "referti" && (
        <div style={{ display: "grid", gap: 10 }}>
          {/* Disclaimer referti — HIGH fix */}
          <div style={{ background: "#E3F2FD", borderRadius: 8, padding: "10px 14px", fontSize: fontSize.md, color: "#1565C0", lineHeight: 1.6 }}>
            <b>ℹ️ I referti sono documenti clinici</b> redatti e firmati dal veterinario, che ne è l'unico responsabile. Non modificare o condividere il contenuto senza il consenso del professionista. Per farmaci soggetti a prescrizione fa fede la Ricetta Veterinaria Elettronica (REV) ufficiale.
          </div>
          {referti.filter(r => {
            const pet = pets.find(p => p.id === r.petId);
            const vet = vets.find(v => v.id === r.vetId);
            return matchQ([r.title, pet?.name, vet?.name, r.diagnosis].join(" "));
          }).map(r => {
            const pet = pets.find(p => p.id === r.petId);
            const vet = vets.find(v => v.id === r.vetId);
            const isOpen = open === r.id;
            return (
              <Card key={r.id} onClick={() => setOpen(isOpen ? null : r.id)}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <b>{pet?.photo} {r.title}</b><span style={{ fontSize: fontSize.md, color: colors.textMuted }}>{r.date}</span>
                </div>
                <div style={{ fontSize: fontSize.md, color: colors.textSecondary }}>{pet?.name} · {vet?.name}</div>
                {isOpen && (
                  <div style={{ marginTop: 10, fontSize: fontSize.base, lineHeight: 1.7, borderTop: `1px solid ${colors.divider}`, paddingTop: 10 }}>
                    <b style={{ color: TEAL }}>Diagnosi:</b> {r.diagnosis}<br/>
                    <b style={{ color: TEAL }}>Trattamenti:</b> {r.treatments}<br/>
                    <b style={{ color: TEAL }}>Farmaci:</b> {r.drugs}<br/>
                    <b style={{ color: TEAL }}>Indicazioni:</b> {r.advice}<br/>
                    <b style={{ color: TEAL }}>Prossima visita:</b> {r.next}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab === "fatture" && (
        <div style={{ display: "grid", gap: 10 }}>
          {/* Disclaimer fatture — HIGH fix [DA VALIDARE CON COMMERCIALISTA] */}
          <div style={{ background: colors.bgOrangeLight, borderRadius: 8, padding: "10px 14px", fontSize: fontSize.md, color: colors.textMedium, lineHeight: 1.6 }}>
            <b>ℹ️ Le fatture</b> sono emesse dal veterinario/clinica che ha erogato la prestazione, che ne è il soggetto fiscalmente responsabile. Il documento generato da questa app è una bozza riepilogativa. Prima del go-live occorre integrare il flusso di fatturazione elettronica (SdI). [DA VALIDARE CON COMMERCIALISTA]
          </div>
          {invoices.filter(f => {
            const vet = vets.find(v => v.id === f.vetId);
            return matchQ([vet?.name, ...f.items.map(i => i.desc)].join(" "));
          }).map(f => {
            const vet = vets.find(v => v.id === f.vetId);
            const displayTotal = f.total != null ? f.total : f.items.reduce((s, i) => s + i.qty * i.price, 0);
            const isOpen = open === f.id;
            const isPaid = f.status === "paid";
            return (
              <Card key={f.id} onClick={() => setOpen(isOpen ? null : f.id)}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <b>🧾 Fattura {f.number || f.id.toUpperCase()}</b>
                  <b style={{ color: ORANGE }}>€{displayTotal.toFixed(2)}</b>
                </div>
                <div style={{ fontSize: fontSize.md, color: colors.textSecondary }}>
                  {vet?.name} · {f.date} · {f.payment && `${f.payment} · `}
                  <span style={{ color: isPaid ? colors.success : colors.warning, fontWeight: 600 }}>{isPaid ? "Pagata" : "Da pagare"}</span>
                </div>
                {isOpen && (
                  <div style={{ marginTop: 10, borderTop: `1px solid ${colors.divider}`, paddingTop: 10 }}>
                    <table style={{ width: "100%", fontSize: fontSize.md, borderCollapse: "collapse" }}>
                      <tbody>
                        {f.items.map((i, ix) => (
                          <tr key={ix} style={{ borderBottom: `1px solid ${colors.divider}` }}>
                            <td style={{ padding: "6px 0" }}>{i.desc}</td>
                            <td style={{ textAlign: "center", width: 40 }}>×{i.qty}</td>
                            <td style={{ textAlign: "right", width: 70 }}>€{(i.qty * i.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Riepilogo fiscale */}
                    <div style={{ marginTop: 8, fontSize: fontSize.md, color: colors.textSecondary }}>
                      {f.enpav > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span>ENPAV 2%</span><span>€{f.enpav.toFixed(2)}</span></div>}
                      {f.iva > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span>IVA 22%</span><span>€{f.iva.toFixed(2)}</span></div>}
                      {f.bollo > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span>Bollo</span><span>€{f.bollo.toFixed(2)}</span></div>}
                    </div>
                    <Btn small variant="light" style={{ marginTop: 10, width: "100%" }} onClick={(e) => {
                      e.stopPropagation();
                      const dest = { fullName: f.destName || ownerProfile.fullName, cf: f.destCf || ownerProfile.cf, address: f.destAddress || ownerProfile.address, email: f.destEmail || ownerProfile.email, phone: f.destPhone || ownerProfile.phone };
                      printInvoice(f, vet, dest);
                    }}>📥 Scarica fattura</Btn>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
