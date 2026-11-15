import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export const ForgotPasswordPage = () => {
    const { requestPasswordReset } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            setResult(await requestPasswordReset(email));
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
                    <span className="eyebrow">Password help</span>
                    <h1>Let's get you back in.</h1>
                    <p className="muted">Enter the email on your account and we will send a reset link.</p>
                </div>
                <div className="auth-card">
                    {result ? (
                        <>
                            <h2>Check your inbox</h2>
                            <p className="muted">{result.message}</p>
                            {result.devResetUrl && (
                                <div className="alert alert--success">
                                    <span>Email is in mock mode. Use this development reset link:</span>
                                    <a className="button button--primary button--small" href={result.devResetUrl}>
                                        Reset password now
                                    </a>
                                </div>
                            )}
                            <Link className="button button--dark" to="/login">Back to sign in</Link>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <h2>Forgot password</h2>
                            {error && <div className="alert alert--error">{error}</div>}
                            <label className="field">
                                <span>Email</span>
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </label>
                            <button type="submit" className="button button--primary" disabled={submitting}>
                                {submitting ? 'Sending link...' : 'Send reset link'}
                            </button>
                            <p className="auth-card__foot">
                                Remembered it? <Link to="/login">Sign in</Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
