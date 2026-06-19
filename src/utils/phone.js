export function normalizePhone(phone = "") {
  return String(phone).replace(/[^+\d]/g, "");
}

export function phoneHref(phone) {
  const normalized = normalizePhone(phone);
  return normalized ? `tel:${normalized}` : null;
}
