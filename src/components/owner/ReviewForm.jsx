import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { today, fmtDate } from "../../data/helpers.js";
import { colors, fontSize, radius, inputStyle } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";

export default function ReviewForm({ appt, onDone }) {
  const { vets, reviews, setReviews, notify, ownerProfile } = useApp();
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
        <label htmlFor="review-comment" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}>Il tuo commento</label>
        <textarea id="review-comment" value={comment} onChange={e => setComment(e.target.value)} rows={4} placeholder="Com'è andata la visita?"
          style={{ ...inputStyle, borderRadius: radius.lg, marginTop: 6 }} />
        <Btn variant="accent" style={{ marginTop: 12, width: "100%" }} disabled={!comment} onClick={() => {
          setReviews([...reviews, { id: "rv" + Date.now(), vetId: appt.vetId, apptId: appt.id, rating, comment, reply: null, date: fmtDate(today), author: ownerProfile.name }]);
          notify("⭐ Grazie per la recensione!"); onDone();
        }}>Invia recensione</Btn>
      </Card>
    </>
  );
}
