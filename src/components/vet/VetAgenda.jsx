import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { ORANGE, TYPE_META } from "../../data/constants.js";
import { today, fmtDate } from "../../data/helpers.js";
import { getService } from "../../data/services.js";
import { colors, fontSize, radius } from "../../styles/tokens.js";
import useIsMobile from "../../hooks/useIsMobile.js";
import Badge from "../ui/Badge.jsx";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import VetStats from "./VetStats.jsx";

const DAY_FULL = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

export default function VetAgenda({ vetId }) {
  const { appts, pets } = useApp();
  const isMobile = useIsMobile();
  const [weekOffset, setWeekOffset] = useState(0);
  const monday = (() => { const d = new Date(today); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day + weekOffset * 7); return d; })();
  const weekDays = Array.from({ length: 6 }, (_, i) => { const d = new Date(monday); d.setDate(d.getDate() + i); return d; });
  const pendingCount = appts.filter(a => a.vetId === vetId && a.status === "pending").length;
  const proposalCount = appts.filter(a => a.vetId === vetId && a.proposal && a.proposal.from === "owner").length;

  return (
    <>
      <VetStats vetId={vetId} />
      <SectionTitle right={
        <div style={{ display: "flex", gap: 6 }}>
          {pendingCount > 0 && <span style={{ background: "#FEF3C7", color: "#92400E", padding: "4px 12px", borderRadius: radius.xl, fontSize: fontSize.md, fontWeight: 700 }}>🔔 {pendingCount} da confermare</span>}
          {proposalCount > 0 && <span style={{ background: colors.bgOrangeLight, color: ORANGE, padding: "4px 12px", borderRadius: radius.xl, fontSize: fontSize.md, fontWeight: 700 }}>📝 {proposalCount} proposte</span>}
        </div>
      }>Agenda</SectionTitle>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <Btn small variant="light" onClick={() => setWeekOffset(weekOffset - 1)}>{isMobile ? "←" : "← Sett. prec."}</Btn>
        <b style={{ alignSelf: "center", fontSize: fontSize.base, textAlign: "center" }}>{weekOffset === 0 ? "Questa settimana" : `${fmtDate(weekDays[0])} → ${fmtDate(weekDays[5])}`}</b>
        <Btn small variant="light" onClick={() => setWeekOffset(weekOffset + 1)}>{isMobile ? "→" : "Succ. →"}</Btn>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {weekDays.map(d => {
          const ds = fmtDate(d);
          const dayAppts = appts.filter(a => a.vetId === vetId && a.date === ds && a.status !== "cancelled").sort((a, b) => a.time.localeCompare(b.time));
          const isToday = ds === fmtDate(today);
          return (
            <Card key={ds} style={{ borderLeft: isToday ? `4px solid ${ORANGE}` : "4px solid transparent" }}>
              <b style={{ fontSize: fontSize.base, color: isToday ? ORANGE : colors.textDark }}>
                {(isMobile ? DAY_SHORT : DAY_FULL)[d.getDay()]} {d.getDate()}/{d.getMonth() + 1}{isToday ? " · OGGI" : ""}
              </b>
              {dayAppts.length ? dayAppts.map(a => {
                const pet = pets.find(p => p.id === a.petId);
                const svc = a.serviceId ? getService(a.serviceId) : null;
                return (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, background: colors.bgLighter, borderRadius: radius.md, padding: "8px 12px" }}>
                    <div>
                      <b style={{ fontSize: fontSize.base }}>{a.time}</b> · {pet?.photo} {pet?.name} <span style={{ color: colors.textSecondary, fontSize: fontSize.md }}>({pet?.species})</span>
                      <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>
                        {svc ? `${svc.emoji} ${svc.name} · ~${svc.duration} min` : TYPE_META[a.type]}
                      </div>
                    </div>
                    <Badge status={a.status} />
                  </div>
                );
              }) : <div style={{ color: colors.border, fontSize: fontSize.md, marginTop: 6 }}>Nessuna visita</div>}
            </Card>
          );
        })}
      </div>
    </>
  );
}
