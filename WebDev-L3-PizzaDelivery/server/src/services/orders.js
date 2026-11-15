import { env } from '../config/env.js';
import { store } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { cleanDocument } from '../utils/serializers.js';
import { emitToAdmins, emitToUser } from '../realtime.js';
import { buildOrderDraft, summarizeRequirements } from './orderBuilder.js';
import { createPaymentOrder, verifyPayment } from './payment.js';
import { sendOrderConfirmation } from './email.js';

const nextStatus = {
    RECEIVED: 'IN_KITCHEN',
    IN_KITCHEN: 'OUT_FOR_DELIVERY',
    OUT_FOR_DELIVERY: 'DELIVERED'
};

const computeTotals = (subtotal) => {
    const tax = Math.round(subtotal * env.taxRate);
    const deliveryFee = subtotal > 0 ? env.deliveryFee : 0;
    return {
        subtotal,
        tax,
        deliveryFee,
        totalAmount: subtotal + tax + deliveryFee
    };
};

export const restoreOrderStock = async (order) => {
    const requirements = summarizeRequirements(order.items);
    if (requirements.length > 0) {
        await store.inventory.restore(requirements);
    }
};

export const createOrderFromCart = async ({ userId, cartItems }) => {
    const [pizzas, inventory] = await Promise.all([
        store.pizzas.list(),
        store.inventory.list()
    ]);
    const draft = buildOrderDraft(cartItems, { pizzas, inventory });
    const totals = computeTotals(draft.subtotal);

    let reserved = false;
    let order = null;

    try {
        await store.inventory.decrement(draft.requirements);
        reserved = true;

        order = await store.orders.create({
            userId,
            items: draft.items,
            ...totals,
            status: 'PENDING_PAYMENT',
            paymentStatus: 'PENDING'
        });

        const payment = await createPaymentOrder(order);
        const paymentOrderId = payment.provider === 'razorpay'
            ? payment.razorpayOrderId
            : payment.mockOrderId;

        order = await store.orders.update(order.id, {
            paymentProvider: payment.provider,
            paymentOrderId
        });

        return { order, payment };
    } catch (error) {
        try {
            if (reserved) {
                await store.inventory.restore(draft.requirements);
            }
            if (order) {
                await store.orders.update(order.id, {
                    status: 'CANCELLED',
                    paymentStatus: 'CANCELLED'
                });
            }
        } catch (cleanupError) {
            console.error('Order cleanup failed:', cleanupError.message);
        }
        throw error;
    }
};

export const verifyOrderPayment = async ({ orderId, userId, payload }) => {
    const order = await store.orders.findById(orderId);

    if (!order || order.userId !== userId) {
        throw new AppError('Order not found.', 404, 'ORDER_NOT_FOUND');
    }

    if (order.status !== 'PENDING_PAYMENT') {
        throw new AppError('This order is no longer awaiting payment.', 409, 'ORDER_NOT_PENDING');
    }

    const payment = verifyPayment(order, payload);
    const updated = await store.orders.markPaid(order.id, userId, payment.paymentId);

    if (!updated) {
        throw new AppError('This order is no longer awaiting payment.', 409, 'ORDER_NOT_PENDING');
    }

    const cleanOrder = cleanDocument(updated);
    emitToUser(updated.userId, 'order:updated', cleanOrder);
    emitToAdmins('order:new', cleanOrder);

    const user = await store.users.findById(updated.userId);
    if (user) {
        sendOrderConfirmation(updated, user).catch((error) => {
            console.error('Order confirmation email failed:', error.message);
        });
    }

    return updated;
};

export const cancelOrder = async ({ orderId, userId }) => {
    const cancelled = await store.orders.cancelPending(orderId, userId);

    if (!cancelled) {
        throw new AppError('This order cannot be cancelled.', 409, 'ORDER_NOT_CANCELLABLE');
    }

    await restoreOrderStock(cancelled);
    const cleanOrder = cleanDocument(cancelled);
    emitToUser(cancelled.userId, 'order:updated', cleanOrder);
    emitToAdmins('order:updated', cleanOrder);
    return cancelled;
};

export const cancelStaleOrders = async () => {
    const before = new Date(Date.now() - env.pendingOrderTtlMinutes * 60 * 1000);
    const staleOrders = await store.orders.findStalePending(before);
    let cancelledCount = 0;

    for (const order of staleOrders) {
        const cancelled = await store.orders.cancelPending(order.id);
        if (!cancelled) {
            continue;
        }

        await restoreOrderStock(cancelled);
        const cleanOrder = cleanDocument(cancelled);
        emitToUser(cancelled.userId, 'order:updated', cleanOrder);
        emitToAdmins('order:updated', cleanOrder);
        cancelledCount += 1;
    }

    return cancelledCount;
};

export const updateOrderStatus = async (orderId, status) => {
    const order = await store.orders.findById(orderId);

    if (!order) {
        throw new AppError('Order not found.', 404, 'ORDER_NOT_FOUND');
    }

    if (nextStatus[order.status] !== status) {
        throw new AppError(
            `Cannot move an order from ${order.status} to ${status}.`,
            409,
            'INVALID_STATUS_TRANSITION'
        );
    }

    const updated = await store.orders.update(orderId, { status });
    const cleanOrder = cleanDocument(updated);
    emitToUser(updated.userId, 'order:updated', cleanOrder);
    emitToAdmins('order:updated', cleanOrder);
    return updated;
};
