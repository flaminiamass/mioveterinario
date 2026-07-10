/*
 * directory.js — Utility lato client per le schede directory (strutture non gestite).
 * Mantiene coerenti le regole di visibilità pubblica tra app e pipeline di sync.
 */

const HIDDEN_ACTIVITY = new Set(["likely_closed", "closed", "removed"]);

/**
 * Una scheda directory NON deve comparire nei risultati pubblici lato proprietario se:
 *  - non è pubblicata (isPublished === false), oppure
 *  - è stata rivendicata (diventa un profilo gestito, non una scheda directory), oppure
 *  - il suo profileStatus è "hidden", oppure
 *  - il segnale di attività indica chiusura probabile/certa.
 */
export function shouldHideDirectoryListing(listing) {
  if (!listing) return true;
  if (listing.isPublished === false) return true;
  if (listing.claimedVetId) return true;
  if (listing.profileStatus === "hidden") return true;
  if (HIDDEN_ACTIVITY.has(listing.activityStatus)) return true;
  return false;
}

/** Filtra una lista di schede directory mostrando solo quelle pubblicabili. */
export function publicDirectoryListings(listings) {
  return (listings || []).filter((l) => !shouldHideDirectoryListing(l));
}
