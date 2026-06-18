/* MioVeterinario — App principale
   Smista fra AuthPage/Landing, Owner, Vet e pagine legali.
   Se Supabase è configurato → usa autenticazione reale.
   Se non configurato → usa il vecchio Landing con selezione ruolo (demo). */

import { useState } from "react";
import { useApp } from "./context/AppContext.jsx";
import { useAuthContext } from "./context/AuthContext.jsx";
import { isSupabaseConfigured } from "./lib/supabaseClient.js";
import { TEAL, colors, fontSize, radius, shadow } from "./styles/tokens.js";
import AuthPage from "./components/AuthPage.jsx";
import Landing from "./components/Landing.jsx";
import OwnerApp from "./components/owner/OwnerApp.jsx";
import VetApp from "./components/vet/VetApp.jsx";
import PrivacyPolicy from "./components/legal/PrivacyPolicy.jsx";
import TermsOfService from "./components/legal/TermsOfService.jsx";
import CookiePolicy from "./components/legal/CookiePolicy.jsx";

export default function App() {
  const { role, setRole, toast, dataLoading } = useApp();
  const { user, profile, loading: authLoading, signOut } = useAuthContext();
  const [legalPage, setLegalPage] = useState(null);

  const showLegal = (page) => setLegalPage(page);
  const hideLegal = () => setLegalPage(null);

  const supabaseActive = isSupabaseConfigured();

  const renderContent = () => {
    /* Pagine legali — accessibili da qualsiasi stato */
    if (legalPage === "privacy") return <PrivacyPolicy onBack={hideLegal} />;
    if (legalPage === "terms")   return <TermsOfService onBack={hideLegal} />;
    if (legalPage === "cookie")  return <CookiePolicy onBack={hideLegal} />;

    /* ─── Modalità Supabase (auth reale) ─── */
    if (supabaseActive) {
      /* Spinner di caricamento mentre verifica la sessione */
      if (authLoading) {
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: 16 }}>
            <div style={{ width: 48, height: 48, border: `4px solid ${colors.bgBtn}`, borderTop: `4px solid ${TEAL}`, borderRadius: radius.circle, animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: colors.textMuted, fontSize: fontSize.base }}>Caricamento...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        );
      }

      /* Non loggato → pagina di login */
      if (!user || !profile) {
        return <AuthPage onNav={showLegal} />;
      }

      /* Caricamento dati dal database */
      if (dataLoading) {
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: 16 }}>
            <div style={{ width: 48, height: 48, border: `4px solid ${colors.bgBtn}`, borderTop: `4px solid ${TEAL}`, borderRadius: radius.circle, animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: colors.textMuted, fontSize: fontSize.base }}>Caricamento dati...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        );
      }

      /* Loggato come owner */
      if (profile.role === "owner") {
        return <OwnerApp onLogout={signOut} onNav={showLegal} />;
      }

      /* Loggato come vet */
      return <VetApp onLogout={signOut} onNav={showLegal} />;
    }

    /* ─── Modalità demo (senza Supabase) ─── */
    if (!role) return <Landing onLogin={setRole} onNav={showLegal} />;
    if (role === "owner") return <OwnerApp onLogout={() => setRole(null)} onNav={showLegal} />;
    return <VetApp onLogout={() => setRole(null)} onNav={showLegal} />;
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: colors.bgApp, minHeight: "100vh" }}>
      {toast && (
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: colors.textDark, color: colors.white, padding: "10px 22px", borderRadius: radius.lg, zIndex: 999, fontSize: fontSize.base, boxShadow: shadow.toast }}>
          {toast}
        </div>
      )}
      {renderContent()}
    </div>
  );
}
