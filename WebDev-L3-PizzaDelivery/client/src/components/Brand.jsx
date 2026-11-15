import { Link } from 'react-router-dom';

export const Brand = ({ to = '/' }) => (
    <Link className="brand" to={to} aria-label="SliceCraft home">
        <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="img">
                <circle cx="24" cy="24" r="23" fill="#D9381E" />
                <circle cx="24" cy="24" r="17" fill="#F6C65B" />
                <circle cx="18" cy="18" r="3.2" fill="#B92E16" />
                <circle cx="30" cy="21" r="2.8" fill="#B92E16" />
                <circle cx="24" cy="32" r="2.8" fill="#B92E16" />
                <path d="M17 28c2.5-2.5 5.5-2.5 8 0" stroke="#3F7D4E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <path d="M28 30c2-2 4-2 6 0" stroke="#3F7D4E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            </svg>
        </span>
        <span className="brand__copy">
            <span className="brand__name">SliceCraft</span>
            <span className="brand__tagline">Pizza, built your way</span>
        </span>
    </Link>
);
