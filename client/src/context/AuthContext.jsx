// context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            setUser({ username: decoded.username });
        } catch (err) {
            console.error('Error decoding token:', err);
            localStorage.removeItem('userToken');
        }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('userToken', token);
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: decoded.username });
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
