import { colors, fontSize } from "../../styles/tokens.js";

export default function SectionTitle({ children, right, style }) {
  return (
    <div
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 14px", ...style }}
    >
      <h2 style={{ margin: 0, fontSize: fontSize["3xl"], color: colors.textDark }}>{children}</h2>
      {right}
    </div>
  );
}
