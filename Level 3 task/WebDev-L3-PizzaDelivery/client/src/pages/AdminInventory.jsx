import { useCallback, useEffect, useState } from 'react';
import { PageLoader } from '../components/Spinner.jsx';
import { apiFetch } from '../api.js';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useRealtime } from '../hooks/useRealtime.js';
import { currency } from '../utils/format.js';

export const AdminInventory = () => {
    const { token } = useAdminAuth();
    const { pushToast } = useToast();
    const [items, setItems] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savingId, setSavingId] = useState('');

    const loadInventory = useCallback(async ({ silent = false } = {}) => {
        if (!silent) {
            setLoading(true);
        }
        setError('');
        try {
            const data = await apiFetch('/admin/inventory', { token });
            setItems(data.items);
            setDrafts(Object.fromEntries(data.items.map((item) => [
                item.id,
                { stock: item.stock, threshold: item.threshold }
            ])));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [token]);

    useEffect(() => {
        loadInventory();
    }, [loadInventory]);

    useRealtime(token, {
        'inventory:low': () => loadInventory({ silent: true })
    });

    const handleDraftChange = (id, field, value) => {
        setDrafts((current) => ({
            ...current,
            [id]: {
                ...current[id],
                [field]: value === '' ? '' : Number(value)
            }
        }));
    };

    const saveItem = async (item) => {
        const draft = drafts[item.id];
        const stock = Number(draft?.stock);
        const threshold = Number(draft?.threshold);

        if (!Number.isInteger(stock) || stock < 0 || !Number.isInteger(threshold) || threshold < 0) {
            pushToast('Stock and threshold must be whole numbers of zero or more.', 'error');
            return;
        }

        setSavingId(item.id);
        try {
            const data = await apiFetch(`/admin/inventory/${item.id}`, {
                method: 'PATCH',
                token,
                body: { stock, threshold }
            });
            setItems((current) => current.map((entry) => (
                entry.id === data.item.id ? data.item : entry
            )));
            setDrafts((current) => ({
                ...current,
                [item.id]: { stock: data.item.stock, threshold: data.item.threshold }
            }));
            pushToast(data.alertSent
                ? `${item.name} updated. A low stock alert was sent.`
                : `${item.name} updated.`);
        } catch (requestError) {
            pushToast(requestError.message, 'error');
        } finally {
            setSavingId('');
        }
    };

    if (loading && items.length === 0) {
        return <PageLoader label="Loading inventory..." />;
    }

    return (
        <div>
            <header className="admin-header">
                <div>
                    <span className="eyebrow">Pantry</span>
                    <h1>Watch every ingredient.</h1>
                    <p className="muted">Update stock and thresholds. Low stock alerts are rate-limited by the cooldown in the server env.</p>
                </div>
                <button type="button" className="button button--ghost" onClick={() => loadInventory()}>
                    Refresh
                </button>
            </header>

            {error && (
                <div className="alert alert--error">
                    <span>{error}</span>
                    <button type="button" className="button button--ghost button--small" onClick={() => loadInventory()}>
                        Try again
                    </button>
                </div>
            )}

            <div className="admin-panel admin-panel--flush">
                <div className="table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Threshold</th>
                                <th>State</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => {
                                const draft = drafts[item.id] || { stock: item.stock, threshold: item.threshold };
                                return (
                                    <tr className={item.lowStock ? 'low-stock-row' : ''} key={item.id}>
                                        <td>
                                            <strong>{item.name}</strong>
                                            <span className="table-sub">{item.unit}</span>
                                        </td>
                                        <td>{item.category}</td>
                                        <td>{currency(item.price)}</td>
                                        <td>
                                            <input
                                                className="table-input"
                                                type="number"
                                                min="0"
                                                value={draft.stock}
                                                onChange={(event) => handleDraftChange(item.id, 'stock', event.target.value)}
                                                aria-label={`${item.name} stock`}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="table-input"
                                                type="number"
                                                min="0"
                                                value={draft.threshold}
                                                onChange={(event) => handleDraftChange(item.id, 'threshold', event.target.value)}
                                                aria-label={`${item.name} threshold`}
                                            />
                                        </td>
                                        <td>
                                            {item.lowStock ? (
                                                <span className="status status--cancelled">Low stock</span>
                                            ) : (
                                                <span className="status status--delivered">Healthy</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="button button--dark button--small"
                                                onClick={() => saveItem(item)}
                                                disabled={savingId === item.id}
                                            >
                                                {savingId === item.id ? 'Saving...' : 'Save'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
