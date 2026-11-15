import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const { resetPassword } = useAuth();
    const token = searchParams.get('token');
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

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
            await resetPassword({ token, password: form.password });
            setDone(true);
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
                    <span className="eyebrow">Choose a new password</span>
                    <h1>Make it memorable, make it strong.</h1>
                    <p className="muted">Use at least 8 characters, including one number.</p>
                </div>
                <div className="auth-card">
                    {!token && (
                        <>
                            <h2>Reset link missing</h2>
                            <div className="alert alert--error">This password reset link is missing its token.</div>
                            <Link className="button button--dark" to="/forgot-password">Request a new link</Link>
                        </>
                    )}
                    {token && done && (
                        <>
                            <h2>Password updated</h2>
                            <p className="muted">You can now sign in with your new password.</p>
                            <Link className="button button--primary" to="/login">Go to sign in</Link>
                        </>
                    )}
                    {token && !done && (
                        <form onSubmit={handleSubmit}>
                            <h2>Reset password</h2>
                            {error && <div className="alert alert--error">{error}</div>}
                            <label className="field">
                                <span>New password</span>
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
                                <span>Confirm new password</span>
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
                                {submitting ? 'Updating password...' : 'Update password'}
                            </button>
                            <p className="auth-card__foot">
                                <Link to="/login">Back to sign in</Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
