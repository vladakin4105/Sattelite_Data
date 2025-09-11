import React, { useState, useRef } from "react";
import L from "leaflet";

function ModisButton({ bbox, mapRef }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [visible, setVisible] = useState(false);
  const modisRectRef = useRef(null);

  const clearPreviousRect = () => {
    if (modisRectRef.current && mapRef.current) {
      mapRef.current.removeLayer(modisRectRef.current);
      modisRectRef.current = null;
    }
  };

  const handleClick = async () => {
    if (!bbox) {
      alert("Selectează întâi o zonă pe hartă!");
      return;
    }

    // Dacă dreptunghiul e deja vizibil, îl ascundem
    if (visible) {
      setVisible(false);
      clearPreviousRect();
      setResult(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/modis?x1=${bbox[0]}&y1=${bbox[1]}&x2=${bbox[2]}&y2=${bbox[3]}`
      );
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setResult(data.analysis);
  
      setVisible(true);

      // Desenăm dreptunghiul MODIS independent
      if (mapRef.current) {
        clearPreviousRect();
        const bounds = [
          [Math.min(bbox[1], bbox[3]), Math.min(bbox[0], bbox[2])],
          [Math.max(bbox[1], bbox[3]), Math.max(bbox[0], bbox[2])]
        ];
        const rect = L.rectangle(bounds, {
          color: "#ff7800",
          weight: 2,
          fillOpacity: 0.2
        }).addTo(mapRef.current);
        modisRectRef.current = rect;
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }

    } catch (err) {
      console.error("Error fetching MODIS analysis:", err);
      alert("Error fetching MODIS analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <button
        onClick={handleClick}
        disabled={loading || !bbox}
        style={{
          width: "100%",
          padding: "0.5rem",
          backgroundColor: "#2c69c5ff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading || !bbox ? "not-allowed" : "pointer",
          fontWeight: "bold"
        }}
      >
        {loading
          ? "Loading MODIS..."
          : visible
          ? "Hide MODIS Analysis"
          : "MODIS Analysis"}
      </button>

      {visible && result && (
        <div
          style={{
            marginTop: "0.5rem",
            background: "#444",
            padding: "0.5rem",
            borderRadius: "6px",
            fontSize: "0.9em"
          }}
        >
          <h4 style={{ marginBottom: "0.5rem" }}>MODIS Results:</h4>
          <ul style={{ paddingLeft: "1rem" }}>
            {Object.entries(result).map(([landCoverType, data]) => (
              <li key={landCoverType} style={{ marginBottom: "0.3rem" }}>
                <strong>{landCoverType}:</strong>
                <div style={{ marginLeft: "1rem", fontSize: "0.85em" }}>
                  <div>Pixeli: {data.pixels}</div>
                  <div>Procent: {data.percentage.toFixed(2)}%</div>
                  <div>Suprafață: {data.area_km2.toFixed(2)} km²</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ModisButton;
