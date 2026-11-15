import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';
import { Brand } from './Brand.jsx';

const adminLinkClass = ({ isActive }) => `admin-nav__link ${isActive ? 'active' : ''}`;

export const AdminLayout = () => {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <Brand to="/admin" />
                <div>
                    <span className="admin-sidebar__label">Store operations</span>
                    <nav className="admin-nav" aria-label="Admin navigation">
                        <NavLink to="/admin" end className={adminLinkClass}>Dashboard</NavLink>
                        <NavLink to="/admin/orders" className={adminLinkClass}>Orders</NavLink>
                        <NavLink to="/admin/inventory" className={adminLinkClass}>Inventory</NavLink>
                    </nav>
                </div>
                <div className="admin-sidebar__footer">
                    <span>{admin?.name || 'Store admin'}</span>
                    <button type="button" className="button button--ghost button--small" onClick={handleLogout}>
                        Log out
                    </button>
                    <Link className="admin-store-link" to="/">Back to store</Link>
                </div>
            </aside>
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};
