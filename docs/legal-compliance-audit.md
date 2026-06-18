# MioVeterinario — Legal & Privacy Compliance Audit

**Data audit:** 18 giugno 2026  
**Ambito:** Prototipo demo React (SPA front-end only, dati in-memory, nessun backend reale)  
**Condotto da:** Claude Code + skill `mioveterinario-legal-counsel`  
**Nota:** Questo documento non sostituisce una consulenza legale professionale. Tutti i punti marcati [DA VALIDARE CON LEGALE], [DA VALIDARE CON COMMERCIALISTA] e [DA VALIDARE CON VETERINARIO/ORDINE] richiedono sign-off prima del go-live.

---

## 1. Mappa dei trattamenti dati

### 1.1 Flussi identificati nel prototipo

| Flusso               | Dati raccolti                                                       | Da chi               | Finalità                | Dove salvati (ora)                | Provider terzi | Categoria rischio | Rischi legali                                                                           |
| -------------------- | ------------------------------------------------------------------- | -------------------- | ----------------------- | --------------------------------- | -------------- | ----------------- | --------------------------------------------------------------------------------------- |
| Profilo proprietario | Nome, email, telefono, CF, indirizzo                                | Proprietario animale | Account e fatturazione  | React state (AppContext)          | Nessuno (demo) | Alto              | GDPR: base giuridica, notice, retention                                                 |
| Profilo animale      | Nome, specie, razza, dob, peso, sesso, microchip                    | Proprietario         | Gestione sanitaria      | React state                       | Nessuno (demo) | Medio/Alto        | Microchip = dato identificativo; note libere possono contenere dati sensibili umani     |
| Prenotazione/booking | Animale, servizio, data/ora, note libere                            | Proprietario         | Prenotare visita        | React state                       | Nessuno (demo) | Alto              | Note libere: rischio raccolta dati sanitari umani; info precontrattuali consumatore     |
| Referto clinico      | Diagnosi, trattamenti, farmaci, indicazioni, prossima visita        | Veterinario          | Documentazione clinica  | React state                       | Nessuno (demo) | Alto              | Riservatezza professionale; responsabilità vet; REV per farmaci soggetti a prescrizione |
| Fattura              | CF cliente, importi, voci, regime fiscale, ENPAV/IVA                | Veterinario          | Documentazione fiscale  | React state + printInvoice (HTML) | Nessuno (demo) | Alto              | Emittente della fattura; e-fattura SdI; Sistema TS; obblighi commercialista             |
| Recensione           | Rating, commento, autore, appuntamento collegato                    | Proprietario         | Valutazione veterinario | React state                       | Nessuno (demo) | Alto              | Verifica recensioni (art. 22(5-bis) Cod. Consumo); moderazione; DSA                     |
| Vaccini              | Nome vaccino, data, scadenza, veterinario                           | Proprietario         | Libretto vaccinale      | React state                       | Nessuno (demo) | Medio             | Fonte dell'informazione; responsabilità vet                                             |
| Profilo veterinario  | Nome, clinica, indirizzo, albo, PIVA, CF, specializzazioni, tariffe | Veterinario          | Pubblicazione profilo   | React state (seedData)            | Nessuno (demo) | Alto              | Verifica albo; pubblicità veterinaria; dati fiscali in chiaro                           |
| Ricerca/ranking      | Query utente, filtri, ordinamento                                   | Proprietario         | Trovare veterinario     | Solo calcolo locale               | Nessuno (demo) | Medio             | Trasparenza ranking (P2B Reg. UE 2019/1150)                                             |
| Stampa fattura       | Tutti i dati fattura + popup browser                                | Veterinario          | Copia PDF               | window.open locale                | Nessuno        | Medio             | Non è fattura fiscale valida                                                            |

### 1.2 Dati NON presenti nel prototipo (ma attesi in produzione)

- Dati di pagamento (PSP/carta) → richiedono PCI DSS + SCA
- Email transazionale/marketing → richiedono provider email, consenso, unsubscribe
- Analytics/cookie non tecnici → richiedono banner cookie
- Video-consulto → richiedono provider video, metadati, registrazione
- Geolocalizzazione per visite a domicilio → alto rischio privacy
- Sistema Tessera Sanitaria (spese veterinarie) → [DA VALIDARE CON COMMERCIALISTA]
- Integrazione albo veterinari → [DA VALIDARE CON ORDINE]
- Autenticazione reale (Supabase) → session token, MFA, log accessi

---

## 2. Problemi trovati — classificazione per priorità

### BLOCKER (non pubblicare senza fix)

