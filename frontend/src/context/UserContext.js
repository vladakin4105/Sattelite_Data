import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState({ username: 'guest', role: 'guest' });
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            try {
                if (typeof Storage !== 'undefined' && window.localStorage) {
                    const raw = localStorage.getItem('user');
                    if (raw) {
                        const savedUser = JSON.parse(raw);
                        if (savedUser && savedUser.username && savedUser.username !== 'guest') {
                            setUser(savedUser);
                        }
                    }
                }
            } catch (err) {
                console.warn('Failed to load user from localStorage:', err);
            } finally {
                setIsInitialized(true);
            }
        }
    }, [isInitialized]);

   
    useEffect(() => {
        if (isInitialized) {
            try {
                if (typeof Storage !== 'undefined' && window.localStorage) {
                    if (user.username && user.username !== 'guest') {
                        localStorage.setItem('user', JSON.stringify(user));
                    } else {
                        localStorage.removeItem('user');
                    }
                }
            } catch (err) {
                console.warn('Failed to save user to localStorage:', err);
                
            }
        }
    }, [user, isInitialized]);
    
    const setUsername = (username) => {
        const newUser = { ...user, username };
        
        if (username === 'guest') {
            newUser.role = 'guest';
        } else {
            newUser.role = 'user';
        }
        
        setUser(newUser);
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const logout = () => {
        setUser({ username: 'guest', role: 'guest' });
        try {
            if (typeof Storage !== 'undefined' && window.localStorage) {
                localStorage.removeItem('user');
            }
        } catch (err) {
            console.warn('Failed to clear user from localStorage:', err);
        }
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser: updateUser, 
            setUsername,
            logout,
            isInitialized 
        }}>
            {children}
        </UserContext.Provider>
    );
}
