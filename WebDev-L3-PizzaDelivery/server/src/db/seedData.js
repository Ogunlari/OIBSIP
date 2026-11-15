export const seedInventory = [
    {
        id: 'base-classic',
        name: 'Classic Hand-Tossed',
        category: 'base',
        price: 120,
        stock: 40,
        threshold: 10,
        unit: 'pcs'
    },
    {
        id: 'base-thin',
        name: 'Thin Crust',
        category: 'base',
        price: 140,
        stock: 30,
        threshold: 8,
        unit: 'pcs'
    },
    {
        id: 'base-cheese-burst',
        name: 'Cheese Burst',
        category: 'base',
        price: 180,
        stock: 20,
        threshold: 6,
        unit: 'pcs'
    },
    {
        id: 'base-whole-wheat',
        name: 'Whole Wheat',
        category: 'base',
        price: 150,
        stock: 35,
        threshold: 10,
        unit: 'pcs'
    },
    {
        id: 'base-garlic-butter',
        name: 'Garlic Butter',
        category: 'base',
        price: 165,
        stock: 28,
        threshold: 8,
        unit: 'pcs'
    },
    {
        id: 'sauce-tomato',
        name: 'Tomato Basil',
        category: 'sauce',
        price: 40,
        stock: 50,
        threshold: 12,
        unit: 'portions'
    },
    {
        id: 'sauce-pesto',
        name: 'Pesto',
        category: 'sauce',
        price: 60,
        stock: 25,
        threshold: 8,
        unit: 'portions'
    },
    {
        id: 'sauce-bbq',
        name: 'Smoky BBQ',
        category: 'sauce',
        price: 55,
        stock: 30,
        threshold: 8,
        unit: 'portions'
    },
    {
        id: 'sauce-peri-peri',
        name: 'Peri-Peri',
        category: 'sauce',
        price: 50,
        stock: 35,
        threshold: 10,
        unit: 'portions'
    },
    {
        id: 'sauce-white-garlic',
        name: 'White Garlic',
        category: 'sauce',
        price: 65,
        stock: 30,
        threshold: 8,
        unit: 'portions'
    },
    {
        id: 'cheese-mozzarella',
        name: 'Mozzarella',
        category: 'cheese',
        price: 80,
        stock: 45,
        threshold: 12,
        unit: 'portions'
    },
    {
        id: 'cheese-cheddar',
        name: 'Cheddar',
        category: 'cheese',
        price: 90,
        stock: 30,
        threshold: 8,
        unit: 'portions'
    },
    {
        id: 'cheese-parmesan',
        name: 'Parmesan',
        category: 'cheese',
        price: 70,
        stock: 20,
        threshold: 6,
        unit: 'portions'
    },
    {
        id: 'veg-onion',
        name: 'Onion',
        category: 'veggie',
        price: 25,
        stock: 60,
        threshold: 15,
        unit: 'portions'
    },
    {
        id: 'veg-capsicum',
        name: 'Capsicum',
        category: 'veggie',
        price: 30,
        stock: 55,
        threshold: 15,
        unit: 'portions'
    },
    {
        id: 'veg-mushroom',
        name: 'Mushroom',
        category: 'veggie',
        price: 35,
        stock: 40,
        threshold: 10,
        unit: 'portions'
    },
    {
        id: 'veg-olives',
        name: 'Black Olives',
        category: 'veggie',
        price: 40,
        stock: 35,
        threshold: 10,
        unit: 'portions'
    },
    {
        id: 'veg-tomato',
        name: 'Tomato',
        category: 'veggie',
        price: 25,
        stock: 50,
        threshold: 12,
        unit: 'portions'
    },
    {
        id: 'veg-corn',
        name: 'Sweet Corn',
        category: 'veggie',
        price: 30,
        stock: 45,
        threshold: 12,
        unit: 'portions'
    }
];

export const seedPizzas = [
    {
        id: 'pizza-margherita',
        name: 'Margherita',
        description: 'Classic hand-tossed base, tomato basil sauce, mozzarella, and fresh tomato.',
        price: 299,
        tags: ['Classic', 'Veg'],
        accent: '#E4572E',
        recipe: [
            { itemId: 'base-classic', quantity: 1 },
            { itemId: 'sauce-tomato', quantity: 1 },
            { itemId: 'cheese-mozzarella', quantity: 1 },
            { itemId: 'veg-tomato', quantity: 1 }
        ]
    },
    {
        id: 'pizza-farmhouse',
        name: 'Farmhouse',
        description: 'Loaded with onion, capsicum, and mushroom over a classic base and tomato sauce.',
        price: 399,
        tags: ['Loaded', 'Veg'],
        accent: '#D98E04',
        recipe: [
            { itemId: 'base-classic', quantity: 1 },
            { itemId: 'sauce-tomato', quantity: 1 },
            { itemId: 'cheese-mozzarella', quantity: 1 },
            { itemId: 'veg-onion', quantity: 1 },
            { itemId: 'veg-capsicum', quantity: 1 },
            { itemId: 'veg-mushroom', quantity: 1 }
        ]
    },
    {
        id: 'pizza-pesto-veggie',
        name: 'Pesto Veggie',
        description: 'Thin crust with pesto, mozzarella, black olives, sweet corn, and capsicum.',
        price: 429,
        tags: ['Pesto', 'Veg'],
        accent: '#3F7D4E',
        recipe: [
            { itemId: 'base-thin', quantity: 1 },
            { itemId: 'sauce-pesto', quantity: 1 },
            { itemId: 'cheese-mozzarella', quantity: 1 },
            { itemId: 'veg-olives', quantity: 1 },
            { itemId: 'veg-corn', quantity: 1 },
            { itemId: 'veg-capsicum', quantity: 1 }
        ]
    },
    {
        id: 'pizza-cheese-burst',
        name: 'Cheese Burst',
        description: 'Cheese burst base with tomato sauce, mozzarella, cheddar, and parmesan.',
        price: 449,
        tags: ['Cheesy', 'Veg'],
        accent: '#C9871A',
        recipe: [
            { itemId: 'base-cheese-burst', quantity: 1 },
            { itemId: 'sauce-tomato', quantity: 1 },
            { itemId: 'cheese-mozzarella', quantity: 1 },
            { itemId: 'cheese-cheddar', quantity: 1 },
            { itemId: 'cheese-parmesan', quantity: 1 }
        ]
    }
];
