import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { apiFetch } from '../api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRealtime } from '../hooks/useRealtime.js';
import { currency, formatDate, shortOrderId } from '../utils/format.js';

export const OrdersPage = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch('/orders', { token });
            setOrders(data.orders);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    useRealtime(token, {
        'order:updated': (order) => {
            setOrders((current) => (
                current.some((item) => item.id === order.id)
                    ? current.map((item) => (item.id === order.id ? order : item))
                    : [order, ...current]
            ));
        },
        'order:new': (order) => {
            setOrders((current) => [order, ...current.filter((item) => item.id !== order.id)]);
        }
    });

    if (loading && orders.length === 0) {
        return <PageLoader label="Loading your orders..." />;
    }

    return (
        <div className="page">
            <div className="container">
                <header className="page-head">
                    <div>
                        <span className="eyebrow">Order history</span>
                        <h1>Your pizzas, tracked live.</h1>
                        <p className="muted">Open an order to follow its progress or cancel a pending payment.</p>
                    </div>
                    <Link className="button button--primary" to="/menu">Order again</Link>
                </header>

                {error && (
                    <div className="alert alert--error">
                        <span>{error}</span>
                        <button type="button" className="button button--ghost button--small" onClick={loadOrders}>
                            Try again
                        </button>
                    </div>
                )}

                {orders.length === 0 && !error ? (
                    <EmptyState
                        title="No orders yet"
                        action={<Link className="button button--primary" to="/menu">Browse the menu</Link>}
                    >
                        Your first SliceCraft order will show up here with live kitchen updates.
                    </EmptyState>
                ) : (
                    <div className="order-list">
                        {orders.map((order) => {
                            const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
                            return (
                                <Link className="order-card" to={`/orders/${order.id}`} key={order.id}>
                                    <div className="order-card__main">
                                        <span className="order-card__id">#{shortOrderId(order.id)}</span>
                                        <h3>{itemCount} {itemCount === 1 ? 'pizza' : 'pizzas'}</h3>
                                        <p className="muted">Placed {formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className="order-card__meta">
                                        <StatusBadge status={order.status} />
                                        <strong>{currency(order.totalAmount)}</strong>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
