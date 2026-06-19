import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { colors, fontSize, inputStyle, radius } from "../../styles/tokens.js";
import AvatarImage from "../ui/AvatarImage.jsx";
import Btn from "../ui/Btn.jsx";
import MessageBubble from "./MessageBubble.jsx";

const QUICK_REPLIES_OWNER = [
  "Ok, grazie!",
  "A che ora posso arrivare?",
  "Può mandarmi la ricetta?",
  "Come sta andando la terapia?",
  "Quanto costerà circa?",
];

const QUICK_REPLIES_VET = [
  "Tutto bene, a presto!",
  "Può mandarmi una foto?",
  "Continui la terapia come indicato.",
  "Se peggiora venga subito.",
  "Il referto è pronto.",
];

const ALLOWED_TYPES = ["image/*", ".pdf", ".doc", ".docx", ".txt"];
const MAX_FILE_MB = 10;

function AttachmentPreview({ attachment, onRemove }) {
  if (attachment.type === "image") {
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <img
          src={attachment.url}
          alt={attachment.name}
          style={{ maxHeight: 80, maxWidth: 120, borderRadius: radius.md, display: "block", objectFit: "cover" }}
        />
        <button
          type="button"
          onClick={onRemove}
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            background: colors.danger,
            color: colors.white,
            border: "none",
            borderRadius: radius.circle,
            width: 20,
            height: 20,
            fontSize: 11,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: colors.bgBtn,
        borderRadius: radius.md,
        padding: "5px 10px",
        fontSize: fontSize.sm,
        fontWeight: 600,
        position: "relative",
      }}
    >
      📄 {attachment.name}
      <button
        type="button"
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: colors.textMuted,
          fontSize: 13,
          padding: "0 0 0 4px",
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default function ChatThread({ threadId, vetId, ownerId, apptId, currentRole, onBack }) {
  const { messages, sendMessage, markThreadRead, vets, ownerProfile, clients } = useApp();
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [attachError, setAttachError] = useState("");
  const fileInputRef = useRef(null);

  const vet = vets.find((v) => v.id === vetId);
  const client = clients.find((c) => c.id === ownerId) || null;

  // Nome e avatar della controparte
  const otherName =
    currentRole === "vet"
      ? client?.fullName || ownerProfile?.fullName || ownerProfile?.name || "Proprietario"
      : vet?.name || "Veterinario";
  const otherAvatar =
    currentRole === "vet"
      ? client?.avatar || ownerProfile?.avatar || "👤"
      : vet?.avatar || "👩‍⚕️";

  const myName =
    currentRole === "vet"
      ? vet?.name || "Veterinario"
      : ownerProfile?.fullName || ownerProfile?.name || "Proprietario";

  const quickReplies = currentRole === "vet" ? QUICK_REPLIES_VET : QUICK_REPLIES_OWNER;

  const actualThreadId = threadId || `${ownerId || "demo-owner"}_${vetId}`;

  // Segna i messaggi come letti appena si apre il thread
  useEffect(() => {
    markThreadRead(actualThreadId, currentRole);
  }, [actualThreadId, currentRole, markThreadRead]);

  const threadMessages = useMemo(
    () => messages.filter((m) => m.threadId === actualThreadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [actualThreadId, messages]
  );

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAttachError("");
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setAttachError(`File troppo grande (max ${MAX_FILE_MB} MB)`);
      event.target.value = "";
      return;
    }
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => setAttachment({ type: "image", url: reader.result, name: file.name });
      reader.readAsDataURL(file);
    } else {
      setAttachment({ type: "doc", url: null, name: file.name });
    }
    event.target.value = "";
  };

  const submit = () => {
    if (!text.trim() && !attachment) return;
    sendMessage({
      threadId: actualThreadId,
      vetId,
      ownerId: ownerId || "demo-owner",
      apptId,
      senderRole: currentRole,
      senderName: myName,
      text: text.trim() || (attachment ? `📎 ${attachment.name}` : ""),
      attachment: attachment || null,
    });
    setText("");
    setAttachment(null);
    markThreadRead(actualThreadId, currentRole);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "70vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <Btn small variant="light" onClick={onBack}>
          ←
        </Btn>
        <AvatarImage src={otherAvatar} emoji={otherAvatar} name={otherName} size={42} />
        <div>
          <div style={{ fontWeight: 900, color: colors.textDark }}>{otherName}</div>
          {apptId && <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Chat collegata alla visita</div>}
        </div>
      </div>

      {/* Messaggi */}
      <div
        style={{
          flex: 1,
          display: "grid",
          alignContent: "end",
          gap: 8,
          background: colors.bgLighter,
          borderRadius: radius.xl,
          padding: 12,
        }}
      >
        {threadMessages.length === 0 && (
          <div style={{ textAlign: "center", color: colors.textMuted, padding: 20 }}>Scrivi il primo messaggio.</div>
        )}
        {threadMessages.map((message) => (
          <MessageBubble key={message.id} message={message} mine={message.senderRole === currentRole} />
        ))}
      </div>

      {/* Quick replies */}
      <div className="chip-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "10px 0" }}>
        {quickReplies.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => setText(reply)}
            style={{
              minHeight: 36,
              borderRadius: radius.pill,
              border: `1px solid ${colors.borderLight}`,
              background: colors.white,
              padding: "6px 12px",
              whiteSpace: "nowrap",
              fontWeight: 600,
              fontSize: fontSize.sm,
              cursor: "pointer",
              color: colors.textMedium,
              fontFamily: "inherit",
            }}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Anteprima allegato */}
      {attachment && (
        <div style={{ marginBottom: 8 }}>
          <AttachmentPreview attachment={attachment} onRemove={() => setAttachment(null)} />
        </div>
      )}
      {attachError && (
        <div style={{ fontSize: fontSize.sm, color: colors.danger, marginBottom: 6 }}>{attachError}</div>
      )}

      {/* Input */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        style={{ display: "flex", gap: 8, position: "sticky", bottom: 0, background: colors.bgApp, paddingTop: 8 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFile}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Allega immagine o documento"
          style={{
            minWidth: 44,
            minHeight: 44,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: radius.md,
            background: colors.white,
            cursor: "pointer",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          📎
        </button>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Scrivi un messaggio…"
          style={{ ...inputStyle, flex: 1 }}
        />
        <Btn type="submit" disabled={!text.trim() && !attachment}>
          Invia
        </Btn>
      </form>
    </div>
  );
}
