/* Modale riusabile per il rifiuto di un appuntamento.
   Il vet può scrivere un motivo (facoltativo) che viene mostrato all'owner. */

import { useState, useEffect, useRef } from "react";
import { colors, fontSize, radius, inputStyle, shadow } from "../../styles/tokens.js";
import Btn from "./Btn.jsx";

export default function RejectDialog({ open, onReject, onCancel }) {
  const [reason, setReason] = useState("");
  const prevOpen = useRef(false);

  /* Reset del campo quando si apre — evita setState sincrono nell'effect */
  useEffect(() => {
    if (open && !prevOpen.current) setReason("");
    prevOpen.current = open;
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: colors.white,
          borderRadius: radius.xl,
          padding: 24,
          maxWidth: 380,
          width: "100%",
          boxShadow: shadow.toast,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>❌</div>
        <h3 style={{ margin: "0 0 8px", color: colors.textDark }}>Rifiuta appuntamento</h3>
        <p style={{ fontSize: fontSize.base, color: colors.textSecondary, margin: "0 0 12px", lineHeight: 1.5 }}>
          Scrivi un motivo (facoltativo) per aiutare il proprietario a capire.
        </p>
        <textarea
          id="reject-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Es: Non ho disponibilità in quella data…"
          rows={3}
          style={{ ...inputStyle, borderRadius: radius.lg }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <Btn variant="light" onClick={onCancel} style={{ flex: 1 }}>
            Annulla
          </Btn>
          <Btn variant="danger" onClick={() => onReject(reason)} style={{ flex: 1 }}>
            Rifiuta
          </Btn>
        </div>
      </div>
    </div>
  );
}
