import React from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { DEFAULT_ICON, DEFAULT_ZOOM, TILE_LAYER_CONFIG } from '../../constants/mapConfig';
import { LAYOUT_STYLES } from '../../constants/styleConfig';
import MapInitializer from './MapInitializer';
import MapMenuControl from './MapMenuControl';

const MapContainer = ({ 
  position, 
  mapRef, 
  onMapReady, 
  onCoordsUpdate 
}) => {
  return (
    <div style={LAYOUT_STYLES.mapContainer}>
      <LeafletMapContainer
        center={position}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution={TILE_LAYER_CONFIG.attribution}
          url={TILE_LAYER_CONFIG.url}
        />
        <Marker position={position} icon={DEFAULT_ICON}>
          <Popup>Your location</Popup>
        </Marker>
        <MapInitializer 
          mapRef={mapRef} 
          onMapReady={onMapReady} 
        />
        <MapMenuControl
          mapRef={mapRef}
          onCoordsUpdate={onCoordsUpdate}
        />
      </LeafletMapContainer>
    </div>
  );
};

export default MapContainer;