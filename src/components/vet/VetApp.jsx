import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { space, colors, fontSize } from "../../styles/tokens.js";
import { canUseChat } from "../../data/plans.js";
import Header from "../layout/Header.jsx";
import BottomNav from "../layout/BottomNav.jsx";
import VetAgenda from "./VetAgenda.jsx";
import VetAppts from "./VetAppts.jsx";
import VetPatients from "./VetPatients.jsx";
import VetBilling from "./VetBilling.jsx";
import VetProfileTab from "./VetProfileTab.jsx";
import VetPlanTab from "./VetPlanTab.jsx";
import VetPersonalProfile from "./VetPersonalProfile.jsx";
import NotificationPanel from "../layout/NotificationPanel.jsx";
import LegalFooter from "../legal/LegalFooter.jsx";
import ChatInbox from "../chat/ChatInbox.jsx";
import ChatThread from "../chat/ChatThread.jsx";
import UpgradePrompt from "../ui/UpgradePrompt.jsx";
import usePersistedState from "../../hooks/usePersistedState.js";

export default function VetApp({ onLogout, onNav }) {
  const { vetId, vets, appts, notifications, unreadCount, markRead, markAllRead, unreadMessageCount } = useApp();
  const pendingCount = appts.filter((a) => a.vetId === vetId && a.status === "pending").length;
  const vet = vets.find((v) => v.id === vetId);
  const chatEnabled = canUseChat(vet);
  const [tab, setTab] = usePersistedState("mv.vet.activeTab", "agenda", window.sessionStorage);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChatInbox, setShowChatInbox] = useState(false);
  const [chatThread, setChatThread] = useState(null);
  const tabs = [
    ["agenda", "📅", "Agenda"],
    ["appts", "🗓️", "Visite"],
    ["patients", "🐾", "Pazienti"],
    ["billing", "🧾", "Fatture"],
    ["profile", "⭐", "Servizi"],
    ["plan", "💎", "Piano"],
  ];
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 86 }}>
      <Header
        title="MioVeterinario Pro"
        subtitle={vet ? `${vet.name || "Veterinario"} · ${vet.clinic || "Studio"}` : "Caricamento..."}
        onLogout={onLogout}
        onProfile={() => {
          setShowProfile(true);
          setShowNotifications(false);
          setShowChatInbox(false);
          setChatThread(null);
        }}
        unreadCount={unreadCount}
        chatUnreadCount={unreadMessageCount}
        avatar={vet?.avatar}
        onChat={() => {
          setShowChatInbox(true);
          setShowNotifications(false);
          setShowProfile(false);
          setChatThread(null);
        }}
        onNotifications={() => {
          setShowNotifications(true);
          setShowProfile(false);
          setShowChatInbox(false);
          setChatThread(null);
        }}
      />
      <div style={{ padding: space["3xl"] }}>
        {showNotifications ? (
          <NotificationPanel
            notifications={notifications}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
            onClose={() => setShowNotifications(false)}
            onOpenNotification={(notification) => {
              if (notification.type === "message_received" && notification.data?.threadId) {
                setShowNotifications(false);
                setChatThread({
                  threadId: notification.data.threadId,
                  vetId: notification.data.vetId || vetId,
                  ownerId: notification.data.ownerId || "demo-owner",
                  apptId: notification.data.apptId,
                });
              } else if (notification.type?.startsWith("appt")) {
                setShowNotifications(false);
                setTab("appts");
              }
            }}
          />
        ) : showProfile ? (
          <VetPersonalProfile onBack={() => setShowProfile(false)} />
        ) : chatThread ? (
          chatEnabled
            ? <ChatThread {...chatThread} currentRole="vet" onBack={() => setChatThread(null)} />
            : <UpgradePrompt
                feature="Chat con i proprietari"
                requiredPlan="Pro"
                description="Con il piano Pro puoi chattare direttamente con i proprietari degli animali."
                onViewPlans={() => { setChatThread(null); setTab("plan"); }}
              />
        ) : showChatInbox ? (
          chatEnabled
            ? <ChatInbox role="vet" onOpenThread={(thread) => setChatThread(thread)} />
            : <div style={{ padding: "20px 0" }}>
                <UpgradePrompt
                  feature="Chat con i proprietari"
                  requiredPlan="Pro"
                  description="Con il piano Pro puoi chattare direttamente con i proprietari degli animali."
                  onViewPlans={() => { setShowChatInbox(false); setTab("plan"); }}
                />
                <button
                  onClick={() => setShowChatInbox(false)}
                  style={{ marginTop: 12, background: "none", border: "none", color: colors.textMedium, fontSize: fontSize.base, cursor: "pointer" }}
                >
                  ← Indietro
                </button>
              </div>
        ) : (
          <>
            {tab === "agenda" && <VetAgenda vetId={vetId} onGoToPlan={() => setTab("plan")} />}
            {tab === "appts" && <VetAppts vetId={vetId} onGoToPlan={() => setTab("plan")} />}
            {tab === "patients" && <VetPatients vetId={vetId} />}
            {tab === "billing" && <VetBilling vetId={vetId} />}
            {tab === "profile" && <VetProfileTab vetId={vetId} />}
            {tab === "plan" && <VetPlanTab vetId={vetId} />}
          </>
        )}
      </div>
      <LegalFooter onNav={onNav} />
      <BottomNav
        tabs={tabs}
        active={tab}
        onChange={(t) => {
          setTab(t);
          setShowProfile(false);
          setShowNotifications(false);
          setShowChatInbox(false);
          setChatThread(null);
        }}
        badges={pendingCount > 0 ? { appts: pendingCount } : {}}
      />
    </div>
  );
}
