import { AppError } from '../utils/errors.js';

const findOption = (itemById, id, category, label) => {
    const item = itemById.get(id);
    if (!item || item.category !== category) {
        throw new AppError(`Invalid ${label} selection.`, 400, 'INVALID_SELECTION');
    }
    return item;
};

const addRecipeToRequirements = (requirements, recipe) => {
    for (const entry of recipe) {
        requirements.set(entry.itemId, (requirements.get(entry.itemId) || 0) + entry.quantity);
    }
};

export const buildOrderDraft = (cartItems, { pizzas, inventory }) => {
    const pizzaById = new Map(pizzas.map((pizza) => [pizza.id, pizza]));
    const itemById = new Map(inventory.map((item) => [item.id, item]));
    const requirements = new Map();
    const items = [];

    for (const cartItem of cartItems) {
        const quantity = cartItem.quantity;

        if (cartItem.type === 'pizza') {
            const pizza = pizzaById.get(cartItem.pizzaId);
            if (!pizza) {
                throw new AppError('One of the selected pizzas is no longer available.', 400, 'PIZZA_NOT_FOUND');
            }

            const recipe = pizza.recipe.map((requirement) => {
                const item = itemById.get(requirement.itemId);
                return {
                    itemId: requirement.itemId,
                    name: item ? item.name : requirement.itemId,
                    quantity: requirement.quantity * quantity
                };
            });

            addRecipeToRequirements(requirements, recipe);
            items.push({
                type: 'pizza',
                name: pizza.name,
                summary: pizza.description,
                quantity,
                unitPrice: pizza.price,
                lineTotal: pizza.price * quantity,
                recipe
            });
            continue;
        }

        const selections = cartItem.selections;
        const base = findOption(itemById, selections.baseId, 'base', 'base');
        const sauce = findOption(itemById, selections.sauceId, 'sauce', 'sauce');
        const cheese = findOption(itemById, selections.cheeseId, 'cheese', 'cheese');
        const veggieIds = [...new Set(selections.veggieIds || [])];
        const veggies = veggieIds.map((id) => findOption(itemById, id, 'veggie', 'veggie'));
        const selected = [base, sauce, cheese, ...veggies];
        const unitPrice = selected.reduce((total, item) => total + item.price, 0);
        const recipe = selected.map((item) => ({
            itemId: item.id,
            name: item.name,
            quantity
        }));

        addRecipeToRequirements(requirements, recipe);
        items.push({
            type: 'custom',
            name: 'Custom Pizza',
            summary: selected.map((item) => item.name).join(', '),
            quantity,
            unitPrice,
            lineTotal: unitPrice * quantity,
            recipe
        });
    }

    return {
        items,
        requirements: [...requirements.entries()].map(([itemId, quantity]) => ({ itemId, quantity })),
        subtotal: items.reduce((total, item) => total + item.lineTotal, 0)
    };
};

export const summarizeRequirements = (orderItems) => {
    const requirements = new Map();

    for (const item of orderItems) {
        for (const entry of item.recipe || []) {
            requirements.set(entry.itemId, (requirements.get(entry.itemId) || 0) + entry.quantity);
        }
    }

    return [...requirements.entries()].map(([itemId, quantity]) => ({ itemId, quantity }));
};
