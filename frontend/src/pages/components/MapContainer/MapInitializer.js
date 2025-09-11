import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

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

export default MapInitializer;