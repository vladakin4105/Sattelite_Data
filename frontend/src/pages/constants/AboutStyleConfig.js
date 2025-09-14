// src/pages/AboutStyleConfig.js

export const ABOUT_STYLES = {
  // container that holds all slides (scroll-snap)
  container: {
    height: "100vh",
    width: "100%",
    overflowY: "auto",
    scrollSnapType: "y mandatory",
    position: "relative",
    fontFamily: "Arial, Helvetica, sans-serif",
    WebkitFontSmoothing: "antialiased",
    background: "linear-gradient(to bottom, #e6f2ff, #f7fff0)",
    boxSizing: "border-box",
  },

  slidesWrapper: {
    display: "block",
    overflow: "hidden"
  },

  // each slide
  slide: {
    height: "100vh",
    width: "100%",
    display: "flex",
    scrollSnapAlign: "start",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    boxSizing: "border-box",
    overflow: "hidden"
  },

  // inner card inside a slide
  slideInner: {
    width: "100%",
    maxWidth: "980px",
    background: "rgba(255,255,255,0.85)",
    padding: "28px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(35, 47, 63, 0.12)",
    backdropFilter: "blur(4px)",
  },

  slideTitle: {
    margin: "0 0 12px 0",
    color: "#2c3e50",
    fontSize: "2rem",
    textAlign: "center",
  },

  slideBody: {
    color: "#2f3b45",
    fontSize: "1.05rem",
    lineHeight: 1.6,
    textAlign: "left",
    overflow: "hidden"
  },

  // images row
  imagesRow: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginTop: "8px",
  },

  resourceLink: {
    display: "block",
    transition: "transform .25s ease, box-shadow .25s ease",
    borderRadius: "10px",
    overflow: "hidden",
  },

  resourceImg: {
    width: "280px",
    height: "180px",
    objectFit: "cover",
    borderRadius: "10px",
    display: "block",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    transition: "transform .25s ease, box-shadow .25s ease",
    willChange: "transform, box-shadow",
  },

  architectureImg: {
    width: "calc(100% - 1rem)",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
  },

  aboutList: {
    paddingLeft: "1.25rem",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "12px",
  },

  // different background gradients for slide variants
  variantBackgrounds: {
    intro: "linear-gradient(180deg, #e6f2ff 0%, #f7fff0 100%)",
    resources: "linear-gradient(180deg, #fffaf0 0%, #fff0f7 100%)",
    mission: "linear-gradient(180deg, #f0fff4 0%, #e6f7ff 100%)",
    business: "linear-gradient(180deg, #fff7f0 0%, #f0f0ff 100%)",
    features: "linear-gradient(180deg, #f5fff5 0%, #f0f7ff 100%)",
    architecture: "linear-gradient(180deg, #f0f2ff 0%, #fffaf6 100%)",
    footer: "linear-gradient(180deg, #f7f7f7 0%, #eef6ff 100%)",
  },

  // dots nav (right side)
  dotsNav: {
    position: "fixed",
    right: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 1200,
  },

  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "2px solid rgba(44,62,80,0.25)",
    background: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    transition: "transform .18s ease, background .18s ease, box-shadow .18s ease",
  },

  dotActive: {
    background: "#2c69c5",
    boxShadow: "0 6px 14px rgba(44,105,197,0.18)",
    borderColor: "rgba(44,69,110,0.15)",
    transform: "scale(1.08)",
  },

  // controls bottom center
  controls: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "18px",
    display: "flex",
    gap: "10px",
    zIndex: 1200,
  },

  ctrlBtn: {
    background: "#2c69c5",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 6px 18px rgba(44,105,197,0.16)",
    transition: "transform .12s ease, opacity .12s ease",
  },

  ctrlBtnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
    transform: "none",
  },

  // responsive tweaks (used programmatically if wanted)
  responsive: {
    smallImg: { width: "220px", height: "140px" },
    smallTitle: { fontSize: "1.6rem" },
  },

  centerpieceContainer: {
  display: "flex",
  gap: "20px",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  marginTop: "18px",
},

centerSvgWrapper: {
  flex: "0 0 240px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
},

centerSvg: {
  width: "180px",
  height: "180px",
  display: "block"
},

statGrid: {
  display: "flex",
  gap: "12px",
  flex: "1 1 420px",
  justifyContent: "space-between",
  flexWrap: "wrap"
},

statCard: {
  flex: "1 1 120px",
  minWidth: "120px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,245,250,0.95))",
  padding: "12px 14px",
  borderRadius: "10px",
  boxShadow: "0 8px 18px rgba(35,47,63,0.06)",
  textAlign: "center"
},

statNumber: {
  fontSize: "1.6rem",
  fontWeight: 700,
  color: "#2c69c5",
  marginBottom: "6px",
},

statLabel: {
  fontSize: "0.95rem",
  color: "#4a5560",
  lineHeight: 1.3
},
// AboutStyleConfig.js -> în ABOUT_STYLES adaugă:

formulaBox: {
  marginTop: "16px",
  background: "rgba(250,250,255,0.95)",
  border: "1px solid rgba(40,60,90,0.06)",
  padding: "12px",
  borderRadius: "10px",
  boxShadow: "0 8px 18px rgba(35,47,63,0.04)",
},

codeBlock: {
  display: "block",
  background: "#0f1724",     // dark background for code
  color: "#e6eef8",
  padding: "12px",
  borderRadius: "8px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace",
  fontSize: "0.75rem",
  lineHeight: 1.45,
  whiteSpace: "pre",
  overflowX: "auto",
  marginTop: "8px",
},



};
