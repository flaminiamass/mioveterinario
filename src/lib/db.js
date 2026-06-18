/*
 * db.js — Funzioni per leggere e scrivere su Supabase.
 *
 * Ogni componente chiama queste funzioni per salvare i dati.
 * Tutte restituiscono { data, error } come Supabase.
 *
 * In modalità demo (senza Supabase), i componenti continuano
 * a usare solo setState — queste funzioni non vengono chiamate.
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

/* ══════════════════════════════════════════════════════════════
   APPOINTMENTS
   ══════════════════════════════════════════════════════════════ */

/** Crea un nuovo appuntamento */
export async function createAppointment({ petId, vetId, ownerId, date, time, type, serviceId, ownerNotes }) {
  return supabase
    .from("appointments")
    .insert({
      pet_id: petId,
      vet_id: vetId,
      owner_id: ownerId,
      date,
      time,
      type,
      service_id: serviceId,
      status: "pending",
      owner_notes: ownerNotes || "",
    })
    .select()
    .single();
}

/** Aggiorna lo status di un appuntamento */
export async function updateAppointmentStatus(id, status, extra = {}) {
  const updates = { status };
  if (extra.rejectReason !== undefined) updates.reject_reason = extra.rejectReason;
  if (extra.ownerCancelReason !== undefined) updates.owner_cancel_reason = extra.ownerCancelReason;
  return supabase.from("appointments").update(updates).eq("id", id).select().single();
}

/** Accetta una proposta (aggiorna data/ora e rimuove proposal) */
export async function acceptProposal(id, newDate, newTime) {
  return supabase
    .from("appointments")
    .update({
      date: newDate,
      time: newTime,
      proposal: null,
      status: "confirmed",
    })
    .eq("id", id)
    .select()
    .single();
}

/** Rifiuta una proposta (rimuove proposal senza cambiare status) */
export async function rejectProposal(id) {
  return supabase
    .from("appointments")
    .update({
      proposal: null,
    })
    .eq("id", id)
    .select()
    .single();
}

/** Invia una proposta (da owner o da vet) */
export async function sendProposal(id, proposal) {
  return supabase
    .from("appointments")
    .update({
      proposal, // { from: "owner"|"vet", date, time, message }
    })
    .eq("id", id)
    .select()
    .single();
}

/** Aggiorna le note del vet su un appuntamento */
export async function updateVetNotes(id, vetNotes) {
  return supabase
    .from("appointments")
    .update({
      vet_notes: vetNotes,
    })
    .eq("id", id)
    .select()
    .single();
}

/* ══════════════════════════════════════════════════════════════
   PETS
   ══════════════════════════════════════════════════════════════ */

/** Crea un nuovo animale */
export async function createPet({ ownerId, name, species, breed, dob, weight, chip, sex, photo }) {
  return supabase
    .from("pets")
    .insert({
      owner_id: ownerId,
      name,
      species: species || "Cane",
      breed: breed || "",
      dob: dob || null,
      weight: weight ? Number(weight) : null,
      chip: chip || "",
      sex: sex || "",
      photo: photo || "",
    })
    .select()
    .single();
}

/** Cancella un animale */
export async function deletePet(id) {
  return supabase.from("pets").delete().eq("id", id);
}

/** Aggiorna un animale */
export async function updatePet(id, fields) {
  const updates = {};
  if (fields.name !== undefined) updates.name = fields.name;
  if (fields.breed !== undefined) updates.breed = fields.breed;
  if (fields.weight !== undefined) updates.weight = fields.weight ? Number(fields.weight) : null;
  if (fields.chip !== undefined) updates.chip = fields.chip;
  if (fields.sex !== undefined) updates.sex = fields.sex;
  if (fields.dob !== undefined) updates.dob = fields.dob || null;
  if (fields.photo !== undefined) updates.photo = fields.photo;
  if (fields.species !== undefined) updates.species = fields.species;
  return supabase.from("pets").update(updates).eq("id", id).select().single();
}

/* ══════════════════════════════════════════════════════════════
   VACCINES
   ══════════════════════════════════════════════════════════════ */

/** Aggiungi un vaccino */
export async function createVaccine({ petId, name, date, due, vetName }) {
  return supabase
    .from("vaccines")
    .insert({
      pet_id: petId,
      name,
      date,
      due: due || null,
      vet_name: vetName || "",
    })
    .select()
    .single();
}

/** Aggiorna un vaccino */
export async function updateVaccine(id, fields) {
  const updates = {};
  if (fields.name !== undefined) updates.name = fields.name;
  if (fields.date !== undefined) updates.date = fields.date;
  if (fields.due !== undefined) updates.due = fields.due;
  if (fields.vetName !== undefined) updates.vet_name = fields.vetName;
  return supabase.from("vaccines").update(updates).eq("id", id).select().single();
}

