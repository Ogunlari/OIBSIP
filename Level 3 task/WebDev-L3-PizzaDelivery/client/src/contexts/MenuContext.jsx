import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api.js';

const DEFAULT_PRICING = {
    currency: 'INR',
    taxRate: 0.05,
    deliveryFee: 49
};

const MenuContext = createContext(null);

export const MenuProvider = ({ children }) => {
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const refreshMenu = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch('/menu');
            setMenu(data);
            return data;
        } catch (requestError) {
            setError(requestError.message);
            throw requestError;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshMenu().catch(() => {});
    }, [refreshMenu]);

    const value = useMemo(() => ({
        menu,
        loading,
        error,
        refreshMenu,
        pricing: menu?.pricing || DEFAULT_PRICING
    }), [menu, loading, error, refreshMenu]);

    return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error('useMenu must be used within MenuProvider');
    }
    return context;
};
