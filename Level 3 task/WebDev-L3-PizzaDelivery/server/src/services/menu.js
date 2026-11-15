import { env } from '../config/env.js';

const optionPayload = (item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    stock: item.stock,
    unit: item.unit,
    available: item.stock > 0
});

export const buildMenu = (pizzas, inventory) => {
    const inventoryById = new Map(inventory.map((item) => [item.id, item]));
    const options = {
        base: [],
        sauce: [],
        cheese: [],
        veggie: []
    };

    for (const item of inventory) {
        if (options[item.category]) {
            options[item.category].push(optionPayload(item));
        }
    }

    for (const category of Object.keys(options)) {
        options[category].sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
    }

    const pizzaCards = pizzas.map((pizza) => ({
        id: pizza.id,
        name: pizza.name,
        description: pizza.description,
        price: pizza.price,
        tags: pizza.tags || [],
        accent: pizza.accent,
        available: pizza.recipe.every((requirement) => {
            const item = inventoryById.get(requirement.itemId);
            return item && item.stock >= requirement.quantity;
        })
    }));

    return {
        pizzas: pizzaCards,
        options,
        pricing: {
            currency: env.currency,
            taxRate: env.taxRate,
            deliveryFee: env.deliveryFee
        }
    };
};
