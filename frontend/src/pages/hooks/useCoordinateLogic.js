import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { 
  parseCoordinates, 
  validateCoordinate, 
  savePendingCoordinate,
  saveCoordinateToServer 
} from '../services/coordinateService';
import { createUserIfNotExists } from '../services/userService';

export const useCoordinateLogic = (
  mapReady, 
  mapRef, 
  guestStorage, 
  ndviActions,
  userActions,
  coordinateHooks
) => {
  const { user } = useContext(UserContext);
  const { setUsername } = useContext(UserContext);

  const saveBox = async (x1, y1, x2, y2, generateNdvi = false) => {
    const coord = parseCoordinates(x1, y1, x2, y2);

    if (!validateCoordinate(coord)) {
      alert("Please enter valid numeric coordinates.");
      return;
    }

    if (!mapReady || !mapRef.current) {
      alert("Map is not ready yet. Please wait a moment and try again.");
      return;
    }

    try {
      if (!user || user.username === "guest") {
        savePendingCoordinate(
          coord, 
          guestStorage.guestPendingCoords, 
          guestStorage.setGuestPendingCoords
        );
      } else {
        await createUserIfNotExists(user.username);
        await saveCoordinateToServer(user.username, coord);
      }
    } catch (err) {
      console.error('Error saving coordinates:', err);
    }

    if (generateNdvi) {
      try {
        const message = await ndviActions.generateNdvi(user, coord, generateNdvi);
        userActions.setMessage(message);
      } catch (err) {
        console.error('Error generating NDVI:', err);
        userActions.setMessage('');
        alert('Failed to generate NDVI.');
      }
    }
  };

  const handleSaveCoords = async (e) => {
    e.preventDefault();

    if (!mapReady) {
      alert("Map is not ready yet.");
      return;
    }

    if (!user || user.username === "guest") {
      alert("Coordinates cannot be saved. You must have an account.");
      return;
    }

    try {
      const { x1, y1, x2, y2 } = coordinateHooks.coordInputs;
      await saveBox(
        parseFloat(x1),
        parseFloat(y1),
        parseFloat(x2),
        parseFloat(y2)
      );

      alert(`Coordinates saved successfully for ${user.username}`);
      coordinateHooks.refreshHistory();
    } catch (err) {
      console.error("Error saving coordinates:", err);
      alert("An error occurred while saving coordinates. Please try again.");
    }
  };

  return {
    saveBox,
    handleSaveCoords,
    setUsername
  };
};