import { colors, fontSize } from "../../styles/tokens.js";

export default function Empty({ icon, text, sub, action }) {
  return (
    <div style={{ textAlign: "center", padding: 40, color: colors.textMuted }}>
      <div style={{ fontSize: 42 }}>{icon}</div>
      <div style={{ marginTop: 8, fontSize: fontSize.lg }}>{text}</div>
      {sub && <div style={{ marginTop: 4, fontSize: fontSize.md, color: colors.textSecondary }}>{sub}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}
