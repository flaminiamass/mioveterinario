/* ToggleChips — variante multi-select di FilterPills.
   `active` è un array; click aggiunge/rimuove un valore.
   Se `single` è true, funziona come single-select con deselect. */

import { TEAL, colors, fontSize, radius } from "../../styles/tokens.js";

export default function ToggleChips({ options, active = [], onChange, single, style }) {
  const toggle = (key) => {
    if (single) {
      onChange(active.includes(key) ? [] : [key]);
    } else {
      onChange(
        active.includes(key)
          ? active.filter(k => k !== key)
          : [...active, key]
      );
    }
  };

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", ...style }}>
      {options.map(({ key, label }) => {
        const on = active.includes(key);
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            style={{
              padding: "7px 12px",
              minHeight: 36,
              borderRadius: radius.pill,
              border: "none",
              cursor: "pointer",
              fontSize: fontSize.md,
              fontWeight: 600,
              background: on ? TEAL : colors.bgBtn,
              color: on ? colors.white : colors.textMedium,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
