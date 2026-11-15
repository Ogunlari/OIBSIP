import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';
import { PageLoader } from './Spinner.jsx';

export const AdminProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAdminAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoader label="Checking admin session..." />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: `${location.pathname}${location.search}` }}
            />
        );
    }

    return children;
};
