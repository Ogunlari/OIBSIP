import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PageLoader } from '../components/Spinner.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export const RegisterPage = () => {
    const { register, isAuthenticated, loading } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    if (loading) {
        return <PageLoader label="Checking your session..." />;
    }

    if (isAuthenticated) {
        return <Navigate to="/orders" replace />;
    }

    const handleChange = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (!/\d/.test(form.password)) {
            setError('Password must contain at least one number.');
            return;
        }

        setSubmitting(true);

        try {
            const data = await register({
                name: form.name,
                email: form.email,
                password: form.password
            });
            setResult(data);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className="page auth-page">
                <div className="container auth-layout">
                    <div className="auth-copy">
                        <span className="eyebrow">One more step</span>
                        <h1>Check your inbox.</h1>
                        <p className="muted">Verify your email address before signing in.</p>
                    </div>
                    <div className="auth-card">
                        <h2>Registration complete</h2>
                        <p className="muted">{result.message}</p>
                        {result.devVerificationUrl && (
                            <div className="alert alert--success">
                                <span>Email is in mock mode. Use this development verification link:</span>
                                <a className="button button--primary button--small" href={result.devVerificationUrl}>
                                    Verify email now
                                </a>
                            </div>
                        )}
                        <Link className="button button--dark" to="/login">Go to sign in</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page auth-page">
            <div className="container auth-layout">
                <div className="auth-copy">
                    <span className="eyebrow">Join SliceCraft</span>
                    <h1>Save your favourites and track every bake.</h1>
                    <p className="muted">Create an account to check out, follow live order updates, and keep your pizza history in one place.</p>
                </div>
                <form className="auth-card" onSubmit={handleSubmit}>
                    <h2>Create account</h2>
                    {error && <div className="alert alert--error">{error}</div>}
                    <label className="field">
                        <span>Name</span>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            autoComplete="name"
                            minLength="2"
                            required
                        />
                    </label>
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
                            autoComplete="new-password"
                            minLength="8"
                            required
                        />
                    </label>
                    <label className="field">
                        <span>Confirm password</span>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            minLength="8"
                            required
                        />
                    </label>
                    <button type="submit" className="button button--primary" disabled={submitting}>
                        {submitting ? 'Creating account...' : 'Create account'}
                    </button>
                    <p className="auth-card__foot">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                    <p className="auth-card__foot">
                        Password needs at least 8 characters and one number.
                    </p>
                </form>
            </div>
        </div>
    );
};
