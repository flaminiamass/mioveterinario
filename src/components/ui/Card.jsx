import { colors, radius, shadow, space } from "../../styles/tokens.js";

export default function Card({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      className={onClick ? "card-hover" : ""}
      style={{
        background: colors.white,
        borderRadius: radius.xl,
        padding: space["3xl"],
        boxShadow: shadow.card,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
