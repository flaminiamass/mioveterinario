import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { updateVetProfile, deleteAccount, isSupabaseConfigured } from "../../lib/db.js";
import { TEAL, ORANGE, colors, fontSize, radius, inputStyle, selectStyle } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";

/* Emoji avatar disponibili per il vet */
const VET_AVATARS = ["👩‍⚕️", "👨‍⚕️", "🧑‍⚕️", "👩", "👨", "🧑", "👩‍🔬", "👨‍🔬"];

/* Specializzazioni comuni */
const SPEC_OPTIONS = [
  "Medicina interna",
  "Chirurgia",
  "Ortopedia",
  "Dermatologia",
  "Cardiologia",
  "Neurologia",
  "Oncologia",
  "Oculistica",
  "Odontoiatria",
  "Nutrizione",
  "Comportamento",
  "Riproduzione",
  "Animali esotici",
  "Medicina d'urgenza",
];

/* Tipi di animali */
const ANIMAL_OPTIONS = ["Cani", "Gatti", "Conigli", "Roditori", "Uccelli", "Rettili", "Cavalli", "Esotici"];

export default function VetPersonalProfile({ onBack }) {
  const { vetId, vets, setVets, notify } = useApp();
  const { user, signOut } = useAuthContext();
  const vet = vets.find((v) => v.id === vetId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [newSpec, setNewSpec] = useState("");
  const [newAnimal, setNewAnimal] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inp = { ...inputStyle, marginTop: 6 };
  const compactInp = { ...inputStyle, padding: "6px 10px", fontSize: fontSize.base };

  if (!vet) return <Card>Profilo non trovato.</Card>;

  const startEdit = () => {
    setForm({
      name: vet.name || "",
      clinic: vet.clinic || "",
      city: vet.city || "",
      address: vet.address || "",
      bio: vet.bio || "",
      piva: vet.piva || "",
      cf: vet.cf || "",
      albo: vet.albo || "",
      regime: vet.regime || "ordinario",
      avatar: vet.avatar || "👩‍⚕️",
      spec: [...(vet.spec || [])],
      animals: [...(vet.animals || [])],
      types: [...(vet.types || ["clinic"])],
      feeClinic: vet.fees?.clinic ?? "",
      feeHome: vet.fees?.home ?? "",
      feeVideo: vet.fees?.video ?? "",
    });
    setEditing(true);
  };

  const save = async () => {
    const updatedVet = {
      ...vet,
      name: form.name,
      clinic: form.clinic,
      city: form.city,
      address: form.address,
      bio: form.bio,
      piva: form.piva,
      cf: form.cf,
      albo: form.albo,
      regime: form.regime,
      avatar: form.avatar,
      spec: form.spec,
      animals: form.animals,
      types: form.types,
      fees: {
        clinic: form.feeClinic !== "" ? Number(form.feeClinic) : null,
        home: form.feeHome !== "" ? Number(form.feeHome) : null,
        video: form.feeVideo !== "" ? Number(form.feeVideo) : null,
      },
    };
    setVets(vets.map((v) => (v.id === vetId ? updatedVet : v)));
    setEditing(false);
    notify("✅ Profilo aggiornato!");

    if (isSupabaseConfigured()) {
      const { error } = await updateVetProfile(vetId, {
        name: form.name,
        clinic: form.clinic,
        city: form.city,
        address: form.address,
        bio: form.bio,
        piva: form.piva,
        cf: form.cf,
        albo: form.albo,
        regime: form.regime,
        avatar: form.avatar,
        spec: form.spec,
        animals: form.animals,
        types: form.types,
        feeClinic: form.feeClinic !== "" ? Number(form.feeClinic) : null,
        feeHome: form.feeHome !== "" ? Number(form.feeHome) : null,
        feeVideo: form.feeVideo !== "" ? Number(form.feeVideo) : null,
      });
      if (error) notify("❌ Errore salvataggio: " + error.message);
    }
  };

  const toggleSpec = (s) => {
    setForm({ ...form, spec: form.spec.includes(s) ? form.spec.filter((x) => x !== s) : [...form.spec, s] });
  };

  const toggleAnimal = (a) => {
    setForm({
      ...form,
      animals: form.animals.includes(a) ? form.animals.filter((x) => x !== a) : [...form.animals, a],
    });
  };

  const toggleType = (t) => {
    const updated = form.types.includes(t) ? form.types.filter((x) => x !== t) : [...form.types, t];
    if (updated.length === 0) {
      notify("⚠️ Devi avere almeno un tipo di visita attivo.");
      return;
    }
    setForm({ ...form, types: updated });
  };

  return (
    <>
      <Btn small variant="light" onClick={onBack}>
        ← Indietro
      </Btn>
      <SectionTitle style={{ marginTop: 12 }}>Il mio profilo</SectionTitle>

      {!editing ? (
        /* ──── Vista profilo ──── */
        <>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64 }}>{vet.avatar || "👩‍⚕️"}</div>
            <h2 style={{ margin: "8px 0 4px" }}>{vet.name || "Nome non impostato"}</h2>
            <div style={{ color: colors.textSecondary, fontSize: fontSize.base }}>
              {vet.clinic || "Clinica non impostata"}
            </div>
            <div style={{ color: colors.textMuted, fontSize: fontSize.md }}>
              {vet.city} {vet.address && `· ${vet.address}`}
            </div>
          </Card>

          {/* Dati professionali */}
          <Card style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: fontSize.sm,
                fontWeight: 700,
                color: TEAL,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Dati professionali
            </div>
            <div style={{ display: "grid", gap: 6, fontSize: fontSize.base, color: colors.textMedium }}>
              <div>
                🏥 <b>Clinica:</b> {vet.clinic || "—"}
              </div>
              <div>
                📍 <b>Città:</b> {vet.city || "—"}
              </div>
              <div>
                🏠 <b>Indirizzo:</b> {vet.address || "—"}
              </div>
              <div>
                📋 <b>P.IVA:</b> {vet.piva || "—"}
              </div>
              <div>
                🪪 <b>C.F.:</b> {vet.cf || "—"}
              </div>
              <div>
                🎓 <b>Albo:</b> {vet.albo || "—"}
              </div>
              <div>
                💼 <b>Regime:</b> {vet.regime === "forfettario" ? "Forfettario" : "Ordinario"}
              </div>
            </div>
          </Card>

          {/* Bio */}
          {vet.bio && (
            <Card style={{ marginTop: 10 }}>
              <div
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: 700,
                  color: TEAL,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Chi sono
              </div>
              <div style={{ fontSize: fontSize.base, color: colors.textMedium, lineHeight: 1.6 }}>{vet.bio}</div>
            </Card>
          )}

          {/* Specializzazioni e animali */}
          <Card style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: fontSize.sm,
                fontWeight: 700,
                color: TEAL,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Specializzazioni
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {vet.spec && vet.spec.length > 0 ? (
                vet.spec.map((s) => (
                  <span
                    key={s}
                    style={{
                      background: colors.bgTealLight,
                      color: TEAL,
                      fontSize: fontSize.sm,
                      padding: "4px 10px",
                      borderRadius: radius.md,
                      fontWeight: 600,
                    }}
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span style={{ color: colors.textMuted, fontSize: fontSize.md }}>
                  Nessuna specializzazione impostata
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: fontSize.sm,
                fontWeight: 700,
                color: TEAL,
                textTransform: "uppercase",
                marginBottom: 8,
                marginTop: 14,
              }}
            >
              Animali trattati
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {vet.animals && vet.animals.length > 0 ? (
                vet.animals.map((a) => (
                  <span
                    key={a}
                    style={{
                      background: colors.bgOrangeLight,
                      color: ORANGE,
                      fontSize: fontSize.sm,
                      padding: "4px 10px",
                      borderRadius: radius.md,
                      fontWeight: 600,
                    }}
                  >
                    {a}
                  </span>
                ))
              ) : (
                <span style={{ color: colors.textMuted, fontSize: fontSize.md }}>Nessun animale specificato</span>
              )}
            </div>
          </Card>

          {/* Tipi di visita e tariffe */}
          <Card style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: fontSize.sm,
                fontWeight: 700,
                color: TEAL,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Tipi di visita e tariffe
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { key: "clinic", label: "🏥 In clinica", fee: vet.fees?.clinic },
                { key: "home", label: "🏠 A domicilio", fee: vet.fees?.home },
                { key: "video", label: "📹 Video-consulto", fee: vet.fees?.video },
              ].map((t) => {
                const active = vet.types?.includes(t.key);
                return (
                  <div
                    key={t.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                      opacity: active ? 1 : 0.5,
                    }}
                  >
                    <span style={{ fontSize: fontSize.base }}>{t.label}</span>
                    <span>
                      {active ? (
                        <span style={{ fontWeight: 700, color: ORANGE }}>€{t.fee ?? "—"}</span>
                      ) : (
                        <span style={{ color: colors.textMuted, fontSize: fontSize.md }}>Non attivo</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Btn onClick={startEdit} style={{ marginTop: 14, width: "100%" }}>
            ✏️ Modifica profilo
          </Btn>
        </>
      ) : (
        /* ──── Form modifica ──── */
        <>
          {/* Avatar */}
          <Card>
            <div
              style={{
                fontSize: fontSize.sm,
                fontWeight: 700,
                color: TEAL,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Avatar
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {VET_AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setForm({ ...form, avatar: a })}
                  style={{
                    fontSize: 36,
                    background: form.avatar === a ? colors.bgTealSel : colors.bgLighter,
                    border: form.avatar === a ? `2px solid ${TEAL}` : `2px solid transparent`,
                    borderRadius: radius.lg,
                    cursor: "pointer",
                    width: 56,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </Card>

          {/* Dati personali */}
          <Card style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: fontSize.sm,
                fontWeight: 700,
                color: TEAL,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Dati personali
            </div>
            <label style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>Nome e cognome *</label>
            <input
              style={inp}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dr. Mario Rossi"
            />
            <label
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              Nome clinica / ambulatorio
            </label>
            <input
              style={inp}
              value={form.clinic}
              onChange={(e) => setForm({ ...form, clinic: e.target.value })}
              placeholder="Clinica Veterinaria Esempio"
            />
            <label
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              Città
            </label>
            <input
              style={inp}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Roma"
            />
            <label
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              Indirizzo
            </label>
            <input
              style={inp}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Via Roma 1, 00100 Roma"
            />
          </Card>

          {/* Bio */}
          <Card style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: fontSize.sm,
                fontWeight: 700,
                color: TEAL,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Presentazione
            </div>
            <label style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>
              Chi sei (visibile ai clienti)
            </label>
            <textarea
              style={{ ...inp, minHeight: 80, fontFamily: "inherit" }}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Racconta qualcosa di te: esperienza, approccio, cosa ti appassiona..."
              maxLength={500}
            />
            <div style={{ fontSize: fontSize.xs, color: colors.textMuted, textAlign: "right", marginTop: 4 }}>
              {form.bio.length}/500
            </div>
          </Card>

          {/* Dati fiscali */}
          <Card style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: fontSize.sm,
                fontWeight: 700,
                color: TEAL,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Dati fiscali
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>P.IVA</label>
                <input
                  style={inp}
                  value={form.piva}
                  onChange={(e) => setForm({ ...form, piva: e.target.value })}
                  placeholder="01234567890"
                  maxLength={11}
                />
              </div>
              <div>
                <label style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>C.F.</label>
                <input
                  style={inp}
                  value={form.cf}
                  onChange={(e) => setForm({ ...form, cf: e.target.value.toUpperCase() })}
                  placeholder="RSSMRA80A01H501Z"
                  maxLength={16}
                />
              </div>
            </div>
            <label
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              N° Albo
            </label>
            <input
              style={inp}
              value={form.albo}
              onChange={(e) => setForm({ ...form, albo: e.target.value })}
              placeholder="RM 12345"
            />
            <label
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              Regime fiscale
            </label>
            <select
              style={{ ...selectStyle, marginTop: 6, width: "100%" }}
              value={form.regime}
              onChange={(e) => setForm({ ...form, regime: e.target.value })}
            >
              <option value="ordinario">Ordinario</option>
              <option value="forfettario">Forfettario</option>
            </select>
          </Card>

          {/* Specializzazioni */}
          <Card style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: fontSize.sm,
                fontWeight: 700,
                color: TEAL,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Specializzazioni
            </div>
            <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 8 }}>
              Seleziona quelle comuni oppure aggiungine una personalizzata
            </div>

            {/* Bottoni predefiniti */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SPEC_OPTIONS.map((s) => {
                const active = form.spec.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSpec(s)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: radius.md,
                      border: `1px solid ${active ? TEAL : colors.borderLight}`,
                      background: active ? colors.bgTealSel : colors.white,
                      color: active ? TEAL : colors.textMuted,
                      fontSize: fontSize.sm,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {active ? "✓ " : ""}
                    {s}
                  </button>
                );
              })}
            </div>

            {/* Specializzazioni custom già aggiunte */}
            {form.spec.filter((s) => !SPEC_OPTIONS.includes(s)).length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: fontSize.xs, color: colors.textMuted, fontWeight: 600, marginBottom: 4 }}>
                  Le tue personalizzate:
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {form.spec
                    .filter((s) => !SPEC_OPTIONS.includes(s))
                    .map((s) => (
                      <span
                        key={s}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 10px",
                          borderRadius: radius.md,
                          background: colors.bgTealSel,
                          color: TEAL,
                          fontSize: fontSize.sm,
                          fontWeight: 600,
                        }}
                      >
                        {s}
                        <button
                          onClick={() => setForm({ ...form, spec: form.spec.filter((x) => x !== s) })}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: TEAL,
                            fontSize: 14,
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Campo per aggiungere nuova */}
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input
                style={{ ...compactInp, flex: 1 }}
                value={newSpec}
                onChange={(e) => setNewSpec(e.target.value)}
                placeholder="Es. Fisioterapia veterinaria"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSpec.trim()) {
                    e.preventDefault();
                    if (!form.spec.includes(newSpec.trim())) setForm({ ...form, spec: [...form.spec, newSpec.trim()] });
                    setNewSpec("");
                  }
                }}
              />
              <Btn
                small
                onClick={() => {
                  if (newSpec.trim() && !form.spec.includes(newSpec.trim())) {
                    setForm({ ...form, spec: [...form.spec, newSpec.trim()] });
                    setNewSpec("");
                  }
                }}
                disabled={!newSpec.trim()}
              >
                + Aggiungi
              </Btn>
            </div>
          </Card>

          {/* Animali trattati */}
          <Card style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: fontSize.sm,
                fontWeight: 700,
                color: TEAL,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Animali trattati
            </div>
            <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 8 }}>
              Seleziona quelli comuni oppure aggiungine uno personalizzato
            </div>

            {/* Bottoni predefiniti */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ANIMAL_OPTIONS.map((a) => {
                const active = form.animals.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleAnimal(a)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: radius.md,
                      border: `1px solid ${active ? ORANGE : colors.borderLight}`,
                      background: active ? colors.bgOrangeLight : colors.white,
                      color: active ? ORANGE : colors.textMuted,
                      fontSize: fontSize.sm,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {active ? "✓ " : ""}
                    {a}
                  </button>
                );
              })}
            </div>

            {/* Animali custom già aggiunti */}
            {form.animals.filter((a) => !ANIMAL_OPTIONS.includes(a)).length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: fontSize.xs, color: colors.textMuted, fontWeight: 600, marginBottom: 4 }}>
                  I tuoi personalizzati:
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {form.animals
                    .filter((a) => !ANIMAL_OPTIONS.includes(a))
                    .map((a) => (
                      <span
                        key={a}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 10px",
                          borderRadius: radius.md,
                          background: colors.bgOrangeLight,
                          color: ORANGE,
                          fontSize: fontSize.sm,
                          fontWeight: 600,
                        }}
                      >
                        {a}
                        <button
                          onClick={() => setForm({ ...form, animals: form.animals.filter((x) => x !== a) })}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: ORANGE,
                            fontSize: 14,
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Campo per aggiungere nuovo */}
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input
                style={{ ...compactInp, flex: 1 }}
                value={newAnimal}
                onChange={(e) => setNewAnimal(e.target.value)}
                placeholder="Es. Pesci, Anfibi, Furetti"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newAnimal.trim()) {
                    e.preventDefault();
                    if (!form.animals.includes(newAnimal.trim()))
                      setForm({ ...form, animals: [...form.animals, newAnimal.trim()] });
                    setNewAnimal("");
                  }
                }}
              />
              <Btn
                small
                onClick={() => {
                  if (newAnimal.trim() && !form.animals.includes(newAnimal.trim())) {
                    setForm({ ...form, animals: [...form.animals, newAnimal.trim()] });
                    setNewAnimal("");
                  }
                }}
                disabled={!newAnimal.trim()}
              >
                + Aggiungi
              </Btn>
            </div>
          </Card>

          {/* Tipi di visita + tariffe */}
          <Card style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: fontSize.sm,
                fontWeight: 700,
                color: TEAL,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Tipi di visita e tariffe base
            </div>
            {[
              { key: "clinic", label: "🏥 Visite in clinica", feeKey: "feeClinic" },
              { key: "home", label: "🏠 Visite a domicilio", feeKey: "feeHome" },
              { key: "video", label: "📹 Video-consulto", feeKey: "feeVideo" },
            ].map((t) => {
              const active = form.types.includes(t.key);
              return (
                <div
                  key={t.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: `1px solid ${colors.divider}`,
                  }}
                >
                  <button
                    onClick={() => toggleType(t.key)}
                    style={{
                      width: 36,
                      height: 22,
                      borderRadius: 11,
                      border: "none",
                      cursor: "pointer",
                      background: active ? TEAL : colors.borderLight,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: colors.white,
                        position: "absolute",
                        top: 3,
                        left: active ? 17 : 3,
                        transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    />
                  </button>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: fontSize.base, opacity: active ? 1 : 0.5 }}>
                    {t.label}
                  </span>
                  {active && (
                    <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                      <span style={{ fontSize: fontSize.md, color: colors.textMuted }}>€</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        style={{
                          ...inputStyle,
                          width: 72,
                          textAlign: "right",
                          fontWeight: 700,
                          color: ORANGE,
                          padding: "4px 8px",
                        }}
                        value={form[t.feeKey]}
                        onChange={(e) => setForm({ ...form, [t.feeKey]: e.target.value })}
                        placeholder="—"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 8 }}>
              💡 Attiva almeno un tipo di visita. I clienti potranno prenotare solo i tipi attivi.
            </div>
          </Card>

          {/* Bottoni salva/annulla */}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn variant="light" onClick={() => setEditing(false)} style={{ flex: 1 }}>
              Annulla
            </Btn>
            <Btn onClick={save} style={{ flex: 1 }} disabled={!form.name}>
              Salva ✓
            </Btn>
          </div>
        </>
      )}

      {/* Cancella account */}
      {isSupabaseConfigured() && user && (
        <div style={{ marginTop: 30, textAlign: "center" }}>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: fontSize.sm,
                color: colors.dangerFg,
                textDecoration: "underline",
              }}
            >
              Cancella il mio account
            </button>
          ) : (
            <Card style={{ background: colors.dangerBg, textAlign: "center" }}>
              <div style={{ fontSize: fontSize.base, color: colors.dangerFg, fontWeight: 600, marginBottom: 8 }}>
                ⚠️ Sei sicuro di voler cancellare il tuo account?
              </div>
              <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: 12 }}>
                I tuoi dati verranno eliminati e non potrai più accedere.
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <Btn small variant="light" onClick={() => setConfirmDelete(false)}>
                  Annulla
                </Btn>
                <Btn
                  small
                  style={{ background: colors.dangerFg, color: colors.white }}
                  onClick={async () => {
                    const { error } = await deleteAccount(user.id);
                    if (error) {
                      notify("❌ Errore: " + error.message);
                      return;
                    }
                    notify("Account cancellato.");
                    signOut();
                  }}
                >
                  Sì, cancella
                </Btn>
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
