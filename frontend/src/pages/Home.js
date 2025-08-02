import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Home() {
  const [position, setPosition] = useState([44.4268, 26.1025]);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <div style={{ flex: 1, background: 'linear-gradient(145deg, #4f4f4f, #3a3a3a)', padding: '1rem', color: '#fff' }}>
        <h3>Menu</h3>
        
        <div style={{ background: '#555', padding: '1rem', borderRadius: '8px', boxShadow: '2px 2px 5px rgba(0,0,0,0.5)' }}>
          Settings / Controls
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