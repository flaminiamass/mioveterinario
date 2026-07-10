import { TEAL } from "../../data/constants.js";
import { colors, fontSize, radius } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import VetMap from "../map/VetMap.jsx";
import { phoneHref } from "../../utils/phone.js";

const CLAIM_EMAIL = "info@mioveterinario.it";

/**
 * DirectoryListingProfile — scheda pubblica di una struttura NON gestita
 * (importata da fonte pubblica, non rivendicata dal titolare).
 *
 * Componente separato da VetPublicProfile: qui NON devono mai comparire
 * prenotazione, slot, recensioni, rating, prezzi o disponibilità.
 */
export default function DirectoryListingProfile({ listing, onBack }) {
  const callHref = phoneHref(listing.phone);
  const hasCoords = listing.lat != null && listing.lng != null;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${listing.lat || ""},${listing.lng || ""} ${listing.address || ""}`
  )}`;
  const claimMailto = `mailto:${CLAIM_EMAIL}?subject=${encodeURIComponent(
    `Rivendicazione scheda ${listing.id} — ${listing.name}`
  )}`;

  return (
    <>
      <Btn small variant="light" onClick={onBack}>
        ← Indietro
      </Btn>

      {/* Hero */}
      <Card style={{ marginTop: 12, textAlign: "center" }}>
        <div style={{ fontSize: 52, lineHeight: 1 }}>🏥</div>
        <h2 style={{ margin: "8px 0 2px" }}>{listing.name}</h2>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 4 }}>
          <span
            style={{
              fontSize: fontSize.sm,
              background: colors.bgLighter,
              color: colors.textMuted,
              padding: "3px 10px",
              borderRadius: radius.pill,
              fontWeight: 700,
            }}
          >
            Scheda non gestita
          </span>
        </div>
        {listing.clinic && listing.clinic !== listing.name && (
          <div style={{ color: colors.textSecondary, marginTop: 6 }}>{listing.clinic}</div>
        )}
        {(listing.address || listing.city) && (
          <div style={{ color: colors.textMuted, fontSize: fontSize.md, marginTop: 4 }}>
            {listing.address}
            {listing.address && listing.city ? " · " : ""}
            {listing.city}
            {listing.province ? ` (${listing.province})` : ""}
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          {callHref ? (
            <Btn variant="accent" onClick={() => (window.location.href = callHref)} style={{ width: "100%" }}>
              ☎ Chiama ora
            </Btn>
          ) : (
            <div style={{ fontSize: fontSize.md, color: colors.textMuted }}>Numero non disponibile</div>
          )}
        </div>
        {listing.website && (
          <a
            href={listing.website}
            target="_blank"
            rel="noreferrer nofollow"
            style={{
              display: "inline-flex",
              marginTop: 10,
              fontSize: fontSize.md,
              color: TEAL,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            🌐 Sito web
          </a>
        )}
      </Card>

      {/* Dove siamo — solo se abbiamo coordinate reali */}
      {hasCoords && (
        <>
          <SectionTitle style={{ marginTop: 20 }}>Dove siamo</SectionTitle>
          <Card>
            <VetMap vets={[]} directoryListings={[listing]} center={{ lat: listing.lat, lng: listing.lng }} />
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
        </>
      )}

      {/* Rivendicazione */}
      <Card style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, fontSize: fontSize.lg, color: colors.textDark }}>
          Sei il titolare di questa struttura?
        </div>
        <div style={{ fontSize: fontSize.md, color: colors.textSecondary, marginTop: 4, lineHeight: 1.5 }}>
          Rivendica la scheda per gestire le informazioni, ricevere prenotazioni online e rispondere ai clienti.
        </div>
        <a
          href={claimMailto}
          style={{
            display: "inline-flex",
            marginTop: 10,
            fontSize: fontSize.md,
            color: TEAL,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Rivendica questa scheda →
        </a>
      </Card>

      {/* Fonte dati */}
      <p style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: 12, lineHeight: 1.5 }}>
        Questa scheda non è ancora gestita dalla struttura. I dati provengono da fonti pubbliche (Anagrafe Strutture
        Veterinarie — FNOVI) e possono essere aggiornati o rimossi su richiesta.
      </p>
    </>
  );
}
