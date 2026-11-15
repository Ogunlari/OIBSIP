import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLoader } from '../components/Spinner.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { apiFetch } from '../api.js';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';
import { useRealtime } from '../hooks/useRealtime.js';
import { currency, formatDate, shortOrderId } from '../utils/format.js';

export const AdminDashboard = () => {
    const { token, admin } = useAdminAuth();
    const [stats, setStats] = useState(null);
    const [lowStock, setLowStock] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDashboard = useCallback(async ({ silent = false } = {}) => {
        if (!silent) {
            setLoading(true);
        }
        setError('');
        try {
            const [statsData, ordersData] = await Promise.all([
                apiFetch('/admin/stats', { token }),
                apiFetch('/admin/orders', { token })
            ]);
            setStats(statsData.stats);
            setLowStock(statsData.lowStock);
            setRecentOrders(ordersData.orders.slice(0, 5));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [token]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useRealtime(token, {
        'order:new': () => loadDashboard({ silent: true }),
        'order:updated': () => loadDashboard({ silent: true }),
        'inventory:low': () => loadDashboard({ silent: true })
    });

    if (loading && !stats) {
        return <PageLoader label="Loading the store dashboard..." />;
    }

    return (
        <div>
            <header className="admin-header">
                <div>
                    <span className="eyebrow">Dashboard</span>
                    <h1>Good to see you, {admin?.name?.split(' ')[0]}.</h1>
                    <p className="muted">A live view of orders, revenue, and pantry pressure.</p>
                </div>
                <button type="button" className="button button--ghost" onClick={() => loadDashboard()}>
                    Refresh
                </button>
            </header>

            {error && (
                <div className="alert alert--error">
                    <span>{error}</span>
                    <button type="button" className="button button--ghost button--small" onClick={() => loadDashboard()}>
                        Try again
                    </button>
                </div>
            )}

            <div className="admin-grid">
                <article className="stat-card">
                    <span>Paid revenue</span>
                    <strong>{currency(stats?.revenue || 0)}</strong>
                    <p>All paid orders</p>
                </article>
                <article className="stat-card">
                    <span>Total orders</span>
                    <strong>{stats?.total || 0}</strong>
                    <p>{stats?.pending || 0} awaiting payment</p>
                </article>
                <article className="stat-card">
                    <span>Active orders</span>
                    <strong>{stats?.active || 0}</strong>
                    <p>Received, kitchen, or delivery</p>
                </article>
                <article className="stat-card stat-card--alert">
                    <span>Low stock</span>
                    <strong>{lowStock.length}</strong>
                    <p>At or below threshold</p>
                </article>
            </div>

            <section className="admin-panel">
                <div className="admin-panel__head">
                    <div>
                        <span className="eyebrow">Pantry watch</span>
                        <h2>Low stock items</h2>
                    </div>
                    <Link className="text-link" to="/admin/inventory">Manage inventory</Link>
                </div>
                {lowStock.length === 0 ? (
                    <p className="muted">Every ingredient is above its threshold.</p>
                ) : (
                    <div className="table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Category</th>
                                    <th>Stock</th>
                                    <th>Threshold</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.map((item) => (
                                    <tr className="low-stock-row" key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{item.category}</td>
                                        <td><strong>{item.stock}</strong></td>
                                        <td>{item.threshold}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="admin-panel">
                <div className="admin-panel__head">
                    <div>
                        <span className="eyebrow">Live floor</span>
                        <h2>Recent orders</h2>
                    </div>
                    <Link className="text-link" to="/admin/orders">View all orders</Link>
                </div>
                {recentOrders.length === 0 ? (
                    <p className="muted">No orders yet. They will appear here as customers check out.</p>
                ) : (
                    <div className="table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Placed</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>#{shortOrderId(order.id)}</td>
                                        <td>
                                            <strong>{order.customer?.name || 'Deleted user'}</strong>
                                            <span className="table-sub">{order.customer?.email}</span>
                                        </td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>{currency(order.totalAmount)}</td>
                                        <td><StatusBadge status={order.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};
