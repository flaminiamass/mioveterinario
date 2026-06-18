import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { space } from "../../styles/tokens.js";
import Header from "../layout/Header.jsx";
import BottomNav from "../layout/BottomNav.jsx";
import VetAgenda from "./VetAgenda.jsx";
import VetAppts from "./VetAppts.jsx";
import VetPatients from "./VetPatients.jsx";
import VetBilling from "./VetBilling.jsx";
import VetProfileTab from "./VetProfileTab.jsx";
import VetPersonalProfile from "./VetPersonalProfile.jsx";
import NotificationPanel from "../layout/NotificationPanel.jsx";
import LegalFooter from "../legal/LegalFooter.jsx";

export default function VetApp({ onLogout, onNav }) {
  const { vetId, vets, appts, notifications, unreadCount, markRead, markAllRead } = useApp();
  const pendingCount = appts.filter((a) => a.vetId === vetId && a.status === "pending").length;
  const vet = vets.find((v) => v.id === vetId);
  const [tab, setTab] = useState("agenda");
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const tabs = [
    ["agenda", "📅", "Agenda"],
    ["appts", "🗓️", "Visite"],
    ["patients", "🐾", "Pazienti"],
    ["billing", "🧾", "Fatture"],
    ["profile", "⭐", "Servizi"],
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
        }}
        unreadCount={unreadCount}
        onNotifications={() => {
          setShowNotifications(true);
          setShowProfile(false);
        }}
      />
      <div style={{ padding: space["3xl"] }}>
        {showNotifications ? (
          <NotificationPanel
            notifications={notifications}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
            onClose={() => setShowNotifications(false)}
          />
        ) : showProfile ? (
          <VetPersonalProfile onBack={() => setShowProfile(false)} />
        ) : (
          <>
            {tab === "agenda" && <VetAgenda vetId={vetId} />}
            {tab === "appts" && <VetAppts vetId={vetId} />}
            {tab === "patients" && <VetPatients vetId={vetId} />}
            {tab === "billing" && <VetBilling vetId={vetId} />}
            {tab === "profile" && <VetProfileTab vetId={vetId} />}
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
        }}
        badges={pendingCount > 0 ? { appts: pendingCount } : {}}
      />
    </div>
  );
}
