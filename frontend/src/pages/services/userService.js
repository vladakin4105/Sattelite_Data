import { api } from '../../utils/api';

export const createUserIfNotExists = async (username) => {
  const res = await api.post('/users', { username });
  return res.data;
};

export const getUserActions = (username) => {
  try {
    const key = `actions:${username}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

export const saveUserAction = (username, action) => {
  try {
    const key = `actions:${username}`;
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    prev.push(action);
    localStorage.setItem(key, JSON.stringify(prev));
    return true;
  } catch {
    return false;
  }
};

export const createPressAction = () => ({
  type: 'press',
  at: new Date().toISOString()
});