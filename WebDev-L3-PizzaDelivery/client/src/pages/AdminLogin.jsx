import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';

export const AdminLogin = () => {
    const { login, isAuthenticated, loading } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const from = location.state?.from || '/admin';

    if (loading) {
        return <PageLoader label="Checking admin session..." />;
    }

    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    const handleChange = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await login(form.email, form.password);
            navigate(from, { replace: true });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login__panel">
                <Brand to="/" />
                <div className="admin-login__intro">
                    <span className="eyebrow">Admin portal</span>
                    <h1>Run the kitchen.</h1>
                    <p>Manage live orders, watch inventory, and keep the pizza line moving.</p>
                </div>
                <form className="auth-card" onSubmit={handleSubmit}>
                    <h2>Store sign in</h2>
                    {error && <div className="alert alert--error">{error}</div>}
                    <label className="field">
                        <span>Admin email</span>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                        />
                    </label>
                    <label className="field">
                        <span>Password</span>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                        />
                    </label>
                    <button type="submit" className="button button--primary" disabled={submitting}>
                        {submitting ? 'Signing in...' : 'Sign in to admin'}
                    </button>
                    <p className="auth-card__foot">
                        Use the admin credentials configured in <code>server/.env</code>.
                    </p>
                    <p className="auth-card__foot">
                        <Link to="/">Back to the store</Link>
                    </p>
                </form>
            </div>
            <div className="admin-login__art" aria-hidden="true">
                <span>Live orders</span>
                <span>Inventory alerts</span>
                <span>Kitchen flow</span>
            </div>
        </div>
    );
};