| ID  | Problema                                                                                                 | File coinvolti                   | Stato                                                                |
| --- | -------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------- |
| B1  | Assenza totale di Privacy Policy, Terms, Cookie Policy                                                   | —                                | **FIX IMPLEMENTATO**                                                 |
| B2  | Profilo proprietario demo con nome e CF realistico (pattern codice fiscale reale: "MSSFMN95D55H501X")    | AppContext.jsx, seedData.js      | **FIX IMPLEMENTATO** — sostituiti con dati fictizi                   |
| B3  | Nessun disclaimer che il prototipo è una demo — rischio di utenti che credono di prenotare davvero       | Landing.jsx                      | **FIX IMPLEMENTATO**                                                 |
| B4  | InvoiceForm genera e stampa documenti etichettati "fattura" senza essere fatture elettroniche SdI valide | InvoiceForm.jsx, invoicePrint.js | **FIX IMPLEMENTATO** — aggiunta etichetta BOZZA + disclaimer fiscale |
| B5  | Video-consulto prenotabile senza nessun avviso che non sostituisce visita fisica                         | BookingFlow.jsx                  | **FIX IMPLEMENTATO**                                                 |

### HIGH (rischio legale significativo — fix prima del lancio)

| ID  | Problema                                                                                                        | File coinvolti                    | Stato                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| H1  | Recensioni mostrate senza distinguere verificate/non verificate — art. 22(5-bis) Cod. Consumo e AGCM            | VetPublicProfile.jsx, seedData.js | **FIX IMPLEMENTATO** — badge ✓ Verificata / Non verificata                                                                         |
| H2  | Trasparenza ranking assente — P2B Reg. UE 2019/1150                                                             | SearchVets.jsx                    | **FIX IMPLEMENTATO** — nota ℹ️ accanto ai filtri di ordinamento                                                                    |
| H3  | Nessuna informativa pre-booking (identità vet, prezzo definitivo, cancellazione/no-show) — art. 49 Cod. Consumo | BookingFlow.jsx                   | **FIX IMPLEMENTATO** — riepilogo step 4 con indirizzo e disclaimer                                                                 |
| H4  | RefertoForm non ha disclaimer responsabilità veterinario e avviso REV per farmaci                               | RefertoForm.jsx                   | **FIX IMPLEMENTATO**                                                                                                               |
| H5  | Referti e fatture visibili al proprietario senza controlli di accesso lato server                               | OwnerDocs.jsx                     | **FIX PARZIALE** — disclaimer aggiunto; il controllo RBAC server-side è TODO produzione                                            |
| H6  | seedData contiene 3 codici fiscali veterinari e 1 CF proprietario con pattern realistico                        | seedData.js                       | **FIX PARZIALE** — i CF vet sono rimasti (pattern plausibile ma inventato, standard in Italia per test); aggiungere nota esplicita |
| H7  | Campo "note" in BookingFlow è testo libero senza avviso anti-dati-sensibili-umani                               | BookingFlow.jsx                   | **FIX IMPLEMENTATO**                                                                                                               |
| H8  | Vet profile non ha stato di verifica — rischio pubblicazione veterinari non verificati                          | seedData.js, SearchVets.jsx       | **TODO produzione** — aggiungere campo `status: 'verified'` e filtrare nella ricerca                                               |
| H9  | Nessuna policy di cancellazione/rimborso visibile prima della conferma booking                                  | BookingFlow.jsx                   | **FIX PARZIALE** — placeholder TODO aggiunto                                                                                       |
| H10 | Link footer legale assente in tutta l'app (solo Landing)                                                        | OwnerApp.jsx, VetApp.jsx          | **TODO** — LegalFooter non ancora integrato in OwnerApp e VetApp                                                                   |

### MEDIUM (fix nel prossimo sprint)

| ID  | Problema                                                                                                  | File coinvolti              | Stato                                                               |
| --- | --------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------- |
| M1  | Microchip animale mostrato per intero in PetDetail view (…solo ultimi 5 digit)                            | PetDetail.jsx               | **PARZIALE** — view mascherata; form di modifica ora ha validazione |
| M2  | Campo "Farmaci" in RefertoForm non distingue farmaci da banco da quelli soggetti a REV                    | RefertoForm.jsx             | **FIX IMPLEMENTATO** — avviso aggiunto                              |
| M3  | InvoiceForm numera le fatture sequenzialmente senza anno isolato — rischio duplicati                      | InvoiceForm.jsx             | **TODO produzione** — numerazione da gestire lato server            |
| M4  | Nessuna funzione export/delete account per proprietario o veterinario                                     | —                           | **TODO produzione** — richiesto da GDPR art. 17, 20                 |
| M5  | Nessuna retention policy implementata                                                                     | —                           | **TODO produzione**                                                 |
| M6  | Nessun maxLength sui campi liberi (diagnosi, trattamenti, ecc.) in RefertoForm                            | RefertoForm.jsx             | **TODO** — aggiungere maxLength preventivo                          |
| M7  | Vet reply alle recensioni non ha avviso "non divulgare dati clinici"                                      | VetApp — sezione recensioni | **TODO**                                                            |
| M8  | Nessun rate limiting su form/azioni (solo front-end senza backend)                                        | —                           | **TODO produzione** — gestire lato server/API                       |
| M9  | Formspree o altri form provider: non rilevati nella versione demo, ma da verificare se aggiunti in futuro | index.html, Landing         | **OK in demo** — da verificare in produzione                        |
| M10 | Google Fonts o CDN esterni non rilevati — OK in demo, da verificare in build produzione                   | index.html                  | **OK in demo**                                                      |

