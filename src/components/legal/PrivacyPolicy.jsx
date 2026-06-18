/* Privacy Policy — versione provvisoria per prototipo/beta.
   [DA VALIDARE CON LEGALE E DPO PRIMA DEL GO-LIVE]
   Tutti i placeholder [XXX] devono essere sostituiti con dati reali. */

import { TEAL, colors, fontSize, radius } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <h3 style={{ color: TEAL, fontSize: fontSize.xl, marginBottom: 8, marginTop: 0 }}>{title}</h3>
    <div style={{ color: colors.textMedium, fontSize: fontSize.base, lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function PrivacyPolicy({ onBack }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 20px 40px" }}>
      <Btn small variant="light" onClick={onBack} style={{ marginBottom: 16 }}>← Indietro</Btn>

      <h1 style={{ color: TEAL, fontSize: 26, marginBottom: 4 }}>Informativa sulla Privacy</h1>
      <p style={{ color: colors.textMuted, fontSize: fontSize.md, marginBottom: 24 }}>
        Versione provvisoria — prototipo beta · Ultimo aggiornamento: giugno 2026<br/>
        <b style={{ color: colors.warning }}>⚠️ Documento da validare con legale/DPO prima del go-live [DA VALIDARE CON LEGALE]</b>
      </p>

      <div style={{ background: colors.bgOrangeLight, borderRadius: radius.lg, padding: "12px 16px", marginBottom: 24, fontSize: fontSize.md, color: colors.textMedium, lineHeight: 1.7 }}>
        <b>Nota sul prototipo:</b> MioVeterinario è attualmente in fase di sviluppo e validazione. Nessun dato reale viene raccolto o trasmesso a terzi in questa versione demo. I dati visualizzati sono fittizi e generati esclusivamente per testare le funzionalità.
      </div>

      <Section title="1. Titolare del trattamento">
        <p>Il Titolare del trattamento è <b>[Ragione sociale da inserire]</b>, con sede in <b>[Indirizzo]</b>, P.IVA <b>[P.IVA]</b>, email: <b>[email privacy@dominio]</b>.</p>
        <p style={{ marginTop: 8 }}>Per esercitare i tuoi diritti o per qualsiasi richiesta relativa alla privacy, scrivi a: <b>[email privacy]</b></p>
      </Section>

      <Section title="2. Dati raccolti e finalità">
        <p><b>Proprietari di animali:</b></p>
        <ul style={{ paddingLeft: 20, marginTop: 6, marginBottom: 12 }}>
          <li>Nome, email, telefono, indirizzo (creazione account e prenotazioni)</li>
          <li>Codice fiscale (fatturazione)</li>
          <li>Dati degli animali: nome, specie, razza, data di nascita, peso, sesso, microchip (gestione profilo animale e prenotazioni)</li>
          <li>Note inserite liberamente nella prenotazione (comunicazione con il veterinario)</li>
          <li>Storico appuntamenti, referti, vaccini (gestione sanitaria dell'animale)</li>
          <li>Dati di pagamento: gestiti esclusivamente da provider PSP certificato — MioVeterinario non conserva numeri di carta [DA VALIDARE CON COMMERCIALISTA]</li>
        </ul>
        <p><b>Veterinari e cliniche:</b></p>
        <ul style={{ paddingLeft: 20, marginTop: 6 }}>
          <li>Nome, titolo professionale, numero di iscrizione all'Albo, specializzazioni, indirizzo clinica, email, telefono (iscrizione e pubblicazione profilo)</li>
          <li>P.IVA, codice fiscale, regime fiscale (fatturazione e adempimenti fiscali)</li>
          <li>Agenda, storico appuntamenti, pazienti, referti, fatture emesse (gestione attività professionale)</li>
        </ul>
        <p style={{ marginTop: 8 }}><b>Dati tecnici:</b> indirizzo IP, tipo di dispositivo, log di accesso (sicurezza e corretto funzionamento del servizio).</p>
      </Section>

      <Section title="3. Base giuridica del trattamento">
        <ul style={{ paddingLeft: 20 }}>
          <li><b>Esecuzione del contratto (art. 6(1)(b) GDPR):</b> creazione account, prenotazioni, gestione visite, fatturazione.</li>
          <li><b>Obbligo legale (art. 6(1)(c) GDPR):</b> conservazione documenti fiscali, adempimenti normativi.</li>
          <li><b>Legittimo interesse (art. 6(1)(f) GDPR):</b> sicurezza della piattaforma, prevenzione frodi, miglioramento del servizio.</li>
          <li><b>Consenso (art. 6(1)(a) GDPR):</b> comunicazioni di marketing, newsletter, cookie non tecnici. Il consenso può essere revocato in qualsiasi momento.</li>
        </ul>
      </Section>

      <Section title="4. Dati veterinari e riservatezza">
        <p>I referti, le diagnosi, i trattamenti e i farmaci registrati dal veterinario costituiscono documentazione clinica riservata. Il veterinario che redige il referto rimane responsabile del suo contenuto come professionista sanitario indipendente.</p>
        <p style={{ marginTop: 8 }}>MioVeterinario tratta questi dati per conto del veterinario (responsabile del trattamento ai sensi dell'art. 28 GDPR) e li rende accessibili esclusivamente al proprietario dell'animale cui si riferiscono. [DA VALIDARE CON LEGALE]</p>
        <p style={{ marginTop: 8 }}><b>Importante:</b> nei campi a testo libero (note prenotazione, commenti) inserisci solo informazioni utili per la visita dell'animale. Non inserire dati sanitari tuoi o di altre persone se non strettamente necessario per la cura dell'animale.</p>
      </Section>

      <Section title="5. Conservazione dei dati">
        <ul style={{ paddingLeft: 20 }}>
          <li><b>Dati account:</b> per tutta la durata del rapporto e per il periodo necessario a tutela di eventuali controversie.</li>
          <li><b>Dati clinici (referti, vaccini):</b> secondo la normativa professionale applicabile; il veterinario definisce i tempi di conservazione della propria documentazione clinica.</li>
          <li><b>Documenti fiscali (fatture):</b> 10 anni dalla data di emissione, ai sensi della normativa fiscale italiana. [DA VALIDARE CON COMMERCIALISTA]</li>
          <li><b>Log di sicurezza:</b> 6-12 mesi.</li>
          <li><b>Consensi marketing:</b> fino alla revoca + periodo necessario a dimostrare la liceità del trattamento.</li>
        </ul>
      </Section>

      <Section title="6. Provider esterni (sub-responsabili del trattamento)">
        <p>MioVeterinario utilizza i seguenti provider per erogare il servizio. Tutti trattano i dati solo su istruzione di MioVeterinario e in conformità al GDPR:</p>
        <ul style={{ paddingLeft: 20, marginTop: 6 }}>
          <li><b>Hosting e infrastruttura:</b> [Provider da indicare] — [Paese/EEA]</li>
          <li><b>Email transazionale:</b> [Provider da indicare] — [Paese/EEA]</li>
          <li><b>Pagamenti:</b> [Provider PSP da indicare] — [Paese/EEA] — non riceve dati clinici</li>
          <li><b>Analytics:</b> [Provider da indicare o "non utilizzato"] — [Paese/EEA]</li>
        </ul>
        <p style={{ marginTop: 8 }}>Per i trasferimenti extra-SEE si applicano le clausole contrattuali standard approvate dalla Commissione europea o altri meccanismi di adeguatezza. [DA VALIDARE CON LEGALE]</p>
      </Section>

      <Section title="7. I tuoi diritti (artt. 15-22 GDPR)">
        <p>Hai il diritto di:</p>
        <ul style={{ paddingLeft: 20, marginTop: 6 }}>
          <li><b>Accesso:</b> sapere quali dati trattiamo e ottenerne copia.</li>
          <li><b>Rettifica:</b> correggere dati inesatti o incompleti.</li>
          <li><b>Cancellazione ("diritto all'oblio"):</b> ottenere la cancellazione dei tuoi dati, salvo obblighi legali di conservazione.</li>
          <li><b>Limitazione:</b> limitare il trattamento in determinati casi previsti dal GDPR.</li>
          <li><b>Portabilità:</b> ricevere i tuoi dati in formato strutturato e leggibile da macchina.</li>
          <li><b>Opposizione:</b> opporti al trattamento basato sul legittimo interesse, incluso il marketing diretto.</li>
          <li><b>Revoca del consenso:</b> ritirare in qualsiasi momento il consenso prestato, senza pregiudicare la liceità del trattamento precedente.</li>
        </ul>
        <p style={{ marginTop: 8 }}>Per esercitare i tuoi diritti scrivi a: <b>[email privacy]</b>. Hai inoltre il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" style={{ color: TEAL }}>www.garanteprivacy.it</a>).</p>
        <p style={{ marginTop: 8 }}>
          <b>Cancellazione account e portabilità dati:</b> [TODO — implementare funzione di export e cancellazione account prima del go-live]
        </p>
      </Section>

      <Section title="8. Sicurezza">
        <p>Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati, tra cui: connessioni HTTPS/TLS, controllo degli accessi basato sui ruoli, cifratura dei dati sensibili a riposo, log di accesso alle informazioni cliniche e fiscali.</p>
        <p style={{ marginTop: 8 }}>In caso di violazione dei dati personali che possa comportare rischi per i tuoi diritti e libertà, riceverai tempestiva comunicazione ai sensi dell'art. 34 GDPR. [DA VALIDARE CON LEGALE — predisporre data breach runbook]</p>
      </Section>

      <Section title="9. Cookie e tracciamento">
        <p>Vedi la nostra <b>Cookie Policy</b> per i dettagli sui cookie tecnici e non tecnici utilizzati. In questa versione demo non sono attivi cookie di profilazione o tracciamento di terze parti.</p>
      </Section>

      <Section title="10. Contatti">
        <p>Per qualsiasi domanda su questa informativa:<br/>
        Email: <b>[email privacy]</b><br/>
        Indirizzo: <b>[Ragione sociale], [Indirizzo]</b></p>
      </Section>

      <div style={{ marginTop: 32, padding: "12px 16px", background: colors.bgLighter, borderRadius: radius.lg, fontSize: fontSize.sm, color: colors.textMuted }}>
        Documento generato da MioVeterinario · Versione provvisoria · [DA VALIDARE CON LEGALE E DPO PRIMA DEL GO-LIVE]
      </div>
    </div>
  );
}
