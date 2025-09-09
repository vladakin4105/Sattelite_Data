import L from 'leaflet';
import { api } from '../../utils/api';
import { NDVI_OVERLAY_OPTIONS, MAP_BOUNDS_PADDING } from '../constants/mapConfig';

export const removeNdviOverlay = (map) => {
  if (!map) return;
  
  if (map._ndviOverlay) {
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

export const createNdviOverlay = (url, bounds, map) => {
  // Remove previous overlay
  removeNdviOverlay(map);

  // Create and add the overlay
  const overlay = L.imageOverlay(url, bounds, NDVI_OVERLAY_OPTIONS);
  overlay.addTo(map);
  
  // Store references for cleanup
  overlay._url = url;
  map._ndviOverlay = overlay;

  // Fit map to overlay bounds with padding
  map.fitBounds(bounds, { padding: MAP_BOUNDS_PADDING });

  // Handle overlay events
  overlay.on('load', () => {
    console.log('NDVI overlay loaded successfully');
    map.invalidateSize();
  });

  overlay.on('error', (e) => {
    console.error('NDVI overlay failed to load:', e);
    throw new Error('Failed to load NDVI overlay');
  });

  overlay.on('add', () => {
    console.log('NDVI overlay added to map');
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

  return overlay;
};

export const calculateBounds = (x1, y1, x2, y2) => {
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
  
  return [[south, west], [north, east]];
};

export const fetchAndShowNdviOverlay = async (mapRef, username, x1, y1, x2, y2) => {
  if (!mapRef.current) {
    throw new Error('Map ref not available');
  }

  console.log('Fetching NDVI for user:', username, 'coordinates:', { x1, y1, x2, y2 });

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

  const bounds = calculateBounds(x1, y1, x2, y2);
  console.log('Creating overlay with bounds:', bounds);

  return createNdviOverlay(url, bounds, mapRef.current);
};

export const fetchAndShowNdviForBBox = async (mapRef, x1, y1, x2, y2, opts = {}) => {
  // Wait a bit if map is not ready yet
  let attempts = 0;
  while (!mapRef.current && attempts < 10) {
    console.log(`Waiting for map... attempt ${attempts + 1}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (!mapRef.current) {
    throw new Error('Map ref not available after waiting');
  }

  console.log('Fetching NDVI for bbox:', { x1, y1, x2, y2 }, 'options:', opts);

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

  const bounds = calculateBounds(x1, y1, x2, y2);
  console.log('Creating overlay with bounds:', bounds);

  return createNdviOverlay(url, bounds, mapRef.current);
};