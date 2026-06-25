import { TEAL, ORANGE, colors, fontSize, radius, shadow } from "../../styles/tokens.js";
import Btn from "./Btn.jsx";

/**
 * UpgradePrompt — overlay/card che segnala una funzione bloccata dal piano.
 *
 * Props:
 *   feature     — descrizione breve della funzione bloccata (es. "Statistiche avanzate")
 *   requiredPlan — nome piano richiesto (es. "Pro")
 *   description  — testo esplicativo (facoltativo)
 *   onViewPlans  — callback per aprire la tab Piano
 *   compact      — bool: layout ridotto (per sezioni parzialmente visibili)
 */
export default function UpgradePrompt({ feature, requiredPlan = "Pro", description, onViewPlans, compact = false }) {
  if (compact) {
    return (
      <div
        style={{
          background: colors.bgLight,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: radius.lg,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 22 }}>🔒</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: fontSize.base, color: colors.textDark }}>{feature}</div>
          <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 }}>
            {description || `Disponibile con il piano ${requiredPlan}`}
          </div>
        </div>
        {onViewPlans && (
          <button
            onClick={onViewPlans}
            style={{
              background: TEAL,
              color: "white",
              border: "none",
              borderRadius: radius.pill,
              padding: "6px 14px",
              fontSize: fontSize.sm,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Vedi piani
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${colors.borderLight}`,
        borderRadius: radius.xl,
        padding: 20,
        textAlign: "center",
        boxShadow: shadow.card,
        margin: "8px 0",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 8 }}>🔒</div>
      <div style={{ fontWeight: 800, fontSize: fontSize.xl, color: colors.textDark, marginBottom: 4 }}>{feature}</div>
      <div
        style={{
          fontSize: fontSize.base,
          color: colors.textMedium,
          marginBottom: 14,
          lineHeight: 1.5,
          maxWidth: 300,
          margin: "0 auto 14px",
        }}
      >
        {description || `Questa funzione è disponibile con il piano ${requiredPlan} o superiore.`}
      </div>
      <div
        style={{
          display: "inline-block",
          background: `${ORANGE}18`,
          color: ORANGE,
          border: `1px solid ${ORANGE}40`,
          borderRadius: radius.pill,
          padding: "3px 12px",
          fontSize: fontSize.sm,
          fontWeight: 700,
          marginBottom: 14,
        }}
      >
        Piano {requiredPlan} richiesto
      </div>
      {onViewPlans && (
        <div>
          <Btn onClick={onViewPlans} style={{ minWidth: 160 }}>
            Vedi piani
          </Btn>
        </div>
      )}
    </div>
  );
}
