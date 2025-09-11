import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('userData'));
        } catch (e) {
            console.error("Failed to parse user data from localStorage", e);
        }
    });
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        setIsInitializing(false);
    }, []);

    const login = (newToken, userData) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setToken(null);
        setUser(null);
    };

    const authValue = {
        token,
        user,
        isInitializing,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
