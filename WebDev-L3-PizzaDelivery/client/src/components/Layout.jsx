import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer.jsx';
import { Navbar } from './Navbar.jsx';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname]);

    return null;
};

export const Layout = () => (
    <div className="site-shell">
        <ScrollToTop />
        <Navbar />
        <main className="site-main">
            <Outlet />
        </main>
        <Footer />
    </div>
);
