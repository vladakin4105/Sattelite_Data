//Home.js
import React, { useEffect, useState, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';
import { UserContext } from '../context/UserContext';
import { api } from '../utils/api';

const PENDING_KEY = "pending_coords";

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Home() {
  const { user, setUsername } = useContext(UserContext);
  const [position, setPosition] = useState([44.4268, 26.1025]);
  const [message, setMessage] = useState('');
  const [nameInput, setNameInput] = useState('');

  // helper: save pending coord into sessionStorage
  const savePendingCoord = (coord) => {
    const arr = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
    arr.push(coord);
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(arr));
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
    const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
    for (const p of pending) {
      try {
        await api.post(`/users/${username}/coords`, p);
      } catch (err) {
        console.error("Failed to push coord", p, err);
      }
    }
    sessionStorage.removeItem(PENDING_KEY);
  };

  const saveBox = async (x1, y1, x2, y2) => {
    const coord = { x1, y1, x2, y2 };
    if (!user || user.username === "guest") {
      savePendingCoord(coord);
      alert("Saved temporarily for guest (will be lost when tab closes).");
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
    const msg = `User "${user.username}" pressed the button`;
    setMessage(msg);

    try {
      const key = `actions:${user.username}`;
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      prev.push({ type: 'press', at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(prev));
    } catch (e) {}
  };

  const handleChangeName = (e) => setNameInput(e.target.value);

  const handleSetName = async (e) => {
    e.preventDefault();
    const newName = nameInput.trim();
    if (!newName) return;
    try {
      // create user on server if needed, then set username in context and flush pending
      await createUserIfNotExists(newName);
      setUsername(newName);
      await flushPendingCoordsToServer(newName);
      setNameInput('');
    } catch (err) {
      alert("Failed to create user or flush data. Check console.");
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <div style={{ flex: 1, background: 'linear-gradient(145deg, #4f4f4f, #3a3a3a)', padding: '1rem', color: '#fff' }}>
        <h3>Menu</h3>
        <div style={{ background: '#555', padding: '1rem', borderRadius: '8px', boxShadow: '2px 2px 5px rgba(0,0,0,0.5)' }}>
          <p>Current user: <strong>{user?.username ?? 'guest'}</strong></p>

          <form onSubmit={handleSetName} style={{ marginBottom: '0.5rem' }}>
            <input value={nameInput} onChange={handleChangeName} placeholder="Set display name" />
            <button type="submit">Set</button>
          </form>

          <button onClick={handlePress} style={{ display: 'block', marginTop: '0.5rem' }}>Press me</button>

          <div style={{ marginTop: 12 }}>
            <button onClick={() => saveBox(25.0, 45.0, 25.1, 45.1)}>Save sample box</button>
          </div>

          {message && (
            <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: 6 }}>
              {message}
            </div>
          )}

        </div>
      </div>
      <div style={{ flex: 2, position: 'relative' }}>
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='Tiles © Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <Marker position={position} icon={defaultIcon}>
            <Popup>Your location</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
