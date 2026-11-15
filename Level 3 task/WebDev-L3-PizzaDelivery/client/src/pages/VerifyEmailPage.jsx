import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Spinner } from '../components/Spinner.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const { verifyEmail } = useAuth();
    const token = searchParams.get('token');
    const started = useRef(false);
    const [state, setState] = useState('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (started.current) {
            return;
        }
        started.current = true;

        if (!token) {
            setState('error');
            setMessage('This verification link is missing its token.');
            return;
        }

        let active = true;
        verifyEmail(token)
            .then(() => {
                if (active) {
                    setState('success');
                }
            })
            .catch((requestError) => {
                if (active) {
                    setState('error');
                    setMessage(requestError.message);
                }
            });

        return () => {
            active = false;
        };
    }, [token, verifyEmail]);

    return (
        <div className="page auth-page">
            <div className="container auth-layout">
                <div className="auth-copy">
                    <span className="eyebrow">Account verification</span>
                    <h1>Confirming your email.</h1>
                    <p className="muted">This keeps your account and order updates secure.</p>
                </div>
                <div className="auth-card">
                    {state === 'verifying' && <Spinner label="Verifying your email..." />}
                    {state === 'success' && (
                        <>
                            <h2>Email verified</h2>
                            <p className="muted">Your account is ready. Sign in to start ordering.</p>
                            <Link className="button button--primary" to="/login">Go to sign in</Link>
                        </>
                    )}
                    {state === 'error' && (
                        <>
                            <h2>Verification failed</h2>
                            <div className="alert alert--error">{message}</div>
                            <p className="muted">Request a fresh link by signing up again, or contact the store team if the problem continues.</p>
                            <Link className="button button--dark" to="/register">Back to registration</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