### LOW (polish o backlog)

| ID  | Problema                                                                             | File coinvolti           | Stato                                              |
| --- | ------------------------------------------------------------------------------------ | ------------------------ | -------------------------------------------------- |
| L1  | Placeholder [Ragione sociale], [email privacy] nei documenti legali da compilare     | legal/\*.jsx             | **TODO** — da riempire con dati aziendali reali    |
| L2  | Footer legale non integrato in OwnerApp e VetApp (solo Landing)                      | OwnerApp.jsx, VetApp.jsx | **TODO**                                           |
| L3  | README.md non aggiornato (ancora readme standard Vite)                               | README.md                | **TODO**                                           |
| L4  | Nessun campo per data/ora review nella ReviewForm (usa fmtDate(today))               | ReviewForm.jsx           | **OK** per demo — timestamp da validare con DB     |
| L5  | seedReviews contiene autore "Giulia R." e "Andrea P." — nomi plausibili ma inventati | seedData.js              | **OK** — chiaramente fittizi, accettabile per demo |

---

## 3. Fix implementati in questo audit

### File creati

| File                                      | Contenuto                                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/components/legal/PrivacyPolicy.jsx`  | Informativa privacy strutturata per prototipo/beta — GDPR art. 13/14, diritti, retention, sub-responsabili |
| `src/components/legal/TermsOfService.jsx` | Condizioni d'uso — ruolo piattaforma, booking, cancellazione, fatture, video-consulto, recensioni, ranking |
| `src/components/legal/CookiePolicy.jsx`   | Cookie policy — distinzione tecnici/non tecnici, note su analytics future, link browser                    |
| `src/components/legal/LegalFooter.jsx`    | Footer con link navigabili a Privacy, Terms, Cookie                                                        |
| `docs/legal-compliance-audit.md`          | Questo documento                                                                                           |

### File modificati

| File                                        | Modifiche                                                                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/App.jsx`                               | Aggiunto routing per pagine legali (`legalPage` state), prop `onNav` passata a Landing/Owner/Vet                                                                          |
| `src/components/Landing.jsx`                | Banner beta/prototipo, footer legale, prop `onNav`                                                                                                                        |
| `src/components/owner/BookingFlow.jsx`      | Disclaimer video-consulto (step 4), indirizzo vet nel riepilogo, note prezzo indicativo, avviso note libere, testo privacy pre-conferma, placeholder policy cancellazione |
| `src/components/owner/SearchVets.jsx`       | Nota trasparenza ranking sotto i filtri di ordinamento                                                                                                                    |
| `src/components/owner/VetPublicProfile.jsx` | Badge "✓ Verificata" / "Non verificata" per recensioni; nota disclosure metodo verifica                                                                                   |
| `src/components/owner/PetDetail.jsx`        | Avviso microchip, validazione solo cifre + maxLength 15 nel campo edit                                                                                                    |
| `src/components/owner/OwnerDocs.jsx`        | Disclaimer referti (responsabilità vet, REV), disclaimer fatture (emittente vet, SdI)                                                                                     |
| `src/components/vet/RefertoForm.jsx`        | Disclaimer responsabilità professionale veterinario, avviso REV farmaci, label pulsante "Salva e condividi"                                                               |
| `src/components/vet/InvoiceForm.jsx`        | Titolo con "[BOZZA]", disclaimer fiscale SdI, pulsante "Salva bozza fattura"                                                                                              |
| `src/utils/invoicePrint.js`                 | Watermark BOZZA nel footer HTML stampato, avviso SdI                                                                                                                      |
| `src/data/seedData.js`                      | Commento dati fittizi, seedClients → "Demo Utente" con CF fittizio                                                                                                        |
| `src/context/AppContext.jsx`                | ownerProfile → "Demo Utente" con CF fittizio, commento esplicito                                                                                                          |

