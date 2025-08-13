// src/utils/mapMenu.js
import L from "leaflet";
import "leaflet-draw";
import { ReactComponent as MoveIcon } from "../assets/arrows-move.svg";
import { ReactComponent as HexagonIcon } from "../assets/hexagon.svg";

const clearRectangle = (map) => {
  if (map && map._drawnLayer) {
    map.removeLayer(map._drawnLayer);
    map._drawnLayer = null;
  }
};

const mapMenu = (mapRef, map, onBoxDrawn, onCoordsUpdate) => [
  {
    id: "move",
    label: "Navigation Mode",
    icon: <MoveIcon width={20} height={20} />,
    action: () => {
      if (!map) return;
      clearRectangle(map);

      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();

      if (map._drawCreatedHandler) {
        map.off(L.Draw.Event.CREATED, map._drawCreatedHandler);
        map._drawCreatedHandler = null;
      }
    }
  },
  {
    id: "select",
    label: "Select Area",
    icon: <HexagonIcon width={20} height={20} />,
    action: () => {
      if (!map) return;
      clearRectangle(map);
      map.dragging.disable();

      if (map._drawCreatedHandler) {
        map.off(L.Draw.Event.CREATED, map._drawCreatedHandler);
      }

      map._drawCreatedHandler = function (e) {
        clearRectangle(map);
        const layer = e.layer;
        map._drawnLayer = layer;
        map.addLayer(layer);

        const coords = layer.getLatLngs()[0];
        const x1 = coords[0].lng;
        const y1 = coords[0].lat;
        const x2 = coords[2].lng;
        const y2 = coords[2].lat;

        // trimite coordonatele spre Home.js
        if (typeof onCoordsUpdate === "function") {
          onCoordsUpdate({
            x1: x1.toFixed(6),
            y1: y1.toFixed(6),
            x2: x2.toFixed(6),
            y2: y2.toFixed(6)
          });
        }

        // apelează și logica existentă pentru salvare
        if (typeof onBoxDrawn === "function") {
          onBoxDrawn(x1, y1, x2, y2);
        }
      };

      map.on(L.Draw.Event.CREATED, map._drawCreatedHandler);

      const drawer = new L.Draw.Rectangle(map, {
        shapeOptions: { color: "#196bf8ff" }
      });
      drawer.enable();
    }
  }
];

export default mapMenu;
