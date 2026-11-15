import { useCallback, useEffect, useState } from 'react';
import { EmptyState } from '../components/EmptyState.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { apiFetch } from '../api.js';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useRealtime } from '../hooks/useRealtime.js';
import {
    NEXT_STATUS,
    NEXT_STATUS_LABELS,
    currency,
    formatDate,
    shortOrderId,
    statusLabel
} from '../utils/format.js';

const FILTERS = [
    'ALL',
    'PENDING_PAYMENT',
    'RECEIVED',
    'IN_KITCHEN',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
];

export const AdminOrders = () => {
    const { token } = useAdminAuth();
    const { pushToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [busyId, setBusyId] = useState('');

    const loadOrders = useCallback(async ({ silent = false } = {}) => {
        if (!silent) {
            setLoading(true);
        }
        setError('');
        try {
            const data = await apiFetch('/admin/orders', { token });
            setOrders(data.orders);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [token]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    useRealtime(token, {
        'order:new': () => loadOrders({ silent: true }),
        'order:updated': () => loadOrders({ silent: true })
    });

    const advanceOrder = async (order) => {
        const nextStatus = NEXT_STATUS[order.status];
        if (!nextStatus) {
            return;
        }

        setBusyId(order.id);
        try {
            const data = await apiFetch(`/admin/orders/${order.id}/status`, {
                method: 'PATCH',
                token,
                body: { status: nextStatus }
            });
            setOrders((current) => current.map((item) => (
                item.id === data.order.id ? { ...item, ...data.order } : item
            )));
            pushToast(`Order moved to ${statusLabel(nextStatus)}.`);
        } catch (requestError) {
            pushToast(requestError.message, 'error');
        } finally {
            setBusyId('');
        }
    };

    const filtered = filter === 'ALL'
        ? orders
        : orders.filter((order) => order.status === filter);

    if (loading && orders.length === 0) {
        return <PageLoader label="Loading orders..." />;
    }

    return (
        <div>
            <header className="admin-header">
                <div>
                    <span className="eyebrow">Order desk</span>
                    <h1>Keep the line moving.</h1>
                    <p className="muted">Advance orders through the kitchen and delivery flow.</p>
                </div>
                <label className="inline-field">
                    <span>Filter</span>
                    <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                        {FILTERS.map((status) => (
                            <option value={status} key={status}>
                                {status === 'ALL' ? 'All orders' : statusLabel(status)}
                            </option>
                        ))}
                    </select>
                </label>
            </header>

            {error && (
                <div className="alert alert--error">
                    <span>{error}</span>
                    <button type="button" className="button button--ghost button--small" onClick={() => loadOrders()}>
                        Try again
                    </button>
                </div>
            )}

            {filtered.length === 0 ? (
                <EmptyState title="No orders in this view">
                    Try a different status filter, or wait for the next checkout.
                </EmptyState>
            ) : (
                <div className="admin-panel admin-panel--flush">
                    <div className="table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Placed</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((order) => {
                                    const nextStatus = NEXT_STATUS[order.status];
                                    const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
                                    return (
                                        <tr key={order.id}>
                                            <td>#{shortOrderId(order.id)}</td>
                                            <td>
                                                <strong>{order.customer?.name || 'Deleted user'}</strong>
                                                <span className="table-sub">{order.customer?.email}</span>
                                            </td>
                                            <td>{itemCount}</td>
                                            <td>{formatDate(order.createdAt)}</td>
                                            <td>{currency(order.totalAmount)}</td>
                                            <td><StatusBadge status={order.status} /></td>
                                            <td>
                                                {nextStatus ? (
                                                    <button
                                                        type="button"
                                                        className="button button--dark button--small"
                                                        onClick={() => advanceOrder(order)}
                                                        disabled={busyId === order.id}
                                                    >
                                                        {busyId === order.id ? 'Updating...' : NEXT_STATUS_LABELS[nextStatus]}
                                                    </button>
                                                ) : (
                                                    <span className="muted">No action</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
