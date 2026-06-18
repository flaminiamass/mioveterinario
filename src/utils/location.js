/* Zone demo per Roma + coordinate fittizie per il prototipo.
   Non usa Google Maps né librerie esterne.
   TODO fase 2: sostituire con geolocalizzazione reale del browser. */

export const ROME_ZONES = [
  { key: "Roma",        label: "Roma (tutta)",   lat: 41.9028, lng: 12.4964 },
  { key: "Roma Centro", label: "Roma Centro",    lat: 41.8967, lng: 12.4822 },
  { key: "Prati",       label: "Prati",          lat: 41.9052, lng: 12.4623 },
  { key: "Trastevere",  label: "Trastevere",     lat: 41.8876, lng: 12.4697 },
  { key: "Balduina",    label: "Balduina",       lat: 41.9230, lng: 12.4310 },
  { key: "Aurelio",     label: "Aurelio",        lat: 41.8986, lng: 12.4258 },
  { key: "Parioli",     label: "Parioli",        lat: 41.9240, lng: 12.5130 },
  { key: "Monteverde",  label: "Monteverde",     lat: 41.8780, lng: 12.4545 },
];

export const RADIUS_OPTIONS = [
  { key: 2,  label: "2 km" },
  { key: 5,  label: "5 km" },
  { key: 10, label: "10 km" },
  { key: 20, label: "20 km" },
];

/** Posizione "Vicino a me" — demo: Roma Centro. */
export const DEMO_MY_LOCATION = { lat: 41.8967, lng: 12.4822, label: "Roma Centro (demo)" };

/** Distanza approssimativa in km tra un vet e una zona. */
export function distanceKm(vet, zoneKeyOrLabel) {
  const zone = ROME_ZONES.find(z => z.key === zoneKeyOrLabel || z.label === zoneKeyOrLabel);
  if (!zone) return 5; // fallback
  const vetLat = vet.lat || 41.9028;
  const vetLng = vet.lng || 12.4964;
  // Formula Haversine semplificata (gradi → km, abbastanza precisa a scala locale)
  const dLat = (vetLat - zone.lat) * 111;
  const dLng = (vetLng - zone.lng) * 111 * Math.cos((zone.lat * Math.PI) / 180);
  return Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;
}

/** Il vet è entro il raggio dalla zona selezionata? */
export function matchesRadius(vet, zoneKey, radiusKm) {
  if (!zoneKey || zoneKey === "Roma" || zoneKey === "any") return true;
  const dist = distanceKm(vet, zoneKey);
  return dist <= radiusKm;
}

/** Formatta distanza: "2,4 km" oppure "< 1 km". */
export function fmtDistance(km) {
  if (km < 1) return "< 1 km";
  return `${km.toFixed(1).replace(".", ",")} km`;
}
