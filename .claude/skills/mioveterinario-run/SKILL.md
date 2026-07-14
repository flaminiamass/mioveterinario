---
name: mioveterinario-run
description: Launch and drive MioVeterinario in demo mode with Playwright to verify UI changes (screenshots, console errors) without touching real Supabase credentials.
---

# MioVeterinario — Run & Drive (demo verification)

Use this skill when asked to visually verify a UI/UX change in this app — e.g. "verifica che si veda X", "controlla che non ci siano errori", "fammi uno screenshot di Y" — without a manual walkthrough by the user.

It launches the app in **demo mode** (seed data, no real Supabase reads/writes) and drives it headlessly with Playwright, producing a screenshot and a JSON report of console errors.

Do not use this to test the on-demand Supabase directory-loading path (`loadDirectoryNear` / `searchDirectory` in `AppContext.jsx`) — demo mode never calls Supabase, so that path needs either a mocked backend or a real/staging project, which requires checking with the user first.

## Why demo mode via `--mode demo`, not `.env.local`

`.env.local` normally holds real Supabase credentials, and `isSupabaseConfigured()` (in `src/lib/supabaseClient.js`) treats any non-placeholder URL/key as "configured" — which skips demo/seed data and requires real auth. To get deterministic, credential-free verification without touching `.env.local`:

1. Create a temporary `.env.demo` with placeholder values `isSupabaseConfigured()` recognizes as "not configured":
   ```
   VITE_SUPABASE_URL=https://IL-TUO-PROGETTO.supabase.co
   VITE_SUPABASE_ANON_KEY=la-tua-anon-key
   ```
2. Run Vite with `--mode demo` so it loads `.env.demo` instead of `.env.local`:
   ```bash
   npx vite --mode demo --port 5199 --strictPort
   ```
3. Poll until it's up (`curl -s http://localhost:5199 -o /dev/null` or similar) before driving it.
4. **Cleanup after**: delete `.env.demo` and kill the Vite process. Never leave the placeholder file behind or modify `.env.local`.

## Resolving Playwright without a project dependency

Playwright is not a dependency of this project. Resolve it from npm's `_npx` cache instead of installing it:

```bash
CACHE=$(npm config get cache)
PW_PATH=$(find "$CACHE/_npx" -maxdepth 4 -path '*node_modules/playwright/index.js' | head -1)
```

If that returns nothing, run `npx playwright --version` once (installs it into the npx cache), then re-run the `find`.

`drive.mjs` resolves Playwright via `pathToFileURL(process.env.PW_PATH)` + dynamic `import()` — ESM `import` does not respect `NODE_PATH`, so `PW_PATH` must be the exact absolute path to `playwright/index.js`.

## One-time Chromium install

If `chromium.launch` fails with "Executable doesn't exist at ...chrome-headless-shell.exe", the browser binary itself is missing (separate from the `playwright` package):

```bash
npx playwright install chromium
```

This downloads once (~115 MiB) and is reused across runs.

## Driving the app: `drive.mjs`

`.claude/skills/mioveterinario-run/drive.mjs` launches headless Chromium at Rome-centro coordinates (deterministic geolocation), picks a role on the landing page, opens a bottom-nav tab by exact text, waits 1s for render/geolocation to settle, screenshots, and prints a JSON report (`screenshot`, `textLength`, `errors` — console errors + pageerrors).

Env vars:

| Var | Required | Default | Notes |
|---|---|---|---|
| `PW_PATH` | yes | — | absolute path to `playwright/index.js` |
| `URL` | no | `http://localhost:5199` | must match the `--port` used above |
| `OUT_DIR` | no | `.` | where the screenshot is written |
| `ROLE` | no | `owner` | `owner` or `vet` |
| `TAB` | no | `Veterinari` | exact bottom-nav label text |

Example full run:

```bash
CACHE=$(npm config get cache)
PW_PATH=$(find "$CACHE/_npx" -maxdepth 4 -path '*node_modules/playwright/index.js' | head -1)

cat > .env.demo <<'EOF'
VITE_SUPABASE_URL=https://IL-TUO-PROGETTO.supabase.co
VITE_SUPABASE_ANON_KEY=la-tua-anon-key
EOF

npx vite --mode demo --port 5199 --strictPort &
VITE_PID=$!
until curl -s http://localhost:5199 -o /dev/null; do sleep 0.3; done

PW_PATH="$PW_PATH" URL=http://localhost:5199 OUT_DIR=/tmp ROLE=owner TAB=Veterinari \
  node .claude/skills/mioveterinario-run/drive.mjs

kill $VITE_PID
rm .env.demo
```

Then `Read` the screenshot path printed in the JSON to visually confirm the change.

## Known false-negative

`page.locator("body").innerText()`-based text assertions can under-count matches when CSS `text-transform: uppercase` is involved even though the underlying case should be preserved by `innerText` — treat text-assertion mismatches as inconclusive and confirm visually via the screenshot rather than failing the check solely on them, as long as `errors` is empty and the screenshot looks correct.

## Cleanup checklist after every run

- Delete `.env.demo`.
- Kill the backgrounded Vite process.
- Delete ad-hoc screenshots/scripts created only for this verification pass (not `drive.mjs` itself, which is a permanent project asset).
- Never modify `.env.local`.