---

## 4. Problemi aperti — TODO produzione

### Richiedono decisione business/architettura

- [ ] **Modello di fatturazione:** scegliere tra modello 1 (vet fattura direttamente), modello 2 (piattaforma merchant of record) o modello 3 (payment facilitator). La scelta determina chi è l'emittente della fattura e chi è responsabile degli adempimenti SdI, IVA, ENPAV, Sistema TS. **[DA VALIDARE CON COMMERCIALISTA]**
- [ ] **Sistema TS (spese veterinarie):** verificare se e chi deve inviare le spese veterinarie al sistema precompilata. **[DA VALIDARE CON COMMERCIALISTA]**
- [ ] **PSP e pagamenti:** selezionare un PSP certificato PCI DSS (es. Stripe, Nexi, Satispay), implementare tokenizzazione, SCA, card-on-file, gestione rimborsi e no-show.
- [ ] **Email marketing:** definire se si vuole fare marketing alla waitlist/utenti. Se sì, implementare opt-in separato, unsubscribe in ogni email, consent log.
- [ ] **Video-consulto:** selezionare provider video (es. Daily.co, Jitsi, Zoom SDK), valutare DPA, trasferimenti extra-SEE, no-recording by default, metadati minimi.
- [ ] **Vet verification flow:** definire il processo KYB/KYC per veterinari (verifica albo, P.IVA, identità, assicurazione professionale). **[DA VALIDARE CON VETERINARIO/ORDINE]**
- [ ] **Policy cancellazione/no-show:** definire termini, penali, modalità di rimborso. **[DA VALIDARE CON LEGALE]**
- [ ] **Ranking sponsorizzato:** se si vuole introdurre placement a pagamento, dichiararlo esplicitamente e documentare per P2B. **[DA VALIDARE CON LEGALE]**

### Richiedono implementazione tecnica

- [ ] **RBAC server-side:** ogni endpoint che ritorna referti/fatture/appuntamenti deve verificare che il richiedente sia il legittimo proprietario/vet — non solo lato client.
- [ ] **Audit log:** accesso a referti, fatture, modifica dati veterinario, cambio stato appuntamento.
- [ ] **Export account (art. 20 GDPR):** funzione download dati personali in formato strutturato.
- [ ] **Delete account (art. 17 GDPR):** flusso cancellazione con gestione retention per obblighi fiscali.
- [ ] **Rate limiting:** su form di prenotazione, login, review, API endpoint.
- [ ] **Security headers:** CSP, HSTS, X-Frame-Options, X-Content-Type-Options.
- [ ] **MFA:** per account veterinario e admin (accesso a dati clinici/fiscali di terzi).
- [ ] **Crittografia at-rest:** referti e fatture nel DB devono essere cifrati o protetti con KMS.
- [ ] **Secrets management:** .env lato server (mai nel frontend bundle), provider segreti (es. Vault, Doppler).
- [ ] **Numerazione fatture:** gestita lato server con lock transazionale.
- [ ] **maxLength** su tutti i campi free-text (diagnosi, trattamenti, note booking, commento recensione).
- [ ] **Integrazione footer legale** in OwnerApp.jsx e VetApp.jsx.
- [ ] **Stato vet "verified"** nel seed e nella ricerca — filtrare solo vet verificati nella ricerca pubblica.

### Richiedono sign-off esterno

- [ ] **Privacy Policy finale** — validare con DPO o avvocato privacy. Completare tutti i placeholder [Ragione sociale], [email privacy], ecc.
- [ ] **Terms of Service finali** — validare con legale. Attenzione a limitazione responsabilità, recesso consumatori (art. 52 Cod. Consumo), applicazione DSA.
- [ ] **Condizioni per veterinari/professionisti (P2B)** — da redigere e validare con legale. Includere: ranking, commissioni, sospensione, reclami, mediazione.
- [ ] **Cookie Policy** — da aggiornare con elenco cookie reali (sessione, analytics scelti) e validare con DPO.
- [ ] **DPA/sub-responsabili** — accordi art. 28 GDPR con ogni provider di produzione (hosting, email, PSP, video, analytics).
- [ ] **RoPA (Registro Attività di Trattamento)** — redigere per ogni attività di trattamento identificata.
- [ ] **DPIA screening** — obbligatorio prima del go-live con dati clinici reali, geolocalizzazione, video, ranking/profiling.
- [ ] **Deontologia veterinaria** — far revisionare copy e workflow del video-consulto, referti, specializzazioni e advertising dei profili da un veterinario e/o dall'Ordine FNOVI. **[DA VALIDARE CON VETERINARIO/ORDINE]**
- [ ] **Revisione fiscale** — far validare calcoli ENPAV, IVA, regime forfettario, bollo, sistema di numerazione fatture, SdI, Sistema TS. **[DA VALIDARE CON COMMERCIALISTA]**

