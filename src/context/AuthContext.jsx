import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('userData')));
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('authToken', token);
        } else {
            delete apiClient.defaults.headers.common['Authorization'];
            localStorage.removeItem('authToken');
        }
        
        if (isInitializing) {
            setIsInitializing(false);
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('userData', JSON.stringify(user));
        } else {
            localStorage.removeItem('userData');
        }
    }, [user]);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
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