import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api.js';

const TOKEN_KEY = 'sliceraft:user-token';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(token));

    useEffect(() => {
        let active = true;

        if (!token) {
            setUser(null);
            setLoading(false);
            return undefined;
        }

        setLoading(true);
        apiFetch('/auth/me', { token })
            .then((data) => {
                if (active) {
                    setUser(data.user);
                }
            })
            .catch(() => {
                if (active) {
                    localStorage.removeItem(TOKEN_KEY);
                    setToken(null);
                    setUser(null);
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [token]);

    const login = useCallback(async (email, password) => {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    }, []);

    const register = useCallback((payload) => apiFetch('/auth/register', {
        method: 'POST',
        body: payload
    }), []);

    const verifyEmail = useCallback((verificationToken) => apiFetch('/auth/verify-email', {
        method: 'POST',
        body: { token: verificationToken }
    }), []);

    const requestPasswordReset = useCallback((email) => apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: { email }
    }), []);

    const resetPassword = useCallback((payload) => apiFetch('/auth/reset-password', {
        method: 'POST',
        body: payload
    }), []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const value = useMemo(() => ({
        token,
        user,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        verifyEmail,
        requestPasswordReset,
        resetPassword,
        logout
    }), [token, user, loading, login, register, verifyEmail, requestPasswordReset, resetPassword, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
