/* Dati DEMO FITTIZI — nessun dato reale, nessuna persona reale.
   Questi dati sono generati esclusivamente per il test del prototipo.
   Verranno sostituiti da Supabase con dati reali degli utenti registrati. */

import { addDays } from "./helpers.js";

export const seedVets = [
  {
    id: "v1", status: "verified", name: "Dott.ssa Elena Marchetti", clinic: "Clinica Veterinaria Aurelia",
    city: "Roma", address: "Via Aurelia 240, Roma", spec: ["Medicina generale", "Dermatologia"],
    animals: ["Cane", "Gatto"], bio: "15 anni di esperienza in medicina dei piccoli animali. Particolare attenzione alla dermatologia e alle patologie croniche.",
    fees: { clinic: 50, home: 80, video: 35 }, rating: 4.8, reviews: 124, avatar: "👩‍⚕️",
    types: ["clinic", "home", "video"],
    workDays: [1, 2, 3, 4, 5],
    /* Dati fiscali */
    piva: "12345678901", cf: "MRCLNE80A41H501Z", albo: "RM-1234", regime: "ordinario",
    /* Listino personalizzato: id dal catalogo + prezzo custom (null = prezzo default) */
    services: [
      { id: "sv1", price: null }, { id: "sv2", price: null }, { id: "sv3", price: 70 },
      { id: "sv6", price: null }, { id: "sv7", price: null }, { id: "sv8", price: null },
      { id: "sv9", price: null }, { id: "sv10", price: null }, { id: "sv11", price: null },
      { id: "sv13", price: null }, { id: "sv14", price: null }, { id: "sv15", price: null },
      { id: "sv16", price: null }, { id: "sv18", price: null },
      { id: "sv19", price: null }, { id: "sv20", price: null },
      { id: "sv25", price: null }, { id: "sv26", price: null }, { id: "sv27", price: null },
      /* Servizio custom */
      { id: "c_v1_1", name: "Pulizia orecchie", price: 25, duration: 20, cat: "Visite", emoji: "👂", desc: "Pulizia auricolare professionale e controllo otoscopico" },
    ],
  },
  {
    id: "v2", status: "verified", name: "Dott. Marco Ferri", clinic: "Ambulatorio Ferri",
    city: "Roma", address: "Viale Trastevere 101, Roma", spec: ["Ortopedia", "Chirurgia"],
    animals: ["Cane", "Gatto", "Coniglio"], bio: "Specialista in ortopedia e chirurgia dei tessuti molli. Referente per casi complessi.",
    fees: { clinic: 65, home: null, video: 40 }, rating: 4.9, reviews: 89, avatar: "👨‍⚕️",
    types: ["clinic", "video"],
    workDays: [1, 2, 3, 4, 5],
    piva: "98765432101", cf: "FRRMRC75B20H501X", albo: "RM-5678", regime: "forfettario",
    services: [
      { id: "sv1", price: 65 }, { id: "sv5", price: 70 }, { id: "sv7", price: 40 },
      { id: "sv8", price: 90 },
      { id: "sv9", price: null }, { id: "sv10", price: null }, { id: "sv11", price: null },
      { id: "sv12", price: null },
      { id: "sv13", price: null }, { id: "sv19", price: 60 }, { id: "sv20", price: 90 },
      { id: "sv22", price: null }, { id: "sv23", price: null }, { id: "sv24", price: null },
      { id: "sv25", price: null },
    ],
  },
  {
    id: "v3", status: "verified", name: "Dott.ssa Sara Colombo", clinic: "VetCare Balduina",
    city: "Roma", address: "Piazza Giovenale 8, Roma", spec: ["Animali esotici", "Medicina generale"],
    animals: ["Coniglio", "Uccelli", "Rettili", "Cane", "Gatto"], bio: "Esperta in animali esotici e non convenzionali. Approccio gentile e fear-free.",
    fees: { clinic: 55, home: 90, video: 30 }, rating: 4.7, reviews: 56, avatar: "👩‍⚕️",
    types: ["clinic", "home", "video"],
    workDays: [1, 2, 3, 4, 5, 6],
    piva: "11223344556", cf: "CLMSRA82C55H501Y", albo: "RM-9012", regime: "ordinario",
    services: [
      { id: "sv1", price: 55 }, { id: "sv2", price: 55 }, { id: "sv6", price: 90 },
      { id: "sv7", price: 30 }, { id: "sv8", price: null },
      { id: "sv9", price: null }, { id: "sv10", price: null }, { id: "sv11", price: null },
      { id: "sv12", price: null },
      { id: "sv13", price: null }, { id: "sv16", price: null },
      { id: "sv19", price: null },
      { id: "sv25", price: null }, { id: "sv26", price: null }, { id: "sv27", price: null },
      /* Servizio custom per animali esotici */
      { id: "c_v3_1", name: "Visita animali esotici", price: 70, duration: 45, cat: "Visite", emoji: "🦎", desc: "Consulto specialistico per rettili, uccelli e roditori" },
    ],
  },
];

