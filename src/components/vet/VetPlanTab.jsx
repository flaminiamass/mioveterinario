import { useApp } from "../../context/AppContext.jsx";
import { PLANS, PLAN_ORDER, getPlan, getCommissionRate, nextPlan } from "../../data/plans.js";
import { TEAL, ORANGE, colors, fontSize, radius } from "../../styles/tokens.js";
import Card from "../ui/Card.jsx";
import Btn from "../ui/Btn.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";

const PROFILE_STATUS_LABEL = {
  draft: { label: "Bozza", color: colors.textMuted, bg: colors.bgLight },
  pending_verification: { label: "In verifica", color: "#D97706", bg: "#FEF3C7" },
  verified: { label: "Verificato ✓", color: colors.success, bg: "#D1FAE5" },
};

function PlanCard({ planId, currentPlanId, onUpgrade, onDowngrade }) {
  const plan = PLANS[planId];
  const isCurrent = planId === currentPlanId;
  const currentIdx = PLAN_ORDER.indexOf(currentPlanId);
  const planIdx = PLAN_ORDER.indexOf(planId);
  const isUpgrade = planIdx > currentIdx;

  return (
    <div
      style={{
        background: isCurrent ? `${plan.color}0C` : "white",
        border: `2px solid ${isCurrent ? plan.color : plan.recommended ? ORANGE : colors.borderLight}`,
        borderRadius: radius.xl,
        padding: 16,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {plan.recommended && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            background: ORANGE,
            color: "white",
            fontSize: fontSize.xs,
            fontWeight: 800,
            padding: "2px 10px",
            borderRadius: radius.pill,
            whiteSpace: "nowrap",
          }}
        >
          Consigliato
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>{plan.emoji}</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: fontSize.xl, color: plan.color }}>{plan.name}</div>
          <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>
            {plan.priceMonthly === 0 ? "Gratuito" : `€${plan.priceMonthly}/mese`}
          </div>
        </div>
        {isCurrent && (
          <span
            style={{
              marginLeft: "auto",
              background: plan.color + "20",
              color: plan.color,
              fontSize: fontSize.xs,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: radius.pill,
            }}
          >
            Attivo
          </span>
        )}
      </div>

      <div style={{ fontSize: fontSize.sm, color: colors.textMedium, lineHeight: 1.4 }}>{plan.description}</div>

      <ul style={{ margin: 0, padding: "0 0 0 16px", display: "grid", gap: 3 }}>
        {plan.features.slice(0, 5).map((f) => (
          <li key={f} style={{ fontSize: fontSize.sm, color: colors.textDark }}>
            {f}
          </li>
        ))}
      </ul>

      {plan.commissionRate && (
        <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
          Commissione pagamenti online: {plan.commissionRate}%
        </div>
      )}

      {!isCurrent && (
        <button
          onClick={() => (isUpgrade ? onUpgrade(planId) : onDowngrade(planId))}
          style={{
            marginTop: 4,
            padding: "9px 14px",
            borderRadius: radius.lg,
            border: `1.5px solid ${isUpgrade ? plan.color : colors.border}`,
            background: isUpgrade ? plan.color : "white",
            color: isUpgrade ? "white" : colors.textMedium,
            fontWeight: 700,
            fontSize: fontSize.sm,
            cursor: "pointer",
          }}
        >
          {isUpgrade ? `Simula upgrade a ${plan.name}` : `Passa a ${plan.name}`}
        </button>
      )}
    </div>
  );
}

