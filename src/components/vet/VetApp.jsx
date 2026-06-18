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
import LegalFooter from "../legal/LegalFooter.jsx";

export default function VetApp({ onLogout, onNav }) {
  const { vetId, vets } = useApp();
  const vet = vets.find(v => v.id === vetId);
  const [tab, setTab] = useState("agenda");
  const tabs = [
    ["agenda", "📅", "Agenda"], ["appts", "🗓️", "Visite"], ["patients", "🐾", "Pazienti"],
    ["billing", "🧾", "Fatture"], ["profile", "⭐", "Profilo"],
  ];
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 86 }}>
      <Header title="MioVeterinario Pro" subtitle={`${vet?.name} · ${vet?.clinic}`} onLogout={onLogout} />
      <div style={{ padding: space["3xl"] }}>
        {tab === "agenda" && <VetAgenda vetId={vetId} />}
        {tab === "appts" && <VetAppts vetId={vetId} />}
        {tab === "patients" && <VetPatients vetId={vetId} />}
        {tab === "billing" && <VetBilling vetId={vetId} />}
        {tab === "profile" && <VetProfileTab vetId={vetId} />}
      </div>
      <LegalFooter onNav={onNav} />
      <BottomNav tabs={tabs} active={tab} onChange={setTab} />
    </div>
  );
}