/** Cancella un vaccino */
export async function deleteVaccine(id) {
  return supabase.from("vaccines").delete().eq("id", id);
}

/* ══════════════════════════════════════════════════════════════
   REVIEWS
   ══════════════════════════════════════════════════════════════ */

/** Crea una recensione */
export async function createReview({ vetId, apptId, authorId, rating, comment, authorName }) {
  return supabase
    .from("reviews")
    .insert({
      vet_id: vetId,
      appt_id: apptId || null,
      author_id: authorId,
      rating,
      comment,
      author_name: authorName || "",
      date: new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();
}

/** Rispondi a una recensione (vet) */
export async function replyToReview(id, reply) {
  return supabase.from("reviews").update({ reply }).eq("id", id).select().single();
}

/* ══════════════════════════════════════════════════════════════
   REFERTI
   ══════════════════════════════════════════════════════════════ */

/** Crea un referto */
export async function createReferto({ apptId, petId, vetId, title, diagnosis, treatments, drugs, advice, next }) {
  return supabase
    .from("referti")
    .insert({
      appt_id: apptId,
      pet_id: petId,
      vet_id: vetId,
      date: new Date().toISOString().slice(0, 10),
      title,
      diagnosis,
      treatments: treatments || "",
      drugs: drugs || "",
      advice: advice || "",
      next_visit: next || "",
    })
    .select()
    .single();
}

/* ══════════════════════════════════════════════════════════════
   INVOICES
   ══════════════════════════════════════════════════════════════ */

/** Crea una fattura */
export async function createInvoice({
  apptId,
  vetId,
  clientId,
  number,
  payment,
  items,
  enpav,
  iva,
  bollo,
  total,
  dest,
}) {
  return supabase
    .from("invoices")
    .insert({
      appt_id: apptId || null,
      vet_id: vetId,
      client_id: clientId || null,
      date: new Date().toISOString().slice(0, 10),
      number,
      payment,
      items, // JSONB — array di {desc, qty, price}
      enpav,
      iva,
      bollo,
      total,
      status: "unpaid",
      dest_name: dest?.fullName || "",
      dest_cf: dest?.cf || "",
      dest_address: dest?.address || "",
      dest_email: dest?.email || "",
      dest_phone: dest?.phone || "",
    })
    .select()
    .single();
}

/** Segna una fattura come pagata */
export async function markInvoicePaid(id) {
  return supabase.from("invoices").update({ status: "paid" }).eq("id", id).select().single();
}

/* ══════════════════════════════════════════════════════════════
   PROFILES (proprietario)
   ══════════════════════════════════════════════════════════════ */

/** Aggiorna il profilo del proprietario */
export async function updateProfile(id, fields) {
  const updates = {};
  if (fields.fullName !== undefined) updates.full_name = fields.fullName;
  if (fields.displayName !== undefined) updates.display_name = fields.displayName;
  if (fields.phone !== undefined) updates.phone = fields.phone;
  if (fields.email !== undefined) updates.email = fields.email;
  if (fields.cf !== undefined) updates.cf = fields.cf;
  if (fields.address !== undefined) updates.address = fields.address;
  if (fields.avatar !== undefined) updates.avatar = fields.avatar;
  return supabase.from("profiles").update(updates).eq("id", id).select().single();
}

/** Aggiorna i dati di un cliente (vet che modifica i dati di un owner) */
export async function updateClient(id, fields) {
  return updateProfile(id, fields);
}

/* ══════════════════════════════════════════════════════════════
   VETS (profilo veterinario)
   ══════════════════════════════════════════════════════════════ */

/** Aggiorna il profilo personale/professionale del vet */
export async function updateVetProfile(vetId, fields) {
  const updates = {};
  if (fields.name !== undefined) updates.name = fields.name;
  if (fields.clinic !== undefined) updates.clinic = fields.clinic;
  if (fields.city !== undefined) updates.city = fields.city;
  if (fields.address !== undefined) updates.address = fields.address;
  if (fields.bio !== undefined) updates.bio = fields.bio;
  if (fields.spec !== undefined) updates.spec = fields.spec;
  if (fields.animals !== undefined) updates.animals = fields.animals;
  if (fields.piva !== undefined) updates.piva = fields.piva;
  if (fields.cf !== undefined) updates.cf = fields.cf;
  if (fields.albo !== undefined) updates.albo = fields.albo;
  if (fields.regime !== undefined) updates.regime = fields.regime;
  if (fields.types !== undefined) updates.types = fields.types;
  if (fields.avatar !== undefined) updates.avatar = fields.avatar;
  if (fields.feeClinic !== undefined) updates.fee_clinic = fields.feeClinic;
  if (fields.feeHome !== undefined) updates.fee_home = fields.feeHome;
  if (fields.feeVideo !== undefined) updates.fee_video = fields.feeVideo;
  return supabase.from("vets").update(updates).eq("id", vetId).select().single();
}

/** Aggiorna i giorni lavorativi */
export async function updateVetWorkDays(vetId, workDays) {
  return supabase.from("vets").update({ work_days: workDays }).eq("id", vetId).select().single();
}

/** Aggiorna le tariffe del vet */
export async function updateVetFees(vetId, fees) {
  const updates = {};
  if (fees.clinic !== undefined) updates.fee_clinic = fees.clinic;
  if (fees.home !== undefined) updates.fee_home = fees.home;
  if (fees.video !== undefined) updates.fee_video = fees.video;
  return supabase.from("vets").update(updates).eq("id", vetId).select().single();
}

/* ══════════════════════════════════════════════════════════════
   VET_SERVICES (servizi del veterinario)
   ══════════════════════════════════════════════════════════════ */

/** Attiva un servizio dal catalogo per un vet */
export async function addVetService(vetId, catalogId, customPrice) {
  return supabase
    .from("vet_services")
    .insert({
      vet_id: vetId,
      catalog_id: catalogId,
      custom_price: customPrice ?? null,
    })
    .select()
    .single();
}

/** Disattiva un servizio dal catalogo per un vet */
export async function removeVetServiceByCatalog(vetId, catalogId) {
  return supabase.from("vet_services").delete().eq("vet_id", vetId).eq("catalog_id", catalogId);
}

/** Rimuovi un servizio (custom o catalogo) per UUID */
export async function removeVetService(id) {
  return supabase.from("vet_services").delete().eq("id", id);
}

/** Aggiorna il prezzo personalizzato di un servizio */
export async function updateVetServicePrice(vetId, catalogId, customPrice) {
  return supabase
    .from("vet_services")
    .update({
      custom_price: customPrice === "" || customPrice === null ? null : Number(customPrice),
    })
    .eq("vet_id", vetId)
    .eq("catalog_id", catalogId)
    .select()
    .single();
}

/** Aggiungi un servizio personalizzato (non dal catalogo) */
export async function addCustomVetService(vetId, { name, price, duration, category, emoji, desc }) {
  return supabase
    .from("vet_services")
    .insert({
      vet_id: vetId,
      catalog_id: null,
      custom_name: name,
      custom_price: Number(price),
      custom_duration: Number(duration),
      custom_category: category || "Altro",
      custom_emoji: emoji || "🩺",
      custom_desc: desc || "",
    })
    .select()
    .single();
}

/** Aggiorna un servizio personalizzato */
export async function updateCustomVetService(id, { name, price, duration, category, emoji, desc }) {
  return supabase
    .from("vet_services")
    .update({
      custom_name: name,
      custom_price: Number(price),
      custom_duration: Number(duration),
      custom_category: category,
      custom_emoji: emoji,
      custom_desc: desc || "",
    })
    .eq("id", id)
    .select()
    .single();
}

/* ══════════════════════════════════════════════════════════════
   NOTIFICATIONS — notifiche in-app
   ══════════════════════════════════════════════════════════════ */

/** Crea una notifica per un utente */
export async function createNotification({ userId, type, title, message, data }) {
  return supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      message: message || "",
      data: data || {},
    })
    .select()
    .single();
}

/** Carica le notifiche di un utente (ultime 50) */
export async function getNotifications(userId) {
  return supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
}

/** Segna una notifica come letta */
export async function markNotificationRead(id) {
  return supabase.from("notifications").update({ read: true }).eq("id", id);
}

/** Segna tutte le notifiche come lette */
export async function markAllNotificationsRead(userId) {
  return supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

/* ══════════════════════════════════════════════════════════════
   ACCOUNT — cancellazione account
   ══════════════════════════════════════════════════════════════ */

/** Cancella il profilo dell'utente (soft delete — rimuove i dati, il login auth resta
    ma senza profilo il sistema fa logout automatico e non permette più l'accesso). */
export async function deleteAccount(userId) {
  /* Cancella prima il profilo vet se esiste */
  await supabase.from("vets").delete().eq("user_id", userId);
  /* Cancella il profilo */
  return supabase.from("profiles").delete().eq("id", userId);
}

/* ══════════════════════════════════════════════════════════════
   UTILITY — controlla se Supabase è attivo
   ══════════════════════════════════════════════════════════════ */

export { isSupabaseConfigured };
