import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { ORANGE } from "../../data/constants.js";
import { today, fmtDate } from "../../data/helpers.js";
import { getService } from "../../data/services.js";
import useIsMobile from "../../hooks/useIsMobile.js";
import * as db from "../../lib/db.js";
import { mapInvoice } from "../../lib/mappers.js";
import { TEAL, colors, fontSize, radius, compactInputStyle, selectStyle } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";

export default function InvoiceForm({ appt, vetId, onDone }) {
  const { vets, invoices, setInvoices, clients, setClients, ownerProfile, notify } = useApp();
  const vet = vets.find(v => v.id === vetId);
  const isMobile = useIsMobile();

  /* ── Selezione cliente ── */
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const client = clients.find(c => c.id === clientId);

  /* Dati destinatario (pre-compilati dal client, editabili) */
  const [dest, setDest] = useState({
    fullName: client?.fullName || ownerProfile.fullName,
    cf: client?.cf || ownerProfile.cf,
    address: client?.address || ownerProfile.address,
    email: client?.email || ownerProfile.email,
    phone: client?.phone || ownerProfile.phone,
  });

  /* Quando cambia il client dal dropdown, aggiorna i campi */
  const handleClientChange = (newId) => {
    setClientId(newId);
    const cl = clients.find(c => c.id === newId);
    if (cl) {
      setDest({ fullName: cl.fullName, cf: cl.cf, address: cl.address, email: cl.email, phone: cl.phone });
    }
  };

  const svc = appt.serviceId ? getService(appt.serviceId) : null;
  const [items, setItems] = useState([{ desc: svc?.name || "Visita", qty: 1, price: svc?.price || 50 }]);
  const [payment, setPayment] = useState("POS");

  const year = new Date().getFullYear();
  const nextNum = invoices.filter(f => f.vetId === vetId).length + 1;
  const invoiceNumber = `${nextNum}/${year}`;

  const imponibile = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const isForfe = vet?.regime === "forfettario";
  const enpav = isForfe ? 0 : Math.round(imponibile * 0.02 * 100) / 100;
  const baseIva = imponibile + enpav;
  const iva = isForfe ? 0 : Math.round(baseIva * 0.22 * 100) / 100;
  const bollo = (isForfe && (imponibile + enpav) > 77.47) ? 2 : 0;
  const total = Math.round((imponibile + enpav + iva + bollo) * 100) / 100;

  const upd = (ix, k, v) => setItems(items.map((it, i) => i === ix ? { ...it, [k]: v } : it));
  const removeItem = (ix) => setItems(items.filter((_, i) => i !== ix));

  const emitInvoice = async () => {
    /* Salva/aggiorna dati del client per le prossime volte */
    if (clientId && client) {
      const updatedClient = { ...client, ...dest };
      setClients(clients.map(c => c.id === clientId ? updatedClient : c));
      if (db.isSupabaseConfigured()) {
        await db.updateClient(clientId, dest);
      }
    }

    const invoiceItems = items.map(i => ({ ...i, qty: Number(i.qty), price: Number(i.price) }));

    if (db.isSupabaseConfigured()) {
      const { data, error } = await db.createInvoice({
        apptId: appt.id, vetId, clientId: clientId || null,
        number: invoiceNumber, payment, items: invoiceItems,
        enpav, iva, bollo, total, dest,
      });
      if (error) { notify("❌ Errore: " + error.message); return; }
      setInvoices([...invoices, mapInvoice(data)]);
    } else {
      setInvoices([...invoices, {
        id: "f" + Date.now(), apptId: appt.id, vetId, clientId: clientId || null,
        date: fmtDate(today), number: invoiceNumber, payment,
        items: invoiceItems, enpav, iva, bollo, total, status: "unpaid",
        destName: dest.fullName, destCf: dest.cf, destAddress: dest.address,
        destEmail: dest.email, destPhone: dest.phone,
      }]);
    }
    notify("🧾 Fattura emessa.");
    onDone();
  };

  return (
    <>
      <Btn small variant="light" onClick={onDone}>← Indietro</Btn>
      <Card style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Nuova fattura · N° {invoiceNumber} <span style={{ fontSize: fontSize.sm, color: colors.warning, fontWeight: 600 }}>[BOZZA — non è fattura elettronica]</span></h3>
        {/* Disclaimer fiscale — HIGH fix [DA VALIDARE CON COMMERCIALISTA] */}
        <div style={{ background: colors.bgOrangeLight, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: fontSize.md, color: colors.textMedium, lineHeight: 1.6 }}>
          <b>⚠️ Attenzione fiscale:</b> Questo documento è una bozza riepilogativa generata dalla piattaforma. Non costituisce fattura elettronica ai sensi della normativa italiana (D.Lgs. 127/2015). Per la fattura fiscalmente valida è necessario il flusso SdI/Agenzia Entrate. I calcoli di ENPAV e IVA sono orientativi: verificarli con il proprio commercialista. [DA VALIDARE CON COMMERCIALISTA]
        </div>

        {/* Selezione cliente */}
        {clients.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="inv-client" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>Cliente</label>
            <select id="inv-client" style={{ ...selectStyle, marginTop: 4, width: "100%" }} value={clientId} onChange={e => handleClientChange(e.target.value)}>
              {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.fullName}</option>)}
            </select>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 16, background: colors.bgLighter, borderRadius: radius.lg, padding: 12 }}>
          <div>
            <div style={{ fontSize: fontSize.sm, color: TEAL, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Emittente</div>
            <div style={{ fontSize: fontSize.md, lineHeight: 1.6, color: colors.textMedium }}>
              <b>{vet?.name}</b><br/>{vet?.clinic}<br/>{vet?.address}<br/>
              P.IVA: {vet?.piva || "—"}<br/>C.F.: {vet?.cf || "—"}<br/>Albo: {vet?.albo || "—"}<br/>
              Regime: {isForfe ? "Forfettario" : "Ordinario"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: fontSize.sm, color: TEAL, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Destinatario</div>
            <div style={{ fontSize: fontSize.md, lineHeight: 1.6, color: colors.textMedium }}>
              <b>{dest.fullName}</b><br/>{dest.address || "—"}<br/>
              C.F.: {dest.cf || "—"}<br/>📧 {dest.email}<br/>📱 {dest.phone}
            </div>
            {/* Modifica rapida dati destinatario */}
            <details style={{ marginTop: 6 }}>
              <summary style={{ fontSize: fontSize.sm, color: TEAL, cursor: "pointer", fontWeight: 600 }}>✏️ Modifica dati</summary>
              <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
                <input style={compactInputStyle} value={dest.fullName} onChange={e => setDest({ ...dest, fullName: e.target.value })} placeholder="Nome completo" />
                <input style={compactInputStyle} value={dest.cf} onChange={e => setDest({ ...dest, cf: e.target.value.toUpperCase() })} placeholder="Codice Fiscale" maxLength={16} />
                <input style={compactInputStyle} value={dest.address} onChange={e => setDest({ ...dest, address: e.target.value })} placeholder="Indirizzo" />
                <input style={compactInputStyle} type="email" value={dest.email} onChange={e => setDest({ ...dest, email: e.target.value })} placeholder="Email" />
                <input style={compactInputStyle} type="tel" value={dest.phone} onChange={e => setDest({ ...dest, phone: e.target.value })} placeholder="Telefono" />
              </div>
            </details>
          </div>
        </div>

        <div style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginBottom: 6 }}>Voci</div>
        {items.map((it, ix) => (
          <div key={ix} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 80px 100px 30px", gap: 6, marginBottom: 8, alignItems: "center" }}>
            <input style={compactInputStyle} placeholder="Descrizione" value={it.desc} onChange={e => upd(ix, "desc", e.target.value)} />
            <div style={{ display: isMobile ? "flex" : "contents", gap: 6 }}>
              <input style={{ ...compactInputStyle, flex: 1 }} type="number" min="1" placeholder="Qtà" value={it.qty} onChange={e => upd(ix, "qty", e.target.value)} />
              <input style={{ ...compactInputStyle, flex: 1 }} type="number" min="0" step="0.01" placeholder="€" value={it.price} onChange={e => upd(ix, "price", e.target.value)} />
            </div>
            {items.length > 1 && <button onClick={() => removeItem(ix)} aria-label="Rimuovi" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: colors.dangerFg, padding: 2 }}>✕</button>}
          </div>
        ))}
        <Btn small variant="light" onClick={() => setItems([...items, { desc: "", qty: 1, price: 0 }])}>+ Aggiungi voce</Btn>

        <div style={{ marginTop: 14 }}>
          <label htmlFor="inv-pay" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>Pagamento</label>
          <select id="inv-pay" style={{ ...selectStyle, marginTop: 4, width: "100%" }} value={payment} onChange={e => setPayment(e.target.value)}>
            <option value="POS">POS / Carta</option>
            <option value="Contanti">Contanti</option>
            <option value="Bonifico">Bonifico bancario</option>
          </select>
        </div>

        <div style={{ marginTop: 16, borderTop: `2px solid ${colors.divider}`, paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: fontSize.base, marginBottom: 4 }}><span>Imponibile</span><span>€{imponibile.toFixed(2)}</span></div>
          {!isForfe && <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: fontSize.md, color: colors.textSecondary, marginBottom: 4 }}><span>Rivalsa ENPAV 2%</span><span>€{enpav.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: fontSize.md, color: colors.textSecondary, marginBottom: 4 }}><span>IVA 22%</span><span>€{iva.toFixed(2)}</span></div>
          </>}
          {bollo > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: fontSize.md, color: colors.textSecondary, marginBottom: 4 }}><span>Marca da bollo</span><span>€{bollo.toFixed(2)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: ORANGE, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${colors.divider}` }}><span>Totale</span><span>€{total.toFixed(2)}</span></div>
        </div>

        <Btn variant="accent" style={{ marginTop: 14, width: "100%" }} disabled={imponibile <= 0} onClick={emitInvoice}>Salva bozza fattura</Btn>
      </Card>
    </>
  );
}
