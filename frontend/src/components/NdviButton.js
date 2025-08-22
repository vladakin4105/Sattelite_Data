 import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import L from "leaflet";

export default function NdviButton({ mapRef, coordInputs }) {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!mapRef.current) {
      alert("Harta nu este gata încă");
      return;
    }

    setLoading(true);
    try {
      let x1, y1, x2, y2;

      if (user?.username && user.username !== "guest") {
        // Preia ultima coordonată salvată pentru user
        const res = await fetch(`http://localhost:8000/users/${user.username}/coords`);
        if (!res.ok) throw new Error("Nu s-au putut prelua coordonatele userului");
        const coords = await res.json();
        if (!coords || coords.length === 0) {
          alert("Nu există coordonate salvate pentru acest user");
          setLoading(false);
          return;
        }
        const last = coords[coords.length - 1];
        x1 = last.x1; y1 = last.y1; x2 = last.x2; y2 = last.y2;
      } else {
        // Guest folosește coordonatele curente
        ({ x1, y1, x2, y2 } = coordInputs);
      }

      // Fetch NDVI PNG de la backend
      const response = await fetch(`http://localhost:8000/ndvi`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "image/png" },
        body: JSON.stringify({ bbox: [x1, y1, x2, y2] }),
      });

      if (!response.ok) throw new Error("Eroare la generarea NDVI");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Curățare overlay anterior
      if (mapRef.current._ndviOverlay) {
        mapRef.current.removeLayer(mapRef.current._ndviOverlay);
      }

      // Creează overlay pe zona exactă
      const south = Math.min(y1, y2);
      const north = Math.max(y1, y2);
      const west = Math.min(x1, x2);
      const east = Math.max(x1, x2);
      const bounds = [[south, west], [north, east]];

      const overlay = L.imageOverlay(url, bounds, { opacity: 1.0 });
      overlay.addTo(mapRef.current);
      mapRef.current._ndviOverlay = overlay;

      // Fit map la zona overlay
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });

    } catch (err) {
      console.error(err);
      alert(err.message || "Nu s-a putut genera NDVI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontWeight: 'bold',
        marginBottom: '0.5rem'
      }}
    >
      {loading ? "Se generează NDVI..." : " NDVI"}
    </button>
  );
}
