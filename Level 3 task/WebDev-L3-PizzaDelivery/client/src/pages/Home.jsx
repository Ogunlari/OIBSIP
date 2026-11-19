import { Link } from 'react-router-dom';
import { PizzaArt } from '../components/PizzaArt.jsx';
import { PizzaCard } from '../components/PizzaCard.jsx';
import { useMenu } from '../contexts/MenuContext.jsx';

const steps = [
    {
        title: 'Pick a classic',
        copy: 'Choose a signature pie from the menu or open the builder to start from a blank canvas.'
    },
    {
        title: 'Make it yours',
        copy: 'Choose the base, sauce, cheese, and up to five vegetables. The price updates as you build.'
    },
    {
        title: 'Track every step',
        copy: 'Pay securely, then follow the order from the kitchen to your door in real time.'
    }
];

export const Home = () => {
    const { menu, loading, error, refreshMenu } = useMenu();
    const featured = menu?.pizzas?.slice(0, 3) || [];

    const retry = () => {
        refreshMenu().catch(() => {});
    };

    return (
        <div>
            <section className="hero">
                <div className="container hero__grid">
                    <div className="hero__copy">
                        <span className="eyebrow">Fresh dough, bright toppings</span>
                        <h1>Pizza that is built exactly your way.</h1>
                        <p className="hero__lead">
                            Start with a house classic or craft a pie from our live ingredient pantry.
                            Every order is backed by real stock, secure checkout, and live kitchen updates.
                        </p>
                        <div className="hero__actions">
                            <Link className="button button--primary" to="/menu">Explore the menu</Link>
                            <Link className="button button--ghost" to="/build">Build your own</Link>
                        </div>
                        <div className="hero__stats">
                            <div>
                                <strong>4</strong>
                                <span>signature pies</span>
                            </div>
                            <div>
                                <strong>15</strong>
                                <span>fresh ingredients</span>
                            </div>
                            <div>
                                <strong>Live</strong>
                                <span>order tracking</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero__art">
                        <span className="hero__badge">Hand-stretched daily</span>
                        <PizzaArt />
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="section-head">
                        <div>
                            <span className="eyebrow">Fresh from the oven</span>
                            <h2>Signature pies worth sharing</h2>
                        </div>
                        <Link className="text-link" to="/menu">View the full menu</Link>
                    </div>
                    {error ? (
                        <div className="alert alert--error">
                            <span>{error}</span>
                            <button type="button" className="button button--ghost button--small" onClick={retry}>
                                Try again
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="pizza-grid">
                            {[1, 2, 3].map((item) => <div className="skeleton skeleton--card" key={item} />)}
                        </div>
                    ) : (
                        <div className="pizza-grid">
                            {featured.map((pizza) => <PizzaCard pizza={pizza} key={pizza.id} />)}
                        </div>
                    )}
                </div>
            </section>

            <section className="section section--tint">
                <div className="container section-split">
                    <div>
                        <span className="eyebrow">How it works</span>
                        <h2>From craving to doorstep in three moves.</h2>
                        <p className="muted section-split__lead">
                            The menu is connected to the pantry, so what you see is what the kitchen can make.
                        </p>
                        <Link className="button button--dark" to="/build">Start building</Link>
                    </div>
                    <div className="step-list">
                        {steps.map((step, index) => (
                            <article className="step" key={step.title}>
                                <span className="step__number">{String(index + 1).padStart(2, '0')}</span>
                                <div>
                                    <h3>{step.title}</h3>
                                    <p>{step.copy}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="section-head">
                        <div>
                            <span className="eyebrow">Why SliceCraft</span>
                            <h2>Built for the whole pizza journey</h2>
                        </div>
                    </div>
                    <div className="feature-grid">
                        <article className="feature-card">
                            <span className="feature-card__mark">01</span>
                            <h3>Inventory-backed menu</h3>
                            <p>Every pizza is checked against live ingredient stock before it can be ordered.</p>
                        </article>
                        <article className="feature-card">
                            <span className="feature-card__mark">02</span>
                            <h3>Secure checkout</h3>
                            <p>Server-side payment validation before an order is sent to the kitchen.</p>
                        </article>
                        <article className="feature-card">
                            <span className="feature-card__mark">03</span>
                            <h3>Real-time updates</h3>
                            <p>Socket.IO keeps customers and the kitchen team in sync as each order moves forward.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="container cta-band">
                <div>
                    <span className="eyebrow">Your next favourite</span>
                    <h2>Build a pie that tastes like yours.</h2>
                </div>
                <Link className="button button--primary" to="/build">Open the pizza builder</Link>
            </section>
        </div>
    );
};
