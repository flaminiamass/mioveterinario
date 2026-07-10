/**
 * sync-enriched-directory.mjs — Sincronizzazione INTELLIGENTE del CSV arricchito
 * con la tabella Supabase `vet_directory`.
 *
 * A differenza di import-vet-directory.mjs (che carica il seed grezzo), questo
 * script fa un merge ragionato:
 *   - matcha ogni riga con i record già presenti (id, nome+indirizzo+città,
 *     geo entro 100m, telefono/sito, oppure match probabile);
 *   - aggiorna i record esistenti con i campi di arricchimento;
 *   - preserva stati manuali/claim/attivi (mai retrocessioni automatiche);
 *   - aggiunge solo le strutture nuove non ancora presenti;
 *   - NON fonde i duplicati probabili: li segnala per revisione manuale;
 *   - produce statistiche e un report Markdown in scripts/vet_directory/out/.
 *
 * Uso:
 *   npm run sync:directory                       (scrive su Supabase)
 *   npm run sync:directory -- --dry-run          (nessuna scrittura)
 *   npm run sync:directory -- --csv path.csv --batch 500
 *
 * Richiede in .env.local:
 *   VITE_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   (mai con prefisso VITE_)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  parseCsv,
  mapCsvRowToDirectoryEntry,
  findExistingDirectoryMatch,
  mergeDirectoryEntry,
} from "./vet_directory/merge-helpers.mjs";

// ── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getFlag = (name) => args.includes(name);
const getOpt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const CSV_PATH = getOpt("--csv", "scripts/vet_directory/out/vet_directory_enriched.csv");
const DRY_RUN = getFlag("--dry-run");
const BATCH = Number(getOpt("--batch", "500"));

// ── Env ───────────────────────────────────────────────────────────────────
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
      "La service role key è su Supabase Dashboard → Project Settings → API keys."
  );
  process.exit(1);
}

const EXISTING_COLS =
  "id, entity_type, name, clinic_name, vet_name, address, city, province, phone, website, lat, lng, " +
  "official_website_found, website_status, fnovi_registry_source, albo_match_status, google_place_id, " +
  "google_business_status, external_reputation_signal, activity_status, activity_confidence, source_urls, " +
  "evidence_notes, recommended_profile_status, needs_manual_review, profile_status, verification_status, " +
  "online_booking_status, is_published, outreach_status, internal_notes, claim_requests, claimed_vet_id, source_type";

// ── syncEnrichedCsvWithDirectory ────────────────────────────────────────────
async function syncEnrichedCsvWithDirectory() {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  // 1. Leggi e mappa il CSV.
  const rawRows = parseCsv(readFileSync(CSV_PATH, "utf-8"));
  const mapped = rawRows.map(mapCsvRowToDirectoryEntry);
  const valid = mapped.filter((r) => r.id && r.name);
  const invalid = mapped.length - valid.length;

  // 2. Carica lo stato esistente (paginato: PostgREST limita a 1000 righe).
  const existingList = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from("vet_directory").select(EXISTING_COLS).range(from, from + 999);
    if (error) {
      console.error("Errore lettura vet_directory:", error.message);
      process.exit(1);
    }
    existingList.push(...data);
    if (data.length < 1000) break;
  }

  const stats = {
    read: rawRows.length,
    valid: valid.length,
    invalid,
    updated: 0,
    inserted: 0,
    probableDuplicates: 0,
    conflicts: 0,
    publishedUnclaimed: 0,
    sentToReview: 0,
    hidden: 0,
    activePreserved: 0,
  };
  const probableDuplicates = [];
  const conflicts = [];
  const toUpsert = [];
  const matchedExistingIds = new Set();

  // 3-5. Match + merge riga per riga.
  for (const csvEntry of valid) {
    const match = findExistingDirectoryMatch(csvEntry, existingList);

    if (match && match.confidence === "probable") {
      // Non fondere alla cieca: segnala per revisione manuale.
      stats.probableDuplicates++;
      probableDuplicates.push({
        csvId: csvEntry.id,
        csvName: csvEntry.name,
        csvCity: csvEntry.city,
        existingId: match.entry.id,
        existingName: match.entry.name,
        reason: match.reason,
      });
      continue;
    }

    const existing = match ? match.entry : null;
    if (existing) matchedExistingIds.add(existing.id);

    const merged = mergeDirectoryEntry(existing, csvEntry);
    toUpsert.push(merged.row);

    if (merged.action === "insert") stats.inserted++;
    else stats.updated++;

    if (merged.preserved) stats.activePreserved++;
    if (merged.hidden) stats.hidden++;
    if (merged.row.is_published && merged.row.profile_status === "published_unclaimed") stats.publishedUnclaimed++;
    if (merged.row.profile_status === "needs_review") stats.sentToReview++;

    if (merged.riskSignal) {
      stats.conflicts++;
      conflicts.push({
        id: existing.id,
        name: existing.name,
        keptStatus: existing.profile_status,
        csvActivity: csvEntry.activityStatus,
        csvConfidence: csvEntry.activityConfidence,
        reason: match.reason,
      });
    }
  }

  // 6. Scrivi (upsert a batch) salvo dry-run.
  let errors = 0;
  if (!DRY_RUN) {
    for (let i = 0; i < toUpsert.length; i += BATCH) {
      const batch = toUpsert.slice(i, i + BATCH);
      const { error } = await sb.from("vet_directory").upsert(batch, { onConflict: "id" });
      if (error) {
        console.error(`Errore batch ${i}-${i + batch.length}:`, error.message);
        errors += batch.length;
      }
    }
  }

  return { stats, probableDuplicates, conflicts, errors };
}

// ── Report ──────────────────────────────────────────────────────────────────
function buildReport({ stats, probableDuplicates, conflicts, errors }) {
  const ts = new Date().toISOString();
  const lines = [];
  lines.push(`# Report sync directory arricchita`);
  lines.push("");
  lines.push(`- Data: ${ts}`);
  lines.push(`- CSV: \`${CSV_PATH}\``);
  lines.push(`- Modalità: ${DRY_RUN ? "DRY-RUN (nessuna scrittura)" : "APPLICATA"}`);
  lines.push("");
  lines.push(`## Statistiche`);
  lines.push("");
  lines.push(`| Metrica | Valore |`);
  lines.push(`| --- | ---: |`);
  lines.push(`| Righe lette | ${stats.read} |`);
  lines.push(`| Righe valide | ${stats.valid} |`);
  lines.push(`| Righe non valide | ${stats.invalid} |`);
  lines.push(`| Record aggiornati | ${stats.updated} |`);
  lines.push(`| Record aggiunti | ${stats.inserted} |`);
  lines.push(`| Duplicati probabili (non fusi) | ${stats.probableDuplicates} |`);
  lines.push(`| Conflitti (richiedono revisione) | ${stats.conflicts} |`);
  lines.push(`| Schede pubblicate non rivendicate | ${stats.publishedUnclaimed} |`);
  lines.push(`| Schede mandate in revisione | ${stats.sentToReview} |`);
  lines.push(`| Schede nascoste (closed/hidden) | ${stats.hidden} |`);
  lines.push(`| Schede già attive/manuali preservate | ${stats.activePreserved} |`);
  lines.push(`| Errori di scrittura | ${errors} |`);
  lines.push("");

  lines.push(`## Duplicati probabili (revisione manuale — NON fusi)`);
  lines.push("");
  if (!probableDuplicates.length) lines.push("_Nessuno._");
  else {
    lines.push(`| CSV id | CSV nome | Città | Esistente id | Esistente nome | Motivo |`);
    lines.push(`| --- | --- | --- | --- | --- | --- |`);
    for (const d of probableDuplicates)
      lines.push(`| ${d.csvId} | ${d.csvName} | ${d.csvCity} | ${d.existingId} | ${d.existingName} | ${d.reason} |`);
  }
  lines.push("");

  lines.push(`## Conflitti (stato preservato + segnale di rischio dal CSV)`);
  lines.push("");
  if (!conflicts.length) lines.push("_Nessuno._");
  else {
    lines.push(`| id | nome | stato mantenuto | attività CSV | confidence | match |`);
    lines.push(`| --- | --- | --- | --- | ---: | --- |`);
    for (const c of conflicts)
      lines.push(
        `| ${c.id} | ${c.name} | ${c.keptStatus} | ${c.csvActivity} | ${c.csvConfidence ?? "?"} | ${c.reason} |`
      );
  }
  lines.push("");
  return lines.join("\n");
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const result = await syncEnrichedCsvWithDirectory();
  const report = buildReport(result);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = `scripts/vet_directory/out/sync-report-${stamp}.md`;
  writeFileSync(reportPath, report, "utf-8");

  console.log(report);
  console.log(`\nReport salvato in: ${reportPath}`);
  // Nota: usiamo process.exitCode (non process.exit) per evitare l'assertion
  // libuv su Windows quando il client Supabase chiude le connessioni in modo async.
  process.exitCode = result.errors ? 1 : 0;
}

main();
