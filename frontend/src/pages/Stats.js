import React from "react";

export default function Stats() {
  return (
    <div
      style={{
        
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(to bottom, #e6f2ff, #f7fff0)", // albastru spre verde pal
      }}
    >
      {/* Content */}
      <div style={{ padding: "3rem" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: "2.5rem",
            marginBottom: "2rem",
            color: "#34495e",
          }}
        >
          Satellite Data Statistics
        </h1>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#1f2833",
              padding: "2rem",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            <h2 style={{ color: "#66fcf1", fontSize: "2rem" }}>120 TB+</h2>
            <p>Satellite Imagery Processed</p>
          </div>

          <div
            style={{
              backgroundColor: "#1f2833",
              padding: "2rem",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            <h2 style={{ color: "#66fcf1", fontSize: "2rem" }}>85%</h2>
            <p>Accuracy in Crop Detection</p>
          </div>

          <div
            style={{
              backgroundColor: "#1f2833",
              padding: "2rem",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            <h2 style={{ color: "#66fcf1", fontSize: "2rem" }}>50+</h2>
            <p>Regions Monitored</p>
          </div>
        </div>

        {/* Images Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3_VNxB9jVibaQnR7yJJfZE1jV7X_HnLk_tNq2tDfL_m6DZVwGw9dj_TA&s"
            alt="Satellite field analysis"
            style={{
              width: "100%",
              height: "250px",      // fixăm înălțimea
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              objectFit: "cover",   // păstrăm proporțiile fără deformare
              cursor: "pointer",    // arată că e clickabil
              transition: "transform 0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          <img
            src="https://earthobservatory.nasa.gov/ContentFeature/BlueMarble/Images/land_ocean_ice_2048.jpg"
            alt="Earth from satellite"
            style={{
              width: "100%",
              height: "250px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              objectFit: "cover",
              cursor: "pointer",
              transition: "transform 0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#2c3e50",
          color: "white",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <p>
          © {new Date().getFullYear()} Land Analysis Platform — Built with ❤️ by
          our team
        </p>
      </footer>
    </div>
  );
}
