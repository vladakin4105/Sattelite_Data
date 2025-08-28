  import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function NdviButton({ mapRef, coordInputs, saveBox }) {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!user?.username) {
      alert("You must be logged in to generate NDVI");
      return;
    }

    if (!mapRef.current) {
      alert("Map is not ready yet");
      return;
    }

    const { x1, y1, x2, y2 } = coordInputs;
    if ([x1, y1, x2, y2].some(c => c === '' || c === null || c === undefined)) {
      alert("Please select a valid area on the map");
      return;
    }

    setLoading(true);
    try {
      await saveBox(x1, y1, x2, y2, true); // <- NDVI will be generated only here
    } catch (err) {
      console.error(err);
      alert("Failed to generate NDVI");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        width: "100%",
        padding: "0.5rem",
        marginTop: "0.5rem",
        backgroundColor: "#2c69c5ff",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Generating NDVI..." : "Generate NDVI"}
    </button>
  );
}