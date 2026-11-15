import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api.js';

const TOKEN_KEY = 'sliceraft:admin-token';
const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(Boolean(token));

    useEffect(() => {
        let active = true;

        if (!token) {
            setAdmin(null);
            setLoading(false);
            return undefined;
        }

        setLoading(true);
        apiFetch('/admin/auth/me', { token })
            .then((data) => {
                if (active) {
                    setAdmin(data.admin);
                }
            })
            .catch(() => {
                if (active) {
                    localStorage.removeItem(TOKEN_KEY);
                    setToken(null);
                    setAdmin(null);
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
        const data = await apiFetch('/admin/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setAdmin(data.admin);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setAdmin(null);
    }, []);

    const value = useMemo(() => ({
        token,
        admin,
        loading,
        isAuthenticated: Boolean(token && admin),
        login,
        logout
    }), [token, admin, loading, login, logout]);

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};
