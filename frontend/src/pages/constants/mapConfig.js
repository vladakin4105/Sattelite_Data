import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

export const PENDING_KEY = "pending_coords";

export const DEFAULT_POSITION = [44.4268, 26.1025];

export const DEFAULT_ZOOM = 13;

export const DEFAULT_ICON = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const TILE_LAYER_CONFIG = {
  attribution: "Tiles © Esri",
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
};

export const NDVI_OVERLAY_OPTIONS = {
  opacity: 1.0,
  interactive: false,
  crossOrigin: false,
  pane: 'overlayPane'
};

export const MAP_BOUNDS_PADDING = [20, 20];

export const RECTANGLE_STYLE = {
  color: "#3388ff",
  weight: 2,
  fillOpacity: 0.2
};

export const DEFAULT_COORDINATES = {
  x1: '25.0',
  y1: '45.0',
  x2: '25.1',
  y2: '45.1'
};