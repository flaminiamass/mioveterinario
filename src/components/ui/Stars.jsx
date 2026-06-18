import { colors } from "../../styles/tokens.js";

export default function Stars({ n }) {
  return (
    <span style={{ color: colors.star, letterSpacing: 1 }}>
      {"★".repeat(Math.round(n))}
      {"☆".repeat(5 - Math.round(n))}
    </span>
  );
}
