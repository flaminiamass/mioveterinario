/* Prestazioni veterinarie predefinite.
   Prezzi basati su medie di cliniche italiane (2024-2025).
   Fonti: Clinica Vet Portone Pietrasanta, Clinica Vet Certosa Milano, ANMVI */

export const VET_SERVICES = [
  // ── Visite ────────────────────────────────────────────
  {
    id: "sv1",
    cat: "Visite",
    name: "Visita generale",
    desc: "Controllo salute completo con auscultazione e palpazione",
    price: 50,
    duration: 30,
    emoji: "🩺",
  },
  {
    id: "sv2",
    cat: "Visite",
    name: "Prima visita cucciolo/gattino",
    desc: "Primo controllo, consigli su alimentazione e vaccinazioni",
    price: 50,
    duration: 30,
    emoji: "🐣",
  },
  {
    id: "sv3",
    cat: "Visite",
    name: "Visita dermatologica",
    desc: "Esame cute, pelo, prurito, allergie e dermatiti",
    price: 65,
    duration: 40,
    emoji: "🔬",
  },
  {
    id: "sv4",
    cat: "Visite",
    name: "Visita oculistica",
    desc: "Controllo occhi, pressione intraoculare, fondo oculare",
    price: 90,
    duration: 45,
    emoji: "👁️",
  },
  {
    id: "sv5",
    cat: "Visite",
    name: "Visita ortopedica",
    desc: "Valutazione articolazioni, zoppia, displasia",
    price: 65,
    duration: 40,
    emoji: "🦴",
  },
  {
    id: "sv6",
    cat: "Visite",
    name: "Visita a domicilio",
    desc: "Il veterinario viene a casa tua",
    price: 80,
    duration: 45,
    emoji: "🏠",
  },
  {
    id: "sv7",
    cat: "Visite",
    name: "Video consulto",
    desc: "Consulenza online per dubbi e controlli rapidi",
    price: 35,
    duration: 20,
    emoji: "📹",
  },
  {
    id: "sv8",
    cat: "Visite",
    name: "Visita d'urgenza",
    desc: "Per situazioni urgenti che richiedono attenzione immediata",
    price: 85,
    duration: 30,
    emoji: "🚨",
  },

  // ── Vaccini ───────────────────────────────────────────
  {
    id: "sv9",
    cat: "Vaccini",
    name: "Vaccino polivalente cane",
    desc: "Protezione da cimurro, parvovirosi, epatite, leptospirosi",
    price: 55,
    duration: 20,
    emoji: "💉",
  },
  {
    id: "sv10",
    cat: "Vaccini",
    name: "Vaccino trivalente gatto",
    desc: "Protezione da panleucopenia, calicivirus, herpesvirus",
    price: 60,
    duration: 20,
    emoji: "💉",
  },
  {
    id: "sv11",
    cat: "Vaccini",
    name: "Vaccino antirabbica",
    desc: "Obbligatorio per viaggi all'estero e passaporto europeo",
    price: 65,
    duration: 20,
    emoji: "💉",
  },
  {
    id: "sv12",
    cat: "Vaccini",
    name: "Vaccino coniglio Mixo-RHD",
    desc: "Protezione da mixomatosi e malattia emorragica",
    price: 85,
    duration: 20,
    emoji: "💉",
  },

  // ── Analisi ───────────────────────────────────────────
  {
    id: "sv13",
    cat: "Analisi",
    name: "Analisi sangue (emocromo + biochimico)",
    desc: "Esame completo del sangue con profilo biochimico",
    price: 110,
    duration: 20,
    emoji: "🩸",
  },
  {
    id: "sv14",
    cat: "Analisi",
    name: "Test leishmania",
    desc: "Screening anticorpi per leishmaniosi canina",
    price: 50,
    duration: 15,
    emoji: "🧪",
  },
  {
    id: "sv15",
    cat: "Analisi",
    name: "Test FIV/FeLV",
    desc: "Test immunodeficienza felina e leucemia felina",
    price: 50,
    duration: 15,
    emoji: "🧪",
  },
  {
    id: "sv16",
    cat: "Analisi",
    name: "Esame urine",
    desc: "Analisi chimico-fisica e sedimento urinario",
    price: 35,
    duration: 15,
    emoji: "🧫",
  },
  {
    id: "sv17",
    cat: "Analisi",
    name: "Esame filaria",
    desc: "Test antigene per filariosi cardiopolmonare",
    price: 35,
    duration: 15,
    emoji: "🧪",
  },
  {
    id: "sv18",
    cat: "Analisi",
    name: "Check-up completo",
    desc: "Visita + analisi sangue + urine per un quadro completo",
    price: 110,
    duration: 30,
    emoji: "📋",
  },

  // ── Diagnostica per immagini ──────────────────────────
  {
    id: "sv19",
    cat: "Diagnostica",
    name: "Radiografia",
    desc: "Immagine radiografica di torace, addome o arti",
    price: 55,
    duration: 20,
    emoji: "📷",
  },
  {
    id: "sv20",
    cat: "Diagnostica",
    name: "Ecografia addominale",
    desc: "Visualizzazione organi addominali con ultrasuoni",
    price: 85,
    duration: 30,
    emoji: "📡",
  },
  {
    id: "sv21",
    cat: "Diagnostica",
    name: "Ecocardiografia",
    desc: "Ecografia del cuore per valutare funzionalità cardiaca",
    price: 130,
    duration: 40,
    emoji: "❤️",
  },

  // ── Chirurgia / Interventi ────────────────────────────
  {
    id: "sv22",
    cat: "Chirurgia",
    name: "Sterilizzazione gatta",
    desc: "Ovariectomia o ovarioisterectomia in anestesia generale",
    price: 180,
    duration: 60,
    emoji: "🏥",
  },
  {
    id: "sv23",
    cat: "Chirurgia",
    name: "Castrazione gatto",
    desc: "Orchiectomia in anestesia generale",
    price: 135,
    duration: 45,
    emoji: "🏥",
  },
  {
    id: "sv24",
    cat: "Chirurgia",
    name: "Ablazione tartaro",
    desc: "Pulizia dentale professionale con ultrasuoni in sedazione",
    price: 200,
    duration: 60,
    emoji: "🦷",
  },

  // ── Altro ─────────────────────────────────────────────
  {
    id: "sv25",
    cat: "Altro",
    name: "Inserimento microchip",
    desc: "Impianto microchip identificativo e registrazione anagrafe",
    price: 40,
    duration: 15,
    emoji: "📟",
  },
  {
    id: "sv26",
    cat: "Altro",
    name: "Certificato sanitario",
    desc: "Certificato di buona salute per viaggi o adozione",
    price: 30,
    duration: 15,
    emoji: "📋",
  },
  {
    id: "sv27",
    cat: "Altro",
    name: "Passaporto europeo",
    desc: "Documenti per viaggiare con l'animale nell'UE",
    price: 50,
    duration: 20,
    emoji: "🛂",
  },
];

