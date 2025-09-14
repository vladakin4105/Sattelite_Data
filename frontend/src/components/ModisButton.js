import React, { useState, useRef } from "react";
import L from "leaflet";

function ModisButton({ bbox, mapRef }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [visible, setVisible] = useState(false);
  const modisRectRef = useRef(null);
  const modisLayerRef = useRef(null);
  const legendControlRef = useRef(null);

  const clearPreviousRect = () => {
    if (modisRectRef.current && mapRef.current) {
      mapRef.current.removeLayer(modisRectRef.current);
      modisRectRef.current = null;
    }
    if (modisLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(modisLayerRef.current);
      modisLayerRef.current = null;
    }
    if (legendControlRef.current && mapRef.current) {
      mapRef.current.removeControl(legendControlRef.current);
      legendControlRef.current = null;
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
          fillOpacity: 0.1
        }).addTo(mapRef.current);
        modisRectRef.current = rect;

        if (data.tile_url) {
          const modisLayer = L.tileLayer(data.tile_url, {
            opacity: 0.6
          });
          modisLayer.addTo(mapRef.current);
          modisLayerRef.current = modisLayer;
        }

        if (data.legend) {
          const legendControl = L.control({ position: "bottomright" });
          legendControl.onAdd = () => {
            const div = L.DomUtil.create("div", "info legend");
            div.style.background = "rgba(128,128,128,0.6)";
            div.style.padding = "6px";
            div.style.border = "1px solid #555";
            div.style.borderRadius = "6px";
            div.style.maxHeight = "180px";
            div.style.overflowY = "auto";
            div.style.fontSize = "1w0px";
            div.style.color = "black";
            const labels = [];
            for (const [name, color] of Object.entries(data.legend)) {
              labels.push(
                `<div style="display:flex; align-items:center; margin-bottom:4px;">
                  <span style="display:inline-block; width:18px; height:18px; background:${color}; margin-right:6px; border:1px solid #999;"></span>
                  ${name}
                </div>`
              );
            }
            div.innerHTML = `<h4 style="margin:0 0 6px 0;">Legend</h4>${labels.join("")}`;
            return div;
          };
          legendControl.addTo(mapRef.current);
          legendControlRef.current = legendControl;
        }


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
          ? "Hide Land C lassification"
          : "Land Cover Classification"}
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
                  <div>Pixels: {data.pixels}</div>
                  <div>Percentage: {data.percentage.toFixed(2)}%</div>
                  <div>Area: {data.area_km2.toFixed(2)} km²</div>
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
