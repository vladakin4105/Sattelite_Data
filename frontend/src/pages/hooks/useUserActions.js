import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createUserIfNotExists, 
  createPressAction, 
  saveUserAction 
} from '../services/userService';
import { flushPendingCoordsToServer } from '../services/coordinateService';

export const useUserActions = (user, logout, guestStorage) => {
  const [message, setMessage] = useState('');
  const [nameInput, setNameInput] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  const handlePress = () => {
    const msg = `User "${user?.username ?? 'guest'}" pressed the button`;
    setMessage(msg);
    
    const action = createPressAction();
    
    if (!user || user.username === "guest") {
      guestStorage.addGuestAction(action);
    } else {
      const success = saveUserAction(user.username, action);
      if (!success) {
        guestStorage.addGuestAction(action);
      }
    }
  };

  const handleChangeName = (e) => {
    setNameInput(e.target.value);
  };

  const handleSetName = async (e, setUsername) => {
    e.preventDefault();
    const newName = nameInput.trim();
    if (!newName) return;
    
    try {
      await createUserIfNotExists(newName);
      setUsername(newName);
      await flushPendingCoordsToServer(
        newName, 
        guestStorage.guestPendingCoords, 
        guestStorage.setGuestPendingCoords
      );
      setNameInput('');
      alert(`Username set to: ${newName}`);
    } catch (error) {
      console.error('Error setting username:', error);
      alert("Failed to create user or flush data.");
    }
  };

  return {
    message,
    setMessage,
    nameInput,
    handleLogout,
    handlePress,
    handleChangeName,
    handleSetName
  };
};