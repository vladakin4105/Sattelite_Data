// src/pages/About.js
import React, { useEffect, useRef, useState } from "react";
import diagramImage from "../assets/Architecture.drawio.png";
import networkDiagram from "../assets/networkdiagram.drawio.png";
import ModisImage from "../assets/image.png";
import { ABOUT_STYLES } from "./constants/AboutStyleConfig";
import { HorizontalSatelliteBanner, DataFlowDiagram, createLandCoverAnimation} from './constants/AboutAnimations';


const slidesContent = [
  {
    id: "intro",
    title: "About Our Land Analysis Platform",
    body: (
      <>
        <p style={{ marginTop: "48px"}}>
          This application leverages <strong>NASA’s MODIS satellite data</strong> to provide
          insights into agricultural fields and land usage. By selecting an area of interest
          on the map, users can generate tailored analyses that highlight vegetation status
          and environmental conditions.
        </p>
        <hr style={{ margin: "48px 0" }} />
        <div style={ABOUT_STYLES.imagesRow}>
          {[
            {
              href: "https://earthobservatory.nasa.gov/",
              src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgwb7XN-OyiS4M_s01SDlNwBfTfVq5kIPzFQ&s",
              alt: "Earth Observatory",
            },
            {
              href: "https://modis.gsfc.nasa.gov/gallery/",
              src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyWGdbAKGbQ5Nh6susriVjB71-nvJz6MSLLw&s",
              alt: "MODIS Gallery",
            },
            {
              href: "https://earthdata.nasa.gov/",
              src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxESBhURExIKFRMXDSAYGRcVEyYWGhgaFhUZHRkZHRgYHiggHSInGxYXITEtJS0rLi4wFyE1OzMsNyguLysBCgoKDg0NGxAQGjAjHyUtLjIrLy83Ky0tMC0tMi81NS03Ky02LS01LSsuNTYtNS0wLTUwKy0yKy0tLi0vKzUvK//AABEIAMYA/wMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAAAQQFBgcDAgj/xABFEAACAgECBAMDBwgIBQUAAAABAgADEQQhBRIxQQYTUSJhgQcUMjNxcpEVQlJzobGywSNUYpKis9HSJDRTdOEWFzWCk//EABgBAQEBAQEAAAAAAAAAAAAAAAABAgME/8QAKBEBAAIBAwIGAgMBAAAAAAAAAAECEQMSITHhQWFxgcHwUbEEkaET/9oADAMBAAIRAxEAPwDl56yI7xPU8pERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEkdZEkdYEd4jvEBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEkdZEkdYEd4jvEBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEkdZEkdYEd4jvEBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEkdZEkdYEd4jvEBERAREs6LQW255FyFGWYkIiD1Z2IVfiZFVomRXS6Zfp6l3PcUUkr8LLSgPwUj3yTRpDt5uvrPq9K2D8EcH98ZXDGxL13C3GnNqNTdUvV6iTyj+2jAOn/wBlx75RjKTGCIiVCJ76PR23XclVdtjeiLk/HHT4zKDwhxH+qan/AA/7oxKTaI6ywkS7xDhOoox51N9eTsWXb8RtKaqSwABJJwABkk+gA6wsTlETM1+E+IMmRpNVj3gD9jEGfZ8HcR/qmp/Ff90YlnfX8sHEvcR4NqdOyi6m6sucLzY9ogjYYJ9R+Mt2+E9etRZtLqQoXJO2wHU4DZjEruj8sNPTT0PZeERXZ2OAqjJJ9AJkND4d1l1AerTalkIyGwADnuOYjMzPgjgeqHiCm80XCpL2DOcYUqGVgQTnZtowTbjhg9ZwLV1ac2W6fVIg6syYAycDf7ZjXOEJ907j4y09l3hq6qtWdygC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",
              alt: "Earth Data",
            },
          ].map((img, i) => (
            <a
              key={i}
              href={img.href}
              target="_blank"
              rel="noopener noreferrer"
              style={ABOUT_STYLES.resourceLink}
            >
              <img
                src={img.src}
                alt={img.alt}
                style={ABOUT_STYLES.resourceImg}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.035)";
                  e.currentTarget.style.boxShadow = "0 10px 26px rgba(0,0,0,0.18)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = ABOUT_STYLES.resourceImg.boxShadow;
                }}
              />
            </a>
          ))}
        </div>
        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          Learn more at{" "}
          <a href="https://modis.gsfc.nasa.gov/" target="_blank" rel="noopener noreferrer">
            <strong>NASA MODIS</strong>
          </a>
        </p>
      </>
    ),
  },
  
  {
    id: "mission & business",
    title: "Our Mission & Business Value",
    body: (
      <>
        <p>
          Our platform empowers users to <strong>identify and analyze land types</strong> directly from satellite data.
          By selecting specific territories, users can instantly see whether the land is <strong>agricultural, urban, water-covered, or natural</strong>.
        </p>

        <p>
          Additionally, users can apply the <strong>NDVI (Normalized Difference Vegetation Index)</strong> filter to measure vegetation health
          and monitor land productivity.
        </p>

        
        <HorizontalSatelliteBanner />


        <p>
          With growing pressure on land resources, <strong>transparent and data-driven land evaluation</strong> is essential.
          Our solution transforms raw satellite data into <strong>actionable business intelligence</strong>.
        </p>

        <ul style={ABOUT_STYLES.aboutList}>
          <li><strong>Farmers</strong> can validate crop areas and monitor productivity.</li>
          <li><strong>Investors</strong> can identify underutilized agricultural zones.</li>
          <li><strong>Real estate developers</strong> can evaluate if land is suitable for construction or other projects.</li>
          <li><strong>Government and NGOs</strong> can use the tool for environmental monitoring and planning.</li>
        </ul>
      </>
    ),
  },
  {
    id: "features",
    title: "Application Features",
    body: (
      <>
        <div style={{ justifyContent: "center", display: "flex", flexDirection: "row", gap: "16px" }}>
          <ul style={ABOUT_STYLES.aboutList}>
            <li>Secure <strong>user authentication</strong> backed by SQL.</li>
            <li><strong>Select territories</strong> directly on the map for targeted analysis.</li>
            <li>Apply <strong>NDVI</strong> and <strong>MODIS</strong> analysis filters.</li>
            <li>Automatic <strong>data saving</strong> and personalized history.</li>
            <li>Intuitive <strong>real-time visualization</strong>.</li>
          </ul>
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <img src={networkDiagram} alt="Network Diagram" style={ABOUT_STYLES.architectureImg} />
          </div>
        </div>
        
      </>
    ),
  },
  {
  id: "ndvi",
  title: "NDVI Analysis",
  body: (
    <>
      <p>
        The NDVI (Normalized Difference Vegetation Index) is a key metric for assessing vegetation health and
        monitoring land productivity. By analyzing satellite data, users can gain insights into crop health,
        identify stressed areas, and make informed decisions about resource allocation.
      </p>
      <DataFlowDiagram />
      <p>
        Our platform allows users to apply NDVI analysis filters to specific territories, enabling targeted
        assessments and facilitating precision agriculture practices.
      </p>

      {/* formula box */}
      <div title="NDVI Formula" style={ABOUT_STYLES.formulaBox}>
        <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700" }}>NDVI Script</p>

        {/* original implementation (readable, copyable) */}
        <pre style={ABOUT_STYLES.codeBlock}>
      {
`       function setup() {
        return {
          input: [{ bands: ["B04", "B08", "dataMask"] }],
          output: { bands: 4, sampleType: "UINT8" }
        };
      }

      function evaluatePixel(sample) {
        let val = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
        imgVals = compute(val);
        imgVals.push(sample.dataMask * 255);
        return imgVals;
      }`}
        </pre>
      </div>
    </>
  )
},{
    id: "MODIS",
    title: "Land Cover Classification Type UMD with MODIS",
    body: (
      <>
        <p>
          The MODIS Land Cover Type product provides global land cover classification at a 500-meter resolution and <strong style={{color: "#990000"}}> temporal resolution of one year </strong>.
        </p>
        {createLandCoverAnimation()}
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "row", justifyContent: "center" , alignItems: "center", gap: "16px"}}>
          
          <p style={{ marginBottom: "12px"}}>
            The UMD Land Cover Classification is based on MODIS data and provides insights into land cover changes over time. <br />
            Types:<br />
            <ul style={{ fontSize: "0.8rem" }}>
              <li>0: 'Water bodies'</li>
              <li>1: 'Evergreen Needleleaf Forests'</li>
              <li>2: 'Evergreen Broadleaf Forests'</li>
              <li>3: 'Deciduous Needleleaf Forests'</li>
              <li>4: 'Deciduous Broadleaf Forests'</li>
              <li>5: 'Mixed Forests'</li>
              <li>6: 'Closed Shrublands'</li>
              <li>7: 'Open Shrublands'</li>
              <li>8: 'Woody Savannas'</li>
              <li>9: 'Savannas'</li>
              <li>10: 'Grasslands'</li>
              <li>11: 'Permanent Wetlands'</li>
              <li>12: 'Croplands'</li>
              <li>13: 'Urban and Built-up Lands'</li>
              <li>14: 'Cropland/Natural Vegetation Mosaics'</li>
              <li>15: 'Permanent Snow and Ice'</li>
              <li>16: 'Unclassified'</li>
            </ul>
          </p>
          <img src={ModisImage} alt="MODIS Land Cover Classification" style={{ borderRadius: "8px" , width: "50%", height: "auto"}} />
        </div>
        
      </>
    )
},
  {
    id: "architecture",
    title: "System Architecture",
    body: (
      <>
        <div style={{ textAlign: "center" }}>
          <img src={diagramImage} alt="System Architecture Diagram" style={ABOUT_STYLES.architectureImg} />
        </div>
        <p style={{ marginLeft: "1rem", marginRight: "1rem", padding: "1rem" , justifyContent: "center", gap: "8px"}}>
          The application is a modular, scalable pipeline:<br />The React/Leaflet frontend captures user-selected areas and requests analyses from a FastAPI backend. The backend manages calls to satellite-processing services (Sentinel Hub / Google Earth Engine) to produce NDVI and MODIS land-cover outputs, caches generated tiles/images, and stores data and user coordinates in a Postgres database. Results are returned as <strong>map overlays</strong> or <strong>JSON reports</strong>.
        </p>
      </>
    ),
  },
  {
    id: "footer",
    title: "Thank you",
    body: (
      <>
        <p>© {new Date().getFullYear()} Land Analysis Platform — Built with ❤️ by our team
          <br />
          Team Members: <strong> Costea Carmen Andreea, Mangiurea Alina-Daniela, Popescu George-Vlad</strong>
        </p>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>Scroll up to review slides or use the side dots navigation.</p>
        
      </>
      
    ),
  },
];

