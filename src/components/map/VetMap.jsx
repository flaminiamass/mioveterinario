import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { TEAL } from "../../styles/tokens.js";
import Btn from "../ui/Btn.jsx";

const vetIcon = new L.DivIcon({
  className: "mv-vet-marker",
  html: `<div style="width:30px;height:30px;border-radius:50%;background:${TEAL};color:white;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,.25);font-size:16px">✚</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const userIcon = new L.DivIcon({
  className: "mv-user-marker",
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#F0813A;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.25)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function vetPosition(vet) {
  return [vet.lat || 41.9028, vet.lng || 12.4964];
}

export default function VetMap({ vets = [], slots = [], userCoords, center, onBookSlot, onViewVet }) {
  const mapCenter = center
    ? [center.lat, center.lng]
    : userCoords
      ? [userCoords.lat, userCoords.lng]
      : [41.9028, 12.4964];
  const firstSlotByVet = slots.reduce((acc, slot) => {
    if (!acc[slot.vetId]) acc[slot.vetId] = slot;
    return acc;
  }, {});

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #E2E8F0", minHeight: 320 }}>
      <MapContainer center={mapCenter} zoom={12} style={{ height: 320, width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]} icon={userIcon}>
            <Popup>{userCoords.label || "La tua posizione"}</Popup>
          </Marker>
        )}
        {vets.map((vet) => {
          const slot = firstSlotByVet[vet.id];
          return (
            <Marker key={vet.id} position={vetPosition(vet)} icon={vetIcon}>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <b>{vet.name}</b>
                  <div>{vet.clinic}</div>
                  <div>
                    ⭐ {vet.rating} · {vet.reviews} recensioni
                  </div>
                  {slot && (
                    <div style={{ marginTop: 6 }}>
                      Primo slot: <b>{slot.time}</b> · €{slot.price}
                    </div>
                  )}
                  <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                    {slot && (
                      <Btn small onClick={() => onBookSlot?.(slot)}>
                        Prenota {slot.time}
                      </Btn>
                    )}
                    {vet.phone ? (
                      <a href={`tel:${vet.phone}`} style={{ color: TEAL, fontWeight: 700 }}>
                        ☎ Chiama
                      </a>
                    ) : (
                      <span>Numero non disponibile</span>
                    )}
                    <button
                      onClick={() => onViewVet?.(vet)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: TEAL,
                        padding: 0,
                        textAlign: "left",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Vedi profilo
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
