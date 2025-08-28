 
// src/components/ParcelSelector.js
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function ParcelSelector({ setCoordInputs }) {
  const [points, setPoints] = useState([]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (points.length < 2) {
        const newPoints = [...points, [lng, lat]];
        setPoints(newPoints);
        if (newPoints.length === 1) {
          setCoordInputs(prev => ({ ...prev, x1: lng, y1: lat }));
        } else if (newPoints.length === 2) {
          setCoordInputs(prev => ({ ...prev, x2: lng, y2: lat }));
        }
      } else {
        setPoints([[lng, lat]]);
        setCoordInputs({ x1: lng, y1: lat, x2: '', y2: '' });
      }
    }
  });

  return points.map(([lng, lat], idx) => (
    <Marker key={idx} position={[lat, lng]} icon={defaultIcon}>
      <Popup>{`Punct ${idx + 1}: ${lat.toFixed(5)}, ${lng.toFixed(5)}`}</Popup>
    </Marker>
  ));
}
