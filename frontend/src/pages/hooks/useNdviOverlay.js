import { useState, useEffect } from 'react';
import { fetchAndShowNdviOverlay, fetchAndShowNdviForBBox, removeNdviOverlay } from '../services/ndviService';

export const useNdviOverlay = (mapRef) => {
  const [isLoadingNdvi, setIsLoadingNdvi] = useState(false);
  const [ndviActive, setNdviActive] = useState(false);

  // Cleanup overlay on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        removeNdviOverlay(mapRef.current);
      }
    };
  }, [mapRef]);

  const generateNdvi = async (user, coord, generateNdvi = false) => {
    if (!generateNdvi) return;

    setIsLoadingNdvi(true);
    
    try {
      if (!user || user.username === "guest") {
        await fetchAndShowNdviForBBox(
          mapRef, 
          coord.x1, 
          coord.y1, 
          coord.x2, 
          coord.y2, 
          { resolution: 60 }
        );
      } else {
        await fetchAndShowNdviOverlay(
          mapRef, 
          user.username, 
          coord.x1, 
          coord.y1, 
          coord.x2, 
          coord.y2
        );
      }
      setNdviActive(true);
      return 'NDVI overlay loaded';
    } catch (err) {
      console.error('Error generating NDVI:', err);
      throw new Error('Failed to generate NDVI');
    } finally {
      setIsLoadingNdvi(false);
    }
  };

  const handleRemoveOverlay = () => {
    if (mapRef.current) {
      removeNdviOverlay(mapRef.current);
      setNdviActive(false);
      return 'NDVI overlay removed';
    }
  };

  return {
    isLoadingNdvi,
    ndviActive,
    generateNdvi,
    handleRemoveOverlay
  };
};