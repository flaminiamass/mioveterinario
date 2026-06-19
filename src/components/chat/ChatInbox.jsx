import { useApp } from "../../context/AppContext.jsx";
import { colors, fontSize, radius } from "../../styles/tokens.js";
import AvatarImage from "../ui/AvatarImage.jsx";
import Card from "../ui/Card.jsx";
import Empty from "../ui/Empty.jsx";

export default function ChatInbox({ role = "owner", onOpenThread }) {
  const { getThreadsForOwner, getThreadsForVet, vets, vetId } = useApp();
  const threads = role === "vet" ? getThreadsForVet(vetId) : getThreadsForOwner();

  return (
    <div>
      <h2 style={{ margin: "0 0 12px", color: colors.textDark }}>💬 Messaggi</h2>
      {threads.length === 0 ? (
        <Card>
          <Empty icon="💬" text="Nessuna chat" sub="Le conversazioni con i veterinari appariranno qui." />
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {threads.map((thread) => {
            const vet = vets.find((v) => v.id === thread.vetId);
            return (
              <Card key={thread.threadId} onClick={() => onOpenThread(thread)} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <AvatarImage
                    src={role === "vet" ? "👤" : vet?.avatar}
                    name={role === "vet" ? thread.ownerName : vet?.name}
                    size={46}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, color: colors.textDark }}>
                      {role === "vet" ? thread.ownerName : vet?.name}
                    </div>
                    <div
                      style={{
                        fontSize: fontSize.md,
                        color: colors.textSecondary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {thread.lastMessage?.text}
                    </div>
                  </div>
                  {thread.unread > 0 && (
                    <span
                      style={{
                        background: colors.orange,
                        color: colors.white,
                        borderRadius: radius.circle,
                        minWidth: 22,
                        height: 22,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: fontSize.xs,
                        fontWeight: 900,
                      }}
                    >
                      {thread.unread}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
