import React, {createContext, useState, useEffect} from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : { username: 'guest', role: 'guest' };
        } catch (err) {
            return { username: 'guest' , role: 'guest' };
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('user', JSON.stringify(user));
        } catch (err) { }
    }, [user]);
    const setUsername = (username) => setUser((prev) => ({ ...prev, username}));

    return (
        <UserContext.Provider value = { { user, setUser, setUsername }}>
            {children}
        </UserContext.Provider>
    );
}

