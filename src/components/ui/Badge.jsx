import { STATUS_META } from "../../data/constants.js";
import { fontSize, radius } from "../../styles/tokens.js";

export default function Badge({ status }) {
  const m = STATUS_META[status];
  return (
    <span
      style={{
        background: m.bg,
        color: m.fg,
        padding: "3px 10px",
        borderRadius: radius.lg,
        fontSize: fontSize.sm,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {m.label}
    </span>
  );
}