export const seedPets = [
  { id: "p1", name: "Ragù", species: "Cane", breed: "Barboncino toy", dob: "2023-03-12", weight: 4.2, chip: "380260101234567", sex: "M", photo: "🐩" },
  { id: "p2", name: "Miele", species: "Gatto", breed: "Europeo", dob: "2021-07-01", weight: 4.8, chip: "380260109876543", sex: "F", photo: "🐱" },
];

export const seedAppointments = [
  { id: "a1", petId: "p1", vetId: "v1", date: addDays(2), time: "10:00", type: "clinic", serviceId: "sv9", status: "confirmed", ownerNotes: "Controllo annuale + vaccino", vetNotes: "", proposal: null },
  { id: "a2", petId: "p2", vetId: "v1", date: addDays(-20), time: "16:30", type: "clinic", serviceId: "sv3", status: "completed", ownerNotes: "Prurito orecchie", vetNotes: "Otite esterna lieve, trattata.", proposal: null },
  { id: "a3", petId: "p1", vetId: "v2", date: addDays(-60), time: "11:00", type: "clinic", serviceId: "sv5", status: "completed", ownerNotes: "Zoppia posteriore", vetNotes: "Lussazione rotulea grado 1, monitoraggio.", proposal: null },
  { id: "a4", petId: "p1", vetId: "v1", date: addDays(0), time: "15:00", type: "video", serviceId: "sv7", status: "pending", ownerNotes: "Domanda su alimentazione casalinga", vetNotes: "", proposal: null },
];

export const seedReferti = [
  { id: "r1", apptId: "a2", petId: "p2", vetId: "v1", date: addDays(-20), title: "Otite esterna", diagnosis: "Otite esterna eritematosa bilaterale, lieve.", treatments: "Pulizia auricolare ambulatoriale.", drugs: "Gocce auricolari (ossitetraciclina) 2 volte/die per 7 giorni.", advice: "Ricontrollo se persistenza oltre 10 giorni. Evitare bagni.", next: "Controllo facoltativo tra 2 settimane." },
  { id: "r2", apptId: "a3", petId: "p1", vetId: "v2", date: addDays(-60), title: "Valutazione ortopedica", diagnosis: "Lussazione rotulea mediale grado 1 arto posteriore sx.", treatments: "Visita ortopedica completa, test del cassetto negativo.", drugs: "Nessuno al momento.", advice: "Mantenere peso forma, evitare salti dal divano. Integratore condroprotettore consigliato.", next: "Ricontrollo tra 6 mesi o se peggioramento." },
];

export const seedInvoices = [
  { id: "f1", apptId: "a2", vetId: "v1", date: addDays(-20), number: "1/2026", payment: "POS",
    items: [{ desc: "Visita dermatologica", qty: 1, price: 50 }, { desc: "Pulizia auricolare", qty: 1, price: 15 }, { desc: "Gocce auricolari", qty: 1, price: 18 }],
    enpav: 1.66, iva: 18.57, bollo: 0, total: 104.57, status: "paid" },
  { id: "f2", apptId: "a3", vetId: "v2", date: addDays(-60), number: "1/2026", payment: "Contanti",
    items: [{ desc: "Visita ortopedica specialistica", qty: 1, price: 65 }],
    enpav: 0, iva: 0, bollo: 0, total: 65, status: "paid" },
];

export const seedReviews = [
  { id: "rv1", vetId: "v1", apptId: "a2", rating: 5, comment: "Gentilissima e molto preparata. Miele di solito è terrorizzata dal veterinario ma con lei è stata tranquilla.", reply: "Grazie mille! Un saluto a Miele 🐱", date: addDays(-18), author: "Flaminia M." },
  { id: "rv2", vetId: "v1", apptId: null, rating: 5, comment: "Professionale e disponibile, spiega tutto con calma.", reply: null, date: addDays(-40), author: "Giulia R." },
  { id: "rv3", vetId: "v1", apptId: null, rating: 4, comment: "Brava, unico neo i tempi di attesa in sala.", reply: "Grazie del feedback, stiamo riorganizzando gli orari!", date: addDays(-70), author: "Andrea P." },
  { id: "rv4", vetId: "v2", apptId: "a3", rating: 5, comment: "Diagnosi precisa e consigli pratici. Consigliatissimo per problemi ortopedici.", reply: null, date: addDays(-58), author: "Flaminia M." },
];

/* NOTA: il client demo usa un nome fittizio. In produzione i dati vengono
   dall'account reale dell'utente autenticato (Supabase Auth). */
export const seedClients = [
  {
    id: "cl1",
    fullName: "Demo Utente",
    cf: "DMOUTN80A01H501Z",
    address: "Via Esempio 42, 00100 Roma",
    email: "demo@mioveterinario.it",
    phone: "+39 333 0000000",
    petIds: ["p1", "p2"],
  },
];

export const seedVaccines = [
  { petId: "p1", name: "Polivalente (CPV/CDV/CAV/Lepto)", date: addDays(-340), due: addDays(25), vet: "Dott.ssa Marchetti" },
  { petId: "p1", name: "Rabbia", date: addDays(-340), due: addDays(390), vet: "Dott.ssa Marchetti" },
  { petId: "p2", name: "Trivalente felina", date: addDays(-200), due: addDays(165), vet: "Dott.ssa Marchetti" },
];
