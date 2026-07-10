/**
 * merge-helpers.mjs — Logica centralizzata di normalizzazione, matching e merge
 * per la sincronizzazione del CSV arricchito con la directory strutture.
 *
 * Modulo PURO (nessuna dipendenza Node/browser): può essere importato sia dallo
 * script di sync lato Node sia, in futuro, da codice applicativo lato browser.
 *
 * Regole guida (allineate al brief di prodotto):
 *  - Il CSV arricchito è la fonte migliore per i campi di *scoring e provenienza*
 *    (activityStatus, activityConfidence, websiteStatus, officialWebsiteFound,
 *    googleBusinessStatus, externalReputationSignal, sourceUrls, evidenceNotes,
 *    needsManualReview, recommendedProfileStatus, fnovi/albo/google ids).
 *  - Il dato già presente prevale per gli stati manuali/operativi
 *    (claim, profileStatus attivo/verificato/rivendicato, verificationStatus
 *    verificato, onlineBookingStatus attivo, outreachStatus, internalNotes
 *    scritte a mano, dati inseriti dal titolare).
 *  - Non si retrocede mai automaticamente una scheda attiva/verificata/claimed:
 *    al massimo si aggiunge un segnale/nota e needsManualReview = true.
 */

// ────────────────────────────────────────────────────────────────────────────
// Parser CSV (RFC 4180: virgolette, campi multilinea, doppie virgolette)
// ────────────────────────────────────────────────────────────────────────────
export function parseCsv(text) {
  if (!text) return [];
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // BOM
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  const header = rows.shift();
  if (!header) return [];
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

// ────────────────────────────────────────────────────────────────────────────
// Normalizzazioni
// ────────────────────────────────────────────────────────────────────────────
const NAME_STOPWORDS = new Set([
  "ambulatorio",
  "veterinario",
  "veterinaria",
  "clinica",
  "studio",
  "centro",
  "dr",
  "dott",
  "dottssa",
  "dottsa",
  "dott.ssa",
  "dr.ssa",
  "drssa",
  "srl",
  "snc",
  "sas",
  "spa",
  "associati",
  "associato",
  "medico",
  "medici",
  "di",
  "del",
  "della",
  "the",
  "e",
]);

function stripAccents(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeName(name) {
  if (!name) return "";
  return stripAccents(String(name).toLowerCase())
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Token significativi del nome (senza stopword di settore) per il matching. */
export function nameTokens(name) {
  return normalizeName(name)
    .split(" ")
    .filter((t) => t && t.length > 1 && !NAME_STOPWORDS.has(t));
}

export function normalizeAddress(address) {
  if (!address) return "";
  return stripAccents(String(address).toLowerCase())
    .replace(/\b(via|viale|piazza|piazzale|corso|largo|vicolo|strada|localita|loc|km)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCity(city) {
  if (!city) return "";
  return stripAccents(String(city).toLowerCase())
    .replace(/[^a-z0-9\s/]/g, " ")
    .split("/")[0] // "Mestre / Venezia" -> "mestre"
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeProvince(province) {
  if (!province) return "";
  return stripAccents(String(province).toLowerCase())
    .replace(/[^a-z]/g, "")
    .slice(0, 2);
}

export function normalizePhone(phone) {
  if (!phone) return "";
  let p = String(phone).replace(/[^\d+]/g, "");
  p = p.replace(/^\+39/, "").replace(/^0039/, "");
  return p.replace(/[^\d]/g, "");
}

export function normalizeWebsite(website) {
  if (!website) return "";
  return String(website)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "")
    .split(/[?#]/)[0];
}

export function normalizeCoordinates(lat, lng) {
  const nlat = lat === "" || lat == null ? null : Number(lat);
  const nlng = lng === "" || lng == null ? null : Number(lng);
  if (nlat == null || nlng == null || Number.isNaN(nlat) || Number.isNaN(nlng)) return null;
  return { lat: nlat, lng: nlng };
}

/** Distanza in metri tra due coordinate (formula haversine). */
export function haversineMeters(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Similarità nomi 0..1 basata su Jaccard dei token significativi. */
export function nameSimilarity(a, b) {
  const ta = new Set(nameTokens(a));
  const tb = new Set(nameTokens(b));
  if (!ta.size || !tb.size) {
    // Fallback: confronto sui nomi normalizzati interi
    const na = normalizeName(a);
    const nb = normalizeName(b);
    if (!na || !nb) return 0;
    return na === nb ? 1 : 0;
  }
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

// ────────────────────────────────────────────────────────────────────────────
// Mapping CSV arricchito → entry directory (formato interno camelCase)
// ────────────────────────────────────────────────────────────────────────────
/**
 * Mapping robusto delle colonne. Accetta piccole varianti di naming
 * (case-insensitive, spazi/underscore) per non rompersi se il CSV cambia.
 */
const CSV_ALIASES = {
  id: ["id"],
  name: ["name", "nome"],
  entityType: ["entitytype", "entity_type", "type"],
  address: ["address", "indirizzo"],
  city: ["city", "citta", "comune"],
  province: ["province", "provincia", "prov"],
  lat: ["lat", "latitude", "latitudine"],
  lng: ["lng", "lon", "long", "longitude", "longitudine"],
  phone: ["phone", "telefono", "tel"],
  website: ["website", "sito", "url"],
  officialWebsiteFound: ["officialwebsitefound"],
  websiteStatus: ["websitestatus"],
  fnoviRegistrySource: ["fnoviregistrysource"],
  alboMatchStatus: ["albomatchstatus"],
  googlePlaceId: ["googleplaceid"],
  googleBusinessStatus: ["googlebusinessstatus"],
  externalReputationSignal: ["externalreputationsignal"],
  activityStatus: ["activitystatus"],
  activityConfidence: ["activityconfidence"],
  sourceUrls: ["sourceurls", "sourceurl", "source_urls"],
  evidenceNotes: ["evidencenotes", "evidence"],
  recommendedProfileStatus: ["recommendedprofilestatus"],
  needsManualReview: ["needsmanualreview"],
  internalNotes: ["internalnotes", "note", "notes"],
};

function buildHeaderIndex(rawRow) {
  const idx = {};
  for (const key of Object.keys(rawRow)) {
    idx[key.toLowerCase().replace(/[\s_]/g, "")] = key;
  }
  return idx;
}

function pick(rawRow, headerIdx, field) {
  for (const alias of CSV_ALIASES[field] || []) {
    const real = headerIdx[alias.replace(/[\s_]/g, "")];
    if (real != null && rawRow[real] != null && rawRow[real] !== "") return rawRow[real];
  }
  return "";
}

const asBool = (v) => v === true || v === "true" || v === "1" || v === "yes";
const asNum = (v) => (v === "" || v == null ? null : Number(v));
const asList = (v) =>
  !v
    ? []
    : String(v)
        .split(/[|;]/)
        .map((s) => s.trim())
        .filter(Boolean);

/**
 * Normalizza entityType ai soli valori ammessi dal DB ('clinic' | 'vet').
 * Il CSV arricchito può contenere varianti (individual_vet, unknown, ...).
 */
export function normalizeEntityType(raw) {
  const v = String(raw || "").toLowerCase();
  if (v === "vet" || v === "individual_vet" || v === "veterinario" || v === "libero_professionista") return "vet";
  return "clinic";
}

/**
 * mapCsvRowToDirectoryEntry — trasforma una riga grezza del CSV arricchito
 * nel formato interno usato dal merge. Documentazione mapping: vedi CSV_ALIASES.
 */
export function mapCsvRowToDirectoryEntry(rawRow) {
  const h = buildHeaderIndex(rawRow);
  const coords = normalizeCoordinates(pick(rawRow, h, "lat"), pick(rawRow, h, "lng"));
  return {
    id: pick(rawRow, h, "id"),
    entityType: normalizeEntityType(pick(rawRow, h, "entityType")),
    name: pick(rawRow, h, "name"),
    address: pick(rawRow, h, "address"),
    city: pick(rawRow, h, "city"),
    province: pick(rawRow, h, "province"),
    lat: coords ? coords.lat : null,
    lng: coords ? coords.lng : null,
    phone: pick(rawRow, h, "phone"),
    website: pick(rawRow, h, "website"),
    officialWebsiteFound: asBool(pick(rawRow, h, "officialWebsiteFound")),
    websiteStatus: pick(rawRow, h, "websiteStatus") || "not_checked",
    fnoviRegistrySource: pick(rawRow, h, "fnoviRegistrySource"),
    alboMatchStatus: pick(rawRow, h, "alboMatchStatus") || "not_checked",
    googlePlaceId: pick(rawRow, h, "googlePlaceId"),
    googleBusinessStatus: pick(rawRow, h, "googleBusinessStatus") || "not_checked",
    externalReputationSignal: pick(rawRow, h, "externalReputationSignal") || "not_checked",
    activityStatus: pick(rawRow, h, "activityStatus") || "uncertain",
    activityConfidence: asNum(pick(rawRow, h, "activityConfidence")),
    sourceUrls: asList(pick(rawRow, h, "sourceUrls")),
    evidenceNotes: pick(rawRow, h, "evidenceNotes"),
    recommendedProfileStatus: pick(rawRow, h, "recommendedProfileStatus") || "needs_review",
    needsManualReview: asBool(pick(rawRow, h, "needsManualReview")),
    internalNotes: pick(rawRow, h, "internalNotes"),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Stati derivati dal CSV
// ────────────────────────────────────────────────────────────────────────────
const HIDDEN_ACTIVITY = new Set(["likely_closed", "closed", "removed"]);

/** Una scheda non deve comparire nei risultati pubblici lato proprietario. */
export function shouldHideFromPublicResults(entry) {
  if (!entry) return true;
  const status = entry.profileStatus || entry.profile_status;
  const activity = entry.activityStatus || entry.activity_status;
  if (status === "hidden") return true;
  if (HIDDEN_ACTIVITY.has(activity)) return true;
  return false;
}

/**
 * resolveProfileStatusFromCsv — deriva gli stati operativi per un record NUOVO
 * a partire dal recommendedProfileStatus (e dal segnale di attività).
 */
export function resolveProfileStatusFromCsv(entry) {
  const rec = entry.recommendedProfileStatus || "needs_review";
  const hide = shouldHideFromPublicResults(entry);

  if (rec === "published_unclaimed" && !hide) {
    return {
      profileStatus: "published_unclaimed",
      verificationStatus: "not_verified",
      onlineBookingStatus: "disabled",
      isPublished: true,
    };
  }
  if (rec === "hidden" || hide) {
    return {
      profileStatus: "hidden",
      verificationStatus: "not_verified",
      onlineBookingStatus: "disabled",
      isPublished: false,
    };
  }
  // needs_review (default) e published_unclaimed che però è nascosto per attività
  return {
    profileStatus: "needs_review",
    verificationStatus: "not_verified",
    onlineBookingStatus: "disabled",
    isPublished: false,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Preservazione degli stati manuali / claim / attivi
// ────────────────────────────────────────────────────────────────────────────
const STRONG_PROFILE = new Set(["claimed", "verified", "active", "claim_requested", "reviewed", "rejected"]);
const STRONG_VERIFICATION = new Set(["verified", "contacted", "pending"]);

/**
 * shouldPreserveExistingStatus — true se un operatore/titolare ha già toccato
 * la scheda e il suo stato NON deve essere sovrascritto dall'automazione.
 * Accetta record sia in camelCase (app) sia in snake_case (DB).
 */
export function shouldPreserveExistingStatus(existing) {
  if (!existing) return false;
  const profile = existing.profileStatus ?? existing.profile_status;
  const verification = existing.verificationStatus ?? existing.verification_status;
  const booking = existing.onlineBookingStatus ?? existing.online_booking_status;
  const outreach = existing.outreachStatus ?? existing.outreach_status;
  const claimedVetId = existing.claimedVetId ?? existing.claimed_vet_id;
  const claimRequests = existing.claimRequests ?? existing.claim_requests;

  if (claimedVetId != null) return true;
  if (STRONG_PROFILE.has(profile)) return true;
  if (STRONG_VERIFICATION.has(verification)) return true;
  if (booking === "enabled") return true;
  if (outreach && outreach !== "not_contacted") return true;
  if (Array.isArray(claimRequests) && claimRequests.length > 0) return true;
  return false;
}

// ────────────────────────────────────────────────────────────────────────────
// Matching / deduplica
// ────────────────────────────────────────────────────────────────────────────
const GEO_RADIUS_M = 100;

/**
 * findExistingDirectoryMatch — cerca la struttura esistente corrispondente.
 * Ritorna { entry, confidence: 'sure' | 'probable', reason } oppure null.
 *
 * Ordine:
 *  1. id esatto            -> sure
 *  2. nome+indirizzo+città -> sure
 *  3. nome simile + coord entro 100m -> sure
 *  4. stesso telefono o stesso sito -> sure
 *  5. nome molto simile + stessa città (+ indirizzo parziale) -> probable
 */
export function findExistingDirectoryMatch(csvEntry, existingList) {
  const cName = normalizeName(csvEntry.name);
  const cAddr = normalizeAddress(csvEntry.address);
  const cCity = normalizeCity(csvEntry.city);
  const cPhone = normalizePhone(csvEntry.phone);
  const cSite = normalizeWebsite(csvEntry.website);
  const cCoords = normalizeCoordinates(csvEntry.lat, csvEntry.lng);

  const get = (e, camel, snake) => e[camel] ?? e[snake] ?? "";

  // 1. id esatto
  const byId = existingList.find((e) => e.id && csvEntry.id && e.id === csvEntry.id);
  if (byId) return { entry: byId, confidence: "sure", reason: "id" };

  // 2. nome + indirizzo + città
  if (cName && cAddr && cCity) {
    const strong = existingList.find(
      (e) =>
        normalizeName(get(e, "name", "name")) === cName &&
        normalizeAddress(get(e, "address", "address")) === cAddr &&
        normalizeCity(get(e, "city", "city")) === cCity
    );
    if (strong) return { entry: strong, confidence: "sure", reason: "name+address+city" };
  }

  // 3. nome simile + coordinate entro raggio
  if (cCoords) {
    const geo = existingList.find((e) => {
      const eCoords = normalizeCoordinates(get(e, "lat", "lat"), get(e, "lng", "lng"));
      if (!eCoords) return false;
      if (haversineMeters(cCoords, eCoords) > GEO_RADIUS_M) return false;
      return nameSimilarity(csvEntry.name, get(e, "name", "name")) >= 0.5;
    });
    if (geo) return { entry: geo, confidence: "sure", reason: "geo<=100m+name" };
  }

  // 4. stesso telefono o stesso sito
  if (cPhone) {
    const byPhone = existingList.find((e) => normalizePhone(get(e, "phone", "phone")) === cPhone);
    if (byPhone) return { entry: byPhone, confidence: "sure", reason: "phone" };
  }
  if (cSite) {
    const byWeb = existingList.find((e) => normalizeWebsite(get(e, "website", "website")) === cSite);
    if (byWeb) return { entry: byWeb, confidence: "sure", reason: "website" };
  }

  // 5. probabile: nome molto simile + stessa città (+ indirizzo parziale coerente)
  if (cName && cCity) {
    const probable = existingList.find((e) => {
      if (normalizeCity(get(e, "city", "city")) !== cCity) return false;
      const sim = nameSimilarity(csvEntry.name, get(e, "name", "name"));
      if (sim < 0.6) return false;
      const eAddr = normalizeAddress(get(e, "address", "address"));
      const addrCoherent = !cAddr || !eAddr || eAddr.includes(cAddr) || cAddr.includes(eAddr) || sim >= 0.8;
      return addrCoherent;
    });
    if (probable) return { entry: probable, confidence: "probable", reason: "name~+city" };
  }

  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// Merge
// ────────────────────────────────────────────────────────────────────────────
/**
 * mergeDirectoryEntry — fonde una riga CSV arricchita su un record esistente.
 *
 * @param existing  record esistente (snake_case dal DB, o null se nuovo)
 * @param csvEntry  entry mappata dal CSV (camelCase, da mapCsvRowToDirectoryEntry)
 * @returns { row, action, preserved, hidden, riskSignal }
 *          row     = record snake_case pronto per l'upsert
 *          action  = 'insert' | 'update'
 */
export function mergeDirectoryEntry(existing, csvEntry) {
  const now = new Date().toISOString();

  // Campi di arricchimento: il CSV è SEMPRE la fonte migliore.
  const enrichment = {
    official_website_found: csvEntry.officialWebsiteFound,
    website_status: csvEntry.websiteStatus,
    fnovi_registry_source: csvEntry.fnoviRegistrySource,
    albo_match_status: csvEntry.alboMatchStatus,
    google_place_id: csvEntry.googlePlaceId,
    google_business_status: csvEntry.googleBusinessStatus,
    external_reputation_signal: csvEntry.externalReputationSignal,
    activity_status: csvEntry.activityStatus,
    activity_confidence: csvEntry.activityConfidence,
    source_urls: csvEntry.sourceUrls,
    evidence_notes: csvEntry.evidenceNotes,
    recommended_profile_status: csvEntry.recommendedProfileStatus,
    needs_manual_review: csvEntry.needsManualReview,
  };

  // ── NUOVO RECORD ──
  if (!existing) {
    const st = resolveProfileStatusFromCsv(csvEntry);
    return {
      action: "insert",
      preserved: false,
      hidden: shouldHideFromPublicResults(csvEntry),
      riskSignal: false,
      row: {
        id: csvEntry.id,
        entity_type: csvEntry.entityType || "clinic",
        name: csvEntry.name,
        clinic_name: "",
        vet_name: "",
        address: csvEntry.address || "",
        city: csvEntry.city || "",
        province: csvEntry.province || "",
        phone: csvEntry.phone || "",
        website: csvEntry.website || "",
        lat: csvEntry.lat,
        lng: csvEntry.lng,
        ...enrichment,
        profile_status: st.profileStatus,
        verification_status: st.verificationStatus,
        online_booking_status: st.onlineBookingStatus,
        is_published: st.isPublished,
        outreach_status: "not_contacted",
        internal_notes: csvEntry.internalNotes || "",
        claim_requests: [],
        source_type: "enriched_research",
        updated_at: now,
      },
    };
  }

  // ── RECORD ESISTENTE ──
  const preserve = shouldPreserveExistingStatus(existing);
  const csvHidesIt = shouldHideFromPublicResults(csvEntry);

  // Base: parto dall'esistente e ci sovrascrivo solo l'arricchimento + colmo i buchi.
  const row = { ...existing, ...enrichment, updated_at: now };
  // Garantisce che source_type sia SEMPRE valorizzato (NOT NULL): l'upsert a lotti
  // altrimenti manderebbe NULL sulle righe che non lo includono.
  row.source_type = existing.source_type || "enriched_research";

  // Colma i contatti mancanti senza sovrascrivere dati esistenti non vuoti.
  const fill = (col, val) => {
    if (val && (existing[col] == null || existing[col] === "")) row[col] = val;
  };
  fill("address", csvEntry.address);
  fill("city", csvEntry.city);
  fill("province", csvEntry.province);
  fill("phone", csvEntry.phone);
  fill("website", csvEntry.website);
  if (existing.lat == null && csvEntry.lat != null) row.lat = csvEntry.lat;
  if (existing.lng == null && csvEntry.lng != null) row.lng = csvEntry.lng;

  let riskSignal = false;

  if (preserve) {
    // Non toccare stati/claim/note manuali. Ma se il CSV segnala rischio,
    // alza needsManualReview e aggiungi una nota, SENZA retrocedere.
    row.profile_status = existing.profile_status;
    row.verification_status = existing.verification_status;
    row.online_booking_status = existing.online_booking_status;
    row.is_published = existing.is_published;
    row.outreach_status = existing.outreach_status;
    row.internal_notes = existing.internal_notes || "";
    row.claim_requests = existing.claim_requests || [];

    if (csvHidesIt) {
      riskSignal = true;
      row.needs_manual_review = true;
      const note = `[sync] segnale attività: ${csvEntry.activityStatus} (confidence ${csvEntry.activityConfidence ?? "?"})`;
      if (!String(row.internal_notes).includes(note)) {
        row.internal_notes = [row.internal_notes, note].filter(Boolean).join(" | ");
      }
    }
  } else {
    // Record "vergine": applico gli stati raccomandati dal CSV.
    const st = resolveProfileStatusFromCsv(csvEntry);
    row.profile_status = st.profileStatus;
    row.verification_status = st.verificationStatus;
    row.online_booking_status = st.onlineBookingStatus;
    row.is_published = st.isPublished;
    // Per i record non gestiti il CSV è autoritativo anche su nome/contatti:
    // così si applicano le correzioni (es. OCR) e i dati migliori dei nuovi giri.
    // Sovrascrive solo quando il CSV fornisce un valore non vuoto.
    const refresh = (col, val) => {
      if (val) row[col] = val;
    };
    refresh("name", csvEntry.name);
    refresh("entity_type", csvEntry.entityType);
    refresh("address", csvEntry.address);
    refresh("city", csvEntry.city);
    refresh("province", csvEntry.province);
    refresh("phone", csvEntry.phone);
    refresh("website", csvEntry.website);
    if (csvEntry.lat != null) row.lat = csvEntry.lat;
    if (csvEntry.lng != null) row.lng = csvEntry.lng;
    // internalNotes: se l'esistente è vuoto, eredita quello del CSV.
    if (!existing.internal_notes) row.internal_notes = csvEntry.internalNotes || "";
  }

  return {
    action: "update",
    preserved: preserve,
    hidden: csvHidesIt,
    riskSignal,
    row,
  };
}
