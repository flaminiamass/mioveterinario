import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { TEAL } from "../../data/constants.js";
import { today } from "../../data/helpers.js";
import { createPet, isSupabaseConfigured } from "../../lib/db.js";
import { mapPet } from "../../lib/mappers.js";
import { colors, fontSize, radius, inputStyle } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import AvatarImage from "../ui/AvatarImage.jsx";
import Card from "../ui/Card.jsx";
import Empty from "../ui/Empty.jsx";
import PhotoUploader from "../ui/PhotoUploader.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";

/* Emoji disponibili per ogni specie */
const PHOTO_OPTIONS = {
  Cane: ["🐶", "🐕", "🐩", "🦮"],
  Gatto: ["🐱", "🐈", "🐈‍⬛"],
  Coniglio: ["🐰", "🐇"],
  Uccelli: ["🐦", "🦜", "🐤"],
  Rettili: ["🦎", "🐢", "🐍"],
  Altro: ["🐾"],
};

export default function MyPets({ onView }) {
  const { pets, setPets, notify, setSelectedPetId } = useApp();
  const { user } = useAuthContext();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: "",
    species: "Cane",
    breed: "",
    dob: "",
    weight: "",
    chip: "",
    sex: "",
    photo: "🐶",
  });
  const inp = { ...inputStyle, marginTop: 6 };

  const age = (dob) => {
    const y = (today - new Date(dob)) / 31557600000;
    return y < 1 ? `${Math.round(y * 12)} mesi` : `${Math.floor(y)} anni`;
  };

  /* Quando cambia la specie, aggiorna la foto di default */
  const changeSpecies = (species) => {
    const photos = PHOTO_OPTIONS[species] || PHOTO_OPTIONS.Altro;
    setForm({ ...form, species, photo: photos[0] });
  };

  return (
    <>
      <SectionTitle
        right={
          <Btn small variant="accent" onClick={() => setAdding(!adding)}>
            {adding ? "Annulla" : "+ Aggiungi"}
          </Btn>
        }
      >
        I miei animali
      </SectionTitle>
      {adding && (
        <Card style={{ marginBottom: 14 }}>
          <label htmlFor="pet-add-name" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>
            Nome *
          </label>
          <input
            id="pet-add-name"
            style={inp}
            placeholder="Es: Ragù, Miele…"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <label
            htmlFor="pet-add-species"
            style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}
          >
            Specie
          </label>
          <select
            id="pet-add-species"
            style={{ ...inp, background: colors.white }}
            value={form.species}
            onChange={(e) => changeSpecies(e.target.value)}
          >
            {["Cane", "Gatto", "Coniglio", "Uccelli", "Rettili", "Altro"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <label
            style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}
          >
            Foto o icona
          </label>
          <div style={{ marginTop: 8 }}>
            <PhotoUploader
              value={form.photo}
              emoji={form.photo}
              name={form.name || "Animale"}
              rounded="rounded"
              onChange={(photo) => setForm({ ...form, photo })}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            {(PHOTO_OPTIONS[form.species] || PHOTO_OPTIONS.Altro).map((emoji) => (
              <button
                key={emoji}
                onClick={() => setForm({ ...form, photo: emoji })}
                aria-label={`Icona ${emoji}`}
                style={{
                  fontSize: 28,
                  padding: 6,
                  borderRadius: radius.md,
                  border: `2px solid ${form.photo === emoji ? TEAL : colors.borderLight}`,
                  background: form.photo === emoji ? colors.bgTealSel : colors.white,
                  cursor: "pointer",
                  minWidth: 44,
                  minHeight: 44,
                }}
              >
                {emoji}
              </button>
            ))}
          </div>

          <label
            htmlFor="pet-add-breed"
            style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}
          >
            Razza
          </label>
          <input
            id="pet-add-breed"
            style={inp}
            placeholder="Es: Barboncino toy"
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
          />

          <label
            htmlFor="pet-add-sex"
            style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}
          >
            Sesso
          </label>
          <select
            id="pet-add-sex"
            style={{ ...inp, background: colors.white }}
            value={form.sex}
            onChange={(e) => setForm({ ...form, sex: e.target.value })}
          >
            <option value="">Non specificato</option>
            <option value="M">Maschio ♂️</option>
            <option value="F">Femmina ♀️</option>
          </select>

          <label
            htmlFor="pet-add-dob"
            style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}
          >
            Data di nascita
          </label>
          <input
            id="pet-add-dob"
            style={inp}
            type="date"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
          />

          <label
            htmlFor="pet-add-weight"
            style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}
          >
            Peso (kg)
          </label>
          <input
            id="pet-add-weight"
            style={inp}
            placeholder="Es: 4.2"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />

          <label
            htmlFor="pet-add-chip"
            style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}
          >
            Numero microchip
          </label>
          <input
            id="pet-add-chip"
            style={inp}
            placeholder="Es: 380260101234567"
            value={form.chip}
            onChange={(e) => setForm({ ...form, chip: e.target.value })}
          />

          <Btn
            style={{ marginTop: 14, width: "100%" }}
            disabled={!form.name}
            onClick={async () => {
              if (isSupabaseConfigured() && user) {
                const { data, error } = await createPet({ ownerId: user.id, ...form });
                if (error) {
                  notify("❌ Errore: " + error.message);
                  return;
                }
                const mapped = mapPet(data);
                setPets([...pets, mapped]);
                setSelectedPetId(mapped.id);
              } else {
                const newPet = { id: "p" + Date.now(), ...form, weight: form.weight ? Number(form.weight) : "" };
                setPets([...pets, newPet]);
                setSelectedPetId(newPet.id);
              }
              setForm({ name: "", species: "Cane", breed: "", dob: "", weight: "", chip: "", sex: "", photo: "🐶" });
              setAdding(false);
              notify("🐾 Animale aggiunto!");
            }}
          >
            Salva
          </Btn>
        </Card>
      )}
      {!adding && pets.length === 0 && (
        <Card>
          <Empty
            icon="🐾"
            text="Aggiungi il tuo primo animale"
            sub="Registra il tuo compagno per prenotare visite"
            action={
              <Btn variant="accent" onClick={() => setAdding(true)}>
                + Aggiungi animale
              </Btn>
            }
          />
        </Card>
      )}
      <div style={{ display: "grid", gap: 12 }}>
        {pets.map((p) => (
          <Card key={p.id} onClick={() => onView(p)}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <AvatarImage src={p.photo} emoji={p.photo} name={p.name} size={52} rounded="rounded" />
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: fontSize.xl }}>{p.name}</b>
                <div style={{ color: colors.textSecondary, fontSize: fontSize.md }}>
                  {p.species} · {p.breed}
                  {p.dob ? ` · ${age(p.dob)}` : ""}
                  {p.sex ? ` · ${p.sex === "M" ? "♂️" : "♀️"}` : ""}
                </div>
              </div>
              <span style={{ color: TEAL }}>→</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
