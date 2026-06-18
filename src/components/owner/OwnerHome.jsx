import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE, TYPE_META } from "../../data/constants.js";
import { today, fmtDate, addDays } from "../../data/helpers.js";
import { getService } from "../../data/services.js";
import { colors, fontSize } from "../../styles/tokens.js";
import Badge from "../ui/Badge.jsx";
import Card from "../ui/Card.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Empty from "../ui/Empty.jsx";

export default function OwnerHome({ goSearch, goPets }) {
  const { appts, pets, vets, vaccines, ownerProfile } = useApp();
  const next = appts.filter(a => ["pending", "confirmed"].includes(a.status) && a.date >= fmtDate(today)).sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextPet = next && pets.find(p => p.id === next.petId);
  const nextVet = next && vets.find(v => v.id === next.vetId);
  const nextSvc = next?.serviceId ? getService(next.serviceId) : null;
  const dueVax = vaccines.filter(v => v.due && new Date(v.due).getTime() < new Date(addDays(45)).getTime());

  return (
    <>
      <SectionTitle>Ciao {ownerProfile.name.split(" ")[0]} 👋</SectionTitle>
      {next ? (
        <Card style={{ borderLeft: `5px solid ${TEAL}` }}>
          <div style={{ fontSize: fontSize.sm, color: TEAL, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Prossima visita</div>
          <div style={{ fontSize: fontSize["2xl"], fontWeight: 700, margin: "6px 0 2px" }}>{nextPet?.photo} {nextPet?.name} · {next.date} ore {next.time}</div>
          <div style={{ color: colors.textSecondary, fontSize: fontSize.base }}>
            {nextVet?.name} · {nextSvc ? `${nextSvc.emoji} ${nextSvc.name}` : TYPE_META[next.type]}
          </div>
          <div style={{ marginTop: 8 }}><Badge status={next.status} /></div>
        </Card>
      ) : <Card><Empty icon="📅" text="Nessuna visita in programma" /></Card>}

      <div style={{ height: 14 }} />
      <Card style={{ borderLeft: `5px solid ${ORANGE}` }}>
        <div style={{ fontSize: fontSize.sm, color: ORANGE, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Promemoria scadenze</div>
        {dueVax.length ? dueVax.map((v, i) => {
          const pet = pets.find(p => p.id === v.petId);
          return <div key={i} style={{ marginTop: 8, fontSize: fontSize.base }}>💉 <b>{pet?.name}</b>: {v.name} — scade il <b>{v.due}</b></div>;
        }) : <div style={{ marginTop: 8, color: colors.textSecondary, fontSize: fontSize.base }}>Nessuna scadenza nei prossimi 45 giorni ✅</div>}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        <Card onClick={goSearch} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 30 }}>🔍</div><b style={{ color: TEAL }}>Prenota visita</b>
        </Card>
        <Card onClick={goPets} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 30 }}>🐾</div><b style={{ color: TEAL }}>I miei animali</b>
        </Card>
      </div>
    </>
  );
}
