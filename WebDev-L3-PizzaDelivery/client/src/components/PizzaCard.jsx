import { useCart } from '../contexts/CartContext.jsx';
import { useMenu } from '../contexts/MenuContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { currency } from '../utils/format.js';
import { PizzaSlice } from './PizzaSlice.jsx';

export const PizzaCard = ({ pizza }) => {
    const { addPizza } = useCart();
    const { pricing } = useMenu();
    const { pushToast } = useToast();

    const handleAdd = () => {
        addPizza(pizza);
        pushToast(`${pizza.name} added to your cart.`);
    };

    return (
        <article className={`pizza-card ${pizza.available ? '' : 'is-unavailable'}`} style={{ '--accent': pizza.accent }}>
            <div className="pizza-card__visual">
                <PizzaSlice className="pizza-card__slice" />
            </div>
            <div className="pizza-card__body">
                <div className="pizza-card__tags">
                    {(pizza.tags || []).map((tag) => (
                        <span className="tag" key={tag}>{tag}</span>
                    ))}
                </div>
                <h3>{pizza.name}</h3>
                <p>{pizza.description}</p>
                <div className="pizza-card__footer">
                    <span className="price">{currency(pizza.price, pricing.currency)}</span>
                    <button
                        type="button"
                        className="button button--primary button--small"
                        onClick={handleAdd}
                        disabled={!pizza.available}
                    >
                        {pizza.available ? 'Add to cart' : 'Sold out'}
                    </button>
                </div>
            </div>
        </article>
    );
};
