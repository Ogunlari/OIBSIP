import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PageLoader } from '../components/Spinner.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export const LoginPage = () => {
    const { login, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const from = location.state?.from || '/orders';

    if (loading) {
        return <PageLoader label="Checking your session..." />;
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
        <div className="page auth-page">
            <div className="container auth-layout">
                <div className="auth-copy">
                    <span className="eyebrow">Welcome back</span>
                    <h1>Your next pizza is waiting.</h1>
                    <p className="muted">Sign in to check out faster and follow every order from the kitchen to your door.</p>
                </div>
                <form className="auth-card" onSubmit={handleSubmit}>
                    <h2>Sign in</h2>
                    {error && <div className="alert alert--error">{error}</div>}
                    <label className="field">
                        <span>Email</span>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
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
                        {submitting ? 'Signing in...' : 'Sign in'}
                    </button>
                    <p className="auth-card__foot">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </p>
                    <p className="auth-card__foot">
                        New to SliceCraft? <Link to="/register">Create an account</Link>
                    </p>
                    <p className="auth-card__foot">
                        Store team? <Link to="/admin/login">Open the admin portal</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
