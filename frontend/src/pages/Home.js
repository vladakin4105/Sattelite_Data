// Home.js
import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';
import { UserContext } from '../context/UserContext';
import { api } from '../utils/api';
import mapMenu from '../utils/mapMenu';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

import NdviButton from "../components/NdviButton";
import ModisButton from "../components/ModisButton";
import { useNavigate } from 'react-router-dom';
import History from '../utils/History';

 

const PENDING_KEY = "pending_coords";


 
const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map reference and initialization
const MapInitializer = ({ mapRef, onMapReady }) => {
  const map = useMap();

  useEffect(() => {
    if (map && mapRef) {
      mapRef.current = map;
      console.log('Map reference set:', map);
      if (onMapReady) {
        onMapReady(map);
      }
    }
  }, [map, mapRef, onMapReady]);

  return null;
};

const MapMenuControl = ({ mapRef, onCoordsUpdate }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const menuItems = mapMenu(mapRef, map, (x1, y1, x2, y2) => {
      if (typeof onCoordsUpdate === "function") {
        onCoordsUpdate({ x1, y1, x2, y2 });
      }
    });

    const CustomControl = L.Control.extend({
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar');
        container.style.background = '#fff';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.padding = '4px';

        menuItems.forEach(item => {
          const btn = L.DomUtil.create('button', '', container);
          btn.innerHTML = renderToStaticMarkup(item.icon);
          btn.title = item.label;
          btn.style.cursor = 'pointer';
          btn.style.fontSize = '16px';
          btn.style.background = '#ffffff';
          btn.style.border = '1px solid #ddd';
          btn.style.borderRadius = '6px';
          btn.style.padding = '6px';
          btn.style.display = 'flex';
          btn.style.alignItems = 'center';
          btn.style.justifyContent = 'center';
          btn.style.width = '40px';
          btn.style.height = '40px';
          btn.style.pointerEvents = 'auto';

          btn.addEventListener('mouseover', () => btn.style.background = '#eef6ff');
          btn.addEventListener('mouseout', () => btn.style.background = '#ffffff');
          btn.addEventListener('click', item.action);
        });

        L.DomEvent.disableClickPropagation(container);
        return container;
      }
    });

    const controlInstance = new CustomControl({ position: 'topright' });
    map.addControl(controlInstance);

    return () => map.removeControl(controlInstance);
  }, [map, mapRef, onCoordsUpdate]);

  return null;
};

const removeNdviOverlay = (map) => {
  if(!map) return;
  if(map._ndviOverlay) {
    try {
      // Revoke URL if it exists
      if (map._ndviOverlay._url && map._ndviOverlay._url.startsWith('blob:')) {
        URL.revokeObjectURL(map._ndviOverlay._url);
      }
      map.removeLayer(map._ndviOverlay);
    } catch (e) {
      console.warn('Error removing NDVI overlay:', e);
    }
    map._ndviOverlay = null;
  }
};

