 import React, { useState } from "react";

export default function ModisButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    // momentan nu face nimic
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
      {loading ? "Processing..." : "MODIS"}
    </button>
  );
}
