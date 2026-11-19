import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { PizzaSlice } from '../components/PizzaSlice.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useMenu } from '../contexts/MenuContext.jsx';
import { apiFetch } from '../api.js';
import { currency } from '../utils/format.js';

const loadRazorpayScript = () => new Promise((resolve, reject) => {
    if (window.Razorpay) {
        resolve();
        return;
    }

    const existing = document.getElementById('razorpay-checkout-script');
    if (existing) {
        existing.remove();
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'));
    document.body.appendChild(script);
});

export const CheckoutPage = () => {
    const { token, user } = useAuth();
    const { items, subtotal, clearCart } = useCart();
    const { pricing, refreshMenu } = useMenu();
    const navigate = useNavigate();
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');
    const [paymentMode, setPaymentMode] = useState('');

    useEffect(() => {
        let active = true;
        apiFetch('/health')
            .then((data) => {
                if (active) {
                    setPaymentMode(data.paymentMode);
                }
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, []);

    const tax = Math.round(subtotal * pricing.taxRate);
    const deliveryFee = subtotal > 0 ? pricing.deliveryFee : 0;
    const total = subtotal + tax + deliveryFee;

    const openRazorpay = async (data) => {
        await loadRazorpayScript();

        await new Promise((resolve, reject) => {
            let settled = false;
            const settle = (callback, value) => {
                if (settled) {
                    return;
                }
                settled = true;
                callback(value);
            };

            const cancelPending = async () => {
                try {
                    await apiFetch(`/orders/${data.order.id}/cancel`, {
                        method: 'POST',
                        token
                    });
                    await refreshMenu().catch(() => {});
                } catch {
                    return;
                }
            };

            const razorpay = new window.Razorpay({
                key: data.payment.keyId,
                amount: Math.round(data.payment.amount * 100),
                currency: data.payment.currency,
                name: 'SliceCraft',
                description: `Order ${data.order.id.slice(0, 8).toUpperCase()}`,
                order_id: data.payment.razorpayOrderId,
                prefill: {
                    name: user.name,
                    email: user.email
                },
                theme: {
                    color: '#D9381E'
                },
                handler: async (response) => {
                    try {
                        await apiFetch(`/orders/${data.order.id}/verify-payment`, {
                            method: 'POST',
                            token,
                            body: {
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            }
                        });
                        clearCart();
                        await refreshMenu().catch(() => {});
                        navigate(`/orders/${data.order.id}?success=1`, { replace: true });
                        settle(resolve);
                    } catch (verificationError) {
                        settle(reject, verificationError);
                    }
                },
                modal: {
                    ondismiss: async () => {
                        if (settled) {
                            return;
                        }
                        await cancelPending();
                        settle(reject, new Error('Payment was cancelled and the order was released.'));
                    }
                }
            });

            razorpay.on('payment.failed', async (response) => {
                if (settled) {
                    return;
                }
                await cancelPending();
                settle(reject, new Error(response.error?.description || 'Payment failed.'));
            });

            razorpay.open();
        });
    };

    const completeMockPayment = async (data) => {
        await apiFetch(`/orders/${data.order.id}/verify-payment`, {
            method: 'POST',
            token,
            body: { mock: true }
        });
        clearCart();
        await refreshMenu().catch(() => {});
        navigate(`/orders/${data.order.id}?success=1`, { replace: true });
    };

    const handlePlaceOrder = async (event) => {
        event.preventDefault();

        if (placing || items.length === 0) {
            return;
        }

        setPlacing(true);
        setError('');

        try {
            const data = await apiFetch('/orders/checkout', {
                method: 'POST',
                token,
                body: {
                    items: items.map((item) => (
                        item.type === 'pizza'
                            ? {
                                type: 'pizza',
                                pizzaId: item.pizzaId,
                                quantity: item.quantity
                            }
                            : {
                                type: 'custom',
                                quantity: item.quantity,
                                selections: item.selections
                            }
                    ))
                }
            });

            if (data.payment.provider === 'mock') {
                await completeMockPayment(data);
            } else {
                await openRazorpay(data);
            }
        } catch (requestError) {
            setError(requestError.message);
            if (requestError.code === 'INSUFFICIENT_STOCK') {
                refreshMenu().catch(() => {});
            }
        } finally {
            setPlacing(false);
        }
    };

    if (items.length === 0 && !placing) {
        return <Navigate to="/cart" replace />;
    }

    return (
        <div className="page">
            <div className="container">
                <header className="page-head">
                    <div>
                        <span className="eyebrow">Checkout</span>
                        <h1>Finish your order.</h1>
                        <p className="muted">Review the basket, then complete payment to send it to the kitchen.</p>
                    </div>
                </header>

                {error && <div className="alert alert--error">{error}</div>}

                <form className="checkout-layout" onSubmit={handlePlaceOrder}>
                    <div className="checkout-main">
                        <section className="panel">
                            <h2>Delivering to</h2>
                            <div className="checkout-user">
                                <div>
                                    <strong>{user?.name}</strong>
                                    <span>{user?.email}</span>
                                </div>
                                <span className="tag">Account verified</span>
                            </div>
                            <p className="muted checkout-note">
                                Order updates are sent to your account and shown live on the tracking page.
                            </p>
                        </section>

                        <section className="panel">
                            <h2>Your pizzas</h2>
                            <div className="checkout-items">
                                {items.map((item) => (
                                    <article className="checkout-item" key={item.id}>
                                        <div className="checkout-item__visual">
                                            <PizzaSlice className="checkout-item__slice" />
                                        </div>
                                        <div className="checkout-item__copy">
                                            <strong>{item.quantity} x {item.name}</strong>
                                            <span>{item.summary}</span>
                                        </div>
                                        <strong>{currency(item.unitPrice * item.quantity, pricing.currency)}</strong>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="panel">
                            <h2>Payment</h2>
                            <div className="payment-card">
                                <span className="payment-card__mark" aria-hidden="true" />
                                <div>
                                    <strong>
                                        {paymentMode === 'razorpay'
                                            ? 'Razorpay secure checkout'
                                            : paymentMode === 'mock'
                                                ? 'Demo payment (development)'
                                                : paymentMode === 'not_configured'
                                                    ? 'Payment not configured'
                                                    : 'Checking payment provider...'}
                                    </strong>
                                    <span>
                                        {paymentMode === 'razorpay'
                                            ? 'You will be redirected to the Razorpay checkout to complete payment.'
                                            : paymentMode === 'mock'
                                                ? 'No Razorpay keys are set, so this order will be marked paid with a demo payment. No money will be charged.'
                                                : paymentMode === 'not_configured'
                                                    ? 'Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env to enable checkout.'
                                                    : 'Confirming the payment provider before checkout.'}
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="summary-card">
                        <h2>Order total</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <strong>{currency(subtotal, pricing.currency)}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Taxes</span>
                            <strong>{currency(tax, pricing.currency)}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Delivery</span>
                            <strong>{currency(deliveryFee, pricing.currency)}</strong>
                        </div>
                        <div className="summary-row summary-row--total">
                            <span>Total</span>
                            <strong>{currency(total, pricing.currency)}</strong>
                        </div>
                        <button type="submit" className="button button--primary" disabled={placing}>
                            {placing ? 'Processing...' : paymentMode === 'mock' ? 'Place order (demo payment)' : 'Place order'}
                        </button>
                        <p className="summary-card__note">
                            Stock is reserved when the order is created and released automatically if payment is not completed.
                        </p>
                    </aside>
                </form>
            </div>
        </div>
    );
};
