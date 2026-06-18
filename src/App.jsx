/* MioVeterinario — App principale
   Smista fra Landing, Owner, Vet e pagine legali in base al ruolo/route selezionato. */

import { useState } from "react";
import { useApp } from "./context/AppContext.jsx";
import { colors, fontSize, radius, shadow } from "./styles/tokens.js";
import Landing from "./components/Landing.jsx";
import OwnerApp from "./components/owner/OwnerApp.jsx";
import VetApp from "./components/vet/VetApp.jsx";
import PrivacyPolicy from "./components/legal/PrivacyPolicy.jsx";
import TermsOfService from "./components/legal/TermsOfService.jsx";
import CookiePolicy from "./components/legal/CookiePolicy.jsx";

export default function App() {
  const { role, setRole, toast } = useApp();
  /* legalPage: null | 'privacy' | 'terms' | 'cookie' */
  const [legalPage, setLegalPage] = useState(null);

  const showLegal = (page) => setLegalPage(page);
  const hideLegal = () => setLegalPage(null);

  const renderContent = () => {
    /* Pagine legali — accessibili da qualsiasi stato */
    if (legalPage === "privacy") return <PrivacyPolicy onBack={hideLegal} />;
    if (legalPage === "terms")   return <TermsOfService onBack={hideLegal} />;
    if (legalPage === "cookie")  return <CookiePolicy onBack={hideLegal} />;

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
