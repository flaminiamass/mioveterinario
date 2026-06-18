import Btn from "../ui/Btn.jsx";
import logoImg from "../../assets/logo.png";
import { colors, fontSize, radius } from "../../styles/tokens.js";

export default function Header({ title, subtitle, onLogout, onProfile }) {
  return (
    <div style={{ background: colors.headerGradient, color: colors.white, padding: "18px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: fontSize["3xl"], display: "flex", alignItems: "center", gap: 8 }}><img src={logoImg} alt="" style={{ width: 30, height: 30, borderRadius: radius.circle }} /> {title}</div>
        <div style={{ fontSize: fontSize.sm, opacity: 0.85 }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {onProfile && (
          <button onClick={onProfile} aria-label="Il mio profilo" style={{ background: "rgba(255,255,255,0.18)", border: "none", borderRadius: radius.md, color: colors.white, fontSize: 18, cursor: "pointer", padding: "6px 10px", minWidth: 36, minHeight: 36 }}>👤</button>
        )}
        <Btn small variant="light" onClick={onLogout} style={{ background: "rgba(255,255,255,0.18)", color: colors.white }}>Esci</Btn>
      </div>
    </div>
  );
}