---

## 5. Provider esterni identificati

| Provider                            | Tipo                          | Stato attuale                          | Azione richiesta                      |
| ----------------------------------- | ----------------------------- | -------------------------------------- | ------------------------------------- |
| Supabase                            | Auth + DB + Storage           | Menzionato nei commenti, non integrato | DPA, configurazione RLS, crittografia |
| PSP (Stripe/Nexi/altro)             | Pagamenti                     | Non integrato                          | Selezione, DPA, PCI DSS, SCA          |
| Email provider (SendGrid/SES/altro) | Email transazionale/marketing | Non integrato                          | DPA, trasferimento extra-SEE, opt-out |
| Video provider (Daily/Jitsi/altro)  | Video-consulto                | Non integrato                          | DPA, no-recording default, metadati   |
| Hosting                             | Infrastruttura                | Non definito                           | DPA, EEA o SCCs                       |
| Analytics (GA/Plausible/altro)      | Analytics                     | Non integrato                          | Consenso cookie, DPA                  |
| Error reporting (Sentry/altro)      | Debug                         | Non integrato                          | DPA, no-PII in logs                   |

---

## 6. Checklist go-live

### Legale/privacy (BLOCKER se non completato)

- [ ] Privacy Policy finale con dati aziendali reali, validata con legale/DPO
- [ ] Terms of Service finali, validati con legale
- [ ] Condizioni per veterinari (P2B) redatte e validate
- [ ] Cookie Policy aggiornata con cookie reali
- [ ] Cookie banner se sono presenti cookie non tecnici
- [ ] Consenso marketing separato e non pre-spuntato
- [ ] DPA firmati con tutti i provider attivi
- [ ] RoPA compilato
- [ ] DPIA screening effettuato
- [ ] Data breach runbook predisposto
- [ ] Contatto privacy operativo

### Sicurezza (BLOCKER se non completato)

- [ ] HTTPS/TLS su tutti gli endpoint
- [ ] RBAC server-side su ogni endpoint con dati personali
- [ ] Secrets mai nel frontend o nel repository
- [ ] .env.example senza valori reali
- [ ] MFA per vet e admin
- [ ] Security headers implementati
- [ ] Rate limiting su auth, form, API
- [ ] Dati clinici/fiscali cifrati at-rest
- [ ] Audit log attivati

### Business/fiscale (HIGH se non completato)

- [ ] Modello fatturazione scelto e validato con commercialista
- [ ] Flusso SdI definito o PSP con e-fattura integrata
- [ ] Sistema TS verificato
- [ ] PSP selezionato e integrato (no PAN/CVV stored)
- [ ] Policy cancellazione/no-show definita e visibile pre-booking
- [ ] Vet verification process operativo

### Veterinario/deontologico (HIGH se non completato)

- [ ] Processo verifica albo per ogni veterinario definito
- [ ] Copy video-consulto revisionato da veterinario/FNOVI
- [ ] Workflow referto approvato da veterinario
- [ ] Nessuna autocertificazione specializzazione non documentata

---

## 7. Fonti di riferimento

- GDPR (Reg. UE 2016/679) — art. 5, 6, 9, 13, 17, 20, 28, 30, 35
- Codice Privacy (D.Lgs. 196/2003 mod.) — art. 130 (marketing)
- Garante Privacy: Linee guida cookie 2021 (Provv. n. 231/2021)
- EDPB Guidelines 07/2020 (controller/processor), 05/2020 (consenso)
- Codice del Consumo (D.Lgs. 206/2005) — art. 22(5-bis) recensioni, art. 49 precontractual info
- Reg. UE 2019/1150 Platform-to-Business (P2B) — ranking, termini vet
- Reg. UE 2022/2065 Digital Services Act (DSA) — content moderation
- FNOVI Codice Deontologico Medico Veterinario (2019) — art. 40, 47, 48, 51, 52
- FNOVI Linee guida telemedicina (2023)
- D.Lgs. 127/2015 e D.Lgs. 148/2023 — fatturazione elettronica SdI
- Sistema Tessera Sanitaria — spese veterinarie
- PSD2 / EBA RTS — SCA, card-on-file

---

_Documento generato da MioVeterinario Legal Counsel Skill — 18 giugno 2026_  
_Non costituisce parere legale. Richiedere sign-off professionale prima del go-live._
