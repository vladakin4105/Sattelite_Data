// Home.js
import React, { useEffect, useState, useContext, useRef } from 'react';
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

const PENDING_KEY = "pending_coords";

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapMenuControl = ({ mapRef }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Importăm aici pentru a evita problemele cu SSR
    const { Draw } = require('leaflet-draw');

    const menuItems = mapMenu(mapRef, map);

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

          btn.addEventListener('mouseover', () => {
            btn.style.background = '#eef6ff';
          });
          btn.addEventListener('mouseout', () => {
            btn.style.background = '#ffffff';
          });

          btn.addEventListener('click', item.action);
        });

        L.DomEvent.disableClickPropagation(container);
        return container;
      }
    });

    const controlInstance = new CustomControl({ position: 'topright' });
    map.addControl(controlInstance);

    return () => {
      map.removeControl(controlInstance);
    };
  }, [map, mapRef]);

  return null;
};

export default function Home() {
  const { user, setUsername } = useContext(UserContext);
  const [position, setPosition] = useState([44.4268, 26.1025]);
  const [message, setMessage] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Pentru guest - storage temporar in state
  const [guestPendingCoords, setGuestPendingCoords] = useState([]);
  const [guestActions, setGuestActions] = useState([]);

  // State pentru coordonate input
  const [coordInputs, setCoordInputs] = useState({
    x1: '25.0',
    y1: '45.0',
    x2: '25.1',
    y2: '45.1'
  });

  const mapRef = useRef(null);

  // savePendingCoord din primul fișier (simplu, sessionStorage)
  const savePendingCoord = (coord) => {
    try {
      const arr = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
      arr.push(coord);
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn("SessionStorage not available, using temporary storage");
      setGuestPendingCoords(prev => [...prev, coord]);
    }
  };

  const createUserIfNotExists = async (username) => {
    try {
      const res = await api.post('/users', { username });
      return res.data;
    } catch (err) {
      console.error("createUserIfNotExists error", err);
      throw err;
    }
  };

  const flushPendingCoordsToServer = async (username) => {
    let pendingToFlush = [];

    try {
      pendingToFlush = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
      sessionStorage.removeItem(PENDING_KEY);
    } catch (e) {
      console.warn("SessionStorage not available, using guest state");
      pendingToFlush = [...guestPendingCoords];
      setGuestPendingCoords([]);
    }

    for (const p of pendingToFlush) {
      try {
        await api.post(`/users/${username}/coords`, p);
      } catch (err) {
        console.error("Failed to push coord", p, err);
      }
    }
  };

  const saveBox = async (x1, y1, x2, y2) => {
    const coord = {
      x1: parseFloat(x1),
      y1: parseFloat(y1),
      x2: parseFloat(x2),
      y2: parseFloat(y2)
    };

    if (isNaN(coord.x1) || isNaN(coord.y1) || isNaN(coord.x2) || isNaN(coord.y2)) {
      alert("Please enter valid numeric coordinates.");
      return;
    }

    if (!user || user.username === "guest") {
      savePendingCoord(coord);
      alert("Saved temporarily for guest (will be lost when page refreshes).");
      return;
    }

    try {
      await createUserIfNotExists(user.username);
      await api.post(`/users/${user.username}/coords`, coord);
      alert("Saved for user " + user.username);
    } catch (err) {
      console.error(err);
      alert("Failed to save to server.");
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      }, () => {});
    }
  }, []);

  const handlePress = () => {
    const msg = `User "${user?.username ?? 'guest'}" pressed the button`;
    setMessage(msg);

    const action = { type: 'press', at: new Date().toISOString() };

    if (!user || user.username === "guest") {
      setGuestActions(prev => [...prev, action]);
    } else {
      try {
        const key = `actions:${user.username}`;
        const prev = JSON.parse(localStorage.getItem(key) || '[]');
        prev.push(action);
        localStorage.setItem(key, JSON.stringify(prev));
      } catch (e) {
        console.warn("LocalStorage not available, using temporary storage");
        setGuestActions(prev => [...prev, action]);
      }
    }
  };

  const handleChangeName = (e) => setNameInput(e.target.value);

  const handleCoordChange = (field, value) => {
    setCoordInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCoords = async () => {
    await saveBox(coordInputs.x1, coordInputs.y1, coordInputs.x2, coordInputs.y2);
  };

  const handleSetName = async (e) => {
    e.preventDefault();
    const newName = nameInput.trim();
    if (!newName) return;

    try {
      await createUserIfNotExists(newName);
      setUsername(newName);
      await flushPendingCoordsToServer(newName);
      setNameInput('');
      alert(`Successfully set username to: ${newName}`);
    } catch (err) {
      console.error("Error in handleSetName:", err);
      alert("Failed to create user or flush data. Check console for details.");
    }
  };

  const getPendingCoordsCount = () => {
    if (!user || user.username === "guest") {
      return guestPendingCoords.length;
    }
    try {
      const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
      return pending.length;
    } catch (e) {
      return guestPendingCoords.length;
    }
  };

  const getActionsCount = () => {
    if (!user || user.username === "guest") {
      return guestActions.length;
    }
    try {
      const key = `actions:${user.username}`;
      const actions = JSON.parse(localStorage.getItem(key) || '[]');
      return actions.length;
    } catch (e) {
      return guestActions.length;
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <div style={{ flex: 1, background: 'linear-gradient(145deg, #4f4f4f, #3a3a3a)', padding: '1rem', color: '#fff' }}>
        <h3>Menu</h3>
        <div style={{ background: '#555', padding: '1rem', borderRadius: '8px', boxShadow: '2px 2px 5px rgba(0,0,0,0.5)' }}>
          <p>Current user: <strong>{user?.username ?? 'guest'}</strong></p>

          <form onSubmit={handleSetName} style={{ marginBottom: '0.5rem' }}>
            <input
              value={nameInput}
              onChange={handleChangeName}
              placeholder="Set display name"
              style={{ marginRight: '0.5rem', padding: '0.25rem' }}
            />
            <button type="submit" style={{ padding: '0.25rem 0.5rem' }}>Set</button>
          </form>

          <button onClick={handlePress} style={{
            display: 'block',
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%'
          }}>
            Press me
          </button>

          <div style={{ marginTop: '1rem', padding: '1rem', background: '#666', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9em' }}>Enter Coordinates:</h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '2px' }}>X1:</label>
                <input
                  type="number"
                  step="0.000001"
                  value={coordInputs.x1}
                  onChange={(e) => handleCoordChange('x1', e.target.value)}
                  style={{ width: '100%', padding: '0.25rem', borderRadius: '3px', border: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '2px' }}>Y1:</label>
                <input
                  type="number"
                  step="0.000001"
                  value={coordInputs.y1}
                  onChange={(e) => handleCoordChange('y1', e.target.value)}
                  style={{ width: '100%', padding: '0.25rem', borderRadius: '3px', border: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '2px' }}>X2:</label>
                <input
                  type="number"
                  step="0.000001"
                  value={coordInputs.x2}
                  onChange={(e) => handleCoordChange('x2', e.target.value)}
                  style={{ width: '100%', padding: '0.25rem', borderRadius: '3px', border: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '2px' }}>Y2:</label>
                <input
                  type="number"
                  step="0.000001"
                  value={coordInputs.y2}
                  onChange={(e) => handleCoordChange('y2', e.target.value)}
                  style={{ width: '100%', padding: '0.25rem', borderRadius: '3px', border: 'none' }}
                />
              </div>
            </div>

            <button
              onClick={handleSaveCoords}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Save Coordinates
            </button>
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.9em' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Storage type:</strong> {(!user || user.username === "guest") ? "Temporary" : "Persistent"}
            </div>

            {getPendingCoordsCount() > 0 && (
              <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,165,0,0.2)', borderRadius: 4 }}>
                <strong>Pending coordinates:</strong> {getPendingCoordsCount()}
              </div>
            )}

            {getActionsCount() > 0 && (
              <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(0,255,0,0.2)', borderRadius: 4 }}>
                <strong>Actions:</strong> {getActionsCount()}
              </div>
            )}
          </div>

          {message && (
            <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: 6 }}>
              {message}
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 2, position: 'relative' }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            attribution='Tiles © Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <Marker position={position} icon={defaultIcon}>
            <Popup>Your location</Popup>
          </Marker>

          {/* Meniul pe hartă */}
          <MapMenuControl mapRef={mapRef} />
        </MapContainer>
      </div>
    </div>
  );
}
