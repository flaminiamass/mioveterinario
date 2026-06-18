/* Token di stile — MioVeterinario Design System
   Importa da qui invece di scrivere valori a mano nei componenti.
   Es: import { colors, fontSize, radius, shadow, inputStyle } from "../../styles/tokens.js"; */

// ── Colori principali ───────────────────────────────────
export const TEAL = "#0D7E83";
export const ORANGE = "#F0813A";

export const colors = {
  teal: TEAL,
  orange: ORANGE,

  // Header
  headerGradient: "linear-gradient(135deg, #12A0A8, #0A6B70)",

  // Testi
  textDark: "#1A2535",
  textMedium: "#475569",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  // Bordi
  border: "#CBD5E1",
  borderLight: "#E2E8F0",
  divider: "#F1F5F9",

  // Sfondi
  bgApp: "#F0F4F4",
  bgLight: "#F1F5F9",
  bgLighter: "#F8FAFA",
  bgBtn: "#E8EEEE",
  bgTealLight: "#E0F2F2",
  bgTealSel: "#F0F9F9",
  bgOrangeLight: "#FFF3E8",

  // Semantici
  star: "#F59E0B",
  success: "#059669",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  dangerFg: "#991B1B",
  warning: "#D97706",
  white: "white",
  transparent: "transparent",
};

// ── Tipografia ──────────────────────────────────────────
export const fontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  "2xl": 17,
  "3xl": 20,
};

// ── Spaziature ──────────────────────────────────────────
export const space = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  "2xl": 14,
  "3xl": 16,
  "4xl": 24,
};

// ── Bordi arrotondati ───────────────────────────────────
export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  pill: 18,
  circle: "50%",
};

// ── Ombre ────────────────────────────────────────────────
export const shadow = {
  card: "0 1px 4px rgba(0,0,0,0.07)",
  logo: "0 6px 18px rgba(13,126,131,0.35)",
  toast: "0 4px 14px rgba(0,0,0,0.25)",
};

// ── Stili riusabili per form ────────────────────────────

/** Input e textarea standard */
export const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: radius.md,
  border: `1px solid ${colors.border}`,
  fontSize: fontSize.base,
  boxSizing: "border-box",
  fontFamily: "inherit",
  minHeight: 44,
};

/** Select e filtri inline */
export const selectStyle = {
  padding: "10px 12px",
  borderRadius: radius.md,
  border: `1px solid ${colors.border}`,
  fontSize: fontSize.base,
  background: colors.white,
  minHeight: 44,
};

/** Input di ricerca (più grande) */
export const searchInputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: radius.lg,
  border: `1px solid ${colors.border}`,
  fontSize: fontSize.lg,
  boxSizing: "border-box",
  minHeight: 48,
};

/** Input compatti (es. righe fattura) */
export const compactInputStyle = {
  padding: "8px 10px",
  borderRadius: radius.sm,
  border: `1px solid ${colors.border}`,
  fontSize: fontSize.md,
  boxSizing: "border-box",
};
