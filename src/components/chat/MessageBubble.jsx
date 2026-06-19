import { colors, fontSize, radius } from "../../styles/tokens.js";

export default function MessageBubble({ message, mine }) {
  const time = new Date(message.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  const { attachment } = message;

  return (
    <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth: "78%",
          background: mine ? colors.teal : colors.white,
          color: mine ? colors.white : colors.textDark,
          borderRadius: mine
            ? `${radius.lg}px ${radius.lg}px ${radius.sm}px ${radius.lg}px`
            : `${radius.lg}px ${radius.lg}px ${radius.lg}px ${radius.sm}px`,
          padding: "9px 12px",
          boxShadow: "0 1px 4px rgba(15,23,42,.08)",
          overflow: "hidden",
        }}
      >
        {attachment?.type === "image" && (
          <img
            src={attachment.url}
            alt={attachment.name}
            style={{ display: "block", maxWidth: "100%", borderRadius: radius.md, marginBottom: message.text ? 6 : 0 }}
          />
        )}
        {attachment?.type === "doc" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: mine ? "rgba(255,255,255,0.15)" : colors.bgBtn,
              borderRadius: radius.md,
              padding: "5px 9px",
              marginBottom: message.text ? 6 : 0,
              fontSize: fontSize.sm,
              fontWeight: 600,
            }}
          >
            📄 {attachment.name}
          </div>
        )}
        {message.text && (
          <div style={{ fontSize: fontSize.base, lineHeight: 1.45 }}>{message.text}</div>
        )}
        <div style={{ marginTop: 3, fontSize: fontSize.xs, opacity: 0.72, textAlign: "right" }}>{time}</div>
      </div>
    </div>
  );
}
