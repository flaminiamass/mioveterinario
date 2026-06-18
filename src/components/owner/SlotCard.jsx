import { TEAL, ORANGE, TYPE_META } from "../../data/constants.js";
import { colors, fontSize, radius } from "../../styles/tokens.js";
import Stars from "../ui/Stars.jsx";
import Btn from "../ui/Btn.jsx";
import { fmtDistance } from "../../utils/location.js";
import { formatRelativeDateLabel } from "../../data/helpers.js";

/**
 * SlotCard — card slot-first per la tab Prenota.
 *
 * Props:
 *   slot: oggetto slot normalizzato (da getAllAvailableSlots)
 *   onBook: () => void
 *   onViewVet: () => void
 */
export default function SlotCard({ slot, onBook, onViewVet }) {
  const dayLabel = formatRelativeDateLabel(slot.date);
  const isToday = dayLabel === "Oggi";
  const isTomorrow = dayLabel === "Domani";
  const urgentColor = isToday ? ORANGE : isTomorrow ? TEAL : colors.textDark;

  const typeLabel = TYPE_META[slot.type] || "In clinica";
  const confirmLabel = slot.autoConfirm ? "✓ Conferma immediata" : "⏳ Richiesta conferma";

  return (
    <div
      style={{
        background: colors.white,
        borderRadius: radius.xl,
        boxShadow: "0 8px 26px rgba(15,23,42,0.08)",
        overflow: "hidden",
        border: `1px solid ${colors.borderLight}`,
      }}
    >
      {/* Fascia orario — priorità visiva massima */}
      <div
        style={{
          background: isToday
            ? "linear-gradient(135deg, #FFF3E8, #FFE7D1)"
            : "linear-gradient(135deg, #F0F9F9, #E0F2F2)",
          padding: "14px 16px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ fontSize: fontSize["3xl"], fontWeight: 800, color: urgentColor }}>{slot.time}</span>
          <span style={{ marginLeft: 8, fontSize: fontSize.lg, fontWeight: 600, color: urgentColor }}>
            · {dayLabel}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: ORANGE,
              background: colors.white,
              padding: "5px 9px",
              borderRadius: radius.md,
            }}
          >
            €{slot.price}
          </div>
        </div>
      </div>

      {/* Corpo card */}
      <div style={{ padding: "12px 16px 14px" }}>
        {/* Prestazione */}
        <div style={{ fontSize: fontSize.base, fontWeight: 700, color: colors.textDark, marginBottom: 6 }}>
          {slot.service.emoji} {slot.service.name}
          <span style={{ marginLeft: 8, fontSize: fontSize.sm, fontWeight: 500, color: colors.textMuted }}>
            · ~{slot.service.duration} min
          </span>
        </div>

        {/* Veterinario */}
        <div style={{ fontSize: fontSize.base, fontWeight: 600, color: colors.textDark }}>
          {slot.vet.avatar} {slot.vet.name}
        </div>

        {/* Clinica + zona + distanza */}
        <div style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: 2 }}>
          {slot.vet.clinic} · {slot.zone}
          {slot.distanceKm != null && (
            <span style={{ marginLeft: 6, color: colors.textMuted }}>· {fmtDistance(slot.distanceKm)}</span>
          )}
        </div>

        {/* Rating + recensioni + badge verificato */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          <Stars n={slot.rating} />
          <span style={{ fontSize: fontSize.md, color: colors.textSecondary }}>
            {slot.rating} · {slot.reviews} recensioni
          </span>
          <span
            style={{
              fontSize: fontSize.xs,
              background: colors.bgTealLight,
              color: TEAL,
              padding: "2px 7px",
              borderRadius: radius.md,
              fontWeight: 700,
            }}
          >
            ✓ Verificato
          </span>
        </div>

        {/* Modalità visita */}
        <div style={{ marginTop: 6 }}>
          <span
            style={{
              fontSize: fontSize.xs,
              background: colors.bgOrangeLight,
              color: ORANGE,
              padding: "3px 8px",
              borderRadius: radius.sm,
              fontWeight: 600,
            }}
          >
            {typeLabel}
          </span>
          <span
            style={{
              marginLeft: 6,
              fontSize: fontSize.xs,
              background: slot.autoConfirm ? "#D1FAE5" : colors.bgLighter,
              color: slot.autoConfirm ? "#065F46" : colors.textMedium,
              padding: "3px 8px",
              borderRadius: radius.sm,
              fontWeight: 700,
            }}
          >
            {confirmLabel}
          </span>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Btn variant="accent" onClick={onBook} style={{ flex: 2, fontSize: fontSize.base, minHeight: 44 }}>
            Prenota {slot.time}
          </Btn>
          <Btn variant="light" onClick={onViewVet} style={{ flex: 1, fontSize: fontSize.md, minHeight: 44 }}>
            Vedi veterinario
          </Btn>
        </div>
      </div>
    </div>
  );
}
