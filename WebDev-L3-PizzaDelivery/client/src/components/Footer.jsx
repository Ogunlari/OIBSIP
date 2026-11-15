import { Link } from 'react-router-dom';
import { Brand } from './Brand.jsx';

export const Footer = () => (
    <footer className="footer">
        <div className="container footer__grid">
            <div className="footer__brand">
                <Brand />
                <p>Small-batch dough, bright ingredients, and pizza that is built exactly the way you like it.</p>
            </div>
            <div>
                <h3>Explore</h3>
                <Link to="/menu">Full menu</Link>
                <Link to="/build">Pizza builder</Link>
                <Link to="/orders">Track an order</Link>
            </div>
            <div>
                <h3>Account</h3>
                <Link to="/login">Sign in</Link>
                <Link to="/register">Create account</Link>
                <Link to="/admin/login">Admin portal</Link>
            </div>
            <div>
                <h3>Good to know</h3>
                <Link to="/menu">Fresh dough daily</Link>
                <Link to="/orders">Live order tracking</Link>
                <Link to="/build">Inventory-backed menu</Link>
            </div>
        </div>
        <div className="container footer__bottom">
            <span>SliceCraft Pizza Co.</span>
            <span>Built for the OIBSIP Level 3 full-stack brief.</span>
        </div>
    </footer>
);
