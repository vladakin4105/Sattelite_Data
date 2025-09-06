 import React, { useState, useContext, useEffect} from "react";
import { UserContext } from "../context/UserContext";

function History({ fetchHistory, onSelect, deleteCoord, version }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const { user } = useContext(UserContext);

  const handleToggle = async () => {
    if (!isOpen) {
      if (!user || user.username === "guest") {
        alert("You cannot access history without an account.");
        return;
      }
      try {
        const data = await fetchHistory();
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history:", err);
        alert("Failed to fetch history. Please try again.");
      }
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!user || user.username === "guest" || !isOpen) return;
    const load = async () => {
      try {
        const data = await fetchHistory();
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    load();
  }, [version]); 

  const handleRowDoubleClick = (item, index) => {
    setSelectedIndex(index);
    if (onSelect) onSelect(item);
  };

  const handleDelete = async (coordId) => {
    if (!window.confirm("Are you sure you want to delete this coordinate?")) return;
    try {
      await deleteCoord(coordId);
      setHistory(history.filter((c) => c.id !== coordId));
    } catch (err) {
      console.error("Failed to delete coordinate:", err);
      alert("Failed to delete coordinate. Try again.");
    }
  };

  const formatDateShortYear = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2); // ultimele 2 cifre
    const hours = String((d.getHours()+3)%24).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div style={{ width: "100%" }}>
      <button
        onClick={handleToggle}
        style={{
          width: "100%",
          padding: "0.5rem",
          backgroundColor: "#454745ff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "10px",
          fontWeight: "bold",
        }}
      >
        {isOpen ? "Hide History" : "Show History"}
      </button>

      {isOpen && user && user.username !== "guest" && (
        <div
          style={{
            marginTop: "10px",
            maxHeight: "250px",
            overflowY: "auto",
            overflowX: "hidden",
            border: "1px solid #cececeff",
            borderRadius: "8px",
            background: "#cececeff",
          }}
        >
          {history.length === 0 ? (
            <p style={{ padding: "10px" }}>No saved coordinates yet.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
                tableLayout: "fixed",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#454745ff", color: "white" }}>
                  <th style={{ border: "1px solid #000", padding: "1px" }}>X1</th>
                  <th style={{ border: "1px solid #000", padding: "1px" }}>Y1</th>
                  <th style={{ border: "1px solid #000", padding: "1px" }}>X2</th>
                  <th style={{ border: "1px solid #000", padding: "1px" }}>Y2</th>
                  <th style={{ border: "1px solid #000", padding: "1px", minWidth: "200px" }}>Date</th>
                  <th style={{ border: "1px solid #000", padding: "1px", minWidth: "60px" }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr
                    key={item.id}
                    onDoubleClick={() => handleRowDoubleClick(item, index)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedIndex === index ? "#888" : "transparent",
                      color: selectedIndex === index ? "white" : "black",
                    }}
                  >
                    <td style={{ border: "1px solid #000", padding: "1px", textAlign: "center" }}>
                      {Number(item.x1).toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "1px", textAlign: "center" }}>
                      {Number(item.y1).toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "1px", textAlign: "center" }}>
                      {Number(item.x2).toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "1px", textAlign: "center" }}>
                      {Number(item.y2).toFixed(2)}
                    </td>
                    <td style={{ borderTop: "1px solid #000", borderLeft: "1px solid #000",borderBottom: "1px solid #000", padding: "1px", textAlign: "center" }}>
                      {formatDateShortYear(item.created_at)}
                    </td>
                    <td style={{  borderTop: "1px solid #000", borderRight: "1px solid #000",borderBottom: "1px solid #000", padding: "1px", textAlign: "center" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        style={{
                          background: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "0.7rem",
                          padding: "4px 6px",
                          cursor: "pointer",
                        }}
                        title="Delete coordinate"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default History;
