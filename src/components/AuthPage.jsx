/*
 * AuthPage — Pagina di login e registrazione.
 *
 * Due modalità:
 * - "login": email + password → accesso
 * - "signup": email + password + nome + ruolo → registrazione
 *
 * Usa Supabase Auth per l'autenticazione.
 * Stile coerente con il resto dell'app (teal/orange, design tokens).
 */

import { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { TEAL, ORANGE, colors, fontSize, radius, shadow, inputStyle } from "../styles/tokens.js";
import Btn from "./ui/Btn.jsx";
import LegalFooter from "./legal/LegalFooter.jsx";
import logoImg from "../assets/logo.png";

export default function AuthPage({ onNav }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("owner"); // "owner" | "vet"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resetSent, setResetSent] = useState(false);

  /* Estrai il messaggio d'errore (Supabase può restituire formati diversi) */
  const getErrorMessage = (err) => {
    if (!err) return "Errore sconosciuto.";
    if (typeof err === "string") return err;
    if (err.message && typeof err.message === "string") return err.message;
    if (err.error_description) return err.error_description;
    if (err.msg) return err.msg;
    /* Fallback: prova a convertire in stringa leggibile */
    try {
      return JSON.stringify(err);
    } catch {
      return "Errore durante l'operazione.";
    }
  };

  /* Traduci gli errori di Supabase in italiano */
  const translateError = (err) => {
    const msg = getErrorMessage(err);
    console.warn("Errore auth Supabase:", err); // debug
    if (msg.includes("Invalid login")) return "Email o password non corretti.";
    if (msg.includes("Email not confirmed"))
      return "Devi confermare la tua email prima di accedere. Controlla la casella di posta.";
    if (msg.includes("User already registered")) return "Questa email è già registrata. Prova ad accedere.";
    if (msg.includes("Password should be")) return "La password deve essere di almeno 6 caratteri.";
    if (msg.includes("Unable to validate")) return "Email non valida. Controlla e riprova.";
    if (msg.includes("Email rate limit")) return "Troppi tentativi. Riprova tra qualche minuto.";
    if (msg.includes("Signup is disabled")) return "La registrazione è temporaneamente disabilitata.";
    if (msg.includes("Database error")) return "Errore del server. Riprova tra qualche istante.";
    if (msg.includes("duplicate key") || msg.includes("already exists"))
      return "Questa email è già registrata. Prova ad accedere.";
    return msg;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);
    if (err) {
      setError(translateError(err));
    }
    /* Se il login ha successo, onAuthStateChange in useAuth si occupa del resto */
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("Inserisci la tua email prima di cliccare 'Password dimenticata'.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (err) {
      setError(translateError(err));
    } else {
      setResetSent(true);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError("Inserisci il tuo nome.");
      return;
    }

    setLoading(true);

    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          role,
          display_name: displayName.trim(),
        },
      },
    });

    setLoading(false);
    if (err) {
      setError(translateError(err));
    } else {
      setSuccess(
        "Registrazione completata! Controlla la tua email per confermare l'account, poi torna qui per accedere."
      );
    }
  };

  /* Se il reset password è stato inviato */
  if (resetSent) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: 24, textAlign: "center" }}>
        <div style={{ marginTop: 60 }}>
          <img
            src={logoImg}
            alt="MioVeterinario logo"
            style={{
              width: 90,
              height: 90,
              borderRadius: radius.circle,
              margin: "0 auto",
              display: "block",
              boxShadow: shadow.logo,
            }}
          />
          <h1 style={{ fontSize: 28, margin: "18px 0 4px", color: ORANGE, fontWeight: 900 }}>
            Mio<span style={{ color: TEAL }}>Veterinario</span>
          </h1>
        </div>
        <div
          style={{
            marginTop: 30,
            background: "#E3F2FD",
            borderRadius: radius.lg,
            padding: "20px",
            lineHeight: 1.7,
            color: "#1565C0",
            fontSize: fontSize.base,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>📧</div>
          <b>Email inviata!</b>
          <p style={{ marginTop: 10 }}>
            Se l'indirizzo <b>{email}</b> è registrato, riceverai un'email con il link per reimpostare la password.
            Controlla anche la cartella spam.
          </p>
        </div>
        <Btn
          style={{ marginTop: 20, width: "100%" }}
          onClick={() => {
            setResetSent(false);
            setPassword("");
          }}
        >
          ← Torna al login
        </Btn>
      </div>
    );
  }

  /* Se la registrazione è andata a buon fine, mostra il messaggio di successo */
  if (success) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: 24, textAlign: "center" }}>
        <div style={{ marginTop: 60 }}>
          <img
            src={logoImg}
            alt="MioVeterinario logo"
            style={{
              width: 90,
              height: 90,
              borderRadius: radius.circle,
              margin: "0 auto",
              display: "block",
              boxShadow: shadow.logo,
            }}
          />
          <h1 style={{ fontSize: 28, margin: "18px 0 4px", color: ORANGE, fontWeight: 900 }}>
            Mio<span style={{ color: TEAL }}>Veterinario</span>
          </h1>
        </div>
        <div
          style={{
            marginTop: 30,
            background: "#E8F5E9",
            borderRadius: radius.lg,
            padding: "20px",
            lineHeight: 1.7,
            color: "#2E7D32",
            fontSize: fontSize.base,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
          <b>Registrazione riuscita!</b>
          <p style={{ marginTop: 10 }}>{success}</p>
        </div>
        <Btn
          style={{ marginTop: 20, width: "100%" }}
          onClick={() => {
            setSuccess(null);
            setMode("login");
            setPassword("");
          }}
        >
          ← Torna al login
        </Btn>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 24 }}>
      {/* Logo e titolo */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <img
          src={logoImg}
          alt="MioVeterinario logo"
          style={{
            width: 90,
            height: 90,
            borderRadius: radius.circle,
            margin: "0 auto",
            display: "block",
            boxShadow: shadow.logo,
          }}
        />
        <h1 style={{ fontSize: 28, margin: "18px 0 4px", color: ORANGE, fontWeight: 900 }}>
          Mio<span style={{ color: TEAL }}>Veterinario</span>
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: fontSize.xl, margin: 0 }}>
          {mode === "login" ? "Accedi al tuo account" : "Crea un nuovo account"}
        </p>
      </div>

      {/* Tab login/registrazione */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginTop: 30,
          borderRadius: radius.lg,
          overflow: "hidden",
          border: `1px solid ${colors.border}`,
        }}
      >
        <button
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          style={{
            flex: 1,
            padding: "12px",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: fontSize.base,
            fontFamily: "inherit",
            background: mode === "login" ? TEAL : colors.bgLight,
            color: mode === "login" ? colors.white : colors.textMuted,
          }}
        >
          Accedi
        </button>
        <button
          onClick={() => {
            setMode("signup");
            setError(null);
          }}
          style={{
            flex: 1,
            padding: "12px",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: fontSize.base,
            fontFamily: "inherit",
            background: mode === "signup" ? TEAL : colors.bgLight,
            color: mode === "signup" ? colors.white : colors.textMuted,
          }}
        >
          Registrati
        </button>
      </div>

      {/* Form */}
      <form onSubmit={mode === "login" ? handleLogin : handleSignup} style={{ marginTop: 20 }}>
        {/* Nome — solo in registrazione */}
        {mode === "signup" && (
          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="auth-name"
              style={{
                fontSize: fontSize.sm,
                fontWeight: 600,
                color: colors.textMuted,
                display: "block",
                marginBottom: 4,
              }}
            >
              Nome e cognome
            </label>
            <input
              id="auth-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Es: Maria Rossi"
              required
              style={inputStyle}
            />
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label
            htmlFor="auth-email"
            style={{
              fontSize: fontSize.sm,
              fontWeight: 600,
              color: colors.textMuted,
              display: "block",
              marginBottom: 4,
            }}
          >
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="la-tua@email.it"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label
            htmlFor="auth-password"
            style={{
              fontSize: fontSize.sm,
              fontWeight: 600,
              color: colors.textMuted,
              display: "block",
              marginBottom: 4,
            }}
          >
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Minimo 6 caratteri" : "La tua password"}
            required
            minLength={6}
            style={inputStyle}
          />
          {mode === "login" && (
            <button
              type="button"
              onClick={handleResetPassword}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: fontSize.sm,
                color: TEAL,
                fontWeight: 600,
                padding: "6px 0",
                marginTop: 4,
              }}
            >
              Password dimenticata?
            </button>
          )}
        </div>

        {/* Selezione ruolo — solo in registrazione */}
        {mode === "signup" && (
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontSize: fontSize.sm,
                fontWeight: 600,
                color: colors.textMuted,
                display: "block",
                marginBottom: 8,
              }}
            >
              Chi sei?
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                type="button"
                onClick={() => setRole("owner")}
                style={{
                  padding: "14px 12px",
                  borderRadius: radius.lg,
                  cursor: "pointer",
                  border: `2px solid ${role === "owner" ? TEAL : colors.border}`,
                  background: role === "owner" ? colors.bgTealLight : colors.white,
                  textAlign: "center",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ fontSize: 28 }}>🧑‍🤝‍🧑</div>
                <div
                  style={{
                    fontWeight: 700,
                    color: role === "owner" ? TEAL : colors.textMedium,
                    fontSize: fontSize.base,
                    marginTop: 4,
                  }}
                >
                  Proprietario
                </div>
                <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 }}>Cerco un veterinario</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("vet")}
                style={{
                  padding: "14px 12px",
                  borderRadius: radius.lg,
                  cursor: "pointer",
                  border: `2px solid ${role === "vet" ? ORANGE : colors.border}`,
                  background: role === "vet" ? colors.bgOrangeLight : colors.white,
                  textAlign: "center",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ fontSize: 28 }}>👩‍⚕️</div>
                <div
                  style={{
                    fontWeight: 700,
                    color: role === "vet" ? ORANGE : colors.textMedium,
                    fontSize: fontSize.base,
                    marginTop: 4,
                  }}
                >
                  Veterinario
                </div>
                <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 }}>
                  Gestisco il mio studio
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Errore */}
        {error && (
          <div
            style={{
              background: colors.dangerBg,
              borderRadius: radius.md,
              padding: "10px 14px",
              marginBottom: 14,
              fontSize: fontSize.base,
              color: colors.dangerFg,
              lineHeight: 1.6,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <Btn
          type="submit"
          variant={mode === "signup" ? "accent" : undefined}
          loading={loading}
          disabled={loading}
          style={{ width: "100%", fontSize: fontSize.xl, padding: "14px" }}
        >
          {loading ? "Caricamento..." : mode === "login" ? "Accedi" : "Registrati"}
        </Btn>
      </form>

      {/* Disclaimer beta */}
      <div
        style={{
          marginTop: 20,
          padding: "10px 16px",
          background: colors.bgOrangeLight,
          borderRadius: radius.lg,
          fontSize: fontSize.md,
          color: colors.textMedium,
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        <b>⚠️ Versione beta</b> — Prototipo dimostrativo. I dati sono simulati.
      </div>

      <LegalFooter onNav={onNav} />
    </div>
  );
}