const fetchAndShowNdviOverlay = async (mapRef, username, x1, y1, x2, y2) => {
  if (!mapRef.current) {
    console.error('Map ref not available');
    return;
  }

  console.log('Fetching NDVI for user:', username, 'coordinates:', { x1, y1, x2, y2 });

  try {
    // Use fetch instead of axios for better blob handling
    const response = await fetch(`${api.defaults.baseURL}/users/${username}/coords/ndvi`, {
      method: 'GET',
      headers: {
        'Accept': 'image/png',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const blob = await response.blob();
    console.log('Received blob:', blob.type, blob.size, 'bytes');

    if (blob.size === 0) {
      throw new Error('Received empty response');
    }

    const url = URL.createObjectURL(blob);
    console.log('Created blob URL:', url);

    // Convert coordinates to numbers and validate
    const lon1 = parseFloat(x1);
    const lat1 = parseFloat(y1);
    const lon2 = parseFloat(x2);
    const lat2 = parseFloat(y2);

    if (isNaN(lon1) || isNaN(lat1) || isNaN(lon2) || isNaN(lat2)) {
      throw new Error('Invalid coordinates');
    }

    // Compute Leaflet bounds: [[south, west], [north, east]]
    const south = Math.min(lat1, lat2);
    const north = Math.max(lat1, lat2);
    const west = Math.min(lon1, lon2);
    const east = Math.max(lon1, lon2);
    const bounds = [[south, west], [north, east]];

    console.log('Creating overlay with bounds:', bounds);

    // Remove previous overlay
    removeNdviOverlay(mapRef.current);

    // Create and add the overlay
    const overlay = L.imageOverlay(url, bounds, { 
      opacity: 1.0,
      interactive: false,
      crossOrigin: false,
      pane: 'overlayPane'
    });

    overlay.addTo(mapRef.current);
    
    // Store references for cleanup
    overlay._url = url;
    mapRef.current._ndviOverlay = overlay;

    // Fit map to overlay bounds with padding
    mapRef.current.fitBounds(bounds, { padding: [20, 20] });

    // Handle overlay events
    overlay.on('load', () => {
      console.log('NDVI overlay loaded successfully');
      // Force a redraw/refresh
      mapRef.current.invalidateSize();
    });

    overlay.on('error', (e) => {
      console.error('NDVI overlay failed to load:', e);
      alert('Failed to load NDVI overlay. Please try again.');
    });

    overlay.on('add', () => {
      console.log('NDVI overlay added to map');
      // Try to bring overlay to front
      overlay.bringToFront();
    });

    // Clean up URL when overlay is removed
    overlay.on('remove', () => {
      try {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      } catch (e) {
        console.warn('Error revoking URL on remove:', e);
      }
    });

    console.log('NDVI overlay added to map');

  } catch (err) {
    console.error("Failed to fetch NDVI overlay:", err);
    alert(`NDVI generation failed: ${err.message}`);
  }
};

const fetchAndShowNdviForBBox = async (mapRef, x1, y1, x2, y2, opts = {}) => {
  // Wait a bit if map is not ready yet
  let attempts = 0;
  while (!mapRef.current && attempts < 10) {
    console.log(`Waiting for map... attempt ${attempts + 1}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (!mapRef.current) {
    console.error('Map ref not available after waiting');
    return;
  }

  console.log('Fetching NDVI for bbox:', { x1, y1, x2, y2 }, 'options:', opts);

  try {
    const payload = { 
      bbox: [parseFloat(x1), parseFloat(y1), parseFloat(x2), parseFloat(y2)]
    };
    if (opts.resolution) payload.resolution = opts.resolution;
    if (opts.start) payload.start = opts.start;
    if (opts.end) payload.end = opts.end;

    const response = await fetch(`${api.defaults.baseURL}/ndvi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'image/png',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const blob = await response.blob();
    console.log('Received blob:', blob.type, blob.size, 'bytes');

    if (blob.size === 0) {
      throw new Error('Received empty response');
    }

    const url = URL.createObjectURL(blob);
    console.log('Created blob URL:', url);

    // Convert coordinates to numbers and validate
    const lon1 = parseFloat(x1);
    const lat1 = parseFloat(y1);
    const lon2 = parseFloat(x2);
    const lat2 = parseFloat(y2);

    if (isNaN(lon1) || isNaN(lat1) || isNaN(lon2) || isNaN(lat2)) {
      throw new Error('Invalid coordinates');
    }

    // Compute Leaflet bounds: [[south, west], [north, east]]
    const south = Math.min(lat1, lat2);
    const north = Math.max(lat1, lat2);
    const west = Math.min(lon1, lon2);
    const east = Math.max(lon1, lon2);
    const bounds = [[south, west], [north, east]];

    console.log('Creating overlay with bounds:', bounds);

    // Remove previous overlay
    removeNdviOverlay(mapRef.current);

    // Create and add the overlay
    const overlay = L.imageOverlay(url, bounds, { 
      opacity: 1.0,
      interactive: false,
      crossOrigin: false,
      pane: 'overlayPane'
    });

    overlay.addTo(mapRef.current);
    
    // Store references for cleanup
    overlay._url = url;
    mapRef.current._ndviOverlay = overlay;

    // Fit map to overlay bounds with padding
    mapRef.current.fitBounds(bounds, { padding: [20, 20] });

    // Handle overlay events
    overlay.on('load', () => {
      console.log('NDVI overlay loaded successfully');
      // Force a redraw/refresh
      mapRef.current.invalidateSize();
    });

    overlay.on('error', (e) => {
      console.error('NDVI overlay failed to load:', e);
      alert('Failed to load NDVI overlay. Please try again.');
    });

    overlay.on('add', () => {
      console.log('NDVI overlay added to map');
      // Try to bring overlay to front
      overlay.bringToFront();
    });

    // Clean up URL when overlay is removed
    overlay.on('remove', () => {
      try {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      } catch (e) {
        console.warn('Error revoking URL on remove:', e);
      }
    });

    console.log('NDVI overlay added to map');

  } catch (err) {
    console.error("Failed to fetch NDVI overlay for bbox:", err);
    alert(`NDVI generation failed: ${err.message}`);
  }
};

export default function Home() {
  const { user, setUsername } = useContext(UserContext);
  const [position, setPosition] = useState([44.4268, 26.1025]);
  const [message, setMessage] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [guestPendingCoords, setGuestPendingCoords] = useState([]);
  const [guestActions, setGuestActions] = useState([]);
  const [coordInputs, setCoordInputs] = useState({ x1: '25.0', y1: '45.0', x2: '25.1', y2: '45.1' });
  const [isLoadingNdvi, setIsLoadingNdvi] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const [ndviActive, setNdviActive] = useState(false);
  
  const { logout } = useContext(UserContext); // folosește logout, nu setUser
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // resetează user și storage
    navigate('/auth', { replace: true }); // du-te la pagina de autentificare
  };
  
  const savePendingCoord = (coord) => {
    try {
      const arr = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
      arr.push(coord);
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(arr));
    } catch (e) {
      setGuestPendingCoords(prev => [...prev, coord]);
    }
  };

  const createUserIfNotExists = async (username) => {
    const res = await api.post('/users', { username });
    return res.data;
  };

  const flushPendingCoordsToServer = async (username) => {
    let pendingToFlush = [];
    try {
      pendingToFlush = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
      sessionStorage.removeItem(PENDING_KEY);
    } catch (e) {
      pendingToFlush = [...guestPendingCoords];
      setGuestPendingCoords([]);
    }

    for (const p of pendingToFlush) {
      try {
        await api.post(`/users/${username}/coords`, p);
      } catch (err) { console.error(err); }
    }
  };

  /*const saveBox = async (x1, y1, x2, y2) => {
    const coord = { x1: parseFloat(x1), y1: parseFloat(y1), x2: parseFloat(x2), y2: parseFloat(y2) };
    if (Object.values(coord).some(isNaN)) {
      alert("Please enter valid numeric coordinates.");
      return;
    }

    // Check if map is ready
    if (!mapReady || !mapRef.current) {
      alert("Map is not ready yet. Please wait a moment and try again.");
      return;
    }

    setIsLoadingNdvi(true);
    setMessage('Loading NDVI data...');

    if (!user || user.username === "guest") {
      savePendingCoord(coord);
      try {
        await fetchAndShowNdviForBBox(mapRef, coord.x1, coord.y1, coord.x2, coord.y2, { resolution: 60 });
        setMessage('NDVI overlay loaded for guest');
      } catch (err) {
        setMessage('');
        console.error('Error loading NDVI for guest:', err);
      }
      setIsLoadingNdvi(false);
      return;
    }

    try {
      await createUserIfNotExists(user.username);
      await api.post(`/users/${user.username}/coords`, coord);
      await fetchAndShowNdviOverlay(mapRef, user.username, coord.x1, coord.y1, coord.x2, coord.y2);
      setMessage(`NDVI overlay loaded for user ${user.username}`);
    } catch (err) { 
      console.error('Error saving/loading for user:', err);
      alert("Failed to save to server."); 
      setMessage('');
    }
    setIsLoadingNdvi(false);
  };*/

  const saveBox = async (x1, y1, x2, y2, generateNdvi = false) => {
  const coord = { 
    x1: parseFloat(x1), 
    y1: parseFloat(y1), 
    x2: parseFloat(x2), 
    y2: parseFloat(y2) 
  };

  if (Object.values(coord).some(isNaN)) {
    alert("Please enter valid numeric coordinates.");
    return;
  }

  if (!mapReady || !mapRef.current) {
    alert("Map is not ready yet. Please wait a moment and try again.");
    return;
  }

  try {
    if (!user || user.username === "guest") {
      savePendingCoord(coord);
    } else {
      await createUserIfNotExists(user.username);
      await api.post(`/users/${user.username}/coords`, coord);
    }
  } catch (err) {
    console.error('Error saving coordinates:', err);
  }

  if (generateNdvi) {
    setIsLoadingNdvi(true);
    setMessage('Loading NDVI data...');
    try {
      if (!user || user.username === "guest") {
        await fetchAndShowNdviForBBox(mapRef, coord.x1, coord.y1, coord.x2, coord.y2, { resolution: 60 });
      } else {
        await fetchAndShowNdviOverlay(mapRef, user.username, coord.x1, coord.y1, coord.x2, coord.y2);
      }
      setMessage('NDVI overlay loaded');
      setNdviActive(true);
    } catch (err) {
      console.error('Error generating NDVI:', err);
      setMessage('');
      alert('Failed to generate NDVI.');
    }
    setIsLoadingNdvi(false);
  }
};


  const handleMapReady = useCallback((map) => {
    console.log('Map is ready:', map);
    setMapReady(true);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => setPosition([pos.coords.latitude, pos.coords.longitude]), () => {});
    }
  }, []);

  // Cleanup overlay on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        removeNdviOverlay(mapRef.current);
      }
    };
  }, []);

  const handlePress = () => {
    const msg = `User "${user?.username ?? 'guest'}" pressed the button`;
    setMessage(msg);
    const action = { type: 'press', at: new Date().toISOString() };
    if (!user || user.username === "guest") setGuestActions(prev => [...prev, action]);
    else {
      try {
        const key = `actions:${user.username}`;
        const prev = JSON.parse(localStorage.getItem(key) || '[]');
        prev.push(action);
        localStorage.setItem(key, JSON.stringify(prev));
      } catch { setGuestActions(prev => [...prev, action]); }
    }
  };

  const handleChangeName = (e) => setNameInput(e.target.value);
  const handleCoordChange = (field, value) => setCoordInputs(prev => ({ ...prev, [field]: value }));
  const handleSaveCoords = async (e) => {
  e.preventDefault();

  if (!mapReady) {
    alert("Map is not ready yet.");
    return;
  }

  if (!user || user.username === "guest") {
    alert("Coordinates cannot be saved. You must have an account.");
    return;
  }

  try {
    await saveBox(
      parseFloat(coordInputs.x1),
      parseFloat(coordInputs.y1),
      parseFloat(coordInputs.x2),
      parseFloat(coordInputs.y2)
    );

    alert(`Coordinates saved successfully for ${user.username}`);
  } catch (err) {
    console.error("Error saving coordinates:", err);
    alert("An error occurred while saving coordinates. Please try again.");
  }
};

