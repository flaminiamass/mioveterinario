import { Component } from "react";
import { colors, fontSize, radius } from "../styles/tokens.js";
import Btn from "./ui/Btn.jsx";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error("MioVeterinario runtime error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          padding: 24,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            background: colors.white,
            borderRadius: radius.xl,
            padding: 24,
            textAlign: "center",
            boxShadow: "0 12px 30px rgba(15,23,42,.12)",
          }}
        >
          <div style={{ fontSize: 42 }}>🩺</div>
          <h1 style={{ fontSize: fontSize["3xl"], color: colors.textDark }}>Qualcosa è andato storto</h1>
          <p style={{ color: colors.textSecondary }}>
            La pagina non verrà ricaricata automaticamente. Puoi tornare alla Home manualmente.
          </p>
          <Btn onClick={() => window.location.assign("/")}>Torna alla Home</Btn>
        </div>
      </div>
    );
  }
}
