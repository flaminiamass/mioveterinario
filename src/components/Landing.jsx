import { TEAL, ORANGE, colors, fontSize, radius, shadow } from "../styles/tokens.js";
import Card from "./ui/Card.jsx";
import LegalFooter from "./legal/LegalFooter.jsx";
import logoImg from "../assets/logo.png";

export default function Landing({ onLogin, onNav }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24, textAlign: "center" }}>
      <div style={{ marginTop: 40 }}>
        <img
          src={logoImg}
          alt="MioVeterinario logo"
          style={{
            width: 110,
            height: 110,
            borderRadius: radius.circle,
            margin: "0 auto",
            display: "block",
            boxShadow: shadow.logo,
          }}
        />
        <h1 style={{ fontSize: 34, margin: "18px 0 4px", color: ORANGE, fontWeight: 900 }}>
          Mio<span style={{ color: TEAL }}>Veterinario</span>
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: fontSize.xl, margin: 0 }}>
          Prenota una visita veterinaria senza telefonare
        </p>
        <p style={{ color: colors.textMuted, fontSize: fontSize.base, margin: "10px 0 0", lineHeight: 1.55 }}>
          Vedi gli slot liberi vicino a te, scegli giorno e ora, controlla prezzo e recensioni, conferma dall’app.
        </p>
      </div>

      {/* Beta disclaimer — BLOCKER fix: chiarire che è un prototipo */}
      <div
        style={{
          marginTop: 20,
          padding: "10px 16px",
          background: colors.bgOrangeLight,
          borderRadius: radius.lg,
          fontSize: fontSize.md,
          color: colors.textMedium,
          lineHeight: 1.6,
          textAlign: "left",
        }}
      >
        <b>⚠️ Versione beta — prototipo dimostrativo</b>
        <br />
        Questa è una demo di sviluppo. Le prenotazioni, i pagamenti e i dati visualizzati sono <b>simulati</b> e non
        hanno effetti reali. Nessun dato personale viene raccolto o trasmesso in questa versione.
      </div>

      <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
        <Card
          onClick={() => onLogin("owner")}
          style={{ border: `2px solid ${TEAL}22`, textAlign: "left", display: "flex", gap: 14, alignItems: "center" }}
        >
          <div style={{ fontSize: 36 }}>🧑‍🤝‍🧑</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: fontSize["2xl"], color: TEAL }}>Sono un Proprietario</div>
            <div style={{ color: colors.textSecondary, fontSize: fontSize.md }}>
              Vedi slot disponibili, scegli orario e prenota dall’app.
            </div>
          </div>
        </Card>
        <Card
          onClick={() => onLogin("vet")}
          style={{ border: `2px solid ${ORANGE}33`, textAlign: "left", display: "flex", gap: 14, alignItems: "center" }}
        >
          <div style={{ fontSize: 36 }}>👩‍⚕️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: fontSize["2xl"], color: ORANGE }}>Sono un Veterinario</div>
            <div style={{ color: colors.textSecondary, fontSize: fontSize.md }}>
              Agenda, pazienti, referti e fatturazione
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 44, textAlign: "left" }}>
        <h3 style={{ color: colors.textDark }}>Come funziona</h3>
        {[
          ["🐾", "Scegli", "Scegli animale e prestazione in pochi tap"],
          ["📅", "Vedi slot", "Guarda gli slot liberi vicino a te con prezzo e recensioni"],
          ["🔔", "Prenota", "Confermi dall’app e ricevi un promemoria"],
        ].map(([ic, t, d]) => (
          <div key={t} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
            <div style={{ fontSize: 24 }}>{ic}</div>
            <div>
              <b style={{ color: TEAL }}>{t}</b>
              <div style={{ color: colors.textSecondary, fontSize: fontSize.base }}>{d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Nota accesso simulato */}
      <p style={{ color: colors.textMuted, fontSize: fontSize.sm, marginTop: 30 }}>
        Prototipo demo · accesso simulato senza credenziali reali
      </p>

      {/* Footer legale */}
      <LegalFooter onNav={onNav} />
    </div>
  );
}
