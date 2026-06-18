import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { today, fmtDate } from "../../data/helpers.js";
import { createReview, isSupabaseConfigured } from "../../lib/db.js";
import { mapReview } from "../../lib/mappers.js";
import { colors, fontSize, radius, inputStyle } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";

export default function ReviewForm({ appt, onDone }) {
  const { vets, reviews, setReviews, notify, ownerProfile } = useApp();
  const { user } = useAuthContext();
  const vet = vets.find(v => v.id === appt.vetId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  return (
    <>
      <Btn small variant="light" onClick={onDone}>← Indietro</Btn>
      <Card style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Recensisci {vet?.name}</h3>
        <label style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>Valutazione</label>
        <div style={{ fontSize: 32, cursor: "pointer", marginTop: 4 }}>
          {[1, 2, 3, 4, 5].map(n => <span key={n} onClick={() => setRating(n)} role="button" aria-label={`${n} ${n === 1 ? "stella" : "stelle"}`} style={{ color: n <= rating ? colors.star : colors.borderLight }}>★</span>)}
        </div>
        <div style={{ background: colors.bgLighter, border: `1px solid ${colors.divider}`, borderRadius: radius.md, padding: "10px 14px", marginTop: 14, marginBottom: 4, fontSize: fontSize.md, color: colors.textMedium, lineHeight: 1.6 }}>
          <b>ℹ️ Prima di inviare la recensione:</b>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            <li>Le recensioni provengono da appuntamenti completati e sono <b>pubbliche</b> sul profilo del veterinario.</li>
            <li><b>Non inserire</b> dati sanitari dell'animale, diagnosi, farmaci o dati personali nel commento — per questo esiste il referto clinico.</li>
          </ul>
        </div>
        <label htmlFor="review-comment" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}>Il tuo commento</label>
        <textarea id="review-comment" value={comment} onChange={e => setComment(e.target.value)} rows={4} placeholder="Com'è andata la visita?"
          style={{ ...inputStyle, borderRadius: radius.lg, marginTop: 6 }} maxLength={500} />
        <div style={{ textAlign: "right", fontSize: fontSize.xs, color: comment.length > 450 ? colors.danger || "#E53E3E" : colors.textMuted, marginTop: 2 }}>{comment.length}/500</div>
        <Btn variant="accent" style={{ marginTop: 12, width: "100%" }} disabled={!comment} onClick={async () => {
          if (isSupabaseConfigured() && user) {
            const { data, error } = await createReview({ vetId: appt.vetId, apptId: appt.id, authorId: user.id, rating, comment, authorName: ownerProfile.name });
            if (error) { notify("❌ Errore: " + error.message); return; }
            setReviews([...reviews, mapReview(data)]);
          } else {
            setReviews([...reviews, { id: "rv" + Date.now(), vetId: appt.vetId, apptId: appt.id, rating, comment, reply: null, date: fmtDate(today), author: ownerProfile.name }]);
          }
          notify("⭐ Grazie per la recensione!"); onDone();
        }}>Invia recensione</Btn>
      </Card>
    </>
  );
}
