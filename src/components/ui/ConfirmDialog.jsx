/* ConfirmDialog — modale "Sei sicuro?" prima di azioni distruttive.
   Uso:
     <ConfirmDialog
       open={showConfirm}
       title="Cancellare visita?"
       message="Questa azione non può essere annullata."
       confirmLabel="Sì, cancella"
       onConfirm={() => { ... }}
       onCancel={() => setShowConfirm(false)}
     />
*/

import { colors, fontSize, radius, shadow } from "../../styles/tokens.js";
import Btn from "./Btn.jsx";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Conferma", onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: colors.white, borderRadius: radius.xl, padding: 24,
        maxWidth: 340, width: "100%", boxShadow: shadow.toast, textAlign: "center",
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
        <h3 style={{ margin: "0 0 8px", fontSize: fontSize["2xl"], color: colors.textDark }}>{title}</h3>
        <p style={{ margin: "0 0 20px", fontSize: fontSize.base, color: colors.textSecondary, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="light" onClick={onCancel} style={{ flex: 1 }}>Annulla</Btn>
          <Btn variant="danger" onClick={onConfirm} style={{ flex: 1 }}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}
