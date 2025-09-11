import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import mapMenu from '../../../utils/mapMenu';
import { MAP_MENU_STYLES } from '../../constants/styleConfig';

const MapMenuControl = ({ mapRef, onCoordsUpdate }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const menuItems = mapMenu(mapRef, map, (x1, y1, x2, y2) => {
      if (typeof onCoordsUpdate === "function") {
        onCoordsUpdate({ x1, y1, x2, y2 });
      }
    });

    const CustomControl = L.Control.extend({
      onAdd: () => {
        const container = L.DomUtil.create('div', 'leaflet-bar');
        Object.assign(container.style, MAP_MENU_STYLES.container);

        menuItems.forEach(item => {
          const btn = L.DomUtil.create('button', '', container);
          btn.innerHTML = renderToStaticMarkup(item.icon);
          btn.title = item.label;
          Object.assign(btn.style, MAP_MENU_STYLES.button);

          btn.addEventListener('mouseover', () => {
            btn.style.background = MAP_MENU_STYLES.buttonHover.background;
          });
          
          btn.addEventListener('mouseout', () => {
            btn.style.background = MAP_MENU_STYLES.button.background;
          });
          
          btn.addEventListener('click', item.action);
        });

        L.DomEvent.disableClickPropagation(container);
        return container;
      }
    });

    const controlInstance = new CustomControl({ position: 'topright' });
    map.addControl(controlInstance);

    return () => map.removeControl(controlInstance);
  }, [map, mapRef, onCoordsUpdate]);

  return null;
};

export default MapMenuControl;