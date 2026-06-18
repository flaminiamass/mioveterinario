/* Footer legale — mostrato in fondo a Landing e alle pagine principali */

import { colors, fontSize } from "../../styles/tokens.js";

export default function LegalFooter({ onNav }) {
  const link = (page, label) => (
    <button
      onClick={() => onNav(page)}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: colors.textMuted,
        fontSize: fontSize.sm,
        textDecoration: "underline",
        padding: "2px 4px",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ borderTop: `1px solid ${colors.borderLight}`, marginTop: 32, paddingTop: 16, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
        {link("privacy", "Privacy Policy")}
        <span style={{ color: colors.borderLight, fontSize: fontSize.sm }}>·</span>
        {link("terms", "Condizioni d'uso")}
        <span style={{ color: colors.borderLight, fontSize: fontSize.sm }}>·</span>
        {link("cookie", "Cookie Policy")}
      </div>
      <p style={{ color: colors.textMuted, fontSize: fontSize.xs, margin: 0 }}>
        © {new Date().getFullYear()} MioVeterinario · [Ragione sociale] · [email privacy] · Versione beta
      </p>
    </div>
  );
}