export default function About() {
  const containerRef = useRef(null);
  const slideRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, slidesContent.length);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const options = { root: container, threshold: 0.6 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute("data-index"));
          setActiveIndex(idx);
        }
      });
    }, options);

    slideRefs.current.forEach((el) => { if (el) observer.observe(el); });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (idx) => {
    const el = slideRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goPrev = () => { if (activeIndex > 0) scrollTo(activeIndex - 1); };
  const goNext = () => { if (activeIndex < slidesContent.length - 1) scrollTo(activeIndex + 1); };

  return (
    <div ref={containerRef} style={ABOUT_STYLES.container}>
      <div style={ABOUT_STYLES.slidesWrapper}>
        {slidesContent.map((slide, idx) => (
          <section
            key={slide.id}
            data-index={idx}
            ref={(el) => (slideRefs.current[idx] = el)}
            style={{ 
              ...ABOUT_STYLES.slide, 
              background: ABOUT_STYLES.variantBackgrounds[slide.id] || ABOUT_STYLES.variantBackgrounds.intro 
            }}
          >
            <div style={ABOUT_STYLES.slideInner}>
              <h2 style={ABOUT_STYLES.slideTitle}>{slide.title}</h2>
              <div style={ABOUT_STYLES.slideBody}>{slide.body}</div>
            </div>
          </section>
        ))}
        
      </div>

      {/* dots */}
      <nav style={ABOUT_STYLES.dotsNav} aria-hidden>
        {slidesContent.map((s, i) => {
          const base = { ...ABOUT_STYLES.dot };
          const style = i === activeIndex ? { ...base, ...ABOUT_STYLES.dotActive } : base;
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={style}
            />
          );
        })}
        
      </nav>
      
    </div>
  );
}
