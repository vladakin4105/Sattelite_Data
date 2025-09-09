import { useState, useRef } from 'react';
import L from 'leaflet';
import { DEFAULT_COORDINATES, RECTANGLE_STYLE, MAP_BOUNDS_PADDING } from '../constants/mapConfig';

export const useCoordinates = () => {
  const [coordInputs, setCoordInputs] = useState(DEFAULT_COORDINATES);
  const [historyVersion, setHistoryVersion] = useState(0);
  const modisRectRef = useRef(null);
  const rectLayerRef = useRef(null);

  const handleCoordChange = (field, value) => {
    setCoordInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleHistorySelect = (item) => {
    setCoordInputs({
      x1: item.x1.toString(),
      y1: item.y1.toString(),
      x2: item.x2.toString(),
      y2: item.y2.toString()
    });
  };

  const handleDrawCoordsUpdate = ({ x1, y1, x2, y2 }) => {
    setCoordInputs({ 
      x1: x1.toString(), 
      y1: y1.toString(), 
      x2: x2.toString(), 
      y2: y2.toString() 
    });
  };

  const showRectOnMap = (mapRef) => {
    if (!mapRef.current) return;

    // Remove previous MODIS rectangle if exists
    if (modisRectRef.current) {
      mapRef.current.removeLayer(modisRectRef.current);
    }

    const { x1, y1, x2, y2 } = coordInputs;
    const lon1 = parseFloat(x1);
    const lat1 = parseFloat(y1);
    const lon2 = parseFloat(x2);
    const lat2 = parseFloat(y2);

    if ([lon1, lat1, lon2, lat2].some(isNaN)) return;

    const bounds = [
      [Math.min(lat1, lat2), Math.min(lon1, lon2)],
      [Math.max(lat1, lat2), Math.max(lon1, lon2)]
    ];

    const rect = L.rectangle(bounds, RECTANGLE_STYLE).addTo(mapRef.current);

    modisRectRef.current = rect;
    mapRef.current.fitBounds(bounds, { padding: MAP_BOUNDS_PADDING });
  };

  const removeModisRect = (mapRef) => {
    if (modisRectRef.current && mapRef.current) {
      mapRef.current.removeLayer(modisRectRef.current);
      modisRectRef.current = null;
    }
  };

  const refreshHistory = () => {
    setHistoryVersion(prev => prev + 1);
  };

  return {
    coordInputs,
    historyVersion,
    handleCoordChange,
    handleHistorySelect,
    handleDrawCoordsUpdate,
    showRectOnMap,
    removeModisRect,
    refreshHistory
  };
};