import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";

function History({ fetchHistory, onSelect, deleteCoord }) {
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

  const handleRowDoubleClick = (item, index) => {
    setSelectedIndex(index);
    if (onSelect) {
      onSelect(item);
    }
  };

  const handleDelete = async (coordId) => {
    if (!window.confirm("Are you sure you want to delete this coordinate?")) return;

    try {
      await deleteCoord(coordId);  // funcția trimite DELETE la backend
      setHistory(history.filter((c) => c.id !== coordId));
    } catch (err) {
      console.error("Failed to delete coordinate:", err);
      alert("Failed to delete coordinate. Try again.");
    }
  };

  return (
    <div>
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
            border: "1px solid #cececeff",
            borderRadius: "8px",
            padding: "10px",
            background: "#cececeff",
          }}
        >
          {history.length === 0 ? (
            <p>No saved coordinates yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#454745ff" }}>
                  <th style={{ border: "1px solid #000000ff", padding: "8px" }}>X1</th>
                  <th style={{ border: "1px solid #000000ff", padding: "8px" }}>Y1</th>
                  <th style={{ border: "1px solid #000000ff", padding: "8px" }}>X2</th>
                  <th style={{ border: "1px solid #000000ff", padding: "8px" }}>Y2</th>
                  <th style={{ border: "1px solid #000000ff", padding: "8px" }}>Date</th>
                  <th style={{ border: "1px solid #000000ff", padding: "8px" }}> </th>
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
                    <td style={{ border: "1px solid #000000ff", padding: "8px" }}>{item.x1}</td>
                    <td style={{ border: "1px solid #000000ff", padding: "8px" }}>{item.y1}</td>
                    <td style={{ border: "1px solid #000000ff", padding: "8px" }}>{item.x2}</td>
                    <td style={{ border: "1px solid #000000ff", padding: "8px" }}>{item.y2}</td>
                    <td style={{ border: "1px solid #000000ff", padding: "8px" }}>
                      {item.created_at ? new Date(item.created_at).toLocaleString() : "-"}
                    </td>
                    <td style={{ border: "1px solid #000000ff", padding: "8px", textAlign: "center" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        style={{
                          background: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          cursor: "pointer",
                        }}
                        title="Delete coordinate"
                      >
                        🗑️
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
