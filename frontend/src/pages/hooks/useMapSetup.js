import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_POSITION } from '../constants/mapConfig';

export const useMapSetup = () => {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  // Get user's current position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Keep default position
        }
      );
    }
  }, []);

  const handleMapReady = useCallback((map) => {
    console.log('Map is ready:', map);
    setMapReady(true);
  }, []);

  const handleMapResize = useCallback(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300);
    }
  }, []);

  return {
    position,
    mapReady,
    mapRef,
    handleMapReady,
    handleMapResize
  };
};