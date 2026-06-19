import { useState, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { TEAL, TYPE_META } from "../../data/constants.js";
import { fmtDate } from "../../data/helpers.js";
import { getService } from "../../data/services.js";
import * as db from "../../lib/db.js";
import { mapVaccine } from "../../lib/mappers.js";
import { colors, fontSize, radius, inputStyle } from "../../styles/tokens.js";
import AvatarImage from "../ui/AvatarImage.jsx";
import Badge from "../ui/Badge.jsx";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Empty from "../ui/Empty.jsx";
import ConfirmDialog from "../ui/ConfirmDialog.jsx";
import PhotoUploader from "../ui/PhotoUploader.jsx";

const SPECIES_OPTIONS = ["Cane", "Gatto", "Coniglio", "Uccelli", "Rettili", "Altro"];

export default function PetDetail({ pet, onBack }) {
  const { appts, referti, vets, pets, setPets, vaccines, setVaccines, notify } = useApp();
  const petAppts = appts.filter((a) => a.petId === pet.id).sort((a, b) => b.date.localeCompare(a.date));
  const petVax = vaccines.filter((v) => v.petId === pet.id);

  /* Modalità modifica */
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    weight: pet.weight || "",
    chip: pet.chip || "",
    sex: pet.sex || "",
    photo: pet.photo || "🐾",
  });
  const savedForm = useRef({ ...form });
  const inp = { ...inputStyle, marginTop: 6 };

  /* Avviso modifiche non salvate */
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const isDirty = () => JSON.stringify(form) !== JSON.stringify(savedForm.current);

  const handleBack = () => {
    if (editing && isDirty()) {
      setPendingAction("back");
      setShowUnsaved(true);
    } else {
      onBack();
    }
  };

  const saveEdit = async () => {
    setPets(pets.map((p) => (p.id === pet.id ? { ...p, ...form, weight: form.weight ? Number(form.weight) : "" } : p)));
    savedForm.current = { ...form };
    setEditing(false);
    notify("✏️ Dati aggiornati!");
    if (db.isSupabaseConfigured()) {
      const { error } = await db.updatePet(pet.id, form);
      if (error) notify("❌ Errore salvataggio: " + error.message);
    }
  };

  /* Cancella animale */
  const [showDeletePet, setShowDeletePet] = useState(false);
  const activeApptCount = petAppts.filter((a) => ["pending", "confirmed"].includes(a.status)).length;

  /* Aggiungi vaccino */
  const [addingVax, setAddingVax] = useState(false);
  const [vaxForm, setVaxForm] = useState({ name: "", date: "", due: "", vet: "" });
  const vaxInp = { ...inputStyle, marginTop: 6 };

  /* Modifica/cancella vaccino */
  const [editingVaxId, setEditingVaxId] = useState(null);
  const [editVaxForm, setEditVaxForm] = useState({ name: "", date: "", due: "", vet: "" });
  const [deleteVaxId, setDeleteVaxId] = useState(null);

  return (
    <>
      <Btn small variant="light" onClick={handleBack}>
        ← Indietro
      </Btn>
      <Card style={{ marginTop: 12, textAlign: "center" }}>
        <AvatarImage
          src={editing ? form.photo : pet.photo}
          emoji={editing ? form.photo : pet.photo}
          name={pet.name}
          size={82}
          rounded="rounded"
        />
        <h2 style={{ margin: "6px 0 2px" }}>{editing ? form.name : pet.name}</h2>
        <div style={{ color: colors.textSecondary, fontSize: fontSize.base }}>
          {editing ? form.species : pet.species} · {editing ? form.breed : pet.breed}
        </div>

        {!editing ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 18,
                marginTop: 12,
                fontSize: fontSize.md,
                color: colors.textMedium,
                flexWrap: "wrap",
              }}
            >
              {pet.dob && <span>🎂 {pet.dob}</span>}
              {pet.weight && <span>⚖️ {pet.weight} kg</span>}
              {pet.chip && <span>📟 chip …{String(pet.chip).slice(-5)}</span>}
              {pet.sex && (
                <span>
                  {pet.sex === "M" ? "♂️" : "♀️"} {pet.sex === "M" ? "Maschio" : "Femmina"}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
              <Btn
                small
                variant="ghost"
                onClick={() => {
                  savedForm.current = {
                    name: pet.name,
                    species: pet.species,
                    breed: pet.breed,
                    weight: pet.weight || "",
                    chip: pet.chip || "",
                    sex: pet.sex || "",
                    photo: pet.photo || "🐾",
                  };
                  setForm({ ...savedForm.current });
                  setEditing(true);
                }}
              >
                ✏️ Modifica
              </Btn>
              <Btn small variant="danger" onClick={() => setShowDeletePet(true)}>
                🗑️ Elimina
              </Btn>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "left", marginTop: 12 }}>
            <label htmlFor="pet-name" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>
              Nome
            </label>
            <input
              id="pet-name"
              style={inp}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label
              htmlFor="pet-species"
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              Specie
            </label>
            <select
              id="pet-species"
              style={{ ...inp, background: colors.white }}
              value={form.species}
              onChange={(e) => setForm({ ...form, species: e.target.value })}
            >
              {SPECIES_OPTIONS.map((species) => (
                <option key={species}>{species}</option>
              ))}
            </select>

            <div style={{ marginTop: 12 }}>
              <PhotoUploader
                value={form.photo}
                emoji={form.photo}
                name={form.name}
                rounded="rounded"
                onChange={(photo) => setForm({ ...form, photo })}
                onRemove={() => setForm({ ...form, photo: "🐾" })}
              />
            </div>

            <label
              htmlFor="pet-breed"
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              Razza
            </label>
            <input
              id="pet-breed"
              style={inp}
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
            />

            <label
              htmlFor="pet-weight"
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              Peso (kg)
            </label>
            <input
              id="pet-weight"
              style={inp}
              type="number"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />

            <label
              htmlFor="pet-chip"
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              Microchip
            </label>
            {/* Avviso microchip — MEDIUM fix: il numero è identificativo dell'animale e può essere associato all'anagrafe */}
            <p style={{ fontSize: fontSize.xs, color: colors.textMuted, margin: "2px 0 0" }}>
              Il numero di microchip è un dato identificativo dell'animale. Viene mostrato parzialmente nelle
              visualizzazioni pubbliche.
            </p>
            <input
              id="pet-chip"
              style={inp}
              value={form.chip}
              onChange={(e) => setForm({ ...form, chip: e.target.value.replace(/\D/g, "").slice(0, 15) })}
              placeholder="15 cifre (es: 380260101234567)"
              maxLength={15}
            />

            <label
              htmlFor="pet-sex"
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              Sesso
            </label>
            <select
              id="pet-sex"
              style={{ ...inp, background: colors.white }}
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
            >
              <option value="">Non specificato</option>
              <option value="M">Maschio ♂️</option>
              <option value="F">Femmina ♀️</option>
            </select>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn
                variant="light"
                onClick={() => {
                  setForm({ ...savedForm.current });
                  setEditing(false);
                }}
                style={{ flex: 1 }}
              >
                Annulla
              </Btn>
              <Btn onClick={saveEdit} style={{ flex: 1 }} disabled={!form.name}>
                Salva ✓
              </Btn>
            </div>
          </div>
        )}
      </Card>

      {/* Vaccini */}
      <SectionTitle
        style={{ marginTop: 18 }}
        right={
          <Btn small variant="accent" onClick={() => setAddingVax(!addingVax)}>
            {addingVax ? "Annulla" : "+ Vaccino"}
          </Btn>
        }
      >
        💉 Libretto vaccini
      </SectionTitle>

      {addingVax && (
        <Card style={{ marginBottom: 10 }}>
          <label htmlFor="vax-name" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>
            Nome vaccino *
          </label>
          <input
            id="vax-name"
            style={vaxInp}
            placeholder="Es: Polivalente, Rabbia…"
            value={vaxForm.name}
            onChange={(e) => setVaxForm({ ...vaxForm, name: e.target.value })}
          />

          <label
            htmlFor="vax-date"
            style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}
          >
            Data somministrazione *
          </label>
          <input
            id="vax-date"
            style={vaxInp}
            type="date"
            value={vaxForm.date}
            onChange={(e) => setVaxForm({ ...vaxForm, date: e.target.value })}
          />

          <label
            htmlFor="vax-due"
            style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}
          >
            Scadenza richiamo
          </label>
          <input
            id="vax-due"
            style={vaxInp}
            type="date"
            value={vaxForm.due}
            onChange={(e) => setVaxForm({ ...vaxForm, due: e.target.value })}
          />

          <label
            htmlFor="vax-vet"
            style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginTop: 10, display: "block" }}
          >
            Veterinario
          </label>
          <input
            id="vax-vet"
            style={vaxInp}
            placeholder="Es: Dott.ssa Marchetti"
            value={vaxForm.vet}
            onChange={(e) => setVaxForm({ ...vaxForm, vet: e.target.value })}
          />

          <Btn
            style={{ marginTop: 14, width: "100%" }}
            disabled={!vaxForm.name || !vaxForm.date}
            onClick={async () => {
              if (db.isSupabaseConfigured()) {
                const { data, error } = await db.createVaccine({
                  petId: pet.id,
                  name: vaxForm.name,
                  date: vaxForm.date,
                  due: vaxForm.due || null,
                  vetName: vaxForm.vet || "—",
                });
                if (error) {
                  notify("❌ Errore: " + error.message);
                  return;
                }
                setVaccines([...vaccines, mapVaccine(data)]);
              } else {
                setVaccines([
                  ...vaccines,
                  {
                    petId: pet.id,
                    name: vaxForm.name,
                    date: vaxForm.date,
                    due: vaxForm.due || null,
                    vet: vaxForm.vet || "—",
                  },
                ]);
              }
              setVaxForm({ name: "", date: "", due: "", vet: "" });
              setAddingVax(false);
              notify("💉 Vaccino aggiunto!");
            }}
          >
            Salva vaccino
          </Btn>
        </Card>
      )}

      {petVax.length ? (
        petVax.map((v, i) => (
          <Card key={v.id || i} style={{ marginBottom: 8 }}>
            {editingVaxId === (v.id || i) ? (
              /* Form modifica vaccino inline */
              <div>
                <label style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>
                  Nome vaccino *
                </label>
                <input
                  style={vaxInp}
                  value={editVaxForm.name}
                  onChange={(e) => setEditVaxForm({ ...editVaxForm, name: e.target.value })}
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
                  Data somministrazione *
                </label>
                <input
                  style={vaxInp}
                  type="date"
                  value={editVaxForm.date}
                  onChange={(e) => setEditVaxForm({ ...editVaxForm, date: e.target.value })}
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
                  Scadenza richiamo
                </label>
                <input
                  style={vaxInp}
                  type="date"
                  value={editVaxForm.due}
                  onChange={(e) => setEditVaxForm({ ...editVaxForm, due: e.target.value })}
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
                  Veterinario
                </label>
                <input
                  style={vaxInp}
                  value={editVaxForm.vet}
                  onChange={(e) => setEditVaxForm({ ...editVaxForm, vet: e.target.value })}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Btn small variant="light" onClick={() => setEditingVaxId(null)}>
                    Annulla
                  </Btn>
                  <Btn
                    small
                    disabled={!editVaxForm.name || !editVaxForm.date}
                    onClick={async () => {
                      const vaxId = v.id || i;
                      setVaccines(
                        vaccines.map((vx) =>
                          (vx.id || vaccines.indexOf(vx)) === vaxId
                            ? {
                                ...vx,
                                name: editVaxForm.name,
                                date: editVaxForm.date,
                                due: editVaxForm.due || null,
                                vet: editVaxForm.vet,
                              }
                            : vx
                        )
                      );
                      setEditingVaxId(null);
                      notify("✏️ Vaccino aggiornato!");
                      if (db.isSupabaseConfigured() && v.id) {
                        const { error } = await db.updateVaccine(v.id, {
                          name: editVaxForm.name,
                          date: editVaxForm.date,
                          due: editVaxForm.due || null,
                          vetName: editVaxForm.vet,
                        });
                        if (error) notify("❌ Errore: " + error.message);
                      }
                    }}
                  >
                    Salva ✓
                  </Btn>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <b style={{ fontSize: fontSize.base }}>{v.name}</b>
                    <div style={{ fontSize: fontSize.md, color: colors.textSecondary }}>
                      Fatto: {v.date}
                      {v.due && (
                        <>
                          {" "}
                          · Scadenza:{" "}
                          <b
                            style={{
                              color: new Date(v.due) < new Date(fmtDate(new Date())) ? colors.danger : colors.success,
                            }}
                          >
                            {v.due}
                          </b>
                        </>
                      )}
                      {v.vet && <> · {v.vet}</>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <Btn
                      small
                      variant="ghost"
                      onClick={() => {
                        setEditingVaxId(v.id || i);
                        setEditVaxForm({ name: v.name, date: v.date, due: v.due || "", vet: v.vet || "" });
                      }}
                    >
                      ✏️
                    </Btn>
                    <Btn small variant="danger" onClick={() => setDeleteVaxId(v.id || i)}>
                      🗑️
                    </Btn>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))
      ) : (
        <Card>
          <Empty icon="💉" text="Nessun vaccino registrato" />
        </Card>
      )}

      {/* Storico visite */}
      <SectionTitle style={{ marginTop: 18 }}>📋 Storico visite</SectionTitle>
      {petAppts.length ? (
        petAppts.map((a) => {
          const v = vets.find((x) => x.id === a.vetId);
          const ref = referti.find((r) => r.apptId === a.id);
          return (
            <Card key={a.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b style={{ fontSize: fontSize.base }}>
                  {a.date} · {a.time}
                </b>
                <Badge status={a.status} />
              </div>
              <div style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: 4 }}>
                {v?.name} ·{" "}
                {a.serviceId
                  ? `${getService(a.serviceId)?.emoji || ""} ${getService(a.serviceId)?.name || ""}`
                  : TYPE_META[a.type]}
              </div>
              {a.vetNotes && (
                <div
                  style={{
                    fontSize: fontSize.md,
                    color: TEAL,
                    marginTop: 6,
                    background: colors.bgTealSel,
                    borderRadius: radius.sm,
                    padding: "6px 10px",
                  }}
                >
                  👩‍⚕️ Note vet: {a.vetNotes}
                </div>
              )}
              {ref && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: fontSize.md,
                    background: colors.bgTealSel,
                    borderRadius: radius.sm,
                    padding: "6px 10px",
                  }}
                >
                  📄 Referto: <b>{ref.title}</b>
                </div>
              )}
            </Card>
          );
        })
      ) : (
        <Card>
          <Empty icon="📋" text="Nessuna visita" />
        </Card>
      )}

      {/* Dialog conferma eliminazione animale */}
      <ConfirmDialog
        open={showDeletePet}
        title="Eliminare questo animale?"
        message={
          activeApptCount > 0
            ? `${pet.name} ha ${activeApptCount} visita/e attiva/e. Eliminando l'animale le visite rimarranno ma non saranno più collegate. Vuoi procedere?`
            : `Vuoi davvero eliminare ${pet.name}? L'azione non può essere annullata.`
        }
        confirmLabel="Sì, elimina"
        onCancel={() => setShowDeletePet(false)}
        onConfirm={async () => {
          setPets(pets.filter((p) => p.id !== pet.id));
          setShowDeletePet(false);
          notify("🗑️ Animale eliminato");
          onBack();
          if (db.isSupabaseConfigured()) {
            const { error } = await db.deletePet(pet.id);
            if (error) notify("❌ Errore: " + error.message);
          }
        }}
      />

      {/* Dialog conferma eliminazione vaccino */}
      <ConfirmDialog
        open={!!deleteVaxId}
        title="Eliminare questo vaccino?"
        message="Il record del vaccino verrà rimosso dal libretto."
        confirmLabel="Elimina"
        onCancel={() => setDeleteVaxId(null)}
        onConfirm={async () => {
          const vaxId = deleteVaxId;
          setVaccines(vaccines.filter((vx) => (vx.id || vaccines.indexOf(vx)) !== vaxId));
          notify("🗑️ Vaccino eliminato");
          if (db.isSupabaseConfigured() && typeof vaxId === "string") {
            const { error } = await db.deleteVaccine(vaxId);
            if (error) notify("❌ Errore: " + error.message);
          }
          setDeleteVaxId(null);
        }}
      />

      {/* Dialog per modifiche non salvate */}
      <ConfirmDialog
        open={showUnsaved}
        title="Modifiche non salvate"
        message="Hai modifiche non salvate. Vuoi uscire senza salvare?"
        confirmLabel="Esci senza salvare"
        onCancel={() => setShowUnsaved(false)}
        onConfirm={() => {
          setShowUnsaved(false);
          setEditing(false);
          if (pendingAction === "back") onBack();
        }}
      />
    </>
  );
}
