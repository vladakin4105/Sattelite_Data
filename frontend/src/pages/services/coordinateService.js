import { api } from '../../utils/api';
import { PENDING_KEY } from '../constants/mapConfig';

export const saveCoordinateToServer = async (username, coordinate) => {
  return await api.post(`/users/${username}/coords`, coordinate);
};

export const deleteCoordinateFromServer = async (username, coordId) => {
  const response = await fetch(
    `http://localhost:8000/users/${username}/coords/${coordId}`,
    { method: "DELETE" }
  );
  
  if (!response.ok) {
    throw new Error("Failed to delete coordinate");
  }
  
  return response;
};

export const fetchUserCoordinates = async (username) => {
  const response = await fetch(
    `http://localhost:8000/users/${username}/coords`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch coordinates');
  }
  
  return await response.json();
};

export const savePendingCoordinate = (coordinate, guestCoords, setGuestCoords) => {
  try {
    const arr = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
    arr.push(coordinate);
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(arr));
  } catch (e) {
    setGuestCoords(prev => [...prev, coordinate]);
  }
};

export const flushPendingCoordsToServer = async (username, guestCoords, setGuestCoords) => {
  let pendingToFlush = [];
  
  try {
    pendingToFlush = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
    sessionStorage.removeItem(PENDING_KEY);
  } catch (e) {
    pendingToFlush = [...guestCoords];
    setGuestCoords([]);
  }

  for (const coord of pendingToFlush) {
    try {
      await saveCoordinateToServer(username, coord);
    } catch (err) {
      console.error('Error flushing coordinate:', err);
    }
  }
};

export const getPendingCoordsCount = (user, guestCoords) => {
  if (!user || user.username === "guest") {
    return guestCoords.length;
  }
  
  try {
    return JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]").length;
  } catch {
    return guestCoords.length;
  }
};

export const validateCoordinate = (coord) => {
  return !Object.values(coord).some(isNaN);
};

export const parseCoordinates = (x1, y1, x2, y2) => {
  return {
    x1: parseFloat(x1),
    y1: parseFloat(y1),
    x2: parseFloat(x2),
    y2: parseFloat(y2)
  };
};