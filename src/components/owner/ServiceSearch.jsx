/* ServiceSearch — flusso service-first: Bisogno → Servizio → Veterinari che lo offrono → Prenota */

import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE } from "../../data/constants.js";
import { VET_SERVICES, SERVICE_CATEGORIES, getVetServices } from "../../data/services.js";
import { getFirstAvailableSlot } from "../../data/availability.js";
import { colors, fontSize, radius } from "../../styles/tokens.js";
import Card from "../ui/Card.jsx";
import Stars from "../ui/Stars.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Empty from "../ui/Empty.jsx";
import Btn from "../ui/Btn.jsx";

/* Emoji per ogni categoria */
const CAT_EMOJI = { Visite: "🩺", Vaccini: "💉", Analisi: "🩸", Diagnostica: "📷", Chirurgia: "🏥", Altro: "📋" };

/* Nomi dei giorni abbreviati */
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

const fmtSlot = (slot) => {
  if (!slot) return null;
  const d = new Date(slot.date);
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1} ore ${slot.time}`;
};

export default function ServiceSearch({ onBook }) {
  const { vets, appts } = useApp();
  const [openCat, setOpenCat] = useState(null);
  const [selectedService, setSelectedService] = useState(null);  // oggetto servizio dal catalogo

  const verifiedVets = useMemo(() => vets.filter(v => v.status === "verified"), [vets]);

  /* Per ogni servizio del catalogo, conta quanti vet verificati lo offrono e calcola range prezzo */
  const serviceStats = useMemo(() => {
    const stats = {};
    VET_SERVICES.forEach(s => {
      const offering = verifiedVets.filter(v => {
        const vs = getVetServices(v);
        return vs.some(sv => sv.id === s.id);
      });
      if (offering.length > 0) {
        const prices = offering.map(v => {
          const sv = getVetServices(v).find(sv => sv.id === s.id);
          return sv ? sv.price : s.price;
        });
        stats[s.id] = {
          count: offering.length,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
        };
      }
    });
    return stats;
  }, [verifiedVets]);

  /* Vet che offrono il servizio selezionato, con prezzo e slot */
  const matchingVets = useMemo(() => {
    if (!selectedService) return [];
    return verifiedVets
      .map(v => {
        const vs = getVetServices(v);
        const sv = vs.find(s => s.id === selectedService.id);
        if (!sv) return null;
        return {
          ...v,
          servicePrice: sv.price,
          _firstSlot: getFirstAvailableSlot(v, appts),
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Ordina per prima disponibilità (null = in fondo)
        if (!a._firstSlot && !b._firstSlot) return 0;
        if (!a._firstSlot) return 1;
        if (!b._firstSlot) return -1;
        const cmp = a._firstSlot.date.localeCompare(b._firstSlot.date);
        return cmp !== 0 ? cmp : a._firstSlot.time.localeCompare(b._firstSlot.time);
      });
  }, [selectedService, verifiedVets, appts]);

  /* Vista: lista vet per un servizio selezionato */
  if (selectedService) {
    return (
      <>
        <Btn small variant="light" onClick={() => setSelectedService(null)}>← Torna ai servizi</Btn>
        <SectionTitle style={{ marginTop: 12 }}>
          {selectedService.emoji} {selectedService.name}
        </SectionTitle>
        <p style={{ fontSize: fontSize.md, color: colors.textSecondary, margin: "0 0 14px" }}>
          {selectedService.desc}
        </p>

        {matchingVets.length === 0 ? (
          <Empty icon="🔍" text="Nessun veterinario verificato offre questo servizio" />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {matchingVets.map(v => (
              <Card key={v.id}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ fontSize: 36 }}>{v.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: fontSize.xl }}>{v.name}</div>
                    <div style={{ color: colors.textSecondary, fontSize: fontSize.md }}>
                      {v.clinic} · {v.city}{v.zone ? ` · ${v.zone}` : ""}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Stars n={v.rating} />{" "}
                      <span style={{ fontSize: fontSize.md, color: colors.textSecondary }}>{v.rating} ({v.reviews})</span>
                    </div>
                    {/* Primo slot */}
                    <div style={{ marginTop: 4, fontSize: fontSize.sm }}>
                      {v._firstSlot
                        ? <span style={{ color: TEAL, fontWeight: 600 }}>📅 {fmtSlot(v._firstSlot)}</span>
                        : <span style={{ color: colors.textMuted }}>Nessuno slot disponibile</span>
                      }
                    </div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 800, color: ORANGE, fontSize: fontSize["2xl"] }}>€{v.servicePrice}</div>
                      <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>{selectedService.name}</div>
                    </div>
                    <Btn small variant="accent" onClick={() => onBook(v, selectedService.id)} style={{ marginTop: 8 }}>
                      Prenota
                    </Btn>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* P2B */}
        <p style={{ fontSize: fontSize.xs, color: colors.textMuted, margin: "12px 0 0", lineHeight: 1.5 }}>
          ℹ️ Ordine per primo slot disponibile. Nessun risultato sponsorizzato.
        </p>
      </>
    );
  }

  /* Vista principale: griglia categorie + servizi */
  return (
    <>
      <SectionTitle>Di cosa ha bisogno il tuo animale?</SectionTitle>
      <p style={{ fontSize: fontSize.md, color: colors.textSecondary, margin: "-8px 0 14px" }}>
        Scegli un servizio e vedi quali veterinari lo offrono e quando sono disponibili.
      </p>

      <div style={{ display: "grid", gap: 6 }}>
        {SERVICE_CATEGORIES.map(cat => {
          const catServices = VET_SERVICES.filter(s => s.cat === cat);
          // Conta solo servizi che almeno un vet offre
          const available = catServices.filter(s => serviceStats[s.id]);
          const isOpen = openCat === cat;

          return (
            <div key={cat} style={{ borderRadius: radius.lg, border: `1px solid ${colors.borderLight}`, overflow: "hidden" }}>
              {/* Header categoria */}
              <button onClick={() => setOpenCat(isOpen ? null : cat)} style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 14px", background: isOpen ? colors.bgTealSel : colors.white,
                border: "none", cursor: "pointer", fontFamily: "inherit",
              }}>
                <span style={{ fontWeight: 700, fontSize: fontSize.xl, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{CAT_EMOJI[cat]}</span>
                  {cat}
                  <span style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 400 }}>({available.length} servizi)</span>
                </span>
                <span style={{ fontSize: 14, color: isOpen ? TEAL : colors.textMuted, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </button>

              {/* Lista servizi della categoria */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${colors.divider}` }}>
                  {catServices.map(s => {
                    const stat = serviceStats[s.id];
                    return (
                      <div
                        key={s.id}
                        onClick={() => stat && setSelectedService(s)}
                        style={{
                          padding: "12px 14px", cursor: stat ? "pointer" : "default",
                          borderBottom: `1px solid ${colors.divider}`,
                          display: "flex", alignItems: "center", gap: 12,
                          opacity: stat ? 1 : 0.45,
                        }}
                      >
                        <span style={{ fontSize: 24, flexShrink: 0 }}>{s.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: fontSize.base }}>{s.name}</div>
                          {s.desc && <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 }}>{s.desc}</div>}
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          {stat ? (
                            <>
                              <div style={{ fontWeight: 700, color: ORANGE, fontSize: fontSize.base }}>
                                {stat.minPrice === stat.maxPrice ? `€${stat.minPrice}` : `€${stat.minPrice}–${stat.maxPrice}`}
                              </div>
                              <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
                                {stat.count} {stat.count === 1 ? "vet" : "vet"}
                              </div>
                            </>
                          ) : (
                            <span style={{ fontSize: fontSize.xs, color: colors.textMuted }}>Non disponibile</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
