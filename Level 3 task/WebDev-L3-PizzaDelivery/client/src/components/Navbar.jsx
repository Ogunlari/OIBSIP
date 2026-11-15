import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { Brand } from './Brand.jsx';

const linkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

export const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { itemCount } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        setMobileOpen(false);
        navigate('/');
    };

    const firstName = user?.name?.split(' ')[0];

    return (
        <header className={`navbar ${mobileOpen ? 'is-open' : ''}`}>
            <div className="container navbar__inner">
                <Brand />
                <nav className="nav-links" aria-label="Main navigation">
                    <NavLink to="/" end className={linkClass}>Home</NavLink>
                    <NavLink to="/menu" className={linkClass}>Menu</NavLink>
                    <NavLink to="/build" className={linkClass}>Build your own</NavLink>
                    {isAuthenticated && <NavLink to="/orders" className={linkClass}>My orders</NavLink>}
                </nav>
                <div className="nav-actions">
                    <Link className="cart-link" to="/cart" aria-label={`Cart with ${itemCount} items`}>
                        Cart
                        <span className="cart-count">{itemCount}</span>
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <span className="nav-user">Hi, {firstName}</span>
                            <button type="button" className="button button--ghost button--small" onClick={handleLogout}>
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link className="nav-link" to="/login">Sign in</Link>
                            <Link className="button button--primary button--small" to="/register">Create account</Link>
                        </>
                    )}
                </div>
                <button
                    type="button"
                    className="mobile-toggle"
                    onClick={() => setMobileOpen((open) => !open)}
                    aria-expanded={mobileOpen}
                    aria-label="Toggle navigation menu"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>
            <div className="mobile-menu">
                <NavLink to="/" end className={linkClass}>Home</NavLink>
                <NavLink to="/menu" className={linkClass}>Menu</NavLink>
                <NavLink to="/build" className={linkClass}>Build your own</NavLink>
                <NavLink to="/cart" className={linkClass}>Cart ({itemCount})</NavLink>
                {isAuthenticated && <NavLink to="/orders" className={linkClass}>My orders</NavLink>}
                {isAuthenticated ? (
                    <button type="button" className="button button--ghost" onClick={handleLogout}>Log out</button>
                ) : (
                    <>
                        <NavLink to="/login" className={linkClass}>Sign in</NavLink>
                        <Link className="button button--primary" to="/register">Create account</Link>
                    </>
                )}
            </div>
        </header>
    );
};
