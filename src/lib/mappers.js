/*
 * Mappers — Traducono i dati dal formato database al formato componenti.
 *
 * Il database Supabase usa nomi con il trattino basso (snake_case):
 *   pet_id, vet_id, owner_notes, display_name ...
 *
 * I componenti React si aspettano nomi in camelCase:
 *   petId, vetId, ownerNotes, displayName ...
 *
 * Questi mapper fanno la conversione automaticamente.
 * Così i componenti non devono sapere nulla del database:
 * continuano a lavorare con lo stesso formato di prima.
 */

/**
 * Mappa un veterinario dal formato database al formato componente.
 * Combina i dati dalla tabella "vets" con i servizi da "vet_services".
 */
export function mapVet(row, vetServicesRows = []) {
  return {
    id: row.id,
    userId: row.user_id, // ID utente auth (non presente in seedData, utile per l'app)
    status: row.status || "pending",
    name: row.name || "",
    clinic: row.clinic || "",
    city: row.city || "",
    address: row.address || "",
    spec: row.spec || [], // JSONB → array automatico
    animals: row.animals || [],
    bio: row.bio || "",
    fees: {
      clinic: row.fee_clinic != null ? Number(row.fee_clinic) : null,
      home: row.fee_home != null ? Number(row.fee_home) : null,
      video: row.fee_video != null ? Number(row.fee_video) : null,
    },
    rating: Number(row.rating) || 0,
    reviews: row.review_count || 0, // DB: review_count → componenti: reviews (il conteggio)
    avatar: row.avatar || "👩‍⚕️",
    types: row.types && row.types.length > 0 ? row.types : ["clinic"],
    workDays: row.work_days || [1, 2, 3, 4, 5],
    piva: row.piva || "",
    cf: row.cf || "",
    albo: row.albo || "",
    regime: row.regime || "ordinario",
    zone: row.zone || "",
    languages: row.languages || ["Italiano"],
    cancellationHours: row.cancellation_hours != null ? Number(row.cancellation_hours) : 24,
    services: vetServicesRows.map(mapVetService),
  };
}

/**
 * Mappa un servizio del vet.
 * Se ha catalog_id → è un servizio dal catalogo (con prezzo personalizzato opzionale).
 * Se catalog_id è null → è un servizio creato dal vet.
 */
function mapVetService(row) {
  if (row.catalog_id) {
    // Servizio dal catalogo standard
    return {
      id: row.catalog_id,
      price: row.custom_price != null ? Number(row.custom_price) : null,
    };
  }
  // Servizio personalizzato creato dal vet
  return {
    id: row.id,
    name: row.custom_name || "",
    price: row.custom_price != null ? Number(row.custom_price) : 0,
    duration: row.custom_duration || 30,
    cat: row.custom_category || "Altro",
    emoji: row.custom_emoji || "🩺",
    desc: row.custom_desc || "",
  };
}

/**
 * Mappa un animale dal formato database al formato componente.
 */
export function mapPet(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name || "",
    species: row.species || "Cane",
    breed: row.breed || "",
    dob: row.dob || "",
    weight: row.weight != null ? Number(row.weight) : null,
    chip: row.chip || "",
    sex: row.sex || "",
    photo: row.photo || "",
  };
}

/**
 * Mappa un appuntamento dal formato database al formato componente.
 */
export function mapAppointment(row) {
  return {
    id: row.id,
    petId: row.pet_id,
    vetId: row.vet_id,
    ownerId: row.owner_id,
    date: row.date || "",
    time: row.time || "",
    type: row.type || "clinic",
    serviceId: row.service_id || null,
    vetServiceId: row.vet_service_id || null,
    status: row.status || "pending",
    ownerNotes: row.owner_notes || "",
    vetNotes: row.vet_notes || "",
    rejectReason: row.reject_reason || "",
    proposal: row.proposal || null, // JSONB → oggetto automatico
    ownerCancelReason: row.owner_cancel_reason || "",
  };
}

/**
 * Mappa un referto dal formato database al formato componente.
 */
export function mapReferto(row) {
  return {
    id: row.id,
    apptId: row.appt_id,
    petId: row.pet_id,
    vetId: row.vet_id,
    date: row.date || "",
    title: row.title || "",
    diagnosis: row.diagnosis || "",
    treatments: row.treatments || "",
    drugs: row.drugs || "",
    advice: row.advice || "",
    next: row.next_visit || "", // DB: next_visit → componenti: next
  };
}

/**
 * Mappa una fattura dal formato database al formato componente.
 */
export function mapInvoice(row) {
  return {
    id: row.id,
    apptId: row.appt_id || null,
    vetId: row.vet_id,
    clientId: row.client_id || null,
    date: row.date || "",
    number: row.number || "",
    payment: row.payment || "POS",
    items: row.items || [], // JSONB → array automatico
    enpav: Number(row.enpav) || 0,
    iva: Number(row.iva) || 0,
    bollo: Number(row.bollo) || 0,
    total: Number(row.total) || 0,
    status: row.status || "unpaid",
    destName: row.dest_name || "",
    destCf: row.dest_cf || "",
    destAddress: row.dest_address || "",
    destEmail: row.dest_email || "",
    destPhone: row.dest_phone || "",
  };
}

/**
 * Mappa una recensione dal formato database al formato componente.
 */
export function mapReview(row) {
  return {
    id: row.id,
    vetId: row.vet_id,
    apptId: row.appt_id || null,
    authorId: row.author_id,
    rating: row.rating,
    comment: row.comment || "",
    reply: row.reply || null,
    date: row.date || "",
    author: row.author_name || "", // DB: author_name → componenti: author
  };
}

/**
 * Mappa un vaccino dal formato database al formato componente.
 */
export function mapVaccine(row) {
  return {
    id: row.id,
    petId: row.pet_id,
    name: row.name || "",
    date: row.date || "",
    due: row.due || null,
    vet: row.vet_name || "", // DB: vet_name → componenti: vet
  };
}

/**
 * Mappa una notifica dal formato database al formato componente.
 */
export function mapNotification(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type || "",
    title: row.title || "",
    message: row.message || "",
    data: row.data || {},
    read: !!row.read,
    createdAt: row.created_at || "",
  };
}

/**
 * Mappa un profilo owner in un "client" (per la vista del veterinario).
 * Il vet vede i proprietari come "clienti" con i loro animali.
 */
export function mapClient(row, petIds = []) {
  return {
    id: row.id,
    fullName: row.full_name || row.display_name || "",
    cf: row.cf || "",
    address: row.address || "",
    email: row.email || "",
    phone: row.phone || "",
    petIds,
  };
}
