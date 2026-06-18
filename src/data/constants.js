/* Costanti condivise dell'app MioVeterinario
   I colori principali vengono da tokens.js — li ri-esportiamo
   così i file che già importano TEAL/ORANGE da qui continuano a funzionare. */

export { TEAL, ORANGE } from "../styles/tokens.js";

export const SLOT_TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

export const STATUS_META = {
  pending: { label: "In attesa", bg: "#FEF3C7", fg: "#92400E" },
  confirmed: { label: "Confermato", bg: "#D1FAE5", fg: "#065F46" },
  completed: { label: "Completato", bg: "#E5E7EB", fg: "#374151" },
  cancelled: { label: "Cancellato", bg: "#FEE2E2", fg: "#991B1B" },
};

export const TYPE_META = { clinic: "🏥 In clinica", home: "🏠 A domicilio", video: "📹 Video" };