function PaymentSettings({ vet, onUpdate }) {
  const plan = getPlan(vet);
  const canUsePayments = plan.limits.onlinePayments;
  const commissionRate = getCommissionRate(vet);

  return (
    <Card style={{ padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: fontSize.base, color: colors.textDark, marginBottom: 10 }}>
        💳 Pagamenti online
      </div>

      {!canUsePayments ? (
        <div
          style={{
            background: colors.bgLight,
            borderRadius: radius.lg,
            padding: "12px 14px",
            fontSize: fontSize.sm,
            color: colors.textMedium,
            lineHeight: 1.5,
          }}
        >
          🔒 I pagamenti online sono disponibili dal piano <b>Pro</b>.
          <div style={{ marginTop: 6, color: colors.textMuted, fontSize: fontSize.xs }}>
            Nessun pagamento reale viene processato in questa demo.
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              background: "#FFF3E8",
              borderRadius: radius.lg,
              padding: "10px 14px",
              fontSize: fontSize.sm,
              color: colors.textMedium,
              lineHeight: 1.5,
              marginBottom: 12,
            }}
          >
            ℹ️ I pagamenti online saranno disponibili in una fase successiva.
            {commissionRate && (
              <>
                {" "}
                La commissione simulata del tuo piano è <b>{commissionRate}%</b>.
              </>
            )}
            <div style={{ marginTop: 4, color: colors.textMuted, fontSize: fontSize.xs }}>
              Nessun pagamento reale viene processato in questa demo.
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: fontSize.sm, fontWeight: 700, color: colors.textDark }}>
              Modalità pagamento online:
            </div>
            {["disabled", "optional", "required"].map((mode) => {
              const labels = {
                disabled: "Disattivato — solo pagamento in studio",
                optional: "Facoltativo — il cliente sceglie",
                required: "Obbligatorio — solo online",
              };
              return (
                <label
                  key={mode}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: radius.lg,
                    border: `1.5px solid ${vet.paymentMode === mode ? TEAL : colors.borderLight}`,
                    background: vet.paymentMode === mode ? colors.bgTealLight : "white",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMode"
                    value={mode}
                    checked={vet.paymentMode === mode}
                    onChange={() => onUpdate({ paymentMode: mode, acceptsOnlinePayments: mode !== "disabled" })}
                    style={{ accentColor: TEAL }}
                  />
                  <span style={{ fontSize: fontSize.sm, color: colors.textDark }}>{labels[mode]}</span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

function RoiCard({ vetId, appts, invoices }) {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthEnd = nextMonth.toISOString().slice(0, 10);

  const monthAppts = appts.filter(
    (a) => a.vetId === vetId && (a.status === "confirmed" || a.status === "completed") && a.date >= monthStart && a.date < monthEnd
  );
  const monthRevenue = invoices
    .filter((f) => f.vetId === vetId && f.status === "paid" && f.date >= monthStart && f.date < monthEnd)
    .reduce((sum, f) => sum + (f.total || 0), 0);

  const avgVisitValue = monthRevenue > 0 && monthAppts.length > 0 ? Math.round(monthRevenue / monthAppts.length) : 55;
  const starterPrice = 29;
  const visitsToBreakEven = Math.ceil(starterPrice / avgVisitValue);

  return (
    <Card style={{ padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: fontSize.base, color: colors.textDark, marginBottom: 12 }}>
        📊 Il tuo studio questo mese
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div
          style={{
            background: colors.bgTealLight,
            borderRadius: radius.lg,
            padding: "12px 14px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: TEAL }}>{monthAppts.length}</div>
          <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>Appuntamenti</div>
        </div>
        <div
          style={{
            background: "#FFF3E8",
            borderRadius: radius.lg,
            padding: "12px 14px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: ORANGE }}>€{monthRevenue.toFixed(0)}</div>
          <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>Fatturato stimato</div>
        </div>
      </div>

      <div
        style={{
          background: "#F0F9F9",
          border: `1px solid ${TEAL}30`,
          borderRadius: radius.lg,
          padding: "12px 14px",
          fontSize: fontSize.sm,
          color: colors.textDark,
          lineHeight: 1.6,
        }}
      >
        💡 Ti basta acquisire <b>{visitsToBreakEven} nuova visita</b> al mese per ripagare il piano Starter
        (€{starterPrice}/mese). Ogni nuovo cliente vale in media <b>€{avgVisitValue}</b> di fatturato.
      </div>

      <div style={{ marginTop: 10, fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 1.5 }}>
        * Dati calcolati sulle visite e fatture demo del mese corrente. I valori reali dipendono dalla tua attività.
      </div>
    </Card>
  );
}

export default function VetPlanTab({ vetId }) {
  const { vets, setVets, appts, invoices, notify } = useApp();
  const vet = vets.find((v) => v.id === vetId);

  if (!vet) return null;

  const plan = getPlan(vet);
  const profileStatusInfo = PROFILE_STATUS_LABEL[vet.profileStatus || "verified"] || PROFILE_STATUS_LABEL.verified;
  const next = nextPlan(vet);

  const handleUpgrade = (targetPlanId) => {
    const targetPlan = PLANS[targetPlanId];
    setVets((current) =>
      current.map((v) =>
        v.id === vetId
          ? {
              ...v,
              plan: targetPlanId,
              acceptsOnlineBooking: targetPlan.limits.onlineBooking,
              commissionRate: targetPlan.commissionRate,
            }
          : v
      )
    );
    notify(`Piano aggiornato a ${targetPlan.name} — simulazione beta ✓`);
  };

  const handleDowngrade = (targetPlanId) => {
    const targetPlan = PLANS[targetPlanId];
    setVets((current) =>
      current.map((v) =>
        v.id === vetId
          ? {
              ...v,
              plan: targetPlanId,
              acceptsOnlineBooking: targetPlan.limits.onlineBooking,
              commissionRate: targetPlan.commissionRate,
              acceptsOnlinePayments: targetPlan.limits.onlinePayments ? v.acceptsOnlinePayments : false,
              paymentMode: targetPlan.limits.onlinePayments ? v.paymentMode : "disabled",
            }
          : v
      )
    );
    notify(`Piano aggiornato a ${targetPlan.name} — simulazione beta`);
  };

  const handlePaymentUpdate = (updates) => {
    setVets((current) => current.map((v) => (v.id === vetId ? { ...v, ...updates } : v)));
    notify("Impostazioni pagamento aggiornate");
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* ── Piano attuale ── */}
      <Card style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: radius.circle,
              background: plan.color + "18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            {plan.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 800, fontSize: fontSize["2xl"], color: colors.textDark }}>
                Piano {plan.name}
              </span>
              <span
                style={{
                  background: plan.color + "18",
                  color: plan.color,
                  fontSize: fontSize.xs,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: radius.pill,
                }}
              >
                {plan.badge}
              </span>
            </div>
            <div style={{ fontSize: fontSize.base, color: colors.textMedium, marginTop: 2 }}>
              {plan.priceMonthly === 0 ? "Gratuito" : `€${plan.priceMonthly}/mese indicativi`}
            </div>
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  background: profileStatusInfo.bg,
                  color: profileStatusInfo.color,
                  fontSize: fontSize.xs,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: radius.pill,
                }}
              >
                {profileStatusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {next && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${colors.divider}` }}>
            <div style={{ fontSize: fontSize.sm, color: colors.textMedium, marginBottom: 8 }}>
              Sblocca più funzioni con il piano <b>{next.name}</b>:
            </div>
            <ul style={{ margin: "0 0 12px", padding: "0 0 0 16px", display: "grid", gap: 3 }}>
              {next.features.slice(0, 3).map((f) => (
                <li key={f} style={{ fontSize: fontSize.sm, color: colors.textDark }}>
                  {f}
                </li>
              ))}
            </ul>
            <Btn onClick={() => handleUpgrade(next.id)} style={{ width: "100%" }}>
              Simula upgrade a {next.name} — €{next.priceMonthly}/mese
            </Btn>
          </div>
        )}

        {!next && (
          <div
            style={{
              marginTop: 12,
              background: "#F0F4FF",
              borderRadius: radius.lg,
              padding: "10px 14px",
              fontSize: fontSize.sm,
              color: "#4338CA",
              fontWeight: 600,
            }}
          >
            🏆 Sei al piano massimo! Hai accesso a tutte le funzionalità.
          </div>
        )}
      </Card>

      {/* ── ROI dashboard ── */}
      <RoiCard vetId={vetId} appts={appts} invoices={invoices} />

      {/* ── Confronto piani ── */}
      <SectionTitle>Confronta i piani</SectionTitle>

      <div
        style={{
          fontSize: fontSize.xs,
          color: colors.textMuted,
          marginBottom: 4,
          lineHeight: 1.5,
        }}
      >
        💬 Prezzi indicativi per la beta — potrai modificarli prima del lancio.
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {PLAN_ORDER.map((planId) => (
          <PlanCard
            key={planId}
            planId={planId}
            currentPlanId={vet.plan || "free"}
            onUpgrade={handleUpgrade}
            onDowngrade={handleDowngrade}
          />
        ))}
      </div>

      {/* ── Pagamenti online ── */}
      <SectionTitle style={{ marginTop: 4 }}>Pagamenti online</SectionTitle>
      <PaymentSettings vet={vet} onUpdate={handlePaymentUpdate} />
    </div>
  );
}
