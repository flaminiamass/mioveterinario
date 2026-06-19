import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { updateProfile, deleteAccount, isSupabaseConfigured } from "../../lib/db.js";
import { TEAL, colors, fontSize, radius, inputStyle } from "../../styles/tokens.js";
import AvatarImage from "../ui/AvatarImage.jsx";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import PhotoUploader from "../ui/PhotoUploader.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";

/* Emoji avatar disponibili per il proprietario */
const OWNER_AVATARS = ["👩", "👨", "🧑", "👧", "👦", "🧓", "👴", "👵"];

export default function OwnerProfile({ onBack }) {
  const {
    ownerProfile,
    setOwnerProfile,
    notify,
    vets,
    favoriteVetIds,
    toggleFavoriteVet,
    browserNotificationsEnabled,
    setBrowserNotificationsEnabled,
  } = useApp();
  const { user, signOut } = useAuthContext();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({ ...ownerProfile });
  const inp = { ...inputStyle, marginTop: 6 };
  const avatar = ownerProfile.avatar || "👤";

  const save = async () => {
    setOwnerProfile({ ...form });
    setEditing(false);
    notify("✅ Profilo aggiornato!");
    if (isSupabaseConfigured() && user) {
      const { error } = await updateProfile(user.id, {
        fullName: form.fullName,
        displayName: form.fullName,
        phone: form.phone,
        email: form.email,
        cf: form.cf,
        address: form.address,
        avatar: form.avatar,
      });
      if (error) notify("❌ Errore salvataggio: " + error.message);
    }
  };

  return (
    <>
      <Btn small variant="light" onClick={onBack}>
        ← Indietro
      </Btn>
      <SectionTitle style={{ marginTop: 12 }}>Il mio profilo</SectionTitle>
      <Card style={{ textAlign: "center" }}>
        <AvatarImage src={avatar} emoji={avatar} name={ownerProfile.fullName} size={76} />
        {!editing ? (
          <>
            <h2 style={{ margin: "8px 0 4px" }}>{ownerProfile.fullName}</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginTop: 12,
                fontSize: fontSize.base,
                color: colors.textMedium,
              }}
            >
              <div>📧 {ownerProfile.email}</div>
              <div>📱 {ownerProfile.phone}</div>
              <div>🏠 {ownerProfile.address || "—"}</div>
              <div>🪪 C.F.: {ownerProfile.cf || "—"}</div>
            </div>
            <div
              style={{
                marginTop: 10,
                padding: "8px 12px",
                background: colors.bgTealSel,
                borderRadius: 8,
                fontSize: fontSize.sm,
                color: TEAL,
              }}
            >
              ℹ️ Il codice fiscale e l'indirizzo servono per ricevere fatture detraibili.
            </div>
            <Btn
              small
              variant="ghost"
              style={{ marginTop: 14 }}
              onClick={() => {
                setForm({ ...ownerProfile });
                setEditing(true);
              }}
            >
              ✏️ Modifica
            </Btn>
          </>
        ) : (
          <div style={{ textAlign: "left", marginTop: 12 }}>
            {/* Scelta avatar */}
            <div style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, marginBottom: 6 }}>
              Foto profilo
            </div>
            <PhotoUploader
              value={form.avatar}
              emoji={form.avatar}
              name={form.fullName}
              onChange={(avatar) => setForm({ ...form, avatar })}
              onRemove={() => setForm({ ...form, avatar: "👤" })}
            />
            <div style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600, margin: "12px 0 6px" }}>
              Oppure scegli emoji
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 14 }}>
              {OWNER_AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setForm({ ...form, avatar: a })}
                  style={{
                    fontSize: 32,
                    background: form.avatar === a ? colors.bgTealSel : colors.bgLighter,
                    border: form.avatar === a ? `2px solid ${TEAL}` : `2px solid transparent`,
                    borderRadius: radius.lg,
                    cursor: "pointer",
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>

            <label htmlFor="prof-name" style={{ fontSize: fontSize.sm, color: colors.textMuted, fontWeight: 600 }}>
              Nome completo
            </label>
            <input
              id="prof-name"
              style={inp}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <label
              htmlFor="prof-email"
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              Email
            </label>
            <input
              id="prof-email"
              style={inp}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <label
              htmlFor="prof-phone"
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              Telefono
            </label>
            <input
              id="prof-phone"
              style={inp}
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <label
              htmlFor="prof-address"
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
              id="prof-address"
              style={inp}
              placeholder="Via, CAP, Città"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <label
              htmlFor="prof-cf"
              style={{
                fontSize: fontSize.sm,
                color: colors.textMuted,
                fontWeight: 600,
                marginTop: 10,
                display: "block",
              }}
            >
              Codice Fiscale
            </label>
            <input
              id="prof-cf"
              style={inp}
              placeholder="RSSMRA80A01H501Z"
              value={form.cf}
              onChange={(e) => setForm({ ...form, cf: e.target.value.toUpperCase() })}
              maxLength={16}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn variant="light" onClick={() => setEditing(false)} style={{ flex: 1 }}>
                Annulla
              </Btn>
              <Btn onClick={save} style={{ flex: 1 }} disabled={!form.fullName}>
                Salva ✓
              </Btn>
            </div>
          </div>
        )}
      </Card>

      <SectionTitle style={{ marginTop: 18 }}>Notifiche</SectionTitle>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <b>Notifiche browser</b>
            <div style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Avvisi locali per messaggi e visite.</div>
          </div>
          <Btn
            small
            variant={browserNotificationsEnabled ? undefined : "light"}
            onClick={async () => {
              if (!("Notification" in window)) {
                notify("Notifiche browser non supportate.");
                return;
              }
              const permission = await Notification.requestPermission();
              if (permission !== "granted") {
                notify("Permesso notifiche negato.");
                setBrowserNotificationsEnabled(false);
                return;
              }
              setBrowserNotificationsEnabled(!browserNotificationsEnabled);
              notify(!browserNotificationsEnabled ? "Notifiche browser attivate." : "Notifiche browser disattivate.");
            }}
          >
            {browserNotificationsEnabled ? "ON" : "OFF"}
          </Btn>
        </div>
      </Card>

      <SectionTitle style={{ marginTop: 18 }}>Veterinari preferiti</SectionTitle>
      <Card>
        {favoriteVetIds.length === 0 ? (
          <div style={{ color: colors.textMuted, fontSize: fontSize.base }}>
            Salva i veterinari che usi più spesso per prenotare più velocemente.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {favoriteVetIds
              .map((id) => vets.find((vet) => vet.id === id))
              .filter(Boolean)
              .map((vet) => (
                <div key={vet.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AvatarImage src={vet.avatar} emoji={vet.avatar} name={vet.name} size={42} />
                  <div style={{ flex: 1 }}>
                    <b>{vet.name}</b>
                    <div style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
                      ⭐ {vet.rating} · {vet.zone || vet.city}
                    </div>
                  </div>
                  <Btn small variant="ghost" onClick={() => toggleFavoriteVet(vet.id)}>
                    Rimuovi
                  </Btn>
                </div>
              ))}
          </div>
        )}
      </Card>

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
