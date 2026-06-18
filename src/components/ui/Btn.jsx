import { TEAL, ORANGE, colors, fontSize, radius } from "../../styles/tokens.js";

export default function Btn({ children, onClick, variant = "primary", small, style, disabled, loading }) {
  const isDisabled = disabled || loading;
  const base = {
    border: "none",
    borderRadius: radius.md,
    fontWeight: 600,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
    padding: small ? "8px 14px" : "12px 18px",
    fontSize: small ? fontSize.md : fontSize.lg,
    minHeight: small ? 36 : 44,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  };
  const variants = {
    primary: { background: TEAL, color: colors.white },
    accent: { background: ORANGE, color: colors.white },
    ghost: { background: colors.transparent, color: TEAL, border: `1.5px solid ${TEAL}` },
    danger: { background: colors.dangerBg, color: colors.dangerFg },
    light: { background: colors.bgLight, color: "#333" },
  };

  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className="btn-hover"
      style={{ ...base, ...variants[variant], ...style }}
    >
      {loading && (
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: 14,
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }}
        />
      )}
      {children}
    </button>
  );
}
