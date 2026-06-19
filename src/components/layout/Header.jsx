import Btn from "../ui/Btn.jsx";
import logoImg from "../../assets/logo.png";
import { colors, fontSize, radius } from "../../styles/tokens.js";
import AvatarImage from "../ui/AvatarImage.jsx";

export default function Header({
  title,
  subtitle,
  onLogout,
  onProfile,
  unreadCount = 0,
  onNotifications,
  chatUnreadCount = 0,
  onChat,
  avatar,
}) {
  return (
    <div
      style={{
        background: colors.headerGradient,
        color: colors.white,
        padding: "18px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontWeight: 900, fontSize: fontSize["3xl"], display: "flex", alignItems: "center", gap: 8 }}>
          <img src={logoImg} alt="" style={{ width: 30, height: 30, borderRadius: radius.circle }} /> {title}
        </div>
        <div style={{ fontSize: fontSize.sm, opacity: 0.85 }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {onNotifications && (
          <button
            onClick={onNotifications}
            aria-label="Notifiche"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "none",
              borderRadius: radius.md,
              color: colors.white,
              cursor: "pointer",
              padding: "6px 10px",
              minHeight: 36,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: fontSize.sm,
              fontWeight: 600,
              position: "relative",
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -4,
                  background: "#EF4444",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  minWidth: 16,
                  height: 16,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  lineHeight: 1,
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}
        {onChat && (
          <button
            onClick={onChat}
            aria-label="Messaggi"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "none",
              borderRadius: radius.md,
              color: colors.white,
              cursor: "pointer",
              padding: "6px 10px",
              minHeight: 36,
              display: "flex",
              alignItems: "center",
              fontSize: fontSize.sm,
              fontWeight: 600,
              position: "relative",
            }}
          >
            💬
            {chatUnreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -4,
                  background: "#EF4444",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  minWidth: 16,
                  height: 16,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  lineHeight: 1,
                }}
              >
                {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
              </span>
            )}
          </button>
        )}
        {onProfile && (
          <button
            onClick={onProfile}
            aria-label="Il mio profilo"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "none",
              borderRadius: radius.md,
              color: colors.white,
              cursor: "pointer",
              padding: "6px 10px",
              minHeight: 36,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: fontSize.sm,
              fontWeight: 600,
            }}
          >
            {avatar ? <AvatarImage src={avatar} emoji={avatar} name="Profilo" size={22} /> : "👤"} <span>Profilo</span>
          </button>
        )}
        <Btn
          small
          variant="light"
          onClick={onLogout}
          style={{ background: "rgba(255,255,255,0.18)", color: colors.white }}
        >
          Esci
        </Btn>
      </div>
    </div>
  );
}