const deleteCoord = async (coordId) => {
    if (!user) return;
    try {
      const res = await fetch(
        `http://localhost:8000/users/${user.username}/coords/${coordId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete coord");
      alert(` Coordinate deleted for user: ${user.username}`);
    } catch (err) {
      console.error("Error deleting coord:", err);
      throw err;
    }
  };


const showRectOnMap = () => {
  if (!mapRef.current) return;

  // Dacă există deja un dreptunghi, îl ștergem
  if (rectLayerRef.current) {
    mapRef.current.removeLayer(rectLayerRef.current);
  }

  const { x1, y1, x2, y2 } = coordInputs;
  const lon1 = parseFloat(x1);
  const lat1 = parseFloat(y1);
  const lon2 = parseFloat(x2);
  const lat2 = parseFloat(y2);

  if ([lon1, lat1, lon2, lat2].some(isNaN)) {
    alert("Invalid coordinates. Cannot draw rectangle.");
    return;
  }

  const bounds = [
    [Math.min(lat1, lat2), Math.min(lon1, lon2)],
    [Math.max(lat1, lat2), Math.max(lon1, lon2)]
  ];

  const rect = L.rectangle(bounds, {
  color: "#3388ff",      // aceeași culoare ca Leaflet Draw
  weight: 2,
  fill: true,
  fillOpacity: 0.2
}).addTo(mapRef.current);


  // Opțional: facem zoom pe dreptunghi
  mapRef.current.fitBounds(bounds, { padding: [20, 20] });

  if (mapRef.current._historyRect) {
  mapRef.current.removeLayer(mapRef.current._historyRect);
}
mapRef.current._historyRect = rect;

};

 const rectLayerRef = useRef(null);

  const handleSetName = async (e) => {
    e.preventDefault();
    const newName = nameInput.trim();
    if (!newName) return;
    try {
      await createUserIfNotExists(newName);
      setUsername(newName);
      await flushPendingCoordsToServer(newName);
      setNameInput('');
      alert(`Username set to: ${newName}`);
    } catch { alert("Failed to create user or flush data."); }
  };

  const getPendingCoordsCount = () => {
    if (!user || user.username === "guest") return guestPendingCoords.length;
    try { return JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]").length; } 
    catch { return guestPendingCoords.length; }
  };

  const getActionsCount = () => {
    if (!user || user.username === "guest") return guestActions.length;
    try { return JSON.parse(localStorage.getItem(`actions:${user.username}`) || '[]').length; } 
    catch { return guestActions.length; }
  };

  const handleRemoveOverlay = () => {
    if (mapRef.current) {
      removeNdviOverlay(mapRef.current);
      setMessage('NDVI overlay removed');
    }
  };
  const handleHistorySelect = (item) => {
  setCoordInputs({
    x1: item.x1.toString(),
    y1: item.y1.toString(),
    x2: item.x2.toString(),
    y2: item.y2.toString()
  });
   if (mapRef.current) {
    mapRef.current.invalidateSize({ animate: true });
  }
};


  // --- Funcție pentru update coordonate din draw ---
  const handleDrawCoordsUpdate = ({ x1, y1, x2, y2 }) => {
    setCoordInputs({ 
      x1: x1.toString(), 
      y1: y1.toString(), 
      x2: x2.toString(), 
      y2: y2.toString() 
    });
    saveBox(x1, y1, x2, y2);

  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <div style={{ flex: 1, background: 'linear-gradient(145deg, #4f4f4f, #3a3a3a)', padding: '1rem', color: '#fff' }}>
        <h3>Menu</h3>
         
         <NdviButton 
         mapRef={mapRef} 
         coordInputs={coordInputs} 
         saveBox={saveBox} 
         />
         
        <ModisButton onClick={() => {}} />  {/* momentan nu face nimic */}

        <div style={{ background: '#555', padding: '1rem', borderRadius: '8px', boxShadow: '2px 2px 5px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
  <span>Current user: <strong>{user?.username ?? 'guest'}</strong></span>
  
  <button
    onClick={handleLogout}
    style={{
      marginLeft: 'auto',
      padding: '0.25rem 0.5rem',
      fontSize: '0.8rem',
      borderRadius: '4px',
      backgroundColor: '#000000ff',
      color: 'white',
      border: 'none',
      cursor: 'pointer'
    }}
  >
    Log Out
  </button>

</div>

          <p>Map status: <strong>{mapReady ? 'Ready' : 'Loading...'}</strong></p>
          <form onSubmit={handleSetName} style={{ marginBottom: '0.5rem' }}>
            <input value={nameInput} onChange={handleChangeName} placeholder="Set display name" style={{ marginRight: '0.5rem', padding: '0.25rem' }}/>
            <button type="submit" style={{ padding: '0.25rem 0.5rem' }}>Set</button>
          </form>
          <button onClick={handlePress} style={{ display: 'block', marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>Press me</button>
          
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#666', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9em' }}>Enter Coordinates:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {['x1','y1','x2','y2'].map((f, i) => (
                <div key={f}>
                  <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '2px' }}>{f.toUpperCase()}:</label>
                  <input type="number" step="0.000001" value={coordInputs[f]} onChange={(e) => handleCoordChange(f, e.target.value)} style={{ width: '100%', padding: '0.25rem', borderRadius: '3px', border: 'none' }}/>
                </div>
              ))}
            </div>
            <button 
              onClick={handleSaveCoords} 
              disabled={isLoadingNdvi || !mapReady}
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                backgroundColor: (isLoadingNdvi || !mapReady) ? '#555' : '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: (isLoadingNdvi || !mapReady) ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}
            >
              {!mapReady ? 'Map Loading...' : (isLoadingNdvi ? 'Loading NDVI...' : 'Save Coordinates')}
            </button>
            
        

            {ndviActive && (
  <button 
    onClick={() => {
      handleRemoveOverlay();
      setNdviActive(false); // dezactivează overlay-ul
    }}
    disabled={!mapReady}
    style={{ 
      width: '100%', 
      padding: '0.5rem', 
      backgroundColor: !mapReady ? '#555' : '#dc3545', 
      color: 'white', 
      border: 'none', 
      borderRadius: '4px', 
      cursor: !mapReady ? 'not-allowed' : 'pointer', 
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    }}
  >
    Remove NDVI Overlay
  </button>
)}


            <button 
  onClick={showRectOnMap}
  disabled={!mapReady}
  style={{ 
    width: '100%', 
    padding: '0.5rem', 
    backgroundColor: !mapReady ? '#555' : '#28a745', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: !mapReady ? 'not-allowed' : 'pointer', 
    fontWeight: 'bold'
  }}
>
  Show on Map
</button>

            
<History fetchHistory={async () => {
  try {
    const response = await fetch(`http://localhost:8000/users/${user.username}/coords`);
    if (!response.ok) throw new Error("Failed to fetch history");
    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}} onSelect={handleHistorySelect} deleteCoord={deleteCoord} />

          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.9em' }}>
            <div style={{ marginBottom: '0.5rem' }}><strong>Storage type:</strong> {(!user || user.username === "guest") ? "Temporary" : "Persistent"}</div>
            {getPendingCoordsCount() > 0 && <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,165,0,0.2)', borderRadius: 4 }}><strong>Pending coordinates:</strong> {getPendingCoordsCount()}</div>}
            {getActionsCount() > 0 && <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(0,255,0,0.2)', borderRadius: 4 }}><strong>Actions:</strong> {getActionsCount()}</div>}
          </div>

          {message && <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: 6 }}>{message}</div>}
        </div>
      </div>

      <div style={{ flex: 2, position: 'relative' }}>
        <MapContainer 
          center={position} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer attribution='Tiles © Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"/>
          <Marker position={position} icon={defaultIcon}><Popup>Your location</Popup></Marker>
          <MapInitializer mapRef={mapRef} onMapReady={handleMapReady} />
          <MapMenuControl mapRef={mapRef} onCoordsUpdate={handleDrawCoordsUpdate} />
        </MapContainer>
      </div>
    </div>
  );
}