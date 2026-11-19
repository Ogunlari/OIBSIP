import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

const razorpay = env.razorpay.enabled
    ? new Razorpay({
        key_id: env.razorpay.keyId,
        key_secret: env.razorpay.keySecret
    })
    : null;

const assertMockAllowed = () => {
    if (env.isProduction) {
        throw new AppError('Demo payments are disabled in production.', 403, 'PAYMENT_NOT_CONFIGURED');
    }
};

export const createPaymentOrder = async (order) => {
    if (env.paymentMode === 'mock') {
        assertMockAllowed();

        return {
            provider: 'mock',
            paymentOrderId: `mock_order_${crypto.randomUUID()}`,
            amount: order.totalAmount,
            currency: env.currency
        };
    }

    if (!razorpay) {
        throw new AppError(
            'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env.',
            503,
            'PAYMENT_NOT_CONFIGURED'
        );
    }

    try {
        const paymentOrder = await razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100),
            currency: env.currency,
            receipt: order.id,
            notes: {
                orderId: order.id
            }
        });

        return {
            provider: 'razorpay',
            keyId: env.razorpay.keyId,
            paymentOrderId: paymentOrder.id,
            razorpayOrderId: paymentOrder.id,
            amount: order.totalAmount,
            currency: env.currency
        };
    } catch (error) {
        console.error(error);
        throw new AppError('Unable to create the payment order.', 502, 'PAYMENT_CREATE_FAILED');
    }
};

export const verifyPayment = (order, payload) => {
    if (order.paymentProvider === 'mock') {
        assertMockAllowed();

        if (payload.mock !== true) {
            throw new AppError('Confirm the demo payment to continue.', 400, 'PAYMENT_VERIFICATION_FAILED');
        }

        return { paymentId: `mock_payment_${crypto.randomUUID()}` };
    }

    if (!razorpay) {
        throw new AppError(
            'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env.',
            503,
            'PAYMENT_NOT_CONFIGURED'
        );
    }

    if (order.paymentProvider !== 'razorpay' || !order.paymentOrderId) {
        throw new AppError('This order was not created with Razorpay.', 400, 'PAYMENT_VERIFICATION_FAILED');
    }

    const { razorpayPaymentId, razorpaySignature } = payload;
    if (!razorpayPaymentId || !razorpaySignature) {
        throw new AppError('Payment verification details are missing.', 400, 'PAYMENT_VERIFICATION_FAILED');
    }

    const expectedSignature = crypto
        .createHmac('sha256', env.razorpay.keySecret)
        .update(`${order.paymentOrderId}|${razorpayPaymentId}`)
        .digest('hex');

    const expected = Buffer.from(expectedSignature, 'hex');
    const received = Buffer.from(razorpaySignature, 'hex');

    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
        throw new AppError('Payment signature verification failed.', 400, 'PAYMENT_VERIFICATION_FAILED');
    }

    return { paymentId: razorpayPaymentId };
};
