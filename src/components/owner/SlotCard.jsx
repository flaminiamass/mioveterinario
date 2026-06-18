import { TEAL, ORANGE, TYPE_META } from "../../data/constants.js";
import { colors, fontSize, radius, shadow } from "../../styles/tokens.js";
import Stars from "../ui/Stars.jsx";
import Btn from "../ui/Btn.jsx";
import { fmtDistance } from "../../utils/location.js";
import { today } from "../../data/helpers.js";

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

function slotDayLabel(dateStr) {
  const t = new Date(today);
  const d = new Date(dateStr);
  const diff = Math.round((d - t) / 86400000);
  const dow = DAY_SHORT[d.getDay()];
  if (diff === 0) return "Oggi";
  if (diff === 1) return "Domani";
  return `${dow} ${d.getDate()}/${d.getMonth() + 1}`;
}

/**
 * SlotCard — card slot-first per la tab Prenota.
 *
 * Props:
 *   slot: oggetto slot normalizzato (da getAllAvailableSlots)
 *   onBook: () => void
 *   onViewVet: () => void
 */
export default function SlotCard({ slot, onBook, onViewVet }) {
  const dayLabel = slotDayLabel(slot.date);
  const isToday = dayLabel === "Oggi";
  const isTomorrow = dayLabel === "Domani";
  const urgentColor = isToday ? ORANGE : isTomorrow ? TEAL : colors.textDark;

  const typeLabel = TYPE_META[slot.type] || "In clinica";

  return (
    <div style={{
      background: colors.white,
      borderRadius: radius.xl,
      boxShadow: shadow.card,
      overflow: "hidden",
      border: `1px solid ${colors.borderLight}`,
    }}>
      {/* Fascia orario — priorità visiva massima */}
      <div style={{
        background: isToday ? colors.bgOrangeLight : colors.bgTealSel,
        padding: "12px 16px 10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <span style={{ fontSize: fontSize["3xl"], fontWeight: 800, color: urgentColor }}>
            {slot.time}
          </span>
          <span style={{ marginLeft: 8, fontSize: fontSize.lg, fontWeight: 600, color: urgentColor }}>
            · {dayLabel}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: fontSize["2xl"], fontWeight: 800, color: ORANGE }}>
            €{slot.price}
          </div>
          {slot.autoConfirm && (
            <span style={{ fontSize: fontSize.xs, background: "#D1FAE5", color: "#065F46", padding: "2px 6px", borderRadius: radius.sm, fontWeight: 700 }}>
              ✓ Conferma immediata
            </span>
          )}
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
          <span style={{ fontSize: fontSize.xs, background: colors.bgTealLight, color: TEAL, padding: "2px 7px", borderRadius: radius.md, fontWeight: 700 }}>
            ✓ Verificato
          </span>
        </div>

        {/* Modalità visita */}
        <div style={{ marginTop: 6 }}>
          <span style={{ fontSize: fontSize.xs, background: colors.bgOrangeLight, color: ORANGE, padding: "3px 8px", borderRadius: radius.sm, fontWeight: 600 }}>
            {typeLabel}
          </span>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Btn
            variant="accent"
            onClick={onBook}
            style={{ flex: 2, fontSize: fontSize.base, minHeight: 44 }}
          >
            Prenota
          </Btn>
          <Btn
            variant="light"
            onClick={onViewVet}
            style={{ flex: 1, fontSize: fontSize.md, minHeight: 44 }}
          >
            Vedi veterinario
          </Btn>
        </div>
      </div>
    </div>
  );
}
