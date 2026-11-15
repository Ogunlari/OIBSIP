import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.jsx';
import { PizzaCard } from '../components/PizzaCard.jsx';
import { useMenu } from '../contexts/MenuContext.jsx';

export const MenuPage = () => {
    const { menu, loading, error, refreshMenu } = useMenu();
    const [query, setQuery] = useState('');

    const normalizedQuery = query.trim().toLowerCase();
    const pizzas = menu?.pizzas || [];
    const filtered = normalizedQuery
        ? pizzas.filter((pizza) => (
            `${pizza.name} ${pizza.description} ${(pizza.tags || []).join(' ')}`
                .toLowerCase()
                .includes(normalizedQuery)
        ))
        : pizzas;

    const retry = () => {
        refreshMenu().catch(() => {});
    };

    return (
        <div className="page">
            <div className="container">
                <header className="page-head">
                    <div>
                        <span className="eyebrow">The menu</span>
                        <h1>Classics with a little fire.</h1>
                        <p className="muted">Choose a signature pie or head to the builder for a fully custom pizza.</p>
                    </div>
                    <Link className="button button--dark" to="/build">Build your own</Link>
                </header>

                <div className="menu-toolbar">
                    <label className="search-field">
                        <span>Search the menu</span>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Try margherita, pesto, cheesy..."
                        />
                    </label>
                    <span className="menu-count">{filtered.length} of {pizzas.length} pizzas</span>
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
                        {[1, 2, 3, 4].map((item) => <div className="skeleton skeleton--card" key={item} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        title="No pizzas match that search"
                        action={<button type="button" className="button button--primary" onClick={() => setQuery('')}>Clear search</button>}
                    >
                        Try a different ingredient or open the builder to make exactly what you want.
                    </EmptyState>
                ) : (
                    <div className="pizza-grid">
                        {filtered.map((pizza) => <PizzaCard pizza={pizza} key={pizza.id} />)}
                    </div>
                )}

                <section className="builder-callout">
                    <div>
                        <span className="eyebrow">Not seeing it?</span>
                        <h2>Build the pizza you actually want.</h2>
                        <p className="muted">Pick every layer yourself, from the base to the final vegetable.</p>
                    </div>
                    <Link className="button button--primary" to="/build">Open the builder</Link>
                </section>
            </div>
        </div>
    );
};
