/* Zone demo per Roma + coordinate fittizie per il prototipo.
   Non usa Google Maps né librerie esterne.
   TODO fase 2: sostituire con geolocalizzazione reale del browser. */

export const ROME_ZONES = [
  { key: "Roma", label: "Roma (tutta)", lat: 41.9028, lng: 12.4964 },
  { key: "Roma Centro", label: "Roma Centro", lat: 41.8967, lng: 12.4822 },
  { key: "Prati", label: "Prati", lat: 41.9052, lng: 12.4623 },
  { key: "Trastevere", label: "Trastevere", lat: 41.8876, lng: 12.4697 },
  { key: "Balduina", label: "Balduina", lat: 41.923, lng: 12.431 },
  { key: "Aurelio", label: "Aurelio", lat: 41.8986, lng: 12.4258 },
  { key: "Parioli", label: "Parioli", lat: 41.924, lng: 12.513 },
  { key: "Monteverde", label: "Monteverde", lat: 41.878, lng: 12.4545 },
];

export const RADIUS_OPTIONS = [
  { key: 2, label: "2 km" },
  { key: 5, label: "5 km" },
  { key: 10, label: "10 km" },
  { key: 20, label: "20 km" },
];

/* Raggi per la ricerca "Vicino a me" su dati nazionali (strutture reali):
   più ampi di RADIUS_OPTIONS perché le strutture sono più rade delle zone di Roma.
   key === null → nessun limite ("Ovunque"). */
export const NEARBY_RADIUS_OPTIONS = [
  { key: 10, label: "10 km" },
  { key: 25, label: "25 km" },
  { key: 50, label: "50 km" },
  { key: 100, label: "100 km" },
  { key: null, label: "Ovunque" },
];

/** Posizione "Vicino a me" — demo: Roma Centro. */
export const DEMO_MY_LOCATION = { lat: 41.8967, lng: 12.4822, label: "Roma Centro (demo)" };

export function distanceBetweenCoords(a, b) {
  const dLat = (a.lat - b.lat) * 111;
  const dLng = (a.lng - b.lng) * 111 * Math.cos((b.lat * Math.PI) / 180);
  return Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;
}

/** Distanza approssimativa in km tra un vet e una zona. */
export function distanceKm(vet, zoneKeyOrLabel) {
  const vetCoords = { lat: vet.lat || 41.9028, lng: vet.lng || 12.4964 };
  if (zoneKeyOrLabel && typeof zoneKeyOrLabel === "object" && zoneKeyOrLabel.lat && zoneKeyOrLabel.lng) {
    return distanceBetweenCoords(vetCoords, zoneKeyOrLabel);
  }
  const zone = ROME_ZONES.find((z) => z.key === zoneKeyOrLabel || z.label === zoneKeyOrLabel);
  if (!zone) return 5; // fallback
  return distanceBetweenCoords(vetCoords, zone);
}

/** Il vet è entro il raggio dalla zona selezionata? */
export function matchesRadius(vet, zoneKey, radiusKm) {
  if (!zoneKey || zoneKey === "Roma" || zoneKey === "any") return true;
  const dist = distanceKm(vet, zoneKey);
  return dist <= radiusKm;
}

/** Formatta distanza: "2,4 km" oppure "< 1 km". */
export function fmtDistance(km) {
  if (km == null) return "";
  if (km < 1) return "< 1 km";
  return `${km.toFixed(1).replace(".", ",")} km`;
}

/**
 * Bounding box (min/max lat/lng) attorno a un centro entro radiusKm.
 * Usato per interrogare il DB senza scaricare tutte le schede nazionali.
 * Ritorna null se mancano centro o raggio (chi chiama interpreta come "nessun vincolo").
 */
export function bboxFromCenter(center, radiusKm) {
  if (!center || center.lat == null || center.lng == null || radiusKm == null) return null;
  const dLat = radiusKm / 111;
  const cosLat = Math.cos((center.lat * Math.PI) / 180) || 1;
  const dLng = radiusKm / (111 * cosLat);
  return {
    minLat: center.lat - dLat,
    maxLat: center.lat + dLat,
    minLng: center.lng - dLng,
    maxLng: center.lng + dLng,
  };
}

/** Distanza in km tra un elemento con lat/lng e un centro { lat, lng }.
    Ritorna null se mancano le coordinate (elemento o centro). */
export function distanceToCenter(item, center) {
  if (!center || center.lat == null || center.lng == null) return null;
  if (!item || item.lat == null || item.lng == null) return null;
  return distanceBetweenCoords({ lat: item.lat, lng: item.lng }, center);
}

/**
 * Filtra elementi entro un raggio da un centro e li ordina per distanza crescente.
 * - radiusKm null/undefined → nessun limite di distanza (ma ordina comunque).
 * - keepMissingCoords: se true, mantiene gli elementi senza coordinate (in coda);
 *   se false, li esclude quando è attivo un raggio.
 * Ogni elemento risultante riceve la proprietà `_distance` (km o null).
 */
export function filterByRadius(items, center, radiusKm, { keepMissingCoords = false } = {}) {
  const withDistance = (items || []).map((item) => ({ ...item, _distance: distanceToCenter(item, center) }));
  const filtered = withDistance.filter((item) => {
    if (item._distance == null) return keepMissingCoords || radiusKm == null;
    if (radiusKm == null) return true;
    return item._distance <= radiusKm;
  });
  return filtered.sort((a, b) => {
    if (a._distance == null && b._distance == null) return 0;
    if (a._distance == null) return 1;
    if (b._distance == null) return -1;
    return a._distance - b._distance;
  });
}
