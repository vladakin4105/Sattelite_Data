import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useMapSetup } from './hooks/useMapSetup';
import { useCoordinates } from './hooks/useCoordinates';
import { useNdviOverlay } from './hooks/useNdviOverlay';
import { useGuestStorage } from './hooks/useGuestStorage';
import { useUserActions } from './hooks/useUserActions';
import { useCoordinateLogic } from './hooks/useCoordinateLogic';
import MapContainer from './components/MapContainer';
import SidePanel from './components/SidePanel';
import { LAYOUT_STYLES } from './constants/styleConfig';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

export default function Home() {
  const { user, logout } = useContext(UserContext);
  
  // Custom hooks for different functionalities
  const mapSetup = useMapSetup();
  const coordinateHooks = useCoordinates();
  const guestStorage = useGuestStorage();
  const ndviActions = useNdviOverlay(mapSetup.mapRef);
  const userActions = useUserActions(user, logout, guestStorage);
  
  // Combined coordinate logic
  const coordinateLogic = useCoordinateLogic(
    mapSetup.mapReady,
    mapSetup.mapRef,
    guestStorage,
    ndviActions,
    userActions,
    coordinateHooks
  );

  // Combine all coordinate actions
  const coordinateActions = {
    ...coordinateHooks,
    ...coordinateLogic,
    saveBox: coordinateLogic.saveBox
  };

  return (
    <div style={LAYOUT_STYLES.mainContainer}>
      <SidePanel
        user={user}
        mapReady={mapSetup.mapReady}
        mapRef={mapSetup.mapRef}
        coordInputs={coordinateHooks.coordInputs}
        userActions={userActions}
        coordinateActions={coordinateActions}
        ndviActions={ndviActions}
        guestStorage={guestStorage}
        historyVersion={coordinateHooks.historyVersion}
        message={userActions.message}
      />
      
      <MapContainer
        position={mapSetup.position}
        mapRef={mapSetup.mapRef}
        onMapReady={mapSetup.handleMapReady}
        onCoordsUpdate={coordinateHooks.handleDrawCoordsUpdate}
      />
    </div>
  );
}