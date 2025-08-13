 import React, { useEffect, useState, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';
import { UserContext } from '../context/UserContext';
import { api } from '../utils/api';
import ParcelSelector from '../components/ParcelSelector';
import CoordinateForm from '../components/CoordinateForm';

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
  const [coordInputs, setCoordInputs] = useState({ x1: '', y1: '', x2: '', y2: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  const handleSaveCoords = async (coords) => {
    // Exemplu simplu de logica salvare
    try {
      if (!user || user.username === "guest") {
        alert("Guests cannot save coordinates permanently.");
        return;
      }
      await api.post(`/users/${user.username}/coords`, coords);
      alert("Coordinates saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save coordinates.");
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <div style={{ flex: 1, background: 'linear-gradient(145deg, #4f4f4f, #3a3a3a)', padding: '1rem', color: '#fff' }}>
        {/* Poți adăuga meniul și alte controale aici */}
        {message && (
          <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: 6 }}>
            {message}
          </div>
        )}
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
          <ParcelSelector setCoordInputs={setCoordInputs} />
        </MapContainer>
        <CoordinateForm
          coordInputs={coordInputs}
          setCoordInputs={setCoordInputs}
          onSave={handleSaveCoords}
        />
      </div>
    </div>
  );
}
