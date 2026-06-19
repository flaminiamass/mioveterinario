import { useState } from "react";
import { DEMO_MY_LOCATION } from "../utils/location.js";

export default function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocalizzazione non supportata. Uso Roma Centro demo.");
      setCoords(DEMO_MY_LOCATION);
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude, label: "La tua posizione" });
        setLoading(false);
      },
      () => {
        setError("Posizione non autorizzata. Uso Roma Centro demo.");
        setCoords(DEMO_MY_LOCATION);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return { coords: coords || DEMO_MY_LOCATION, loading, error, requestLocation };
}
