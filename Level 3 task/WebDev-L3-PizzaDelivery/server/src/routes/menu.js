import express from 'express';
import { store } from '../db/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildMenu } from '../services/menu.js';

const router = express.Router();

router.get('/', asyncHandler(async (request, response) => {
    const [pizzas, inventory] = await Promise.all([
        store.pizzas.list(),
        store.inventory.list()
    ]);

    response.json(buildMenu(pizzas, inventory));
}));

export default router;
