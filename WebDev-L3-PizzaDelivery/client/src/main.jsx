import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AdminAuthProvider } from './contexts/AdminAuthContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { MenuProvider } from './contexts/MenuContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <AdminAuthProvider>
                        <MenuProvider>
                            <CartProvider>
                                <App />
                            </CartProvider>
                        </MenuProvider>
                    </AdminAuthProvider>
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    </React.StrictMode>
);
