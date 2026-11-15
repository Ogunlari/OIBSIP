import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLoader } from '../components/Spinner.jsx';
import { QuantityStepper } from '../components/QuantityStepper.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useMenu } from '../contexts/MenuContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { currency } from '../utils/format.js';

const OptionGroup = ({ title, hint, options, selectedId, onSelect, currencyCode }) => (
    <section className="option-group">
        <div className="option-group__head">
            <h2>{title}</h2>
            {hint && <span>{hint}</span>}
        </div>
        <div className="option-grid">
            {options.map((option) => (
                <button
                    type="button"
                    className={`option-card ${selectedId === option.id ? 'is-selected' : ''}`}
                    key={option.id}
                    onClick={() => onSelect(option.id)}
                    disabled={!option.available}
                >
                    <strong>{option.name}</strong>
                    <small>{currency(option.price, currencyCode)}</small>
                    <span>{option.available ? `${option.stock} left` : 'Sold out'}</span>
                </button>
            ))}
        </div>
    </section>
);

export const PizzaBuilderPage = () => {
    const { menu, loading, error, refreshMenu, pricing } = useMenu();
    const { addCustom } = useCart();
    const { pushToast } = useToast();
    const navigate = useNavigate();

    const [baseId, setBaseId] = useState('');
    const [sauceId, setSauceId] = useState('');
    const [cheeseId, setCheeseId] = useState('');
    const [veggieIds, setVeggieIds] = useState([]);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!menu) {
            return;
        }

        const firstAvailable = (category) => {
            const options = menu.options[category] || [];
            return (options.find((option) => option.available) || options[0])?.id || '';
        };

        setBaseId((current) => current || firstAvailable('base'));
        setSauceId((current) => current || firstAvailable('sauce'));
        setCheeseId((current) => current || firstAvailable('cheese'));
    }, [menu]);

    const base = menu?.options.base.find((option) => option.id === baseId);
    const sauce = menu?.options.sauce.find((option) => option.id === sauceId);
    const cheese = menu?.options.cheese.find((option) => option.id === cheeseId);
    const veggies = (menu?.options.veggie || []).filter((option) => veggieIds.includes(option.id));
    const selectedOptions = useMemo(
        () => [base, sauce, cheese, ...veggies].filter(Boolean),
        [base, sauce, cheese, veggies]
    );

    const unitPrice = selectedOptions.reduce((total, option) => total + option.price, 0);
    const maxQuantity = selectedOptions.length
        ? Math.max(1, Math.min(20, ...selectedOptions.map((option) => option.stock)))
        : 20;
    const allAvailable = selectedOptions.length === 3 + veggies.length
        && selectedOptions.every((option) => option.available);

    useEffect(() => {
        setQuantity((current) => Math.min(current, maxQuantity));
    }, [maxQuantity]);

    const toggleVeggie = (id) => {
        setVeggieIds((current) => {
            if (current.includes(id)) {
                return current.filter((item) => item !== id);
            }
            if (current.length >= 5) {
                pushToast('Choose up to five vegetables.', 'error');
                return current;
            }
            return [...current, id];
        });
    };

    const handleAdd = () => {
        if (!allAvailable) {
            pushToast('Choose an available base, sauce, and cheese.', 'error');
            return;
        }

        addCustom({
            type: 'custom',
            name: 'Custom Pizza',
            summary: selectedOptions.map((option) => option.name).join(', '),
            unitPrice,
            quantity,
            selections: {
                baseId,
                sauceId,
                cheeseId,
                veggieIds
            }
        });
        pushToast('Your custom pizza is in the cart.');
        navigate('/cart');
    };

    if (loading && !menu) {
        return <PageLoader label="Loading the ingredient pantry..." />;
    }

    if (error && !menu) {
        return (
            <div className="page">
                <div className="container">
                    <div className="alert alert--error">
                        <span>{error}</span>
                        <button
                            type="button"
                            className="button button--ghost button--small"
                            onClick={() => refreshMenu().catch(() => {})}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <header className="page-head">
                    <div>
                        <span className="eyebrow">Pizza builder</span>
                        <h1>Start with a blank canvas.</h1>
                        <p className="muted">Choose one base, one sauce, one cheese, and up to five vegetables.</p>
                    </div>
                </header>

                <div className="builder-layout">
                    <div className="builder-panel">
                        <OptionGroup
                            title="1. Choose a base"
                            options={menu?.options.base || []}
                            selectedId={baseId}
                            onSelect={setBaseId}
                            currencyCode={pricing.currency}
                        />
                        <OptionGroup
                            title="2. Choose a sauce"
                            options={menu?.options.sauce || []}
                            selectedId={sauceId}
                            onSelect={setSauceId}
                            currencyCode={pricing.currency}
                        />
                        <OptionGroup
                            title="3. Choose a cheese"
                            options={menu?.options.cheese || []}
                            selectedId={cheeseId}
                            onSelect={setCheeseId}
                            currencyCode={pricing.currency}
                        />
                        <section className="option-group">
                            <div className="option-group__head">
                                <h2>4. Add vegetables</h2>
                                <span>{veggieIds.length}/5 selected</span>
                            </div>
                            <div className="option-grid">
                                {(menu?.options.veggie || []).map((option) => (
                                    <button
                                        type="button"
                                        className={`option-card ${veggieIds.includes(option.id) ? 'is-selected' : ''}`}
                                        key={option.id}
                                        onClick={() => toggleVeggie(option.id)}
                                        disabled={!option.available}
                                    >
                                        <strong>{option.name}</strong>
                                        <small>{currency(option.price, pricing.currency)}</small>
                                        <span>{option.available ? `${option.stock} left` : 'Sold out'}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="builder-summary">
                        <span className="eyebrow">Your build</span>
                        <h2>Custom Pizza</h2>
                        <ul className="builder-summary__list">
                            {selectedOptions.map((option) => (
                                <li key={option.id}>
                                    <span>{option.name}</span>
                                    <strong>{currency(option.price, pricing.currency)}</strong>
                                </li>
                            ))}
                        </ul>
                        {!allAvailable && (
                            <p className="builder-summary__warning">One of your selections is no longer available. Pick another option.</p>
                        )}
                        <div className="builder-summary__row">
                            <span>Pizza price</span>
                            <strong>{currency(unitPrice, pricing.currency)}</strong>
                        </div>
                        <div className="builder-summary__quantity">
                            <span>Quantity</span>
                            <QuantityStepper value={quantity} onChange={setQuantity} max={maxQuantity} />
                        </div>
                        <div className="builder-summary__row builder-summary__total">
                            <span>Total</span>
                            <strong>{currency(unitPrice * quantity, pricing.currency)}</strong>
                        </div>
                        <button
                            type="button"
                            className="button button--primary"
                            onClick={handleAdd}
                            disabled={!allAvailable}
                        >
                            Add custom pizza to cart
                        </button>
                    </aside>
                </div>
            </div>
        </div>
    );
};
