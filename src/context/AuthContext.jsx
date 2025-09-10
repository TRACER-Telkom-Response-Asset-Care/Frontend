import React, { createContext, useState, useContext } from 'react';
import apiClient from '../apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        delete apiClient.defaults.headers.common['Authorization'];
    };

    const authValue = {
        token,
        user,
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
