import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { PizzaSlice } from '../components/PizzaSlice.jsx';
import { QuantityStepper } from '../components/QuantityStepper.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useMenu } from '../contexts/MenuContext.jsx';
import { currency } from '../utils/format.js';

export const CartPage = () => {
    const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
    const { pricing } = useMenu();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const tax = Math.round(subtotal * pricing.taxRate);
    const deliveryFee = subtotal > 0 ? pricing.deliveryFee : 0;
    const total = subtotal + tax + deliveryFee;

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }
        navigate('/checkout');
    };

    const handleClear = () => {
        if (window.confirm('Clear every item from your cart?')) {
            clearCart();
        }
    };

    if (items.length === 0) {
        return (
            <div className="page">
                <div className="container">
                    <EmptyState
                        title="Your cart is empty"
                        action={<Link className="button button--primary" to="/menu">Browse the menu</Link>}
                    >
                        Add a signature pizza or build a custom pie to get started.
                    </EmptyState>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <header className="page-head">
                    <div>
                        <span className="eyebrow">Your order</span>
                        <h1>Review your cart.</h1>
                        <p className="muted">Quantities can be adjusted before checkout.</p>
                    </div>
                    <button type="button" className="button button--ghost button--small" onClick={handleClear}>
                        Clear cart
                    </button>
                </header>

                <div className="cart-layout">
                    <div className="cart-list">
                        {items.map((item) => (
                            <article className="cart-item" key={item.id}>
                                <div className="cart-item__visual">
                                    <PizzaSlice className="cart-item__slice" />
                                </div>
                                <div className="cart-item__copy">
                                    <div className="cart-item__title">
                                        <h3>{item.name}</h3>
                                        <strong>{currency(item.unitPrice * item.quantity, pricing.currency)}</strong>
                                    </div>
                                    <p>{item.summary}</p>
                                    <div className="cart-item__actions">
                                        <QuantityStepper
                                            value={item.quantity}
                                            onChange={(quantity) => updateQuantity(item.id, quantity)}
                                        />
                                        <button
                                            type="button"
                                            className="text-button"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <aside className="summary-card">
                        <h2>Order summary</h2>
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
                        <button type="button" className="button button--primary" onClick={handleCheckout}>
                            Continue to checkout
                        </button>
                        <Link className="summary-card__link" to="/menu">Add more items</Link>
                        <p className="summary-card__note">
                            The server recalculates stock and totals at checkout, so the final amount always matches the kitchen.
                        </p>
                    </aside>
                </div>
            </div>
        </div>
    );
};
