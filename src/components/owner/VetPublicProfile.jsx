import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE, TYPE_META } from "../../data/constants.js";
import { SERVICE_CATEGORIES, getVetServices } from "../../data/services.js";
import { getNextSlotsForVet } from "../../utils/availability.js";
import { formatRelativeDateLabel } from "../../data/helpers.js";
import { colors, fontSize, radius } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import Stars from "../ui/Stars.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import AvatarImage from "../ui/AvatarImage.jsx";
import VetMap from "../map/VetMap.jsx";
import { phoneHref } from "../../utils/phone.js";

const CAT_EMOJI = { Visite: "🩺", Vaccini: "💉", Analisi: "🩸", Diagnostica: "📷", Chirurgia: "🏥", Altro: "📋" };

function slotChipLabel(slot) {
  return `${formatRelativeDateLabel(slot.date)} ${slot.time}`;
}

/**
 * VetPublicProfile — profilo pubblico del veterinario.
 * Props:
 *   vet: oggetto veterinario
 *   onBack: torna indietro
 *   onBook: apre BookingFlow generico (senza slot)
 *   onBookSlot(slot): apre BookingFlow con slot precompilato
 */
export default function VetPublicProfile({ vet, onBack, onBook, onBookSlot, onChat }) {
  const { reviews, appts, isFavoriteVet, toggleFavoriteVet } = useApp();
  const vetReviews = reviews.filter((r) => r.vetId === vet.id);
  const [reviewFilter, setReviewFilter] = useState("all");
  const visibleReviews = reviewFilter === "verified" ? vetReviews.filter((r) => !!r.apptId) : vetReviews;
  const verifiedCount = vetReviews.filter((r) => !!r.apptId).length;

  const vetServices = getVetServices(vet);
  const availableCats = SERVICE_CATEGORIES.filter((c) => vetServices.some((s) => s.cat === c));
  const [openCat, setOpenCat] = useState(null);

  /* Prossimi 5 slot */
  const nextSlots = getNextSlotsForVet({ vet, appts, limit: 5 });

  const cancelHours = vet.cancellationHours || 24;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${vet.lat || ""},${vet.lng || ""} ${vet.address || ""}`)}`;
  const callHref = phoneHref(vet.phone);

  const handleBookSlot = (slot) => {
    if (onBookSlot) onBookSlot(slot);
    else if (onBook) onBook();
  };

  return (
    <>
      <Btn small variant="light" onClick={onBack}>
        ← Indietro
      </Btn>

      {/* Hero card */}
      <Card style={{ marginTop: 12, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <AvatarImage src={vet.avatar} emoji={vet.avatar} name={vet.name} size={72} />
        </div>
        <h2 style={{ margin: "8px 0 2px" }}>{vet.name}</h2>
        {vet.status === "verified" && (
          <span
            style={{
              fontSize: fontSize.sm,
              background: colors.bgTealLight,
              color: TEAL,
              padding: "3px 10px",
              borderRadius: radius.pill,
              fontWeight: 700,
            }}
          >
            ✓ Verificato
          </span>
        )}
        <div style={{ color: colors.textSecondary, marginTop: 6 }}>{vet.clinic}</div>
        <div style={{ color: colors.textMuted, fontSize: fontSize.md }}>
          {vet.zone || vet.city} · {vet.address}
        </div>
        <div style={{ margin: "8px 0" }}>
          <Stars n={vet.rating} />
          <span style={{ marginLeft: 4 }}>
            <b>{vet.rating}</b> · {vet.reviews} recensioni
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
          {vet.types.map((t) => (
            <span
              key={t}
              style={{
                background: colors.bgOrangeLight,
                color: ORANGE,
                fontSize: fontSize.sm,
                padding: "4px 10px",
                borderRadius: radius.md,
                fontWeight: 600,
              }}
            >
              {TYPE_META[t]}
            </span>
          ))}
        </div>
        {vet.languages && vet.languages.length > 0 && (
          <div style={{ marginTop: 8, fontSize: fontSize.md, color: colors.textSecondary }}>
            🗣️ {vet.languages.join(", ")}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <Btn variant={isFavoriteVet(vet.id) ? undefined : "light"} onClick={() => toggleFavoriteVet(vet.id)}>
            {isFavoriteVet(vet.id) ? "♥ Salvato" : "♡ Salva"}
          </Btn>
          {callHref ? (
            <Btn variant="light" onClick={() => (window.location.href = callHref)}>
              ☎ Chiama ora
            </Btn>
          ) : (
            <Btn variant="light" disabled>
              Numero non disponibile
            </Btn>
          )}
          <Btn variant="light" onClick={() => onChat?.(vet)}>
            💬 Chat
          </Btn>
        </div>
      </Card>

      {/* ── Primi slot disponibili — priorità visiva ── */}
      <SectionTitle style={{ marginTop: 20 }}>Primi slot disponibili</SectionTitle>
      {nextSlots.length > 0 ? (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {nextSlots.map((slot, i) => (
              <button
                key={i}
                onClick={() => handleBookSlot(slot)}
                style={{
                  padding: "10px 14px",
                  borderRadius: radius.lg,
                  border: `2px solid ${TEAL}`,
                  background: colors.bgTealSel,
                  color: TEAL,
                  fontSize: fontSize.base,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  minHeight: 44,
                }}
              >
                {slotChipLabel(slot)} · €{slot.price}
                <span style={{ display: "block", fontSize: fontSize.xs, color: colors.textMedium, marginTop: 3 }}>
                  Prenota questo slot
                </span>
              </button>
            ))}
          </div>
          <Btn variant="accent" onClick={onBook} style={{ width: "100%", marginBottom: 8 }}>
            Scegli un altro orario →
          </Btn>
        </>
      ) : (
        <>
          <Card style={{ marginBottom: 12 }}>
            <span style={{ color: colors.textMuted }}>Nessuno slot disponibile nei prossimi 21 giorni</span>
          </Card>
          <Btn variant="accent" onClick={onBook} style={{ width: "100%", marginBottom: 8 }}>
            Prenota una visita
          </Btn>
        </>
      )}

      {/* Bio */}
      <SectionTitle style={{ marginTop: 16 }}>Chi sono</SectionTitle>
      <Card>
        <div style={{ fontSize: fontSize.base, color: colors.textMedium, lineHeight: 1.6 }}>{vet.bio}</div>
        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {vet.spec.map((s) => (
            <span
              key={s}
              style={{
                background: colors.bgBtn,
                color: colors.textMedium,
                fontSize: fontSize.xs,
                padding: "3px 8px",
                borderRadius: radius.md,
                fontWeight: 600,
              }}
            >
              {s}
            </span>
          ))}
        </div>
        {vet.animals && (
          <div style={{ marginTop: 6, fontSize: fontSize.sm, color: colors.textSecondary }}>
            🐾 Animali: {vet.animals.join(", ")}
          </div>
        )}
      </Card>

      {/* Dove siamo */}
      <SectionTitle style={{ marginTop: 20 }}>Dove siamo</SectionTitle>
      <Card>
        <div style={{ fontSize: fontSize.base, color: colors.textDark, lineHeight: 1.6 }}>{vet.address}</div>
        <div style={{ fontSize: fontSize.base, color: colors.textSecondary }}>
          {vet.city}
          {vet.zone ? ` · ${vet.zone}` : ""}
        </div>
        <div style={{ marginTop: 10 }}>
          <VetMap
            vets={[vet]}
            slots={nextSlots}
            center={{ lat: vet.lat || 41.9028, lng: vet.lng || 12.4964 }}
            onBookSlot={handleBookSlot}
          />
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            marginTop: 8,
            fontSize: fontSize.md,
            color: TEAL,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          🧭 Indicazioni
        </a>
      </Card>

      {/* Policy cancellazione */}
      <Card style={{ marginTop: 12, background: colors.bgLighter }}>
        <div style={{ fontSize: fontSize.md, color: colors.textMedium, lineHeight: 1.6 }}>
          ℹ️ <b>Cancellazione:</b> gratuita fino a <b>{cancelHours}h</b> prima della visita.
        </div>
        {vet.autoConfirm && (
          <div style={{ marginTop: 6, fontSize: fontSize.md, color: "#065F46", fontWeight: 600 }}>
            ✓ Prenotazione con conferma immediata
          </div>
        )}
      </Card>

      {/* Listino servizi */}
      <SectionTitle style={{ marginTop: 20 }}>Prestazioni e prezzi</SectionTitle>
      <div style={{ display: "grid", gap: 6 }}>
        {availableCats.map((cat) => {
          const catServices = vetServices.filter((s) => s.cat === cat);
          const isOpen = openCat === cat;
          return (
            <div
              key={cat}
              style={{ borderRadius: radius.lg, border: `1px solid ${colors.borderLight}`, overflow: "hidden" }}
            >
              <button
                onClick={() => setOpenCat(isOpen ? null : cat)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  background: isOpen ? colors.bgTealSel : colors.white,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: fontSize.base, display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span style={{ fontSize: 18 }}>{CAT_EMOJI[cat]}</span> {cat}
                  <span style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 400 }}>
                    ({catServices.length})
                  </span>
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: isOpen ? TEAL : colors.textMuted,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                  }}
                >
                  ▼
                </span>
              </button>
              {isOpen && (
                <div style={{ borderTop: `1px solid ${colors.divider}` }}>
                  {catServices.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: "10px 14px",
                        borderBottom: `1px solid ${colors.divider}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: fontSize.base }}>{s.name}</div>
                        {s.desc && <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>{s.desc}</div>}
                        <div style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>⏱ ~{s.duration} min</div>
                      </div>
                      <b style={{ color: ORANGE, fontSize: fontSize.xl }}>€{s.price}</b>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recensioni */}
      <SectionTitle style={{ marginTop: 20 }}>Recensioni</SectionTitle>
      <Card style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: colors.textDark }}>{vet.rating}</div>
        <Stars n={vet.rating} />
        <div style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: 4 }}>
          {vet.reviews} recensioni · {verifiedCount} verificat{verifiedCount === 1 ? "a" : "e"}
        </div>
      </Card>
      <p style={{ fontSize: fontSize.xs, color: colors.textMuted, margin: "0 0 10px", lineHeight: 1.5 }}>
        Le recensioni <b>verificate ✓</b> provengono da utenti che hanno prenotato e completato una visita tramite
        MioVeterinario.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <Btn small variant={reviewFilter === "all" ? undefined : "light"} onClick={() => setReviewFilter("all")}>
          Tutte
        </Btn>
        <Btn
          small
          variant={reviewFilter === "verified" ? undefined : "light"}
          onClick={() => setReviewFilter("verified")}
        >
          Verificate
        </Btn>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {visibleReviews.map((r) => {
          const isVerified = !!r.apptId;
          return (
            <Card key={r.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <b style={{ fontSize: fontSize.base }}>{r.author}</b>
                  {isVerified ? (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: fontSize.xs,
                        background: colors.bgTealSel,
                        color: TEAL,
                        borderRadius: radius.sm,
                        padding: "2px 6px",
                        fontWeight: 700,
                      }}
                    >
                      ✓ Verificata
                    </span>
                  ) : (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: fontSize.xs,
                        background: colors.bgLighter,
                        color: colors.textMuted,
                        borderRadius: radius.sm,
                        padding: "2px 6px",
                      }}
                    >
                      Non verificata
                    </span>
                  )}
                </div>
                <span style={{ fontSize: fontSize.sm, color: colors.textMuted }}>{r.date}</span>
              </div>
              <Stars n={r.rating} />
              <div style={{ fontSize: fontSize.base, marginTop: 4 }}>{r.comment}</div>
              {r.reply && (
                <div
                  style={{
                    marginTop: 8,
                    background: colors.bgTealSel,
                    padding: "8px 10px",
                    borderRadius: radius.md,
                    fontSize: fontSize.md,
                  }}
                >
                  <b style={{ color: TEAL }}>Risposta del veterinario:</b> {r.reply}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
