import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE, colors, fontSize } from "../../styles/tokens.js";
import { printInvoice } from "../../utils/invoicePrint.js";
import useIsMobile from "../../hooks/useIsMobile.js";
import { markInvoicePaid, isSupabaseConfigured } from "../../lib/db.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import Empty from "../ui/Empty.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";

export default function VetBilling({ vetId }) {
  const { invoices, setInvoices, vets, clients, notify } = useApp();
  const vet = vets.find((v) => v.id === vetId);
  const isMobile = useIsMobile();
  const mine = invoices.filter((f) => f.vetId === vetId);
  const getTotal = (f) => (f.total != null ? f.total : f.items.reduce((s, i) => s + i.qty * i.price, 0));
  const total = mine.reduce((s, f) => s + getTotal(f), 0);
  const paid = mine.filter((f) => f.status === "paid").reduce((s, f) => s + getTotal(f), 0);

  /* Trova il nome del cliente dalla fattura */
  const getClientName = (f) => {
    if (f.destName) return f.destName;
    if (f.clientId) {
      const cl = clients.find((c) => c.id === f.clientId);
      if (cl) return cl.fullName;
    }
    return "—";
  };

  return (
    <>
      <SectionTitle>Fatturazione</SectionTitle>
      <div
        style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}
      >
        {[
          ["Fatturato", `€${total.toFixed(0)}`, TEAL],
          ["Incassato", `€${paid.toFixed(0)}`, colors.success],
          ["Fatture", mine.length, ORANGE],
        ].map(([l, v, c]) => (
          <Card key={l} style={{ textAlign: "center", padding: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>{l}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {mine.length === 0 && (
          <Card>
            <Empty icon="🧾" text="Nessuna fattura emessa" sub="Completa una visita e crea la prima fattura" />
          </Card>
        )}
        {mine.map((f) => {
          const t = getTotal(f);
          return (
            <Card key={f.id}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b>
                  🧾 {f.number || f.id.toUpperCase()} · {f.date}
                </b>
                <b style={{ color: ORANGE }}>€{t.toFixed(2)}</b>
              </div>
              <div style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: 4 }}>
                👤 {getClientName(f)} · {f.items.map((i) => i.desc).join(", ")}
                {f.payment && ` · ${f.payment}`}
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "center", gap: 6 }}
              >
                <span
                  style={{
                    fontSize: fontSize.md,
                    fontWeight: 700,
                    color: f.status === "paid" ? colors.success : colors.warning,
                  }}
                >
                  {f.status === "paid" ? "✓ Pagata" : "Da pagare"}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn
                    small
                    variant="light"
                    onClick={() => {
                      const cl = f.clientId ? clients.find((c) => c.id === f.clientId) : null;
                      const dest = {
                        fullName: f.destName || cl?.fullName || "—",
                        cf: f.destCf || cl?.cf || "",
                        address: f.destAddress || cl?.address || "",
                        email: f.destEmail || cl?.email || "",
                        phone: f.destPhone || cl?.phone || "",
                      };
                      printInvoice(f, vet, dest);
                    }}
                  >
                    📥 Scarica
                  </Btn>
                  {f.status !== "paid" && (
                    <Btn
                      small
                      variant="light"
                      onClick={async () => {
                        setInvoices(invoices.map((x) => (x.id === f.id ? { ...x, status: "paid" } : x)));
                        notify("Fattura segnata come pagata.");
                        if (isSupabaseConfigured()) {
                          const { error } = await markInvoicePaid(f.id);
                          if (error) notify("❌ Errore salvataggio: " + error.message);
                        }
                      }}
                    >
                      Segna pagata
                    </Btn>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
