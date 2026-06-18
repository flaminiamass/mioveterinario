import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL, ORANGE } from "../../data/constants.js";
import { colors, fontSize, radius, selectStyle, searchInputStyle } from "../../styles/tokens.js";
import Card from "../ui/Card.jsx";
import Stars from "../ui/Stars.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Empty from "../ui/Empty.jsx";

export default function SearchVets({ onView }) {
  const { vets } = useApp();
  const [q, setQ] = useState("");
  const [animal, setAnimal] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("rating");

  const filtered = useMemo(() => {
    let r = vets.filter(v =>
      v.status === "verified" &&
      (!q || v.name.toLowerCase().includes(q.toLowerCase()) || v.spec.join(" ").toLowerCase().includes(q.toLowerCase()) || v.city.toLowerCase().includes(q.toLowerCase())) &&
      (!animal || v.animals.includes(animal)) &&
      (!type || v.types.includes(type))
    );
    if (sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    if (sort === "price") r = [...r].sort((a, b) => a.fees.clinic - b.fees.clinic);
    return r;
  }, [q, animal, type, sort, vets]);

  return (
    <>
      <SectionTitle>Cerca veterinario</SectionTitle>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Nome, specializzazione o città…" style={searchInputStyle} />
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <select style={selectStyle} value={animal} onChange={e => setAnimal(e.target.value)}>
          <option value="">Tutti gli animali</option>
          {["Cane", "Gatto", "Coniglio", "Uccelli", "Rettili"].map(a => <option key={a}>{a}</option>)}
        </select>
        <select style={selectStyle} value={type} onChange={e => setType(e.target.value)}>
          <option value="">Tutti i tipi di visita</option>
          <option value="clinic">In clinica</option><option value="home">A domicilio</option><option value="video">Video</option>
        </select>
        <select style={selectStyle} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="rating">Ordina: rating</option><option value="price">Ordina: prezzo</option>
        </select>
      </div>
      {/* Trasparenza ranking — HIGH fix (P2B Reg. UE 2019/1150) */}
      <p style={{ fontSize: fontSize.xs, color: colors.textMuted, margin: "8px 0 0", lineHeight: 1.5 }}>
        {sort === "rating"
          ? "ℹ️ Ordine per valutazione media delle recensioni verificate. Nessun risultato sponsorizzato in questa versione."
          : "ℹ️ Ordine per prezzo base della visita in clinica (crescente). Nessun risultato sponsorizzato in questa versione."}
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {filtered.length === 0 && <Empty icon="🔍" text="Nessun veterinario trovato con questi filtri" />}
        {filtered.map(v => (
          <Card key={v.id} onClick={() => onView(v)}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ fontSize: 40 }}>{v.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: fontSize.xl }}>{v.name} <span style={{ fontSize: fontSize.xs, color: TEAL, fontWeight: 600, background: colors.bgTealLight, padding: "2px 7px", borderRadius: radius.md }}>✓ Verificato</span></div>
                <div style={{ color: colors.textSecondary, fontSize: fontSize.md }}>{v.clinic} · {v.city}</div>
                <div style={{ marginTop: 4 }}><Stars n={v.rating} /> <span style={{ fontSize: fontSize.md, color: colors.textSecondary }}>{v.rating} ({v.reviews} recensioni)</span></div>
                <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {v.spec.map(s => <span key={s} style={{ background: colors.bgTealLight, color: TEAL, fontSize: fontSize.xs, padding: "3px 8px", borderRadius: radius.md, fontWeight: 600 }}>{s}</span>)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, color: ORANGE, fontSize: fontSize["2xl"] }}>€{v.fees.clinic}</div>
                <div style={{ fontSize: fontSize.xs, color: colors.textMuted }}>visita</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
