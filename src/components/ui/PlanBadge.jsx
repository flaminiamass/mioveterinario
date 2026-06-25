import { getPlan } from "../../data/plans.js";
import { fontSize, radius } from "../../styles/tokens.js";

/**
 * PlanBadge — mostra badge colorato con piano del veterinario.
 * Props:
 *   vet — oggetto veterinario (legge vet.plan)
 *   size — "sm" | "md" (default "md")
 *   showName — bool: mostra nome piano (default false, solo emoji/badge)
 */
export default function PlanBadge({ vet, size = "md", showName = false }) {
  const plan = getPlan(vet);
  const isSmall = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: plan.color + "18",
        color: plan.color,
        border: `1px solid ${plan.color}40`,
        borderRadius: radius.pill,
        padding: isSmall ? "2px 7px" : "3px 10px",
        fontSize: isSmall ? fontSize.xs : fontSize.sm,
        fontWeight: 700,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {plan.emoji} {showName ? plan.name : plan.badge}
    </span>
  );
}
