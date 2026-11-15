import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { apiFetch } from '../api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRealtime } from '../hooks/useRealtime.js';
import { useToast } from '../contexts/ToastContext.jsx';
import {
    STATUS_FLOW,
    currency,
    formatDate,
    shortOrderId,
    statusLabel
} from '../utils/format.js';

export const OrderTrackingPage = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const { pushToast } = useToast();
    const [searchParams] = useSearchParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const success = searchParams.get('success') === '1';

    const loadOrder = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch(`/orders/${id}`, { token });
            setOrder(data.order);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        loadOrder();
    }, [loadOrder]);

    useRealtime(token, {
        'order:updated': (updated) => {
            if (updated.id === id) {
                setOrder(updated);
            }
        }
    });

    const handleCancel = async () => {
        if (!window.confirm('Cancel this order and release its reserved stock?')) {
            return;
        }

        setCancelling(true);
        try {
            const data = await apiFetch(`/orders/${id}/cancel`, {
                method: 'POST',
                token
            });
            setOrder(data.order);
            pushToast('Order cancelled.');
        } catch (requestError) {
            pushToast(requestError.message, 'error');
        } finally {
            setCancelling(false);
        }
    };

    if (loading && !order) {
        return <PageLoader label="Loading your order..." />;
    }

    if (error && !order) {
        return (
            <div className="page">
                <div className="container">
                    <EmptyState
                        title="Order not found"
                        action={<Link className="button button--primary" to="/orders">Back to orders</Link>}
                    >
                        {error}
                    </EmptyState>
                </div>
            </div>
        );
    }

    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const isPending = order.status === 'PENDING_PAYMENT';
    const isCancelled = order.status === 'CANCELLED';

    return (
        <div className="page">
            <div className="container">
                <Link className="back-link" to="/orders">Back to orders</Link>

                {success && (
                    <div className="alert alert--success">
                        Payment confirmed. Your order is now with the kitchen.
                    </div>
                )}

                <header className="order-detail__head">
                    <div>
                        <span className="eyebrow">Order #{shortOrderId(order.id)}</span>
                        <h1>{statusLabel(order.status)}</h1>
                        <p className="muted">Placed {formatDate(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                </header>

                <div className="order-detail__grid">
                    <div className="order-detail__main">
                        <section className="panel">
                            <h2>Progress</h2>
                            {isPending && (
                                <div className="alert alert--warning">
                                    Payment is still pending. Complete payment to move this order into the kitchen.
                                </div>
                            )}
                            {isCancelled && (
                                <div className="alert alert--error">
                                    This order was cancelled and its reserved stock was released.
                                </div>
                            )}
                            {!isPending && !isCancelled && (
                                <div className="timeline">
                                    {STATUS_FLOW.map((status, index) => (
                                        <div
                                            className={`timeline__item ${index < currentIndex ? 'is-done' : ''} ${index === currentIndex ? 'is-current' : ''}`}
                                            key={status}
                                        >
                                            <span className="timeline__dot">{index + 1}</span>
                                            <div>
                                                <strong>{statusLabel(status)}</strong>
                                                <p>
                                                    {index < currentIndex
                                                        ? 'Completed'
                                                        : index === currentIndex
                                                            ? 'Happening now'
                                                            : 'Waiting'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="panel">
                            <h2>Your pizzas</h2>
                            <div className="order-items">
                                {order.items.map((item, index) => (
                                    <article className="order-item" key={`${item.name}-${index}`}>
                                        <div>
                                            <strong>{item.quantity} x {item.name}</strong>
                                            <span>{item.summary}</span>
                                        </div>
                                        <strong>{currency(item.lineTotal)}</strong>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="summary-card">
                        <h2>Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <strong>{currency(order.subtotal)}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Taxes</span>
                            <strong>{currency(order.tax)}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Delivery</span>
                            <strong>{currency(order.deliveryFee)}</strong>
                        </div>
                        <div className="summary-row summary-row--total">
                            <span>Total</span>
                            <strong>{currency(order.totalAmount)}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Payment</span>
                            <strong>{order.paymentStatus}</strong>
                        </div>
                        {isPending && (
                            <button
                                type="button"
                                className="button button--ghost"
                                onClick={handleCancel}
                                disabled={cancelling}
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel order'}
                            </button>
                        )}
                        <p className="summary-card__note">
                            This page updates automatically as the store team moves your order forward.
                        </p>
                    </aside>
                </div>
            </div>
        </div>
    );
};
