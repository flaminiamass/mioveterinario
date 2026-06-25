import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE, colors, fontSize } from "../../styles/tokens.js";
import { getService } from "../../data/services.js";
import { canUseAdvancedStats } from "../../data/plans.js";
import useIsMobile from "../../hooks/useIsMobile.js";
import Card from "../ui/Card.jsx";
import UpgradePrompt from "../ui/UpgradePrompt.jsx";

export default function VetStats({ vetId, onGoToPlan }) {
  const { appts, invoices, vets } = useApp();
  const vet = vets.find((v) => v.id === vetId);
  const isMobile = useIsMobile();
  const advancedStats = canUseAdvancedStats(vet);

  /* Mese corrente */
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthEnd = nextMonth.toISOString().slice(0, 10);

  /* Visite completate questo mese */
  const monthAppts = appts.filter(
    (a) => a.vetId === vetId && a.status === "completed" && a.date >= monthStart && a.date < monthEnd
  );

  /* Incassi del mese (fatture pagate) */
  const monthInvoices = invoices.filter(
    (f) => f.vetId === vetId && f.status === "paid" && f.date >= monthStart && f.date < monthEnd
  );
  const monthRevenue = monthInvoices.reduce((sum, f) => sum + (f.total || 0), 0);

  /* Top 3 servizi più richiesti (tutti i tempi) */
  const serviceCounts = {};
  appts
    .filter((a) => a.vetId === vetId && a.status === "completed" && a.serviceId)
    .forEach((a) => {
      serviceCounts[a.serviceId] = (serviceCounts[a.serviceId] || 0) + 1;
    });
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, count]) => ({ service: getService(id), count }));

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}
      >
        <Card style={{ textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: TEAL }}>€{monthRevenue.toFixed(0)}</div>
          <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Incassato questo mese</div>
        </Card>
        <Card style={{ textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: ORANGE }}>{monthAppts.length}</div>
          <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Visite completate</div>
        </Card>
        <Card style={{ textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: colors.success }}>{monthInvoices.length}</div>
          <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Fatture pagate</div>
        </Card>
      </div>

      {advancedStats ? (
        topServices.length > 0 && (
          <Card style={{ padding: 14 }}>
            <div style={{ fontWeight: 700, fontSize: fontSize.base, marginBottom: 8 }}>📊 Prestazioni più richieste</div>
            {topServices.map(({ service, count }, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 0",
                  borderBottom: i < topServices.length - 1 ? `1px solid ${colors.divider}` : "none",
                }}
              >
                <span style={{ fontSize: 20 }}>{service?.emoji || "🩺"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: fontSize.base }}>{service?.name || "Servizio"}</div>
                </div>
                <div style={{ fontWeight: 700, color: TEAL, fontSize: fontSize.base }}>
                  {count} {count === 1 ? "visita" : "visite"}
                </div>
              </div>
            ))}
          </Card>
        )
      ) : (
        <UpgradePrompt
          feature="Statistiche avanzate"
          requiredPlan="Pro"
          description="Con il piano Pro vedi le prestazioni più richieste, l'andamento del fatturato e molto altro."
          onViewPlans={onGoToPlan}
          compact
        />
      )}
    </div>
  );
}
