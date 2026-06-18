import { TEAL, colors, fontSize } from "../../styles/tokens.js";

export default function BottomNav({ tabs, active, onChange }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: colors.white, borderTop: `1px solid ${colors.borderLight}`, display: "flex", justifyContent: "space-around", padding: "8px 0 12px", maxWidth: 640, margin: "0 auto" }}>
      {tabs.map(([k, ic, lbl]) => (
        <button key={k} onClick={() => onChange(k)} aria-label={lbl} style={{ background: "none", border: "none", cursor: "pointer", color: active === k ? TEAL : colors.textMuted, fontWeight: active === k ? 700 : 500, fontSize: fontSize.xs, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 44, minHeight: 44, justifyContent: "center" }}>
          <span style={{ fontSize: 20 }}>{ic}</span>{lbl}
        </button>
      ))}
    </div>
  );
}