/* Categorie ordinate per la UI */
export const SERVICE_CATEGORIES = ["Visite", "Vaccini", "Analisi", "Diagnostica", "Chirurgia", "Altro"];

/* Helper: trova un servizio per id */
export const getService = (id) => VET_SERVICES.find((s) => s.id === id) || null;

/* Helper: restituisce il type (clinic/home/video) automaticamente dal servizio */
export const getTypeFromService = (serviceId) => {
  if (serviceId === "sv6") return "home"; // Visita a domicilio
  if (serviceId === "sv7") return "video"; // Video consulto
  return "clinic";
};

/* Helper: restituisce i servizi disponibili per un vet, con prezzi personalizzati.
   Se il vet ha un array `services`, usa solo quelli (con prezzo custom opzionale).
   Se non ce l'ha, mostra tutto il catalogo. */
export const getVetServices = (vet) => {
  if (!vet.services || !vet.services.length) return VET_SERVICES;
  return vet.services.map((vs) => {
    const catalog = VET_SERVICES.find((s) => s.id === vs.id);
    if (catalog) return { ...catalog, price: vs.price ?? catalog.price };
    // Servizio personalizzato del vet
    return vs;
  });
};

/* Emoji di default per i servizi custom dei vet */
export const SERVICE_EMOJIS = ["🩺", "💉", "🩸", "🧪", "📷", "🏥", "🦷", "📋", "👂", "💊", "🐾", "⚕️"];
