/*
 * drive.mjs — Driver Playwright per pilotare MioVeterinario in modalità demo.
 *
 * Non richiede Playwright installato nel progetto: lo risolve dal cache di npx
 * tramite la variabile PW_PATH (vedi SKILL.md). Usa Chromium headless.
 *
 * Variabili d'ambiente:
 *   PW_PATH   percorso a .../node_modules/playwright/index.js (obbligatoria)
 *   URL       URL dell'app (default http://localhost:5199)
 *   OUT_DIR   cartella screenshot (default .)
 *   ROLE      "owner" | "vet" (default owner)
 *   TAB       testo esatto della tab da aprire (default "Veterinari")
 *
 * Stampa un JSON con eventuali errori di console e alcune asserzioni testuali.
 */
import { pathToFileURL } from "node:url";

const pw = await import(pathToFileURL(process.env.PW_PATH).href);
const chromium = pw.chromium || pw.default?.chromium;

const URL = process.env.URL || "http://localhost:5199";
const OUT = process.env.OUT_DIR || ".";
const ROLE = process.env.ROLE || "owner";
const TAB = process.env.TAB || "Veterinari";
const ROLE_LABEL = ROLE === "vet" ? "Sono un Veterinario" : "Sono un Proprietario";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const context = await browser.newContext({
  viewport: { width: 420, height: 900 },
  geolocation: { latitude: 41.8967, longitude: 12.4822 }, // Roma Centro (deterministico)
  permissions: ["geolocation"],
});
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto(URL, { waitUntil: "domcontentloaded" });

// Landing demo → scelta ruolo
await page.getByText(ROLE_LABEL).click();

// Bottom nav → tab richiesta
await page.getByText(TAB, { exact: true }).first().click();
await page.waitForTimeout(1000); // lascia risolvere geolocalizzazione / render

const shot = `${OUT}/run-${ROLE}-${TAB.toLowerCase()}.png`;
await page.screenshot({ path: shot, fullPage: true });

const bodyText = await page.locator("body").innerText();
console.log(JSON.stringify({ screenshot: shot, textLength: bodyText.length, errors }, null, 2));

await browser.close();
