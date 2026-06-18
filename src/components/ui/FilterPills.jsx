/* FilterPills — bottoni filtro "pillola" usati in più schermate.
   Accetta un array di opzioni [{ key, label }], il valore attivo, e onChange. */

import { TEAL, colors, fontSize, radius } from "../../styles/tokens.js";

export default function FilterPills({ options, active, onChange, style }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, ...style }}>
      {options.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            padding: "8px 14px",
            minHeight: 36,
            borderRadius: radius.pill,
            border: "none",
            cursor: "pointer",
            fontSize: fontSize.md,
            fontWeight: 600,
            background: active === key ? TEAL : colors.bgBtn,
            color: active === key ? colors.white : colors.textMedium,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
