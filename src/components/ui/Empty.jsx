import { colors, fontSize } from "../../styles/tokens.js";

export default function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: 40, color: colors.textMuted }}>
      <div style={{ fontSize: 42 }}>{icon}</div>
      <div style={{ marginTop: 8, fontSize: fontSize.lg }}>{text}</div>
    </div>
  );
}
