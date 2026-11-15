import express from 'express';
import { store } from '../db/index.js';
import { authAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { comparePassword, signToken } from '../utils/security.js';
import { cleanDocument, cleanDocuments, serializeAdmin, serializeUser } from '../utils/serializers.js';
import { checkLowStockAndAlert } from '../services/inventoryAlerts.js';
import { updateOrderStatus } from '../services/orders.js';
import {
    adminLoginSchema,
    inventoryUpdateSchema,
    orderStatusSchema
} from '../validation/schemas.js';

const router = express.Router();

router.post('/auth/login', validate(adminLoginSchema), asyncHandler(async (request, response) => {
    const { email, password } = request.body;
    const admin = await store.admins.findByEmail(email);

    if (!admin || !(await comparePassword(password, admin.passwordHash))) {
        throw new AppError('Invalid admin credentials.', 401, 'INVALID_CREDENTIALS');
    }

    const token = signToken({ sub: admin.id, role: 'admin' });

    response.json({
        token,
        admin: serializeAdmin(admin)
    });
}));

router.get('/auth/me', authAdmin, asyncHandler(async (request, response) => {
    response.json({
        admin: serializeAdmin(request.admin)
    });
}));

router.use(authAdmin);

router.get('/stats', asyncHandler(async (request, response) => {
    const [stats, lowStock] = await Promise.all([
        store.orders.stats(),
        store.inventory.lowStock()
    ]);

    response.json({
        stats,
        lowStock: cleanDocuments(lowStock)
    });
}));

router.get('/inventory', asyncHandler(async (request, response) => {
    const items = await store.inventory.list();
    response.json({
        items: items.map((item) => ({
            ...cleanDocument(item),
            lowStock: item.stock <= item.threshold
        }))
    });
}));

router.patch('/inventory/:id', validate(inventoryUpdateSchema), asyncHandler(async (request, response) => {
    const item = await store.inventory.update(request.params.id, request.body);

    if (!item) {
        throw new AppError('Inventory item not found.', 404, 'INVENTORY_NOT_FOUND');
    }

    const alerts = await checkLowStockAndAlert({ itemIds: [item.id] });

    response.json({
        item: {
            ...cleanDocument(item),
            lowStock: item.stock <= item.threshold
        },
        alertSent: alerts.length > 0
    });
}));

router.get('/orders', asyncHandler(async (request, response) => {
    const orders = await store.orders.findAll();
    const userIds = [...new Set(orders.map((order) => order.userId))];
    const users = await Promise.all(userIds.map((id) => store.users.findById(id)));
    const usersById = new Map(users.filter(Boolean).map((user) => [user.id, user]));

    response.json({
        orders: orders.map((order) => ({
            ...cleanDocument(order),
            customer: serializeUser(usersById.get(order.userId)) || {
                id: order.userId,
                name: 'Deleted user',
                email: ''
            }
        }))
    });
}));

router.patch('/orders/:id/status', validate(orderStatusSchema), asyncHandler(async (request, response) => {
    const order = await updateOrderStatus(request.params.id, request.body.status);
    response.json({
        order: cleanDocument(order)
    });
}));

export default router;
