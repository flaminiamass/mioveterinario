import { TEAL, colors, fontSize } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import Empty from "../ui/Empty.jsx";

/* Icone per tipo di notifica */
const TYPE_ICONS = {
  appt_cancelled: "❌",
  appt_confirmed: "✅",
  appt_completed: "✓",
  appt_proposal: "📅",
  appt_rejected: "🚫",
};

/* Formatta la data/ora relative ("2 min fa", "1 ora fa", "ieri") */
function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "adesso";
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ore fa`;
  if (diff < 172800) return "ieri";
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

export default function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onClose }) {
  const unread = notifications.filter((n) => !n.read);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Btn small variant="light" onClick={onClose}>
          ← Indietro
        </Btn>
        {unread.length > 0 && (
          <Btn small variant="ghost" onClick={onMarkAllRead}>
            Segna tutte lette
          </Btn>
        )}
      </div>

      <h2 style={{ margin: "0 0 12px", fontSize: fontSize["2xl"] }}>🔔 Notifiche</h2>

      {notifications.length === 0 ? (
        <Card>
          <Empty icon="🔔" text="Nessuna notifica" sub="Quando riceverai aggiornamenti appariranno qui" />
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => {
                if (!n.read) onMarkRead(n.id);
              }}
              style={{
                cursor: !n.read ? "pointer" : "default",
                borderLeft: !n.read ? `4px solid ${TEAL}` : "4px solid transparent",
                background: !n.read ? colors.bgTealLight : colors.white,
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{TYPE_ICONS[n.type] || "🔔"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: !n.read ? 700 : 500, fontSize: fontSize.base, color: colors.textDark }}>
                    {n.title}
                  </div>
                  {n.message && (
                    <div style={{ fontSize: fontSize.md, color: colors.textMedium, marginTop: 2 }}>{n.message}</div>
                  )}
                </div>
                <div style={{ fontSize: fontSize.xs, color: colors.textMuted, flexShrink: 0, whiteSpace: "nowrap" }}>
                  {timeAgo(n.createdAt)}
                </div>
              </div>
              {!n.read && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: TEAL,
                    position: "absolute",
                    top: 12,
                    right: 12,
                  }}
                />
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
