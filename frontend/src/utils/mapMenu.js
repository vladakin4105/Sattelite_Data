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

const mapMenu = (mapRef, map) => [
  {
    id: "move",
    label: "Navigation Mode",
    icon: <MoveIcon width={20} height={20} />,
    action: () => {
      if (!map) return;

      // Șterge dreptunghiul existent
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

      // Șterge dreptunghiul existent
      clearRectangle(map);

      map.dragging.disable();

      if (map._drawCreatedHandler) {
        map.off(L.Draw.Event.CREATED, map._drawCreatedHandler);
      }

      map._drawCreatedHandler = function (e) {
        // Ștergem vechiul dreptunghi dacă există
        clearRectangle(map);

        const layer = e.layer;
        map._drawnLayer = layer;
        map.addLayer(layer);

        const coords = layer.getLatLngs()[0];
        console.log("Coordonate dreptunghi selectat:", coords);

        alert("Area selected!");
      };

      map.on(L.Draw.Event.CREATED, map._drawCreatedHandler);

      // Pornește direct modul de desenare
      const drawer = new L.Draw.Rectangle(map, {
        shapeOptions: { color: "#196bf8ff" }
      });
      drawer.enable();
    }
  }
];

export default mapMenu;