import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CART_KEY = 'sliceraft:cart';
const CartContext = createContext(null);

const createId = () => (
    typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`
);

const readCart = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const clampQuantity = (quantity) => Math.min(20, Math.max(1, Number(quantity) || 1));

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(readCart);

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
    }, [items]);

    const addPizza = useCallback((pizza, quantity = 1) => {
        setItems((current) => {
            const existing = current.find((item) => item.type === 'pizza' && item.pizzaId === pizza.id);

            if (existing) {
                return current.map((item) => (
                    item.id === existing.id
                        ? { ...item, quantity: clampQuantity(item.quantity + quantity) }
                        : item
                ));
            }

            return [
                ...current,
                {
                    id: createId(),
                    type: 'pizza',
                    pizzaId: pizza.id,
                    name: pizza.name,
                    summary: pizza.description,
                    unitPrice: pizza.price,
                    quantity: clampQuantity(quantity)
                }
            ];
        });
    }, []);

    const addCustom = useCallback((custom) => {
        setItems((current) => [
            ...current,
            {
                ...custom,
                id: createId(),
                quantity: clampQuantity(custom.quantity)
            }
        ]);
    }, []);

    const updateQuantity = useCallback((id, quantity) => {
        setItems((current) => (
            quantity <= 0
                ? current.filter((item) => item.id !== id)
                : current.map((item) => (
                    item.id === id
                        ? { ...item, quantity: clampQuantity(quantity) }
                        : item
                ))
        ));
    }, []);

    const removeItem = useCallback((id) => {
        setItems((current) => current.filter((item) => item.id !== id));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

    const value = useMemo(() => ({
        items,
        itemCount,
        subtotal,
        addPizza,
        addCustom,
        updateQuantity,
        removeItem,
        clearCart
    }), [items, itemCount, subtotal, addPizza, addCustom, updateQuantity, removeItem, clearCart]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
