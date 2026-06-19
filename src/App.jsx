/* MioVeterinario — App principale
   Smista fra AuthPage/Landing, Owner, Vet e pagine legali.
   Se Supabase è configurato → usa autenticazione reale.
   Se non configurato → usa il vecchio Landing con selezione ruolo (demo). */

import { useState } from "react";
import { useApp } from "./context/AppContext.jsx";
import { useAuthContext } from "./context/AuthContext.jsx";
import { isSupabaseConfigured } from "./lib/supabaseClient.js";
import { TEAL, ORANGE, colors, fontSize, radius, shadow } from "./styles/tokens.js";
import AuthPage from "./components/AuthPage.jsx";
import Landing from "./components/Landing.jsx";
import OwnerApp from "./components/owner/OwnerApp.jsx";
import VetApp from "./components/vet/VetApp.jsx";
import PrivacyPolicy from "./components/legal/PrivacyPolicy.jsx";
import TermsOfService from "./components/legal/TermsOfService.jsx";
import CookiePolicy from "./components/legal/CookiePolicy.jsx";

export default function App() {
  const { role, setRole, toast, dataLoading, bannerNotif } = useApp();
  const { user, profile, loading: authLoading, signOut } = useAuthContext();
  const [legalPage, setLegalPage] = useState(null);

  const showLegal = (page) => setLegalPage(page);
  const hideLegal = () => setLegalPage(null);

  const supabaseActive = isSupabaseConfigured();

  const renderContent = () => {
    /* Pagine legali — accessibili da qualsiasi stato */
    if (legalPage === "privacy") return <PrivacyPolicy onBack={hideLegal} />;
    if (legalPage === "terms") return <TermsOfService onBack={hideLegal} />;
    if (legalPage === "cookie") return <CookiePolicy onBack={hideLegal} />;

    /* ─── Modalità Supabase (auth reale) ─── */
    if (supabaseActive) {
      /* Spinner di caricamento mentre verifica la sessione */
      if (authLoading) {
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "80vh",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: `4px solid ${colors.bgBtn}`,
                borderTop: `4px solid ${TEAL}`,
                borderRadius: radius.circle,
                animation: "spin 0.8s linear infinite",
              }}
            />
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "80vh",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: `4px solid ${colors.bgBtn}`,
                borderTop: `4px solid ${TEAL}`,
                borderRadius: radius.circle,
                animation: "spin 0.8s linear infinite",
              }}
            />
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
        <div
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: colors.textDark,
            color: colors.white,
            padding: "10px 22px",
            borderRadius: radius.lg,
            zIndex: 999,
            fontSize: fontSize.base,
            boxShadow: shadow.toast,
          }}
        >
          {toast}
        </div>
      )}
      {bannerNotif && (
        <div
          style={{
            position: "fixed",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(92vw, 360px)",
            background: "rgba(30,30,32,0.92)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            color: colors.white,
            borderRadius: 18,
            zIndex: 9999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.38)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            animation: "slideDownBanner 0.35s cubic-bezier(.22,1,.36,1)",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: bannerNotif.type === "message_received" ? TEAL : ORANGE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {bannerNotif.type === "message_received" ? "💬" : "🔔"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: fontSize.base,
                color: colors.white,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {bannerNotif.title}
            </div>
            {bannerNotif.message && (
              <div
                style={{
                  fontSize: fontSize.sm,
                  color: "rgba(255,255,255,0.72)",
                  marginTop: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {bannerNotif.message}
              </div>
            )}
          </div>
          <style>{`
            @keyframes slideDownBanner {
              from { opacity: 0; transform: translateX(-50%) translateY(-28px); }
              to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
        </div>
      )}
      {renderContent()}
    </div>
  );
}
