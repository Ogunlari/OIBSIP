import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout.jsx';
import { AdminProtectedRoute } from './components/AdminProtectedRoute.jsx';
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { AdminInventory } from './pages/AdminInventory.jsx';
import { AdminLogin } from './pages/AdminLogin.jsx';
import { AdminOrders } from './pages/AdminOrders.jsx';
import { CartPage } from './pages/CartPage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx';
import { Home } from './pages/Home.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { MenuPage } from './pages/MenuPage.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { OrderTrackingPage } from './pages/OrderTrackingPage.jsx';
import { OrdersPage } from './pages/OrdersPage.jsx';
import { PizzaBuilderPage } from './pages/PizzaBuilderPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx';
import { VerifyEmailPage } from './pages/VerifyEmailPage.jsx';

const App = () => (
    <Routes>
        <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="build" element={<PizzaBuilderPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route
                path="checkout"
                element={(
                    <ProtectedRoute>
                        <CheckoutPage />
                    </ProtectedRoute>
                )}
            />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route
                path="orders"
                element={(
                    <ProtectedRoute>
                        <OrdersPage />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="orders/:id"
                element={(
                    <ProtectedRoute>
                        <OrderTrackingPage />
                    </ProtectedRoute>
                )}
            />
            <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route
            path="admin"
            element={(
                <AdminProtectedRoute>
                    <AdminLayout />
                </AdminProtectedRoute>
            )}
        >
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="inventory" element={<AdminInventory />} />
        </Route>
    </Routes>
);

export default App;
