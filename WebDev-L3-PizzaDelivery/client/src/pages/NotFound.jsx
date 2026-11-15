import { Link } from 'react-router-dom';

export const NotFound = () => (
    <div className="page">
        <div className="container">
            <div className="not-found">
                <span className="eyebrow">404</span>
                <h1>That page slipped off the peel.</h1>
                <p className="muted">The link may be old, or the page may have moved.</p>
                <div className="not-found__actions">
                    <Link className="button button--primary" to="/">Back home</Link>
                    <Link className="button button--ghost" to="/menu">Browse the menu</Link>
                </div>
            </div>
        </div>
    </div>
);
