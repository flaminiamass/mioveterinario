# Cookie and tracking implementation template

## Cookie inventory

| Name/provider | Type                          | Purpose   |   Duration | Data shared | Consent needed? | Blocking mechanism |
| ------------- | ----------------------------- | --------- | ---------: | ----------- | --------------- | ------------------ |
| [cookie]      | technical/analytics/marketing | [purpose] | [duration] | [data]      | yes/no          | [CMP/config]       |

## Banner copy - first layer

Title: "Gestisci cookie e preferenze"

Text:
"Usiamo cookie tecnici necessari al funzionamento del sito. Con il tuo consenso possiamo usare anche cookie e strumenti simili per statistiche, migliorare il servizio e, se attivati, marketing. Puoi accettare, rifiutare o scegliere le preferenze. Puoi modificarle in qualsiasi momento."

Buttons:

- "Rifiuta non necessari"
- "Personalizza"
- "Accetta tutti"

Closing the banner without action must keep non-technical cookies off.

## Preferences categories

### Necessari

Always active. Needed for security, login, session, consent choices.

### Statistiche

Off by default. Use only after consent unless legal/privacy team validates a strict privacy-preserving analytics setup.

### Marketing/profilazione

Off by default. Use only after consent. Do not use pet/referto/appointment data for ad targeting.

## Implementation requirements

- [ ] No non-technical script loads before consent.
- [ ] Consent state saved with policy version and timestamp.
- [ ] User can reopen preferences from footer/account settings.
- [ ] Reject is as easy as accept.
- [ ] No dark patterns, pre-ticked boxes, or bundled consent.
- [ ] Tag manager defaults to denied.
- [ ] Server-side analytics also respects consent where required.
- [ ] Consent log can prove choices.
