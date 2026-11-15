import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const createId = () => (
    typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`
);

const ToastViewport = ({ toasts, onDismiss }) => (
    <div className="toast-viewport" role="status" aria-live="polite">
        {toasts.map((toast) => (
            <div className={`toast toast--${toast.type}`} key={toast.id}>
                <span>{toast.message}</span>
                <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
                    Close
                </button>
            </div>
        ))}
    </div>
);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const pushToast = useCallback((message, type = 'success') => {
        const id = createId();
        setToasts((current) => [...current, { id, message, type }]);
        window.setTimeout(() => removeToast(id), 4200);
    }, [removeToast]);

    const value = useMemo(() => ({ pushToast, removeToast }), [pushToast, removeToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastViewport toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
