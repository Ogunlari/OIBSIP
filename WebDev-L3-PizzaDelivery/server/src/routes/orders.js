import express from 'express';
import { store } from '../db/index.js';
import { authUser } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { cleanDocument } from '../utils/serializers.js';
import { cancelOrder, createOrderFromCart, verifyOrderPayment } from '../services/orders.js';
import { checkoutSchema, verifyPaymentSchema } from '../validation/schemas.js';

const router = express.Router();

router.use(authUser);

router.get('/', asyncHandler(async (request, response) => {
    const orders = await store.orders.findByUser(request.user.id);
    response.json({
        orders: orders.map(cleanDocument)
    });
}));

router.get('/:id', asyncHandler(async (request, response) => {
    const order = await store.orders.findById(request.params.id);

    if (!order || order.userId !== request.user.id) {
        throw new AppError('Order not found.', 404, 'ORDER_NOT_FOUND');
    }

    response.json({
        order: cleanDocument(order)
    });
}));

router.post('/checkout', validate(checkoutSchema), asyncHandler(async (request, response) => {
    const { order, payment } = await createOrderFromCart({
        userId: request.user.id,
        cartItems: request.body.items
    });

    response.status(201).json({
        order: cleanDocument(order),
        payment
    });
}));

router.post('/:id/verify-payment', validate(verifyPaymentSchema), asyncHandler(async (request, response) => {
    const order = await verifyOrderPayment({
        orderId: request.params.id,
        userId: request.user.id,
        payload: request.body
    });

    response.json({
        order: cleanDocument(order)
    });
}));

router.post('/:id/cancel', asyncHandler(async (request, response) => {
    const order = await cancelOrder({
        orderId: request.params.id,
        userId: request.user.id
    });

    response.json({
        order: cleanDocument(order)
    });
}));

export default router;
