/* Cookie Policy — versione provvisoria per prototipo/beta.
   [DA VALIDARE CON LEGALE/DPO PRIMA DEL GO-LIVE]
   Segue linee guida Garante Privacy (Provv. n. 231 del 10/06/2021). */

import { TEAL, colors, fontSize, radius } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <h3 style={{ color: TEAL, fontSize: fontSize.xl, marginBottom: 8, marginTop: 0 }}>{title}</h3>
    <div style={{ color: colors.textMedium, fontSize: fontSize.base, lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function CookiePolicy({ onBack }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 20px 40px" }}>
      <Btn small variant="light" onClick={onBack} style={{ marginBottom: 16 }}>← Indietro</Btn>

      <h1 style={{ color: TEAL, fontSize: 26, marginBottom: 4 }}>Cookie Policy</h1>
      <p style={{ color: colors.textMuted, fontSize: fontSize.md, marginBottom: 24 }}>
        Versione provvisoria — prototipo beta · Ultimo aggiornamento: giugno 2026<br/>
        <b style={{ color: colors.warning }}>⚠️ Documento da validare con legale/DPO prima del go-live [DA VALIDARE CON LEGALE]</b>
      </p>

      <div style={{ background: "#E8F5E9", borderRadius: radius.lg, padding: "12px 16px", marginBottom: 24, fontSize: fontSize.md, color: "#2E7D32", lineHeight: 1.7 }}>
        <b>✅ Versione demo:</b> In questa versione di sviluppo, MioVeterinario <b>non utilizza cookie di profilazione, tracciamento, analytics o marketing</b>. Non vengono installati cookie di terze parti. L'app utilizza esclusivamente lo stato in-memory del browser (React state) per il funzionamento della demo.
      </div>

      <Section title="1. Cosa sono i cookie">
        <p>I cookie sono piccoli file di testo che un sito web salva sul tuo dispositivo durante la navigazione. Possono essere "di sessione" (cancellati alla chiusura del browser) o "persistenti" (conservati per un periodo definito).</p>
      </Section>

      <Section title="2. Cookie tecnici (necessari)">
        <p>I cookie tecnici sono necessari per il funzionamento del sito e non richiedono il tuo consenso. MioVeterinario utilizzerà in produzione solo i seguenti cookie tecnici:</p>
        <div style={{ marginTop: 10, border: `1px solid ${colors.borderLight}`, borderRadius: radius.md, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: fontSize.md }}>
            <thead>
              <tr style={{ background: colors.bgTealSel }}>
                <th style={{ padding: "10px 12px", textAlign: "left", color: TEAL, fontWeight: 700 }}>Nome</th>
                <th style={{ padding: "10px 12px", textAlign: "left", color: TEAL, fontWeight: 700 }}>Finalità</th>
                <th style={{ padding: "10px 12px", textAlign: "left", color: TEAL, fontWeight: 700 }}>Durata</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: `1px solid ${colors.borderLight}` }}>
                <td style={{ padding: "10px 12px" }}>session_token</td>
                <td style={{ padding: "10px 12px" }}>Gestione sessione autenticata</td>
                <td style={{ padding: "10px 12px" }}>Sessione</td>
              </tr>
              <tr style={{ borderTop: `1px solid ${colors.borderLight}`, background: colors.bgLighter }}>
                <td style={{ padding: "10px 12px" }}>csrf_token</td>
                <td style={{ padding: "10px 12px" }}>Protezione CSRF</td>
                <td style={{ padding: "10px 12px" }}>Sessione</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 8, fontSize: fontSize.sm, color: colors.textMuted }}>I cookie tecnici elencati sono a titolo indicativo e saranno definiti in dettaglio con il team di sviluppo prima del go-live.</p>
      </Section>

      <Section title="3. Cookie analitici e di profilazione">
        <p>
          In questa versione demo non sono presenti cookie analitici o di profilazione.
        </p>
        <p style={{ marginTop: 8 }}>
          Prima del go-live, se si intende integrare strumenti di analytics (es. Google Analytics, Plausible, Mixpanel, Hotjar o simili), sarà necessario:
        </p>
        <ul style={{ paddingLeft: 20, marginTop: 6 }}>
          <li>Verificare se lo strumento rientra nelle esenzioni per analytics in forma aggregata e anonimizzata (Linee guida Garante 2021).</li>
          <li>In caso contrario, attivare un banner cookie che permetta di rifiutare facilmente i cookie non tecnici prima della loro installazione.</li>
          <li>Assicurarsi che il rifiuto sia facile quanto l'accettazione (nessuna casella pre-spuntata).</li>
          <li>Registrare il consenso con data, versione della policy e scelta dell'utente.</li>
        </ul>
        <p style={{ marginTop: 8 }}>[DA VALUTARE E IMPLEMENTARE CON LEGALE prima del go-live]</p>
      </Section>

      <Section title="4. Google Fonts e asset di terze parti">
        <p>In questa versione demo non vengono caricati Google Fonts, font di terze parti o asset CDN che trasmettono l'IP dell'utente a server esteri. Se in futuro venissero integrati, occorre valutare l'impatto privacy e le basi giuridiche appropriate. [DA VERIFICARE prima del go-live]</p>
      </Section>

      <Section title="5. Come gestire i cookie">
        <p>Puoi controllare e gestire i cookie tramite le impostazioni del tuo browser:</p>
        <ul style={{ paddingLeft: 20, marginTop: 6 }}>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: TEAL }}>Chrome</a></li>
          <li><a href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" target="_blank" rel="noopener noreferrer" style={{ color: TEAL }}>Firefox</a></li>
          <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" style={{ color: TEAL }}>Safari</a></li>
        </ul>
        <p style={{ marginTop: 8 }}>Disabilitare i cookie tecnici potrebbe compromettere il funzionamento del servizio.</p>
      </Section>

      <Section title="6. Aggiornamenti">
        <p>Questa Cookie Policy può essere aggiornata. Le modifiche saranno indicate con la data di aggiornamento in cima al documento. [DA VALIDARE CON LEGALE]</p>
      </Section>

      <Section title="7. Contatti">
        <p>Per domande sui cookie e sul trattamento dei dati: <b>[email privacy]</b></p>
      </Section>

      <div style={{ marginTop: 32, padding: "12px 16px", background: colors.bgLighter, borderRadius: radius.lg, fontSize: fontSize.sm, color: colors.textMuted }}>
        Documento generato da MioVeterinario · Versione provvisoria · [DA VALIDARE CON LEGALE/DPO PRIMA DEL GO-LIVE]
      </div>
    </div>
  );
}
