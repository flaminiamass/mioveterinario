/* Genera HTML per la stampa/PDF della fattura veterinaria.
   Usa window.open + window.print — nessuna libreria esterna. */

/**
 * Genera HTML completo della fattura pronto per la stampa.
 * @param {object} invoice  — fattura con items, enpav, iva, bollo, total, number, date, payment
 * @param {object} vet      — dati del veterinario (name, clinic, address, piva, cf, albo, regime)
 * @param {object} client   — dati destinatario (fullName, cf, address, email, phone)
 */
export function generateInvoiceHTML(invoice, vet, client) {
  const isForfe = vet?.regime === "forfettario";
  const imponibile = invoice.items.reduce((s, i) => s + i.qty * i.price, 0);

  const itemsRows = invoice.items.map(i => `
    <tr>
      <td style="padding:8px 10px; border-bottom:1px solid #E2E8F0;">${i.desc}</td>
      <td style="padding:8px 10px; border-bottom:1px solid #E2E8F0; text-align:center;">${i.qty}</td>
      <td style="padding:8px 10px; border-bottom:1px solid #E2E8F0; text-align:right;">€${Number(i.price).toFixed(2)}</td>
      <td style="padding:8px 10px; border-bottom:1px solid #E2E8F0; text-align:right; font-weight:600;">€${(i.qty * i.price).toFixed(2)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Fattura ${invoice.number} — ${vet?.clinic || vet?.name}</title>
  <style>
    @page { margin: 20mm 15mm; size: A4; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; color: #1A2535; line-height: 1.6; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #0D7E83; }
    .header-left h1 { font-size: 22px; color: #0D7E83; margin-bottom: 4px; }
    .header-left p { font-size: 12px; color: #64748B; }
    .header-right { text-align: right; }
    .header-right .inv-number { font-size: 20px; font-weight: 800; color: #F0813A; }
    .header-right .inv-date { font-size: 13px; color: #64748B; }
    .parties { display: flex; gap: 40px; margin-bottom: 30px; }
    .party { flex: 1; }
    .party-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #0D7E83; letter-spacing: 1px; margin-bottom: 6px; }
    .party-data { font-size: 12px; color: #475569; line-height: 1.8; }
    .party-data b { color: #1A2535; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead th { padding: 10px; background: #0D7E83; color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    thead th:first-child { text-align: left; border-radius: 6px 0 0 0; }
    thead th:last-child { text-align: right; border-radius: 0 6px 0 0; }
    .totals { margin-left: auto; width: 280px; }
    .totals .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #475569; }
    .totals .row-total { display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px; font-weight: 800; color: #F0813A; border-top: 2px solid #0D7E83; margin-top: 6px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8; text-align: center; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>${vet?.clinic || vet?.name || "Studio Veterinario"}</h1>
      <p>${vet?.name || ""}</p>
      <p>${vet?.address || ""}</p>
    </div>
    <div class="header-right">
      <div class="inv-number">Fattura N° ${invoice.number}</div>
      <div class="inv-date">Data: ${invoice.date}</div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-label">Emittente</div>
      <div class="party-data">
        <b>${vet?.name || ""}</b><br>
        ${vet?.clinic || ""}<br>
        ${vet?.address || ""}<br>
        P.IVA: ${vet?.piva || "—"}<br>
        C.F.: ${vet?.cf || "—"}<br>
        Albo Veterinari: ${vet?.albo || "—"}<br>
        Regime: ${isForfe ? "Forfettario (L. 190/2014)" : "Ordinario"}
      </div>
    </div>
    <div class="party">
      <div class="party-label">Destinatario</div>
      <div class="party-data">
        <b>${client?.fullName || "—"}</b><br>
        ${client?.address || "—"}<br>
        C.F.: ${client?.cf || "—"}<br>
        Email: ${client?.email || "—"}<br>
        Tel: ${client?.phone || "—"}
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="text-align:left;">Descrizione</th>
        <th style="text-align:center; width:60px;">Qtà</th>
        <th style="text-align:right; width:90px;">Prezzo unit.</th>
        <th style="text-align:right; width:90px;">Totale</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Imponibile</span><span>€${imponibile.toFixed(2)}</span></div>
    ${!isForfe ? `
      <div class="row"><span>Rivalsa ENPAV 2%</span><span>€${(invoice.enpav || 0).toFixed(2)}</span></div>
      <div class="row"><span>IVA 22%</span><span>€${(invoice.iva || 0).toFixed(2)}</span></div>
    ` : ""}
    ${(invoice.bollo || 0) > 0 ? `<div class="row"><span>Marca da bollo</span><span>€${invoice.bollo.toFixed(2)}</span></div>` : ""}
    <div class="row-total"><span>TOTALE</span><span>€${(invoice.total || imponibile).toFixed(2)}</span></div>
  </div>

  <div class="footer">
    Modalità di pagamento: ${invoice.payment || "—"}
    ${isForfe ? "<br>Operazione effettuata ai sensi dell'art. 1, commi 54-89, L. 190/2014 — Regime forfettario" : ""}
    ${isForfe ? "<br>Non soggetta a ritenuta d'acconto ai sensi dell'art. 1, comma 67, L. 190/2014" : ""}
    <br><br><strong style="color:#E53E3E;">BOZZA — Non costituisce fattura elettronica valida ai fini fiscali (D.Lgs. 127/2015). Verificare con il proprio commercialista prima dell'emissione ufficiale via SdI.</strong>
    <br><small>Documento generato da MioVeterinario — uso interno [DA VALIDARE CON COMMERCIALISTA]</small>
  </div>
</body>
</html>`;
}

/**
 * Apre una finestra popup con la fattura formattata e avvia la stampa del browser.
 * L'utente può scegliere "Salva come PDF" dal dialog di stampa.
 */
export function printInvoice(invoice, vet, client) {
  const html = generateInvoiceHTML(invoice, vet, client);
  const w = window.open("", "_blank", "width=800,height=1100");
  if (!w) {
    alert("Il browser ha bloccato il popup. Abilita i popup per scaricare la fattura.");
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  /* Piccolo delay per permettere il rendering prima della stampa */
  setTimeout(() => w.print(), 400);
}
