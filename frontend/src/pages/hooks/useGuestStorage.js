import { useState } from 'react';
import { getPendingCoordsCount } from '../services/coordinateService';
import { getUserActions } from '../services/userService';

export const useGuestStorage = () => {
  const [guestPendingCoords, setGuestPendingCoords] = useState([]);
  const [guestActions, setGuestActions] = useState([]);

  const getPendingCount = (user) => {
    return getPendingCoordsCount(user, guestPendingCoords);
  };

  const getActionsCount = (user) => {
    if (!user || user.username === "guest") {
      return guestActions.length;
    }
    
    try {
      return getUserActions(user.username).length;
    } catch {
      return guestActions.length;
    }
  };

  const addGuestAction = (action) => {
    setGuestActions(prev => [...prev, action]);
  };

  return {
    guestPendingCoords,
    setGuestPendingCoords,
    guestActions,
    setGuestActions,
    getPendingCount,
    getActionsCount,
    addGuestAction
  };
};