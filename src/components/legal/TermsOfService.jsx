/* Condizioni d'uso — versione provvisoria per prototipo/beta.
   [DA VALIDARE CON LEGALE PRIMA DEL GO-LIVE]
   Tutti i placeholder [XXX] devono essere sostituiti con dati reali. */

import { TEAL, colors, fontSize, radius } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <h3 style={{ color: TEAL, fontSize: fontSize.xl, marginBottom: 8, marginTop: 0 }}>{title}</h3>
    <div style={{ color: colors.textMedium, fontSize: fontSize.base, lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function TermsOfService({ onBack }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 20px 40px" }}>
      <Btn small variant="light" onClick={onBack} style={{ marginBottom: 16 }}>
        ← Indietro
      </Btn>

      <h1 style={{ color: TEAL, fontSize: 26, marginBottom: 4 }}>Condizioni d'uso</h1>
      <p style={{ color: colors.textMuted, fontSize: fontSize.md, marginBottom: 24 }}>
        Versione provvisoria — prototipo beta · Ultimo aggiornamento: giugno 2026
        <br />
        <b style={{ color: colors.warning }}>
          ⚠️ Documento da validare con legale prima del go-live [DA VALIDARE CON LEGALE]
        </b>
      </p>

      <div
        style={{
          background: colors.bgOrangeLight,
          borderRadius: radius.lg,
          padding: "12px 16px",
          marginBottom: 24,
          fontSize: fontSize.md,
          color: colors.textMedium,
          lineHeight: 1.7,
        }}
      >
        <b>Avviso beta:</b> MioVeterinario è in fase di sviluppo e test. Le funzionalità di prenotazione, pagamento e
        fatturazione mostrate sono simulazioni. Nessuna transazione reale viene processata in questa versione.
      </div>

      <Section title="1. Identità e ruolo della piattaforma">
        <p>
          <b>[Ragione sociale]</b> ("MioVeterinario", "noi", "la piattaforma") è un servizio di intermediazione digitale
          che consente ai proprietari di animali domestici di trovare e prenotare visite veterinarie, e ai
          veterinari/cliniche di gestire la propria agenda e i propri pazienti.
        </p>
        <p style={{ marginTop: 8 }}>
          <b>MioVeterinario non è un fornitore di servizi veterinari.</b> I servizi medici veterinari sono erogati
          direttamente e in piena autonomia professionale dai veterinari e dalle cliniche presenti sulla piattaforma,
          che ne sono gli esclusivi responsabili. MioVeterinario non esercita controllo sull'atto medico e non è parte
          del contratto di prestazione professionale tra il proprietario dell'animale e il veterinario.
        </p>
      </Section>

      <Section title="2. Accettazione delle condizioni">
        <p>
          Accedendo e utilizzando MioVeterinario, accetti queste Condizioni d'uso. Se non le accetti, non utilizzare il
          servizio. Le presenti condizioni si applicano insieme alla nostra Informativa sulla Privacy e alla Cookie
          Policy.
        </p>
      </Section>

      <Section title="3. Requisiti di utilizzo">
        <ul style={{ paddingLeft: 20 }}>
          <li>Devi avere almeno 18 anni (o il consenso di un genitore/tutore se minorenne).</li>
          <li>Devi fornire informazioni veritiere e aggiornate al momento della registrazione.</li>
          <li>Sei responsabile della sicurezza del tuo account e delle attività svolte tramite esso.</li>
          <li>Non puoi creare account per conto di terzi senza autorizzazione.</li>
        </ul>
      </Section>

      <Section title="4. Servizi offerti dalla piattaforma">
        <p>MioVeterinario consente di:</p>
        <ul style={{ paddingLeft: 20, marginTop: 6 }}>
          <li>Cercare veterinari per città, specializzazione e tipo di animale.</li>
          <li>Visualizzare profili, listini prezzi e disponibilità dei veterinari.</li>
          <li>
            Prenotare visite in clinica, a domicilio e video-consulti (quando disponibili e professionalente
            appropriati).
          </li>
          <li>Gestire profili degli animali, storico visite, referti e vaccinazioni.</li>
          <li>Visualizzare le fatture emesse dai veterinari.</li>
          <li>Lasciare recensioni sulle visite completate.</li>
        </ul>
        <p style={{ marginTop: 8 }}>
          I prezzi indicati sono a titolo orientativo e possono variare. Il prezzo definitivo è quello comunicato dal
          veterinario prima della prestazione. [DA VALIDARE CON LEGALE — precontractual information art. 49 Cod.
          Consumo]
        </p>
      </Section>

      <Section title="5. Prenotazioni, cancellazioni e no-show">
        <p>
          [TODO — definire e inserire policy di cancellazione e no-show prima del go-live. Includere: termini di
          cancellazione gratuita, costi in caso di cancellazione tardiva o mancata presentazione, modalità di rimborso.]
        </p>
        <p style={{ marginTop: 8 }}>
          <b>Policy attuale (versione beta):</b> Le prenotazioni effettuate in questa versione demo non hanno effetti
          reali. Prima del lancio pubblico sarà disponibile una policy dettagliata su cancellazioni, rimborsi e penali
          per no-show. [DA VALIDARE CON LEGALE E COMMERCIALISTA]
        </p>
      </Section>

      <Section title="6. Prezzi, pagamenti e fatturazione">
        <p>
          Il contratto di acquisto dei servizi veterinari è tra il proprietario dell'animale e il veterinario/clinica.{" "}
          <b>Il veterinario è il soggetto che emette la fattura o il documento fiscale</b> per le prestazioni erogate e
          ne risponde fiscalmente. MioVeterinario può fornire supporto tecnico alla fatturazione ma non è il soggetto
          emittente della fattura veterinaria. [DA VALIDARE CON COMMERCIALISTA]
        </p>
        <p style={{ marginTop: 8 }}>
          I pagamenti avvengono tramite provider di pagamento certificato (PSP). MioVeterinario non conserva i dati
          della carta di credito. [DA IMPLEMENTARE prima del go-live]
        </p>
        <p style={{ marginTop: 8 }}>
          Le commissioni applicate ai veterinari per l'utilizzo della piattaforma saranno specificate nelle Condizioni
          per Professionisti. [DA VALIDARE CON LEGALE — P2B Reg. UE 2019/1150]
        </p>
      </Section>

      <Section title="7. Video-consulti">
        <div
          style={{
            background: "#FFF3CD",
            borderRadius: radius.md,
            padding: "10px 14px",
            marginBottom: 10,
            fontSize: fontSize.base,
            lineHeight: 1.7,
          }}
        >
          <b>⚠️ Importante — limiti del video-consulto:</b>
          <br />
          La consulenza a distanza (video-consulto){" "}
          <b>non sostituisce una visita clinica fisica quando questa è necessaria</b>. Il video-consulto può essere
          appropriato per follow-up, monitoraggio di animali già in cura, domande su alimentazione o comportamento, o
          triage orientativo. In caso di emergenza, sospetto di malattia grave o peggioramento improvviso, contatta
          immediatamente un pronto soccorso veterinario.
        </div>
        <p>
          Il veterinario è l'unico competente a valutare se il video-consulto è appropriato e può interrompere la
          sessione e richiedere una visita in presenza in qualsiasi momento. MioVeterinario non garantisce diagnosi,
          terapie o prescrizioni tramite video-consulto. [DA VALIDARE CON VETERINARIO/ORDINE]
        </p>
      </Section>

      <Section title="8. Referti e documentazione clinica">
        <p>
          I referti sono redatti, approvati e firmati digitalmente dal veterinario. Il veterinario è l'unico
          responsabile del contenuto clinico. MioVeterinario fornisce lo strumento tecnico per la redazione e la
          condivisione, ma non partecipa alla valutazione medica né ne risponde. Il proprietario dell'animale può
          visualizzare i referti relativi al proprio animale, ma non può modificarli. [DA VALIDARE CON
          VETERINARIO/ORDINE]
        </p>
      </Section>

      <Section title="9. Recensioni">
        <p>
          Le recensioni "verificate" possono essere pubblicate solo da utenti che hanno completato una visita tramite
          MioVeterinario. Le recensioni devono:
        </p>
        <ul style={{ paddingLeft: 20, marginTop: 6 }}>
          <li>Essere veritiere e riferirsi all'esperienza personale.</li>
          <li>Non contenere dati clinici, diagnosi, farmaci o informazioni riservate.</li>
          <li>Non essere offensive, diffamatorie o discriminatorie.</li>
          <li>Non riguardare terze persone non coinvolte nella visita.</li>
        </ul>
        <p style={{ marginTop: 8 }}>
          MioVeterinario si riserva il diritto di moderare, modificare o rimuovere recensioni che violino queste regole.
          Puoi segnalare una recensione inappropriata tramite [canale segnalazione — da implementare]. [DA VALIDARE CON
          LEGALE — DSA e Cod. Consumo art. 22(5-bis)]
        </p>
      </Section>

      <Section title="10. Condizioni per i veterinari">
        <p>I veterinari e le cliniche che utilizzano MioVeterinario accettano che:</p>
        <ul style={{ paddingLeft: 20, marginTop: 6 }}>
          <li>Il loro profilo sarà visibile agli utenti della piattaforma.</li>
          <li>L'iscrizione all'Albo e il titolo professionale devono essere veritieri e aggiornati.</li>
          <li>Le specializzazioni dichiarate devono essere reali e documentabili.</li>
          <li>
            La pubblicità del profilo rispetta il Codice Deontologico del Medico Veterinario (FNOVI): nessuna
            affermazione comparativa, ingannevole o non documentabile. [DA VALIDARE CON VETERINARIO/ORDINE]
          </li>
          <li>
            Il veterinario rimane responsabile dell'atto medico, dei referti, delle prescrizioni e degli adempimenti
            fiscali.
          </li>
        </ul>
        <p style={{ marginTop: 8 }}>
          Le condizioni economiche, le commissioni e le specifiche tecniche per i professionisti saranno disponibili in
          un documento separato (Condizioni per Professionisti). [DA REDARRE E VALIDARE CON LEGALE]
        </p>
      </Section>

      <Section title="11. Ordinamento e ranking dei veterinari">
        <p>
          L'ordinamento predefinito dei risultati di ricerca si basa su: <b>valutazione media delle recensioni</b> e, in
          alternativa, <b>prezzo della visita base</b>. In questa versione nessun risultato è sponsorizzato o promosso a
          pagamento. Eventuali placement sponsorizzati futuri saranno chiaramente etichettati. [DA VALIDARE CON LEGALE —
          P2B Reg. UE 2019/1150 e DSA]
        </p>
      </Section>

      <Section title="12. Limitazione di responsabilità">
        <p>
          MioVeterinario non è responsabile per: (a) la qualità, l'adeguatezza o i risultati delle prestazioni
          veterinarie erogate dai professionisti sulla piattaforma; (b) errori o omissioni nei referti, nelle diagnosi o
          nelle terapie; (c) mancata disponibilità del veterinario; (d) danni derivanti dall'uso improprio del
          video-consulto. [DA VALIDARE CON LEGALE]
        </p>
      </Section>

      <Section title="13. Legge applicabile e foro competente">
        <p>
          Le presenti Condizioni sono regolate dalla legge italiana. Per le controversie con consumatori si applica il
          foro del domicilio del consumatore. [DA VALIDARE CON LEGALE]
        </p>
        <p style={{ marginTop: 8 }}>
          Per la risoluzione alternativa delle controversie (ADR/ODR):{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: TEAL }}
          >
            piattaforma ODR europea
          </a>
          . [DA CONFIGURARE]
        </p>
      </Section>

      <Section title="14. Modifiche alle condizioni">
        <p>
          MioVeterinario si riserva di modificare queste condizioni. Le modifiche saranno comunicate con almeno 15
          giorni di preavviso agli utenti registrati. L'uso continuato della piattaforma dopo la data di entrata in
          vigore costituisce accettazione delle nuove condizioni.
        </p>
      </Section>

      <Section title="15. Contatti e reclami">
        <p>
          Per reclami o richieste di informazioni: <b>[email supporto]</b>
          <br />
          Per questioni privacy: <b>[email privacy]</b>
        </p>
      </Section>

      <div
        style={{
          marginTop: 32,
          padding: "12px 16px",
          background: colors.bgLighter,
          borderRadius: radius.lg,
          fontSize: fontSize.sm,
          color: colors.textMuted,
        }}
      >
        Documento generato da MioVeterinario · Versione provvisoria · [DA VALIDARE CON LEGALE PRIMA DEL GO-LIVE]
      </div>
    </div>
  );
}
