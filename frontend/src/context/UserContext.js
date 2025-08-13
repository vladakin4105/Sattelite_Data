import React, { createContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeUser = async () => {
            try {
                if (typeof Storage !== 'undefined' && window.localStorage && window.sessionStorage) {
                    // Check localStorage for authenticated users
                    const raw = localStorage.getItem('user');
                    if (raw) {
                        const savedUser = JSON.parse(raw);
                        if (savedUser && savedUser.username && savedUser.username !== 'guest') {
                            try {
                                await api.get(`/users/${encodeURIComponent(savedUser.username)}`);
                                setUser(savedUser);
                                return; // Exit early if authenticated user found
                            } catch (err) {
                                console.warn('Persisted user not valid on server, clearing local storage', err?.response?.status);
                                localStorage.removeItem('user');
                            }
                        }
                    }

                    // Check sessionStorage for guest user
                    const guestRaw = sessionStorage.getItem('guest');
                    if (guestRaw) {
                        const savedGuest = JSON.parse(guestRaw);
                        if (savedGuest && savedGuest.username === 'guest') {
                            setUser(savedGuest);
                            return; // Exit early if guest found
                        }
                    }

                    // No valid user found
                    setUser(null);
                } else {
                    // Storage not available
                    setUser(null);
                }
            } catch (err) {
                console.warn('Failed to load user from storage:', err);
                setUser(null);
            } finally {
                // Always set initialized to true, regardless of success/failure
                setIsInitialized(true);
            }
        };

        // Only run initialization once
        if (!isInitialized) {
            initializeUser();
        }
    }, [isInitialized]);

    // Save user to storage when user changes (but only after initialization)
    useEffect(() => {
        if (!isInitialized) return;
        
        try {
            if (typeof Storage !== 'undefined' && window.localStorage && window.sessionStorage) {
                if (user && user.username) {
                    if (user.username === 'guest') {
                        // Save guest to sessionStorage (temporary)
                        sessionStorage.setItem('guest', JSON.stringify(user));
                        localStorage.removeItem('user');
                    } else {
                        // Save authenticated user to localStorage (persistent)
                        localStorage.setItem('user', JSON.stringify(user));
                        sessionStorage.removeItem('guest');
                    }
                } else {
                    // Clear both storages when user is null
                    localStorage.removeItem('user');
                    sessionStorage.removeItem('guest');
                }
            }
        } catch (err) {
            console.warn('Failed to save user to storage:', err);
        }
    }, [user, isInitialized]);
    
    const setUsername = (username) => {
        if (!username) return;

        const newUser = { 
            username,
            role: username === 'guest' ? 'guest' : 'user',
            guest: username === 'guest',
        };
        
        setUser(newUser);
    };

    const setGuest = () => {
        const g = { username: 'guest', role: 'guest', guest: true };
        setUser(g);
    };

    const updateUser = (userData) => {
        setUser((prev) => (prev ? { ...prev, ...userData } : { ...userData }));
    };

    const logout = () => {
        setUser(null);
        try {
            if (typeof Storage !== 'undefined' && window.localStorage && window.sessionStorage) {
                localStorage.removeItem('user');
                sessionStorage.removeItem('guest');
            }
        } catch (err) {
            console.warn('Failed to clear user from storage:', err);
        }
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser: updateUser, 
            setUsername,
            setGuest,
            logout,
            isInitialized,
        }}>
            {children}
        </UserContext.Provider>
    );
}