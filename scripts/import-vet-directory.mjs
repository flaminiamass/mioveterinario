/**
 * Importer: vet_directory_seed.csv → tabella Supabase vet_directory
 *
 * Uso:
 *   npm run import:directory                (equivale a: node --env-file=.env.local scripts/import-vet-directory.mjs)
 *   npm run import:directory -- --dry-run
 *   npm run import:directory -- --csv percorso/file.csv --batch 500
 *
 * Richiede in .env.local:
 *   VITE_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   (senza prefisso VITE_: non deve MAI finire nel bundle)
 *
 * Regola anti-clobber: una riga esistente è PROTETTA (mai aggiornata) se un
 * operatore l'ha toccata, cioè se uno qualsiasi tra claimed_vet_id,
 * is_published, profile_status, verification_status, outreach_status non è
 * più al valore di default dell'import. Le righe protette vengono saltate:
 * i re-import aggiornano solo le schede ancora "vergini".
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// ── CLI args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getFlag = (name) => args.includes(name);
const getOpt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const CSV_PATH = getOpt("--csv", "scripts/vet_directory/out/vet_directory_seed.csv");
const DRY_RUN = getFlag("--dry-run");
const BATCH = Number(getOpt("--batch", "500"));

// ── Env (node --env-file oppure parse manuale di .env.local) ─────────────
function loadEnv(name) {
  if (process.env[name]) return process.env[name];
  try {
    const text = readFileSync(".env.local", "utf-8");
    const m = text.match(new RegExp(`^\\s*${name}\\s*=\\s*(.+)\\s*$`, "m"));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch {
    /* .env.local assente */
  }
  return "";
}

const SUPABASE_URL = loadEnv("VITE_SUPABASE_URL");
const SERVICE_KEY = loadEnv("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Mancano VITE_SUPABASE_URL e/o SUPABASE_SERVICE_ROLE_KEY in .env.local.\n" +
      "La service role key si trova su Supabase Dashboard → Project Settings → API keys."
  );
  process.exit(1);
}

// ── Parser CSV (RFC 4180: virgolette, campi multilinea) ───────────────────
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let field = "",
    row = [],
    inQuotes = false;
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
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

// ── Conversione riga CSV (camelCase) → riga DB (snake_case) ───────────────
const list = (s) =>
  s
    ? s
        .split(";")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];
const num = (s) => (s === "" || s == null ? null : Number(s));
const ts = (s) => (s ? s : null);

function rowToDb(r) {
  return {
    id: r.id,
    entity_type: r.entityType || "clinic",
    name: r.name,
    clinic_name: r.clinicName || "",
    vet_name: r.vetName || "",
    address: r.address || "",
    city: r.city || "",
    province: r.province || "",
    phone: r.phone || "",
    website: r.website || "",
    lat: num(r.lat),
    lng: num(r.lng),
    services: list(r.services),
    species: list(r.species),
    specialties: list(r.specialties),
    source_type: r.sourceType || "anagrafe_strutture_poi",
    source_url: r.sourceUrl || "",
    source_collected_at: ts(r.sourceCollectedAt),
    last_verified_at: ts(r.lastVerifiedAt),
    profile_status: r.profileStatus || "needs_review",
    verification_status: r.verificationStatus || "not_verified",
    online_booking_status: r.onlineBookingStatus || "disabled",
    is_published: r.isPublished === "true",
    marketing_consent: r.marketingConsent === "true",
    outreach_status: r.outreachStatus || "not_contacted",
    internal_notes: r.internalNotes || "",
    raw_label: r.rawLabel || "",
  };
}

function isProtected(existing) {
  return (
    existing.claimed_vet_id !== null ||
    existing.is_published === true ||
    existing.profile_status !== "needs_review" ||
    existing.verification_status !== "not_verified" ||
    existing.outreach_status !== "not_contacted"
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  const csvRows = parseCsv(readFileSync(CSV_PATH, "utf-8"));
  const valid = csvRows.filter((r) => r.id && r.name && r.lat && r.lng && r.sourceType);
  console.log(`CSV: ${csvRows.length} righe lette da ${CSV_PATH} (${valid.length} valide)`);

  // Stato esistente (select paginato: PostgREST limita a 1000 righe/pagina)
  const existing = new Map();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from("vet_directory")
      .select("id, is_published, profile_status, verification_status, outreach_status, claimed_vet_id")
      .range(from, from + 999);
    if (error) {
      console.error("Errore lettura vet_directory:", error.message);
      process.exit(1);
    }
    for (const row of data) existing.set(row.id, row);
    if (data.length < 1000) break;
  }
  console.log(`DB: ${existing.size} righe già presenti`);

  let inserted = 0,
    updated = 0,
    skipped = 0,
    errors = 0;
  const protectedIds = [];
  const toUpsert = [];

  for (const r of valid) {
    const prev = existing.get(r.id);
    if (prev && isProtected(prev)) {
      skipped++;
      if (protectedIds.length < 5) protectedIds.push(r.id);
      continue;
    }
    toUpsert.push(rowToDb(r));
    if (prev) updated++;
    else inserted++;
  }

  if (DRY_RUN) {
    console.log("[dry-run] nessuna scrittura eseguita");
  } else {
    for (let i = 0; i < toUpsert.length; i += BATCH) {
      const batch = toUpsert.slice(i, i + BATCH);
      const { error } = await sb.from("vet_directory").upsert(batch, { onConflict: "id" });
      if (error) {
        console.error(`Errore batch ${i}-${i + batch.length}:`, error.message);
        errors += batch.length;
      }
    }
  }

  console.log("\n=== REPORT IMPORT ===");
  console.log(`Letti da CSV:        ${csvRows.length}`);
  console.log(`Validi:              ${valid.length}`);
  console.log(`Nuovi inseriti:      ${inserted}${DRY_RUN ? " (simulato)" : ""}`);
  console.log(`Aggiornati:          ${updated}${DRY_RUN ? " (simulato)" : ""}`);
  console.log(`Saltati (protetti):  ${skipped}`);
  if (protectedIds.length) console.log(`  esempi protetti:   ${protectedIds.join(", ")}`);
  console.log(`Errori:              ${errors}`);
  process.exit(errors ? 1 : 0);
}

main();
